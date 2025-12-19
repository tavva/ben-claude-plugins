#!/usr/bin/env node
// ABOUTME: Multi-session browser server with isolated contexts per agent
// ABOUTME: Starts Chrome if needed, then exposes HTTP API for browser automation

import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { spawn, execSync } from "node:child_process";
import puppeteer from "puppeteer-core";

const PORT = 9223;
const CHROME_PORT = 9222;
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const SCRAPING_DIR = `${process.env.HOME}/.cache/browser-tools`;

// Parse args
const args = new Set(process.argv.slice(2));
const useProfile = args.has("--profile");
const headless = args.has("--headless");

const validArgs = new Set(["--profile", "--headless"]);
const invalidArgs = [...args].filter((a) => !validArgs.has(a));
if (invalidArgs.length > 0) {
	console.log("Usage: browser-server.js [--profile] [--headless]");
	console.log("\nOptions:");
	console.log("  --profile   Copy your default Chrome profile (cookies, logins)");
	console.log("  --headless  Run Chrome without visible window");
	process.exit(1);
}

let browser;
let chromeStartedByUs = false;
let lastActivityTime = Date.now();
const sessions = new Map();
const clients = new Set();

function resetIdleTimer() {
	lastActivityTime = Date.now();
}

function checkIdleTimeout() {
	if (clients.size === 0 && sessions.size === 0 && Date.now() - lastActivityTime > IDLE_TIMEOUT_MS) {
		console.log("Idle timeout reached (no clients), shutting down...");
		shutdown();
	}
}

async function shutdown() {
	for (const [id] of sessions) {
		await destroySession(id);
	}
	if (browser) await browser.disconnect();
	server.close();
	process.exit(0);
}

function generateId() {
	return randomBytes(4).toString("hex");
}

async function tryConnectChrome() {
	return puppeteer.connect({
		browserURL: `http://localhost:${CHROME_PORT}`,
		defaultViewport: null,
	});
}

async function startChrome() {
	// Setup profile directory
	execSync(`mkdir -p "${SCRAPING_DIR}"`, { stdio: "ignore" });

	// Remove SingletonLock to allow new instance
	try {
		execSync(`rm -f "${SCRAPING_DIR}/SingletonLock" "${SCRAPING_DIR}/SingletonSocket" "${SCRAPING_DIR}/SingletonCookie"`, { stdio: "ignore" });
	} catch {}

	if (useProfile) {
		console.log("Syncing Chrome profile...");
		execSync(
			`rsync -a --delete \
				--exclude='SingletonLock' \
				--exclude='SingletonSocket' \
				--exclude='SingletonCookie' \
				--exclude='*/Sessions/*' \
				--exclude='*/Current Session' \
				--exclude='*/Current Tabs' \
				--exclude='*/Last Session' \
				--exclude='*/Last Tabs' \
				"${process.env.HOME}/Library/Application Support/Google/Chrome/" "${SCRAPING_DIR}/"`,
			{ stdio: "pipe" },
		);
	}

	const chromeArgs = [
		`--remote-debugging-port=${CHROME_PORT}`,
		`--user-data-dir=${SCRAPING_DIR}`,
		"--no-first-run",
		"--no-default-browser-check",
	];
	if (headless) {
		chromeArgs.push("--headless=new");
	}

	spawn(
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		chromeArgs,
		{ detached: true, stdio: "ignore" },
	).unref();

	chromeStartedByUs = true;
	const flags = [useProfile && "profile", headless && "headless"].filter(Boolean);
	console.log(`Starting Chrome on :${CHROME_PORT}${flags.length ? ` (${flags.join(", ")})` : ""}...`);
}

async function ensureChromeAndConnect() {
	// Try connecting to existing Chrome
	try {
		browser = await Promise.race([
			tryConnectChrome(),
			new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
		]);
		console.log("Connected to existing Chrome");
		return;
	} catch {
		// Chrome not running, start it
	}

	await startChrome();

	// Wait for Chrome to be ready
	for (let i = 0; i < 30; i++) {
		try {
			browser = await Promise.race([
				tryConnectChrome(),
				new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 1000)),
			]);
			console.log("Connected to Chrome");
			return;
		} catch {
			await new Promise((r) => setTimeout(r, 500));
		}
	}

	throw new Error("Failed to connect to Chrome after starting it");
}

async function createSession() {
	const id = generateId();
	const context = await browser.createBrowserContext();
	const page = await context.newPage();

	await page.setViewport({ width: 1280, height: 900 });

	const client = await page.createCDPSession();

	const session = {
		id,
		context,
		page,
		client,
		latestFrame: null,
		frameCount: 0,
		lastFrameTime: 0,
	};

	await client.send("Page.startScreencast", {
		format: "jpeg",
		quality: 90,
		maxWidth: 1920,
		maxHeight: 1080,
		everyNthFrame: 1,
	});

	client.on("Page.screencastFrame", async ({ data, sessionId: frameSessionId }) => {
		session.latestFrame = data;
		session.frameCount++;
		session.lastFrameTime = Date.now();
		await client.send("Page.screencastFrameAck", { sessionId: frameSessionId });
	});

	sessions.set(id, session);
	resetIdleTimer();
	console.log(`Session ${id} created (${sessions.size} active)`);
	return session;
}

async function destroySession(id) {
	const session = sessions.get(id);
	if (!session) return false;

	try {
		await session.client.send("Page.stopScreencast").catch(() => {});
		await session.client.detach().catch(() => {});
		await session.context.close();
	} catch (e) {
		console.error(`Error closing session ${id}:`, e.message);
	}

	sessions.delete(id);
	resetIdleTimer();
	console.log(`Session ${id} destroyed (${sessions.size} active)`);
	return true;
}

function parseBody(req) {
	return new Promise((resolve) => {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => {
			try {
				resolve(body ? JSON.parse(body) : {});
			} catch {
				resolve({});
			}
		});
	});
}

function sendJson(res, status, data) {
	res.writeHead(status, { "Content-Type": "application/json" });
	res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`);
	const path = url.pathname;
	const method = req.method;

	// POST /session - create new isolated session
	if (method === "POST" && path === "/session") {
		try {
			const session = await createSession();
			sendJson(res, 201, { id: session.id });
		} catch (e) {
			sendJson(res, 500, { error: e.message });
		}
		return;
	}

	// GET /sessions - list all sessions
	if (method === "GET" && path === "/sessions") {
		const list = Array.from(sessions.entries()).map(([id, s]) => ({
			id,
			frames: s.frameCount,
			lastFrame: s.lastFrameTime ? new Date(s.lastFrameTime).toISOString() : null,
		}));
		sendJson(res, 200, { sessions: list, count: list.length });
		return;
	}

	// Routes that require a session ID: /session/:id/...
	const sessionMatch = path.match(/^\/session\/([a-f0-9]+)(\/.*)?$/);
	if (sessionMatch) {
		const sessionId = sessionMatch[1];
		const action = sessionMatch[2] || "";
		const session = sessions.get(sessionId);

		if (!session) {
			sendJson(res, 404, { error: "Session not found" });
			return;
		}

		// DELETE /session/:id - destroy session
		if (method === "DELETE" && action === "") {
			await destroySession(sessionId);
			sendJson(res, 200, { ok: true });
			return;
		}

		// GET /session/:id/frame - cached screencast JPEG
		if (method === "GET" && action === "/frame") {
			if (!session.latestFrame) {
				res.writeHead(503);
				res.end("No frame available yet");
				return;
			}
			res.writeHead(200, { "Content-Type": "image/jpeg" });
			res.end(Buffer.from(session.latestFrame, "base64"));
			return;
		}

		// GET /session/:id/screenshot - full-res PNG
		if (method === "GET" && action === "/screenshot") {
			try {
				const buffer = await session.page.screenshot({ type: "png" });
				res.writeHead(200, { "Content-Type": "image/png" });
				res.end(buffer);
			} catch (e) {
				sendJson(res, 500, { error: e.message });
			}
			return;
		}

		// POST /session/:id/navigate - go to URL
		if (method === "POST" && action === "/navigate") {
			const body = await parseBody(req);
			const targetUrl = body.url || url.searchParams.get("url");
			if (!targetUrl) {
				sendJson(res, 400, { error: "url required" });
				return;
			}
			try {
				await session.page.goto(targetUrl, { waitUntil: "domcontentloaded" });
				sendJson(res, 200, { ok: true, url: targetUrl });
			} catch (e) {
				sendJson(res, 500, { error: e.message });
			}
			return;
		}

		// GET /session/:id/status - session info
		if (method === "GET" && action === "/status") {
			sendJson(res, 200, {
				id: sessionId,
				url: session.page.url(),
				frames: session.frameCount,
				lastFrame: session.lastFrameTime ? new Date(session.lastFrameTime).toISOString() : null,
				age: session.lastFrameTime ? Date.now() - session.lastFrameTime : null,
			});
			return;
		}

		sendJson(res, 404, { error: "Unknown action" });
		return;
	}

	// POST /client - register a Claude Code client
	if (method === "POST" && path === "/client") {
		const id = generateId();
		clients.add(id);
		resetIdleTimer();
		console.log(`Client ${id} registered (${clients.size} active)`);
		sendJson(res, 201, { id });
		return;
	}

	// DELETE /client/:id - unregister a client
	const clientMatch = path.match(/^\/client\/([a-f0-9]+)$/);
	if (method === "DELETE" && clientMatch) {
		const clientId = clientMatch[1];
		const existed = clients.delete(clientId);
		resetIdleTimer();
		console.log(`Client ${clientId} unregistered (${clients.size} active)`);
		if (clients.size === 0 && sessions.size === 0) {
			console.log("Last client left, shutting down...");
			sendJson(res, 200, { ok: true, shutting_down: true });
			setTimeout(() => shutdown(), 100);
			return;
		}
		sendJson(res, 200, { ok: true, existed });
		return;
	}

	// GET /status - overall server status
	if (method === "GET" && path === "/status") {
		sendJson(res, 200, {
			connected: !!browser,
			sessions: sessions.size,
			clients: clients.size,
		});
		return;
	}

	// Help
	res.writeHead(404, { "Content-Type": "text/plain" });
	res.end(`Browser Server API:

POST   /session              Create new isolated session
GET    /sessions             List all sessions
DELETE /session/:id          Destroy session

GET    /session/:id/frame      Cached screencast JPEG (fast)
GET    /session/:id/screenshot Full-res PNG (text-readable)
POST   /session/:id/navigate   Go to URL (body: {"url": "..."})
GET    /session/:id/status     Session info

POST   /client               Register a client (returns id)
DELETE /client/:id           Unregister client (shuts down if last)

GET    /status               Server status
`);
});

try {
	await ensureChromeAndConnect();
	server.listen(PORT, () => {
		console.log(`Browser server running on http://localhost:${PORT}`);
		console.log("POST /session to create an isolated browser context");
		console.log(`Will auto-shutdown after ${IDLE_TIMEOUT_MS / 60000} minutes idle`);
		setInterval(checkIdleTimeout, 30000);
	});
} catch (e) {
	console.error("Failed to start:", e.message);
	process.exit(1);
}

process.on("SIGINT", () => {
	console.log("\nShutting down...");
	shutdown();
});
