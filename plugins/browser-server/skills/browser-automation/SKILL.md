---
name: browser-automation
description: This skill should be used when working on frontend code, debugging UI issues, verifying visual changes, scraping web pages, testing web features, or inspecting page state. Also triggers on "open browser", "take screenshot", "navigate to URL", "check cookies", "extract page content", or any web automation task. Use proactively during frontend development to verify changes visually.
---

# Multi-Session Browser Server

HTTP server providing isolated browser contexts for multi-agent browser automation. Each session has its own cookies, localStorage, and continuous screencast stream.

## When to Use Proactively

**Use without being asked when:**

- Verifying frontend changes visually
- Debugging UI issues or layout problems
- Scraping or extracting content from web pages
- Testing web features across multiple isolated sessions
- Multiple agents need simultaneous browser access without interference

**Key advantage:** Sessions are fully isolated. Each agent gets its own browser context with separate cookies, storage, and authentication state.

## Session Lifecycle

**Keep sessions alive during the conversation.** Do not delete a session after a single operation - the user may want to:
- Navigate to additional pages
- Take more screenshots
- Interact with the page further

**Only delete sessions when:**
- The user explicitly says they're done with the browser
- The conversation/task is clearly complete
- Starting fresh with a new context is needed

Sessions auto-cleanup via server idle timeout, so leaving them is safe.

## Prerequisites

Install dependencies once:

```bash
cd ${CLAUDE_PLUGIN_ROOT} && npm install
```

## Architecture

```
Chrome (headless) :9222
       ↓ CDP
browser-server.js :9223
       ↓ HTTP API
   [Agent 1]  [Agent 2]  [Agent 3]
   session-a  session-b  session-c
```

- Chrome runs on port 9222 with CDP enabled
- Browser server connects to Chrome and exposes HTTP API on port 9223
- Each session creates an isolated browser context via `browser.createBrowserContext()`
- Continuous screencast keeps the latest frame always ready (~15ms retrieval)

## Starting the Server

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/browser-server.js --headless
```

Options:
- `--headless` - Run Chrome without visible window (recommended for agents)
- `--profile` - Copy default Chrome profile (includes cookies, logins)

The server automatically starts Chrome if not already running. Output:
```
Starting Chrome on :9222 (headless)...
Connected to Chrome
Browser server running on http://localhost:9223
```

**Keep the server running.** It manages sessions for all agents and auto-shuts down after 5 minutes idle.

## API Reference

Base URL: `http://localhost:9223`

### Session Management

**Create session:**
```bash
curl -X POST http://localhost:9223/session
# {"id":"abc12345"}
```

**List sessions:**
```bash
curl http://localhost:9223/sessions
# {"sessions":[{"id":"abc12345","frames":42,"lastFrame":"..."}],"count":1}
```

**Destroy session:**
```bash
curl -X DELETE http://localhost:9223/session/abc12345
# {"ok":true}
```

### Session Operations

All operations require a valid session ID.

**Navigate to URL:**
```bash
curl -X POST http://localhost:9223/session/abc12345/navigate \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
# {"ok":true,"url":"https://example.com"}
```

**Get cached frame (fast ~15ms):**
```bash
curl http://localhost:9223/session/abc12345/frame > frame.jpg
```

Returns JPEG from continuous screencast. Always ready, no rendering delay.

**Get full screenshot (accurate ~100ms):**
```bash
curl http://localhost:9223/session/abc12345/screenshot > screenshot.png
```

Returns PNG with full resolution. Better for text readability and OCR.

**Get session status:**
```bash
curl http://localhost:9223/session/abc12345/status
# {"id":"abc12345","url":"https://example.com","frames":42,"lastFrame":"...","age":1234}
```

### Server Status

```bash
curl http://localhost:9223/status
# {"connected":true,"sessions":3}
```

## Typical Workflows

### Single Agent Scraping

Run each command separately. The session ID from step 1 is used in subsequent steps.

```bash
# Step 1: Create session - note the ID from response
curl -s -X POST http://localhost:9223/session
# Response: {"id":"abc12345"}

# Step 2: Navigate (replace abc12345 with actual ID)
curl -X POST http://localhost:9223/session/abc12345/navigate \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Step 3: Get screenshot for visual inspection
curl http://localhost:9223/session/abc12345/screenshot > /tmp/page.png

# Step 4: Clean up when done
curl -X DELETE http://localhost:9223/session/abc12345
```

### Multi-Agent Parallel Testing

Each agent creates its own session. Sessions are isolated - cookies set in one session don't affect others.

```bash
# Agent 1: Create session, note the ID
curl -s -X POST http://localhost:9223/session
# Use returned ID for all Agent 1 operations

# Agent 2: Create separate session, note the ID
curl -s -X POST http://localhost:9223/session
# Use returned ID for all Agent 2 operations

# Sessions run simultaneously without interference
```

### Authenticated Sessions

Use `--profile` to copy your default Chrome profile with existing logins:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/browser-server.js --profile --headless
```

Sessions will have access to cookies from your normal Chrome profile.

## Screenshot Strategy

Two methods available with different trade-offs:

| Method | Endpoint | Speed | Format | Use Case |
|--------|----------|-------|--------|----------|
| Frame | `/frame` | ~15ms | JPEG | Quick visual checks, animations |
| Screenshot | `/screenshot` | ~100ms | PNG | Text reading, OCR, archiving |

**Recommendations:**
- Use `/frame` for rapid iteration during development
- Use `/screenshot` when reading text content or precision matters
- Frame is from screencast (already rendered); screenshot triggers fresh render

## Error Handling

**"Failed to connect to Chrome after starting it"**
- Chrome failed to start
- Check Chrome is installed at expected path
- On macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`

**"Session not found"**
- Session ID invalid or already destroyed
- Create a new session with POST /session

**"No frame available yet"**
- Page just navigated, screencast hasn't captured yet
- Wait briefly or use `/screenshot` instead

## Performance Notes

- Persistent CDP connection: ~100ms for screenshot vs ~5s with fresh connection (50x faster)
- Continuous screencast: frames always ready, no rendering wait
- Session creation: ~200ms (creates new browser context)
- Memory: each session holds one page; destroy sessions when done

## Cleanup

Sessions persist until explicitly destroyed. Always clean up:

```bash
# Destroy specific session (replace with actual ID)
curl -X DELETE http://localhost:9223/session/abc12345

# Check remaining sessions
curl http://localhost:9223/sessions
```

Stop the server with Ctrl+C - it gracefully closes all sessions.
