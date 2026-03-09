# obsidian-agent-tools

[Obsidian CLI](https://help.obsidian.md/cli) tools for plugin development and vault automation.

- Take screenshots, execute commands, evaluate JavaScript, manage files
- Uses the native `obsidian` CLI — no dependencies required

## Prerequisites

- Obsidian 1.12+ running
- CLI registered via Settings → General → Command line interface

## Installation

```bash
/plugin install obsidian-agent-tools@ben-claude-plugins
```

## Quick Start

Trigger with phrases like "Open Obsidian", "Test x in Obsidian", or "Take an Obsidian screenshot".

In your plugin's CLAUDE.md, explain that the agent can test your plugin using the obsidian-agent-tools skill.

## What It Can Do

The CLI covers the full Obsidian feature set. Run `obsidian help` for the complete command list.

- **Files** — create, read, open, append, prepend, move, rename, delete
- **Search** — full-text search with context
- **Daily notes** — open, read, append, prepend
- **Properties** — read, set, remove frontmatter
- **Tasks** — list, filter, toggle status
- **Plugins** — list, enable, disable, install, reload
- **Commands** — list and execute any command
- **Developer** — screenshots, JS eval, DOM inspection, console logs

## Licence

MIT
