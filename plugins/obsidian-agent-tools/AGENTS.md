# AGENTS.md

Obsidian CLI tools for plugin development, testing, and vault automation. Uses the `obsidian` CLI (requires Obsidian 1.12+) to control a running instance.

## Prerequisites

- Obsidian 1.12+ running
- CLI registered via Settings → General → Command line interface

## Quick Reference

```bash
# Get help
obsidian help
obsidian help <command>

# Plugin development
obsidian plugin:reload id=my-plugin
obsidian dev:screenshot
obsidian command id=my-plugin:command-name
obsidian eval code="app.plugins.plugins['my-plugin'].settings"
obsidian dev:errors

# File operations
obsidian read file=MyNote
obsidian create name=Test.md content="Hello"
obsidian search query="TODO"
```
