# AGENTS.md

CDP (Chrome DevTools Protocol) tools for Obsidian plugin development and testing. Launches isolated Obsidian instances with debugging enabled for automated testing.

## Install Dependencies

```bash
npm install
```

## Available Scripts

Run from an Obsidian plugin directory containing `manifest.json`:

```bash
# Start isolated Obsidian instance
node scripts/obsidian-start.js --vault ~/path/to/vault
node scripts/obsidian-start.js --empty

# Take screenshot (outputs temp file path)
node scripts/obsidian-screenshot.js --port 9223

# Execute JavaScript in Obsidian context
node scripts/obsidian-eval.js --port 9223 'app.vault.getName()'

# Run Obsidian command
node scripts/obsidian-command.js --port 9223 'plugin:command-id'
node scripts/obsidian-command.js --port 9223 --list

# Stop instance and cleanup
node scripts/obsidian-stop.js --port 9223
```

## Architecture

- Each test instance uses isolated user-data-dir in `/tmp/obsidian-test-<port>/`
- Empty vaults created in `/tmp/obsidian-vault-<port>/`
- Plugins are symlinked (not copied) so changes reflect after Obsidian reload
- Multiple instances can run simultaneously on different ports (9223, 9224, etc.)
- Scripts use ES modules (`"type": "module"` in package.json)
