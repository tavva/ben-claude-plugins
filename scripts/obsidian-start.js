#!/usr/bin/env node
// ABOUTME: Launches an isolated Obsidian instance with CDP enabled for testing
// ABOUTME: Symlinks the plugin from current directory into the test vault

import { spawn, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import { tmpdir } from 'node:os';

const OBSIDIAN_PATH = '/Applications/Obsidian.app/Contents/MacOS/Obsidian';
const DEFAULT_PORT = 9223;
const MAX_PORT_ATTEMPTS = 10;
const CDP_TIMEOUT_MS = 15000;
const CDP_POLL_INTERVAL_MS = 500;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    port: DEFAULT_PORT,
    vault: null,
    empty: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--port':
        options.port = parseInt(args[++i], 10);
        break;
      case '--vault':
        options.vault = args[++i];
        break;
      case '--empty':
        options.empty = true;
        break;
      case '--help':
        console.log(`Usage: obsidian-start.js [options]

Options:
  --port <number>   CDP port (default: ${DEFAULT_PORT}, auto-increments if busy)
  --vault <path>    Use existing vault at path
  --empty           Create fresh empty vault
  --help            Show this help

Must specify either --vault or --empty.
Run from an Obsidian plugin directory (with manifest.json).`);
        process.exit(0);
    }
  }

  return options;
}

function readManifest() {
  const manifestPath = join(process.cwd(), 'manifest.json');
  if (!existsSync(manifestPath)) {
    console.error('Error: No manifest.json found in current directory.');
    console.error('Run this command from an Obsidian plugin directory.');
    process.exit(1);
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    if (!manifest.id) {
      console.error('Error: manifest.json missing "id" field.');
      process.exit(1);
    }
    return manifest;
  } catch (e) {
    console.error(`Error parsing manifest.json: ${e.message}`);
    process.exit(1);
  }
}

function isPortInUse(port) {
  try {
    execSync(`lsof -i :${port}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function findFreePort(startPort) {
  for (let i = 0; i < MAX_PORT_ATTEMPTS; i++) {
    const port = startPort + i;
    if (!isPortInUse(port)) {
      return port;
    }
  }
  return null;
}

function createEmptyVault(port) {
  const vaultPath = join(tmpdir(), `obsidian-vault-${port}`);

  if (existsSync(vaultPath)) {
    rmSync(vaultPath, { recursive: true });
  }

  mkdirSync(vaultPath, { recursive: true });
  mkdirSync(join(vaultPath, '.obsidian', 'plugins'), { recursive: true });

  writeFileSync(
    join(vaultPath, '.obsidian', 'app.json'),
    JSON.stringify({}, null, 2)
  );

  writeFileSync(
    join(vaultPath, '.obsidian', 'appearance.json'),
    JSON.stringify({}, null, 2)
  );

  return vaultPath;
}

function setupPlugin(vaultPath, manifest) {
  const pluginsDir = join(vaultPath, '.obsidian', 'plugins');
  const pluginDir = join(pluginsDir, manifest.id);

  if (!existsSync(pluginsDir)) {
    mkdirSync(pluginsDir, { recursive: true });
  }

  if (existsSync(pluginDir)) {
    rmSync(pluginDir, { recursive: true });
  }

  symlinkSync(process.cwd(), pluginDir);

  const communityPluginsPath = join(vaultPath, '.obsidian', 'community-plugins.json');
  let enabledPlugins = [];

  if (existsSync(communityPluginsPath)) {
    try {
      enabledPlugins = JSON.parse(readFileSync(communityPluginsPath, 'utf-8'));
    } catch {
      enabledPlugins = [];
    }
  }

  if (!enabledPlugins.includes(manifest.id)) {
    enabledPlugins.push(manifest.id);
  }

  writeFileSync(communityPluginsPath, JSON.stringify(enabledPlugins, null, 2));
}

function createUserDataDir(port) {
  const userDataDir = join(tmpdir(), `obsidian-test-${port}`);

  if (existsSync(userDataDir)) {
    rmSync(userDataDir, { recursive: true });
  }

  mkdirSync(userDataDir, { recursive: true });

  return userDataDir;
}

function createObsidianConfig(userDataDir, vaultPath) {
  const vaultId = Buffer.from(vaultPath).toString('hex').slice(0, 16);

  const config = {
    vaults: {
      [vaultId]: {
        path: vaultPath,
        ts: Date.now(),
        open: true,
      },
    },
  };

  writeFileSync(
    join(userDataDir, 'obsidian.json'),
    JSON.stringify(config, null, 2)
  );
}

async function waitForCDP(port) {
  const startTime = Date.now();

  while (Date.now() - startTime < CDP_TIMEOUT_MS) {
    try {
      const response = await fetch(`http://localhost:${port}/json`);
      if (response.ok) {
        const pages = await response.json();
        const obsidianPage = pages.find(p => p.url?.includes('obsidian'));
        if (obsidianPage) {
          return obsidianPage;
        }
      }
    } catch {
      // CDP not ready yet
    }

    await new Promise(resolve => setTimeout(resolve, CDP_POLL_INTERVAL_MS));
  }

  return null;
}

async function main() {
  const options = parseArgs();

  if (!options.vault && !options.empty) {
    console.error('Error: Must specify either --vault <path> or --empty');
    process.exit(1);
  }

  if (options.vault && options.empty) {
    console.error('Error: Cannot specify both --vault and --empty');
    process.exit(1);
  }

  if (!existsSync(OBSIDIAN_PATH)) {
    console.error(`Error: Obsidian not found at ${OBSIDIAN_PATH}`);
    process.exit(1);
  }

  const manifest = readManifest();

  const port = findFreePort(options.port);
  if (!port) {
    console.error(`Error: No free port found in range ${options.port}-${options.port + MAX_PORT_ATTEMPTS - 1}`);
    process.exit(1);
  }

  let vaultPath;
  if (options.empty) {
    vaultPath = createEmptyVault(port);
  } else {
    vaultPath = options.vault;
    if (!existsSync(vaultPath)) {
      console.error(`Error: Vault path does not exist: ${vaultPath}`);
      process.exit(1);
    }
  }

  setupPlugin(vaultPath, manifest);

  const userDataDir = createUserDataDir(port);
  createObsidianConfig(userDataDir, vaultPath);

  const obsidian = spawn(OBSIDIAN_PATH, [
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${port}`,
  ], {
    detached: true,
    stdio: 'ignore',
  });

  obsidian.unref();

  const page = await waitForCDP(port);

  if (!page) {
    console.error('Error: Timed out waiting for Obsidian CDP endpoint');
    process.exit(1);
  }

  const result = {
    port,
    vault: vaultPath,
    userDataDir,
    pluginId: manifest.id,
    wsUrl: page.webSocketDebuggerUrl,
    pid: obsidian.pid,
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
