# claude-plugins

A [Claude Code](https://claude.com/claude-code) plugin marketplace —
MCP servers and configs that don't ship their own plugin, packaged so they can
be installed in one step instead of set up by hand.

## Install

```
/plugin marketplace add rkiyanchuk/claude-plugins
/plugin install <plugin>@claude-plugins
```

## Plugins

| Plugin | Description |
|--------|-------------|
| [`apple-events-mcp`](./apple-events-mcp) | Native macOS Reminders and Calendar access via FradSer's `mcp-server-apple-events` (EventKit) — full CRUD, recurring rules, priorities, location triggers, alarms, and batch operations. |
| [`telegram-mcp`](./telegram-mcp) | Full Telegram access via the `@overpod/mcp-telegram` userbot server — read/send messages, manage chats, channels, groups, polls, stories, and more. |

See each plugin's own README for setup (credentials, login, etc.).
