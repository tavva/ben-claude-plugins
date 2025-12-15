#!/usr/bin/env node
// ABOUTME: Executes an Obsidian command by ID via CDP
// ABOUTME: Convenience wrapper around obsidian-eval for the common case

import { WebSocket } from 'ws';

const DEFAULT_PORT = 9223;
const TIMEOUT_MS = 10000;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    port: DEFAULT_PORT,
    commandId: null,
    list: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port') {
      options.port = parseInt(args[++i], 10);
    } else if (args[i] === '--list') {
      options.list = true;
    } else if (args[i] === '--help') {
      console.log(`Usage: obsidian-command.js [options] <command-id>

Options:
  --port <number>   CDP port (default: ${DEFAULT_PORT})
  --list            List all available commands
  --help            Show this help

Example:
  obsidian-command.js 'flow:open-focus'
  obsidian-command.js --list
  obsidian-command.js --list | grep flow`);
      process.exit(0);
    } else if (!args[i].startsWith('--')) {
      options.commandId = args[i];
    }
  }

  return options;
}

async function getWebSocketUrl(port) {
  try {
    const response = await fetch(`http://localhost:${port}/json`);
    if (!response.ok) {
      throw new Error(`CDP endpoint returned ${response.status}`);
    }
    const pages = await response.json();
    const page = pages.find(p => p.url?.includes('obsidian'));
    if (!page) {
      throw new Error('No Obsidian page found');
    }
    return page.webSocketDebuggerUrl;
  } catch (e) {
    console.error(`Error: Could not connect to CDP on port ${port}`);
    console.error(`  Run: obsidian-start.js --port ${port} first`);
    process.exit(1);
  }
}

async function evaluate(wsUrl, expression) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let messageId = 1;

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Timeout waiting for evaluation'));
    }, TIMEOUT_MS);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        id: messageId++,
        method: 'Runtime.enable',
      }));
    });

    ws.on('message', (data) => {
      const response = JSON.parse(data.toString());

      if (response.id === 1) {
        ws.send(JSON.stringify({
          id: messageId++,
          method: 'Runtime.evaluate',
          params: {
            expression,
            returnByValue: true,
            awaitPromise: true,
          },
        }));
      }

      if (response.id === 2) {
        clearTimeout(timeout);
        ws.close();

        if (response.result?.exceptionDetails) {
          reject(new Error(response.result.exceptionDetails.text));
        } else if (response.result?.result) {
          resolve(response.result.result);
        } else {
          resolve(null);
        }
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function main() {
  const options = parseArgs();

  if (!options.commandId && !options.list) {
    console.error('Error: No command ID provided');
    console.error('Usage: obsidian-command.js <command-id>');
    console.error('       obsidian-command.js --list');
    process.exit(1);
  }

  const wsUrl = await getWebSocketUrl(options.port);

  if (options.list) {
    const result = await evaluate(wsUrl, 'Object.keys(app.commands.commands)');
    if (result?.value) {
      for (const cmd of result.value) {
        console.log(cmd);
      }
    }
    return;
  }

  const expression = `app.commands.executeCommandById('${options.commandId.replace(/'/g, "\\'")}')`;
  const result = await evaluate(wsUrl, expression);

  if (result?.value === true) {
    console.log(JSON.stringify({ success: true, command: options.commandId }));
  } else if (result?.value === false) {
    console.error(`Error: Command '${options.commandId}' not found or failed`);
    process.exit(1);
  } else {
    console.log(JSON.stringify({ success: true, command: options.commandId, result: result?.value }));
  }
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
