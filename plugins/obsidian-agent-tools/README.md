# obsidian-agent-tools

[Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) (CDP) tools for Obsidian plugin development. 

- Take screenshots, execute commands, and evaluate JavaScript.
- Runs an isolated instance of Obsidian to avoid interfering with your main setup.

## Platform Support

- **macOS** - Full support
- **Linux** - Not yet supported (see [#3](https://github.com/tavva/ben-claude-plugins/issues/3))
- **Windows** - Not yet supported (see [#2](https://github.com/tavva/ben-claude-plugins/issues/2))

## Installation

```bash
/plugin install obsidian-agent-tools@ben-claude-plugins
```

Then install dependencies (once), although Claude Code will typically do this itself:

```bash
cd ${CLAUDE_PLUGIN_ROOT} && npm install
```

## Quick Start

You can trigger these tools with phrases such as "Open Obsidian" or "Test x in Obsidian".

In the CLAUDE.MD file for your plugin, explain that the agent can test your plugin by opening Obsidian using the obsidian-agent-tools skill, and it should use it when necessary.

## Tools

| Script | Purpose |
|--------|---------|
| `obsidian-start.js` | Launch isolated Obsidian instance with CDP |
| `obsidian-stop.js` | Stop instance and clean up temp files |
| `obsidian-screenshot.js` | Capture window to temp file |
| `obsidian-command.js` | Execute Obsidian commands by ID |
| `obsidian-eval.js` | Run JavaScript in Obsidian context |

## Options

### obsidian-start.js

- `--vault <path>` - Use existing vault with test data
- `--empty` - Create fresh empty vault in temp directory
- `--port <number>` - CDP port (default: 9223, auto-increments if busy)

### obsidian-stop.js / screenshot / command / eval

- `--port <number>` - CDP port of running instance

### obsidian-command.js

- `--list` - List all available commands

## How It Works

- Each test instance uses an isolated user-data-dir in `/tmp/obsidian-test-<port>/`
- Empty vaults are created in `/tmp/obsidian-vault-<port>/`
- Your plugin is symlinked (not copied) so changes reflect after Obsidian reload
- Multiple instances can run simultaneously on different ports

## Licence

MIT
