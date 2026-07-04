# init-project

Bootstrap Claude Code in a project in one pass — a superset of `/init`.

Adds the **`/init-project:init-project`** skill, which:

1. **Analyzes the repo and writes `CLAUDE.md`** — build/test/lint/run commands,
   architecture, and non-obvious conventions, folding in any existing
   `AGENTS.md` / `.cursorrules` / Copilot instructions. Like `/init`.
2. **Builds a codegraph index** — when the repo is a git source tree large
   enough to benefit (≈40+ source files or ≈5000+ lines) and the `codegraph`
   CLI is installed. Skipped (with a reason) otherwise.
3. **Enables the right plugins & MCP servers** — the picker lists everything
   installed with the repo's best fits floated to the top (Python →
   `pyright-lsp`, a GitHub remote → the GitHub MCP, …), and will even install a
   recommended plugin that isn't installed yet. Choices are written to the
   project's `.claude/settings.json` (`enabledPlugins`, `enabledMcpjsonServers`)
   and `.mcp.json`.

## Usage

```
/init-project:init-project                    # full interactive setup
/init-project:init-project --all              # preselect everything, confirm, write
/init-project:init-project pyright-lsp github # preselect these, skip the picker
```

Plugin components are namespaced by plugin, so the invocation is
`/init-project:init-project` (not a bare `/init-project`) — the same shape as
`/skill-creator:skill-creator`. You can also just describe the task ("set up
this project for Claude Code") and let the skill trigger itself.

Run it in a freshly cloned or brand-new project. Plugin and MCP changes take
effect after the next Claude Code restart.

## What the picker shows

It lists **every installed plugin and MCP server**, with the ones that fit the
repo floated to the top as recommendations — and it can install a recommended
plugin that isn't installed yet (most often a language server for a language the
repo uses).

Recommendations come from `skills/init-project/catalog.json`, a *recommendation
overlay* (not the full list of what's offered). Each entry is a plugin `id`
(`name@marketplace`) or an MCP server `config`, with an optional `suggest` rule:

- `{"always": true}` — always recommended
- `{"languages": ["python", "rust"]}` — recommended when that language is detected
- `{"signals": ["github-remote"]}` — recommended on a matching repo signal
  (`has-dependencies`, `git-remote`, `github-remote`, `web-frontend`)

The `marketplaces` map (marketplace → GitHub repo) lets the picker register and
install a recommended plugin from a marketplace you don't have yet. Edit the
catalog to change recommendations or add your own plugins/MCP servers.

## Notes

- Per-project only: everything is written under the project root, never under
  `~/.claude`.
- Runs on Sonnet (`model: sonnet` in the skill frontmatter). The override holds
  for the autonomous stretches; during interactive pauses the session model
  resumes. Change or remove that line to use a different model.
- Supersedes the older personal `project-setup` picker.
