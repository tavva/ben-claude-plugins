#!/usr/bin/env node
// ABOUTME: Captures a screenshot of the Obsidian window via CDP
// ABOUTME: Saves to temp directory and outputs the file path

import { WebSocket } from 'ws';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const DEFAULT_PORT = 9223;
const TIMEOUT_MS = 10000;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    port: DEFAULT_PORT,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--port':
        options.port = parseInt(args[++i], 10);
        break;
      case '--help':
        console.log(`Usage: obsidian-screenshot.js [options]

Options:
  --port <number>   CDP port (default: ${DEFAULT_PORT})
  --help            Show this help`);
        process.exit(0);
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

async function captureScreenshot(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let messageId = 1;

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Timeout waiting for screenshot'));
    }, TIMEOUT_MS);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        id: messageId++,
        method: 'Page.captureScreenshot',
        params: { format: 'png' },
      }));
    });

    ws.on('message', (data) => {
      const response = JSON.parse(data.toString());

      if (response.result?.data) {
        clearTimeout(timeout);
        ws.close();
        resolve(Buffer.from(response.result.data, 'base64'));
      } else if (response.error) {
        clearTimeout(timeout);
        ws.close();
        reject(new Error(response.error.message));
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
  const wsUrl = await getWebSocketUrl(options.port);
  const screenshot = await captureScreenshot(wsUrl);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `obsidian-screenshot-${timestamp}.png`;
  const filepath = join(tmpdir(), filename);

  writeFileSync(filepath, screenshot);
  console.log(filepath);
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
