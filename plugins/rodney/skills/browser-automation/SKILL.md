---
name: browser-automation
description: This skill should be used when working on frontend code, debugging UI issues, verifying visual changes, scraping web pages, testing web features, or inspecting page state. Also triggers on "open browser", "take screenshot", "navigate to URL", "scrape website", "extract page content", "check accessibility", or any web automation task. Use proactively during frontend development to verify changes visually.
---

# Browser Automation with Rodney

Rodney is a CLI tool that drives a persistent headless Chrome instance. Each command connects to the same long-running browser process, making it natural to script multi-step browser interactions via Bash.

## When to Use Proactively

**Use without being asked when:**

- Verifying frontend changes visually
- Debugging UI issues or layout problems
- Scraping or extracting content from web pages
- Testing web features or form interactions
- Checking accessibility of page elements

## Core Workflow

### 1. Start the Browser

```bash
rodney start           # headless (default for agents)
rodney start --show    # visible window (for debugging with user)
```

Check if already running first:

```bash
rodney status || rodney start
```

### 2. Navigate and Wait

```bash
rodney open "https://example.com"
rodney waitstable                    # wait for DOM to settle
```

Always wait after navigation. Prefer `waitstable` for general use, `waitidle` when network requests matter, `waitload` for simple pages.

### 3. Inspect the Page

```bash
rodney title                         # page title
rodney url                           # current URL
rodney text "h1"                     # text content of element
rodney html ".main-content"          # HTML of element
rodney attr "a.logo" "href"          # attribute value
rodney js "document.querySelectorAll('.item').length"  # run JS
```

### 4. Take Screenshots

```bash
rodney screenshot /tmp/page.png              # full viewport
rodney screenshot -w 1280 -h 720 /tmp/page.png  # specific size
rodney screenshot-el ".hero-section" /tmp/hero.png  # element only
```

Use the Read tool to view screenshot files after capturing them.

### 5. Interact with Elements

```bash
rodney click "button.submit"
rodney input "#email" "user@example.com"
rodney select "#country" "GB"
rodney submit "form#login"
rodney hover ".tooltip-trigger"
```

### 6. Check Element State

```bash
rodney exists ".error-message"       # exit 0 if exists, 1 if not
rodney visible ".modal"              # exit 0 if visible, 1 if not
rodney count ".list-item"            # prints count
rodney assert "document.title" "Expected Title"  # assert equality
```

Use exit codes for conditional logic:

```bash
if rodney exists ".error-message"; then
  rodney text ".error-message"
fi
```

### 7. Accessibility Inspection

```bash
rodney ax-tree --depth 3             # dump a11y tree (truncated)
rodney ax-tree --json                # full tree as JSON
rodney ax-find --role button         # find all buttons
rodney ax-find --role link --name "Sign in"  # find specific link
rodney ax-node "#main-nav" --json    # a11y info for element
```

The accessibility tree is often more useful than screenshots for understanding page structure, especially for forms and navigation.

### 8. Stop When Done

```bash
rodney stop
```

The SessionEnd hook automatically runs `rodney stop`, so explicit cleanup is not required but is good practice when switching contexts.

## Session Management

Rodney keeps a single Chrome process alive between commands. State (cookies, localStorage, current page) persists across commands until `rodney stop`.

**Directory-scoped sessions** isolate browser state per project:

```bash
rodney start --local    # state in ./.rodney/state.json
rodney open "..."       # auto-detects local session
rodney stop             # cleans up local session
```

**Tab management** for multi-page workflows:

```bash
rodney newpage "https://docs.example.com"
rodney pages                          # list all tabs
rodney page 0                         # switch back to first tab
rodney closepage 1                    # close second tab
```

## Common Patterns

### Visual Verification After Code Changes

```bash
rodney status || rodney start
rodney open "http://localhost:3000"
rodney waitstable
rodney screenshot /tmp/after-change.png
```

### Form Testing

```bash
rodney open "http://localhost:3000/login"
rodney waitstable
rodney input "#email" "test@example.com"
rodney input "#password" "password123"
rodney click "button[type=submit]"
rodney waitstable
rodney screenshot /tmp/after-login.png
```

### Content Extraction

```bash
rodney open "https://example.com/data"
rodney waitstable
rodney js "JSON.stringify([...document.querySelectorAll('tr')].map(r => r.textContent))"
```

### Waiting for Dynamic Content

```bash
rodney open "https://example.com/dashboard"
rodney wait ".data-loaded"            # wait for specific element
rodney text ".metric-value"           # then extract content
```

## Tips

- **Selectors**: Standard CSS selectors work everywhere. Prefer specific selectors (IDs, data attributes) over fragile positional ones.
- **JavaScript**: `rodney js` wraps expressions as `() => { return (expr); }` — return complex values as JSON strings.
- **Screenshots**: Always save to `/tmp/` and use the Read tool to view them.
- **Exit codes**: `rodney exists` and `rodney visible` return exit code 1 on failure, not stderr — use `if` statements, not `||`.
- **Debugging**: Use `rodney start --show` to make the browser visible when debugging visual issues with the user.

For the complete CLI command reference, consult **`references/commands.md`**.
