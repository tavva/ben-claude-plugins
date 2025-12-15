#!/usr/bin/env node
// ABOUTME: Executes JavaScript in the Obsidian context via CDP
// ABOUTME: Returns the evaluation result as JSON

import { WebSocket } from 'ws';

const DEFAULT_PORT = 9223;
const TIMEOUT_MS = 10000;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    port: DEFAULT_PORT,
    expression: null,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port') {
      options.port = parseInt(args[++i], 10);
    } else if (args[i] === '--help') {
      console.log(`Usage: obsidian-eval.js [options] <expression>

Options:
  --port <number>   CDP port (default: ${DEFAULT_PORT})
  --help            Show this help

Example:
  obsidian-eval.js 'app.vault.getName()'
  obsidian-eval.js --port 9224 'app.workspace.activeLeaf'`);
      process.exit(0);
    } else if (!args[i].startsWith('--')) {
      options.expression = args[i];
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

  if (!options.expression) {
    console.error('Error: No expression provided');
    console.error('Usage: obsidian-eval.js <expression>');
    process.exit(1);
  }

  const wsUrl = await getWebSocketUrl(options.port);
  const result = await evaluate(wsUrl, options.expression);

  if (result?.value !== undefined) {
    console.log(JSON.stringify(result.value, null, 2));
  } else if (result?.description) {
    console.log(result.description);
  } else {
    console.log('undefined');
  }
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
