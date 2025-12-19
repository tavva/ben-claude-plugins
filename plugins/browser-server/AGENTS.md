# AGENTS.md

Multi-session browser server with isolated contexts for agent automation. Provides HTTP API for creating browser sessions with separate cookies, localStorage, and continuous screencast.

## Install Dependencies

```bash
npm install
```

## Start Server

```bash
node scripts/browser-server.js --headless
```

Options:
- `--headless` - Run Chrome without visible window
- `--profile` - Copy default Chrome profile (cookies, logins)

Automatically starts Chrome if not running. Auto-shuts down after 5 minutes idle.

## API

Base URL: `http://localhost:9223`

```bash
# Create session
curl -s -X POST http://localhost:9223/session
# {"id":"abc12345"}

# Navigate
curl -X POST http://localhost:9223/session/abc12345/navigate \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Get screenshot (PNG, ~100ms)
curl http://localhost:9223/session/abc12345/screenshot > page.png

# Get cached frame (JPEG, ~15ms)
curl http://localhost:9223/session/abc12345/frame > frame.jpg

# Destroy session
curl -X DELETE http://localhost:9223/session/abc12345

# List all sessions
curl http://localhost:9223/sessions
```

## Architecture

- Server starts Chrome on :9222 if not running
- HTTP API on :9223
- Each session creates isolated browser context via `browser.createBrowserContext()`
- Sessions have separate cookies, localStorage, authentication state
- Continuous screencast keeps latest frame ready for fast retrieval
