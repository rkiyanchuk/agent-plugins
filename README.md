# cc-plugins

A [Claude Code](https://claude.com/claude-code) plugin marketplace —
MCP servers, commands, and configs that don't ship their own plugin, packaged so
they can be installed in one step instead of set up by hand.

## Install

```
/plugin marketplace add rkiyanchuk/cc-plugins
/plugin install <plugin>@cc-plugins
```

## Plugins

| Plugin | Description |
|--------|-------------|
| [`init-project`](./init-project) | Bootstrap Claude Code in a project (a `/init` superset) — write `CLAUDE.md`, build a codegraph index for large source trees, and interactively enable the right plugins & MCP servers with defaults suggested from the repo. Invoked as `/init-project:init-project`. |
| [`apple-events-mcp`](./apple-events-mcp) | Native macOS Reminders and Calendar access via FradSer's `mcp-server-apple-events` (EventKit) — full CRUD, recurring rules, priorities, location triggers, alarms, and batch operations. |
| [`telegram-mcp`](./telegram-mcp) | Full Telegram access via the `@overpod/mcp-telegram` userbot server — read/send messages, manage chats, channels, groups, polls, stories, and more. |

See each plugin's own README for setup (credentials, login, etc.).
