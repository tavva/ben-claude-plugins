# CLAUDE.md

This file provides guidance to agents when working with code in this repository.

## Repository Overview

This is a Claude Code plugin marketplace repository. Plugins live in `plugins/<plugin-name>/` and follow the Claude Code plugin structure with a `.claude-plugin/plugin.json` manifest.

## Current Plugins

### obsidian-agent-tools
CDP (Chrome DevTools Protocol) tools for Obsidian plugin development and testing. Launches isolated Obsidian instances with debugging enabled for automated testing.

**Structure:**
- `.claude-plugin/plugin.json` - Plugin manifest
- `scripts/` - Node.js CLI tools for Obsidian automation
- `skills/obsidian-automation/SKILL.md` - Skill documentation

**Install dependencies:**
```bash
cd plugins/obsidian-agent-tools && npm install
```

**Available scripts** (run from an Obsidian plugin directory containing `manifest.json`):
```bash
# Start isolated Obsidian instance
node plugins/obsidian-agent-tools/scripts/obsidian-start.js --vault ~/path/to/vault
node plugins/obsidian-agent-tools/scripts/obsidian-start.js --empty

# Take screenshot (outputs temp file path)
node plugins/obsidian-agent-tools/scripts/obsidian-screenshot.js --port 9223

# Execute JavaScript in Obsidian context
node plugins/obsidian-agent-tools/scripts/obsidian-eval.js --port 9223 'app.vault.getName()'

# Run Obsidian command
node plugins/obsidian-agent-tools/scripts/obsidian-command.js --port 9223 'plugin:command-id'
node plugins/obsidian-agent-tools/scripts/obsidian-command.js --port 9223 --list

# Stop instance and cleanup
node plugins/obsidian-agent-tools/scripts/obsidian-stop.js --port 9223
```

## Architecture Notes

- Each test instance uses isolated user-data-dir in `/tmp/obsidian-test-<port>/`
- Empty vaults created in `/tmp/obsidian-vault-<port>/`
- Plugins are symlinked (not copied) so changes reflect after Obsidian reload
- Multiple instances can run simultaneously on different ports (9223, 9224, etc.)
- Scripts use ES modules (`"type": "module"` in package.json)
