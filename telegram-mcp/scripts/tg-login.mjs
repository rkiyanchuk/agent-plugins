#!/usr/bin/env bun
/**
 * One-shot Telegram login for accounts with 2FA (two-step verification).
 *
 * The published @overpod/mcp-telegram server can only complete QR logins, which
 * fail when an account has a cloud password. This script performs a phone +
 * code + 2FA-password login via GramJS and writes the resulting session to the
 * same file the server reads, so the plugin picks it up automatically.
 *
 * TEMPORARY: once https://github.com/mcp-telegram/mcp-telegram/pull/59 is
 * merged and released, set TELEGRAM_2FA_PASSWORD and use the built-in
 * `telegram-login` instead — this script can then be removed.
 *
 * Usage:
 *   TELEGRAM_API_ID=... TELEGRAM_API_HASH=... bun run scripts/tg-login.mjs
 */
import { createInterface } from "node:readline/promises";
import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const API_ID = Number(process.env.TELEGRAM_API_ID);
const API_HASH = process.env.TELEGRAM_API_HASH;

if (!API_ID || !API_HASH) {
  console.error("Set TELEGRAM_API_ID and TELEGRAM_API_HASH environment variables.");
  process.exit(1);
}

// Mirror the server's session resolution: TELEGRAM_SESSION_PATH or the default.
const SESSION_FILE = process.env.TELEGRAM_SESSION_PATH || join(homedir(), ".mcp-telegram", "session");
const SESSION_DIR = dirname(SESSION_FILE);

if (existsSync(SESSION_FILE)) {
  console.log(`Session file already exists at ${SESSION_FILE}`);
  console.log("Delete it first if you want to re-authenticate.");
  process.exit(0);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, {
  connectionRetries: 3,
});

await client.start({
  phoneNumber: async () => rl.question("Phone number (with country code, e.g. +1234567890): "),
  phoneCode: async () => rl.question("Verification code sent to your Telegram app: "),
  password: async () => rl.question("2FA password: "),
  onError: (err) => {
    console.error("Error:", err.message);
  },
});

const sessionString = client.session.save();
mkdirSync(SESSION_DIR, { recursive: true, mode: 0o700 });
writeFileSync(SESSION_FILE, sessionString, { encoding: "utf-8", mode: 0o600 });
chmodSync(SESSION_FILE, 0o600);

console.log(`\nSession saved to ${SESSION_FILE}`);
console.log("The telegram-mcp plugin will reuse it automatically. Run telegram-status to verify.");

await client.disconnect();
rl.close();
