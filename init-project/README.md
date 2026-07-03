# init-project

Bootstrap Claude Code in a project in one pass — a superset of `/init`.

Adds the **`/init-project`** command (backed by the `init-project` skill), which:

1. **Analyzes the repo and writes `CLAUDE.md`** — build/test/lint/run commands,
   architecture, and non-obvious conventions, folding in any existing
   `AGENTS.md` / `.cursorrules` / Copilot instructions. Like `/init`.
2. **Builds a codegraph index** — when the repo is a git source tree large
   enough to benefit (≈40+ source files or ≈5000+ lines) and the `codegraph`
   CLI is installed. Skipped (with a reason) otherwise.
3. **Enables the right plugins & MCP servers** — interactively, with defaults
   preselected from the repo's contents (Python → `pyright-lsp`, a GitHub remote
   → the GitHub MCP, and so on). Choices are written to the project's
   `.claude/settings.json` (`enabledPlugins`, `enabledMcpjsonServers`) and
   `.mcp.json`.

## Usage

```
/init-project                      # full interactive setup
/init-project --all                # preselect everything, confirm, write
/init-project pyright-lsp github   # preselect these, skip the picker
```

Run it in a freshly cloned or brand-new project. Plugin and MCP changes take
effect after the next Claude Code restart.

## Configuring what the picker offers

`skills/init-project/catalog.json` is the single source of truth. Each entry is
a plugin `id` (`name@marketplace`) or an MCP server `config`, with an optional
`suggest` rule that controls when it's preselected:

- `{"always": true}` — always preselected
- `{"languages": ["python", "rust"]}` — preselected when that language is detected
- `{"signals": ["github-remote"]}` — preselected on a matching repo signal
  (`has-dependencies`, `git-remote`, `github-remote`, `web-frontend`)

Edit the catalog to add your own plugins/MCP servers or change the defaults.

## Notes

- Per-project only: everything is written under the project root, never under
  `~/.claude`.
- Supersedes the older personal `project-setup` picker.
