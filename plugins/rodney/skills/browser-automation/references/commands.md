# Rodney CLI Command Reference

## Browser Lifecycle

| Command | Description |
|---------|-------------|
| `rodney start [--show] [--insecure]` | Launch Chrome (headless by default, `--show` for visible) |
| `rodney connect <host:port>` | Connect to existing Chrome on remote debug port |
| `rodney stop` | Shut down Chrome |
| `rodney status` | Show browser status |

## Navigation

| Command | Description |
|---------|-------------|
| `rodney open <url>` | Navigate to URL |
| `rodney back` | Go back in history |
| `rodney forward` | Go forward in history |
| `rodney reload [--hard]` | Reload page (`--hard` bypasses cache) |
| `rodney clear-cache` | Clear the browser cache |

## Page Information

| Command | Description |
|---------|-------------|
| `rodney url` | Print current URL |
| `rodney title` | Print page title |
| `rodney html [selector]` | Print HTML (full page or element) |
| `rodney text <selector>` | Print text content of element |
| `rodney attr <selector> <name>` | Print attribute value |
| `rodney pdf [file]` | Save page as PDF |

## Interaction

| Command | Description |
|---------|-------------|
| `rodney js <expression>` | Evaluate JavaScript expression (result pretty-printed as JSON) |
| `rodney click <selector>` | Click an element |
| `rodney input <selector> <text>` | Type text into an input field |
| `rodney clear <selector>` | Clear an input field |
| `rodney file <selector> <path\|->` | Set file on a file input (`-` for stdin) |
| `rodney download <selector> [file\|-]` | Download href/src target (`-` for stdout) |
| `rodney select <selector> <value>` | Select dropdown option by value |
| `rodney submit <selector>` | Submit a form |
| `rodney hover <selector>` | Hover over an element |
| `rodney focus <selector>` | Focus an element |

## Waiting

| Command | Description |
|---------|-------------|
| `rodney wait <selector>` | Wait for element to appear |
| `rodney waitload` | Wait for page load event |
| `rodney waitstable` | Wait for DOM to stabilise |
| `rodney waitidle` | Wait for network idle |
| `rodney sleep <seconds>` | Sleep for N seconds |

## Screenshots

| Command | Description |
|---------|-------------|
| `rodney screenshot [-w N] [-h N] [file]` | Take page screenshot (default viewport, optional resize) |
| `rodney screenshot-el <selector> [file]` | Screenshot a specific element |

## Tabs

| Command | Description |
|---------|-------------|
| `rodney pages` | List all pages/tabs |
| `rodney page <index>` | Switch to page by index |
| `rodney newpage [url]` | Open a new page/tab |
| `rodney closepage [index]` | Close a page/tab |

## Element Checks

| Command | Description |
|---------|-------------|
| `rodney exists <selector>` | Check if element exists (exit 1 if not) |
| `rodney count <selector>` | Count matching elements |
| `rodney visible <selector>` | Check if element is visible (exit 1 if not) |
| `rodney assert <expr> [expected] [-m msg]` | Assert JS expression (truthy or equality check) |

## Accessibility

| Command | Description |
|---------|-------------|
| `rodney ax-tree [--depth N] [--json]` | Dump accessibility tree |
| `rodney ax-find [--name N] [--role R] [--json]` | Find accessible nodes by name/role |
| `rodney ax-node <selector> [--json]` | Show accessibility info for a specific element |

## Global Options

| Option | Description |
|--------|-------------|
| `--local` | Use directory-scoped session (`./.rodney/`) |
| `--global` | Use global session (`~/.rodney/`) |
| `--version` | Print version and exit |
| `--help` | Show help message |

## Session Scoping

By default, rodney auto-detects: if `./.rodney/state.json` exists in the current directory, the local session is used; otherwise falls back to the global session at `~/.rodney/`.

Use `rodney start --local` to create a directory-scoped session. Add `.rodney/` to `.gitignore`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RODNEY_HOME` | Override data directory (default: `~/.rodney`) |
| `ROD_CHROME_BIN` | Path to Chrome executable |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Check failed (exists, visible, assert returned false) |
| 2 | Error (bad arguments, no browser, timeout) |
