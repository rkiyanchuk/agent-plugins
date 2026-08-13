# telegram-mcp

A coding-agent plugin that gives your agent full access to your Telegram
account, backed by the
[`@overpod/mcp-telegram`](https://github.com/mcp-telegram/mcp-telegram) MCP
server.

Unlike the read-only hosted bridge, this connects as **your own account** over
MTProto (a *userbot*), so the agent can both read **and** act — send messages,
manage chats, channels, groups, polls, stories, contacts, and more (~200 tools).

## Requirements

- [Bun](https://bun.sh) on your `PATH` (the server runs via `bunx`).
- Telegram API credentials. Create an app at <https://my.telegram.org/apps> and
  copy the **api_id** and **api_hash**.

## Setup

### 1. Provide credentials

The plugin reads your credentials from the environment — nothing secret is
stored in the plugin. Export them in your shell profile (`~/.config/fish/config.fish`,
`~/.zshrc`, …):

```bash
export TELEGRAM_API_ID=1234567
export TELEGRAM_API_HASH=your_api_hash
```

Optional environment variables (inherited by the server if set):

| Variable | Purpose |
|----------|---------|
| `TELEGRAM_2FA_PASSWORD` | Cloud password for accounts with two-step verification, so login can complete. |
| `TELEGRAM_SESSION_PATH` | Custom path for the saved session (default `~/.mcp-telegram/session`). |
| `TELEGRAM_PROXY_*` | Proxy settings — see the upstream README. |

### 2. Install the plugin

Claude Code:

```
/plugin marketplace add rkiyanchuk/agent-plugins
/plugin install telegram-mcp@agent-plugins
```

oh-my-pi:

```
/marketplace add rkiyanchuk/agent-plugins
/marketplace install telegram-mcp@agent-plugins
```

(Or point the marketplace at a local clone during development:
`/plugin marketplace add /path/to/agent-plugins`.)

### 3. Log in to Telegram (one time)

The session is created once and reused (stored at `~/.mcp-telegram/session`, or
`TELEGRAM_SESSION_PATH` if set). The plugin's server reads that file regardless
of how it was produced.

Ask the agent to run **`telegram-login`** (a QR code appears; scan it in
Telegram under **Settings → Devices → Link Desktop Device**), or run the login
from a terminal:

```bash
TELEGRAM_API_ID=$TELEGRAM_API_ID TELEGRAM_API_HASH=$TELEGRAM_API_HASH \
  bunx @overpod/mcp-telegram login
```

**Accounts with 2FA (two-step verification)** — set `TELEGRAM_2FA_PASSWORD`
(your cloud password) before logging in. The server reads it during the QR
flow to complete the SRP challenge — no separate steps. The plugin passes the
variable through to the server automatically.

After logging in, ask the agent to run **`telegram-status`** to confirm the
connection.

## What you get

The `telegram` MCP server exposes the full `@overpod/mcp-telegram` tool surface,
including:

- **Messages** — send, edit, delete, forward, search, react, pin, schedule.
- **Chats & dialogs** — list, info, members, folders, archive, mute, mark read.
- **Groups & channels** — create, edit, admin/permissions, invite links, stats.
- **Stories, polls, contacts, stickers, media download/upload**, and more.

## Security notes

- This is a **userbot**: it acts as you, with your full account permissions.
  Treat the session file and API credentials like passwords.
- The session is stored locally (default `~/.mcp-telegram/session`) and reused;
  log out with the `telegram-logout` tool to revoke it server-side.
- No credentials are committed to this plugin — they come from your environment.

## Credits

- MCP server: [`@overpod/mcp-telegram`](https://github.com/mcp-telegram/mcp-telegram)
  (MIT), built on GramJS / MTProto.

## License

MIT — see [LICENSE](../LICENSE).
