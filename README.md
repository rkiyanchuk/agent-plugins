# agent-plugins

A coding-agent plugin marketplace — MCP servers, skills, and configs that don't
ship their own plugin, packaged so they can be installed in one step instead of
set up by hand.

Works with any agent that reads the Claude Code plugin format:

- [Claude Code](https://claude.com/claude-code)
- [oh-my-pi](https://github.com/can1357/oh-my-pi) (`omp`)

## Install

Claude Code:

```sh
/plugin marketplace add rkiyanchuk/agent-plugins
/plugin install <plugin>@agent-plugins
```

oh-my-pi:

```sh
/marketplace add rkiyanchuk/agent-plugins
/marketplace install <plugin>@agent-plugins
```

or from a shell:

```sh
omp plugin marketplace add rkiyanchuk/agent-plugins
omp plugin install <plugin>@agent-plugins
```

Point the marketplace at a local clone during development by passing a path
instead of the repo slug.

## Plugins

- [`apple-events-mcp`](./apple-events-mcp) — native macOS Reminders and Calendar
  access via FradSer's `mcp-server-apple-events` (EventKit): full CRUD,
  recurring rules, priorities, location triggers, alarms, and batch operations.
- [`telegram-mcp`](./telegram-mcp) — full Telegram access via the
  `@overpod/mcp-telegram` userbot server: read/send messages, manage chats,
  channels, groups, polls, stories, and more.

See each plugin's own README for setup (credentials, login, etc.).

## Catalog format

The catalog lives at
[`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json). oh-my-pi
prefers `.omp-plugin/marketplace.json` and falls back to the Claude path, so a
single catalog serves both agents — there is no second copy to keep in sync.
