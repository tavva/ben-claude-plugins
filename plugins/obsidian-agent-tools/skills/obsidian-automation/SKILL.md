---
name: obsidian-automation
description: This skill should be used when working on Obsidian plugins, testing plugin changes, verifying plugin UI, debugging plugin behaviour, or running automated tests against Obsidian. Also triggers on "start Obsidian", "take Obsidian screenshot", "test plugin", "run plugin command", "execute in Obsidian", or any Obsidian automation task. Use proactively during plugin development to verify changes visually.
---

# Obsidian CLI

The `obsidian` CLI controls a running Obsidian instance from the terminal. Anything you can do in Obsidian you can do from the command line.

## Prerequisites

- Obsidian 1.12+ must be running
- CLI registered via Settings → General → Command line interface

## Getting Help

```bash
obsidian help           # List all commands
obsidian help <command> # Detailed help for a command
```

Always check `obsidian help <command>` for the full parameter list before using a command you haven't used before.

## Command Syntax

Commands use `parameter=value` pairs and boolean flags:

```bash
obsidian command parameter=value flag
```

Target a specific vault with `vault=name` as the first parameter. Target files with `file=name` (wikilink resolution) or `path=exact/path`.

Use `--copy` on any command to copy output to clipboard.

## Capabilities

The CLI covers the full Obsidian feature set:

- **Files** — create, read, open, append, prepend, move, rename, delete
- **Search** — full-text search with context, scoped to folders
- **Daily notes** — open, read, append, prepend
- **Properties** — read, set, remove frontmatter properties
- **Tasks** — list, filter, toggle task status
- **Links** — backlinks, outgoing links, orphans, unresolved links
- **Tags** — list, filter, count
- **Plugins** — list, enable, disable, install, uninstall, reload
- **Commands** — list and execute any registered command
- **Developer** — screenshots, JS eval, DOM inspection, console logs, CDP

## Proactive Use

**Use these tools without being asked when:**

- Implementing or modifying Obsidian plugin features — take screenshots to verify UI changes
- Debugging plugin behaviour — execute commands and inspect state
- Testing plugin with different vault configurations
- Verifying that plugin changes work as expected

## Common Workflows

### Plugin Development

```bash
# Reload plugin after code changes
obsidian plugin:reload id=my-plugin

# Take a screenshot to verify UI
obsidian dev:screenshot

# Execute a plugin command
obsidian command id=my-plugin:do-something

# List all commands from your plugin
obsidian commands filter=my-plugin

# Evaluate JS in Obsidian context
obsidian eval code="app.plugins.plugins['my-plugin'].settings"

# Check console for errors
obsidian dev:errors
obsidian dev:console level=error
```

### File Operations

```bash
# Read a file
obsidian read file=MyNote

# Create a file with content
obsidian create name=Test path=folder/Test.md content="Hello world"

# Search the vault
obsidian search query="TODO" path=Projects
obsidian search:context query="function.*export"

# Append to daily note
obsidian daily:append content="- Task from CLI"
```

### Inspecting State

```bash
# Vault info
obsidian vault

# List files
obsidian files ext=md

# Check properties
obsidian properties file=MyNote

# View workspace layout
obsidian workspace
```
