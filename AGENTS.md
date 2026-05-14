# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Repository Overview

Claude Code plugin marketplace. Plugins live in `plugins/<plugin-name>/` and follow the Claude Code plugin structure with a `.claude-plugin/plugin.json` manifest.

## Plugins

| Plugin | Description |
|--------|-------------|
| rodney | Browser automation via the rodney CLI for web scraping, frontend verification, and page interaction |
| eval-designer | Design production-quality LLM evaluations for Langfuse |
| obsidian-agent-tools | Obsidian CLI tools for plugin development, testing, and vault automation |
| readme-generator | Generate README files following best practices |
| sprite | Manage Sprites - persistent, isolated Linux microVMs for safe code execution |

Plugins with code have their own AGENTS.md with build/run instructions.

## Updating a Plugin

When making changes to a plugin, update all of these:

1. **Plugin files** — make your changes in `plugins/<plugin-name>/`
2. **`plugins/<plugin-name>/.claude-plugin/plugin.json`** — bump version, update description if needed
3. **`.claude-plugin/marketplace.json`** — update the plugin's version, description, and tags to match
4. **`AGENTS.MD`** — update the plugin table description if it changed
5. **`README.md`** — update the plugin table description if it changed
