#!/usr/bin/env node
// ABOUTME: Stops a running Obsidian test instance and cleans up temp directories
// ABOUTME: Identifies the instance by CDP port number

import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const DEFAULT_PORT = 9223;

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
        console.log(`Usage: obsidian-stop.js [options]

Options:
  --port <number>   CDP port of instance to stop (default: ${DEFAULT_PORT})
  --help            Show this help`);
        process.exit(0);
    }
  }

  return options;
}

function findProcessOnPort(port) {
  try {
    const output = execSync(`lsof -ti :${port}`, { encoding: 'utf-8' });
    return output.trim().split('\n').map(pid => parseInt(pid, 10));
  } catch {
    return [];
  }
}

function killProcess(pid) {
  try {
    process.kill(pid, 'SIGTERM');
    return true;
  } catch {
    return false;
  }
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForProcessToExit(pid, timeoutMs = 5000) {
  const startTime = Date.now();
  while (isProcessRunning(pid) && Date.now() - startTime < timeoutMs) {
    await sleep(100);
  }
  return !isProcessRunning(pid);
}

async function removeDirectoryWithRetry(dirPath, maxRetries = 3, delayMs = 500) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (existsSync(dirPath)) {
        rmSync(dirPath, { recursive: true, force: true });
      }
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      await sleep(delayMs);
    }
  }
}

async function cleanup(port) {
  const userDataDir = join(tmpdir(), `obsidian-test-${port}`);
  const vaultDir = join(tmpdir(), `obsidian-vault-${port}`);

  await removeDirectoryWithRetry(userDataDir);
  await removeDirectoryWithRetry(vaultDir);
}

async function main() {
  const options = parseArgs();
  const pids = findProcessOnPort(options.port);

  if (pids.length === 0) {
    console.log(JSON.stringify({ stopped: false, message: `No process found on port ${options.port}` }));
    await cleanup(options.port);
    return;
  }

  let killed = 0;
  for (const pid of pids) {
    if (killProcess(pid)) {
      killed++;
    }
  }

  // Wait for processes to fully terminate before cleanup
  for (const pid of pids) {
    await waitForProcessToExit(pid);
  }

  await cleanup(options.port);

  console.log(JSON.stringify({
    stopped: true,
    port: options.port,
    processesKilled: killed,
  }));
}

main();
