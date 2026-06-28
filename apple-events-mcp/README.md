# apple-events-mcp

A [Claude Code](https://claude.com/claude-code) plugin that gives Claude native
access to your **Apple Reminders and Calendar** on macOS, backed by
[`mcp-server-apple-events`](https://github.com/FradSer/mcp-server-apple-events)
(FradSer).

The server talks to EventKit directly — no AppleScript, and the Reminders/Calendar
apps don't need to be open. It exposes full CRUD plus recurring rules, priorities,
location triggers, multiple alarms, search, and batch operations.

## Requirements

- macOS.
- [Node.js](https://nodejs.org) on your `PATH` (the server runs via `npx`).
- Reminders and Calendar access granted to the process that launches Claude
  (see [Permissions](#permissions)).

## Install

```
/plugin marketplace add rkiyanchuk/claude-plugins
/plugin install apple-events-mcp@claude-plugins
```

(Or point the marketplace at a local clone during development:
`/plugin marketplace add /path/to/claude-plugins`.)

## Permissions

The server uses native EventKit, so macOS gates it through TCC (Privacy &
Security). No credentials or environment variables are needed.

- **Claude Code in a terminal** inherits the terminal app's EventKit grants. The
  first call triggers the system prompt; allow **Reminders** and **Calendars**
  for your terminal (Terminal, iTerm2, Ghostty, …) under
  **System Settings → Privacy & Security → Reminders / Calendars**.
- **Desktop clients** (Claude Desktop) inherit the app's own grants.

If calls fail with an authorization error, grant access there and restart the
client.

## What you get

The `apple-events` MCP server exposes the full tool surface, including:

- **Reminders** — create, read, update, delete across lists; priorities;
  recurring rules (daily/weekly/monthly/yearly); location triggers
  (arrive/leave); multiple alarms (absolute + relative); notes, URLs, due dates,
  completion; search and date-based queries.
- **Calendar** — create/read/update/delete events.
- **Batch operations** and a prompt registry (e.g. a daily task organizer)
  exposed via MCP prompts.

## Notes

- For terminal scripting/automation outside Claude, FradSer also ships a pure
  Swift CLI, [`event`](https://github.com/FradSer/event); the MCP server is the
  right fit for MCP clients like Claude Code.

## Credits

- MCP server:
  [`mcp-server-apple-events`](https://github.com/FradSer/mcp-server-apple-events)
  (MIT), by FradSer.

## License

MIT — see [LICENSE](../LICENSE).
