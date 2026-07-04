---
name: init-project
description: Bootstrap Claude Code in a project from scratch. Analyze the codebase and write or refresh CLAUDE.md (like /init), build a codegraph index when the repo is a large enough source tree, and interactively enable the right plugins and MCP servers — with defaults preselected from the repo's contents — writing them into .claude/settings.json and .mcp.json. Use this when setting up a new or freshly cloned project, onboarding Claude Code to a repo, or when the user runs /init-project.
argument-hint: "[--all | plugin/mcp names]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
model: sonnet
---

# init-project — bootstrap Claude Code in a project

Set a project up for Claude Code in one pass. Three things happen, in order:
CLAUDE.md is written from an analysis of the repo, a codegraph index is built if
the repo is big enough to benefit, and the user picks which plugins and MCP
servers this project should use (with sensible defaults chosen from what's
actually in the repo). Each phase is useful on its own, so if one doesn't apply
(no code to index, say) skip it and move on — don't force it.

Everything you write goes **under the project root**, never under
`$HOME/.claude`. This is per-project setup.

## Phase 0 — Orient and take inventory

Find the root: `git rev-parse --show-toplevel`. If that fails it's not a git
repo — carry on using the current directory as the root, and note that codegraph
(git-only) will be skipped. Call this path `ROOT`; substitute it literally in the
commands below and in every file path you write.

Take inventory once — every later phase reads from it. From the repo root:

```sh
# Language mix (extension histogram of tracked files)
git ls-files | grep -oiE '\.[a-z0-9_+]+$' | tr 'A-Z' 'a-z' | sort | uniq -c | sort -rn | head -40
# Dependency manifests present
git ls-files | grep -iE '(^|/)(package\.json|pyproject\.toml|requirements[^/]*\.txt|Pipfile|Cargo\.toml|go\.mod|Gemfile|pom\.xml|build\.gradle[^/]*|composer\.json|Package\.swift)$'
# Git remotes (for git-remote / github-remote signals)
git remote -v
```

From that output derive:

- **Languages** — map extensions to languages using the table in
  `references/codegraph.md`.
- **Signals** — `has-dependencies` (any manifest above present),
  `git-remote` (any remote), `github-remote` (a remote URL contains
  `github.com`), `web-frontend` (a JS/TS manifest **and** `.jsx`/`.tsx`/`.vue`/
  `.svelte` files, or an `index.html`).

Keep these languages + signals handy for Phases 2 and 3.

## Phase 1 — Write / refresh CLAUDE.md

Same goal as `/init`: give future Claude a high-signal map of this repo. Read the
README, the dependency manifests, and any existing agent-guidance files
(`CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.cursor/rules/*`,
`.github/copilot-instructions.md`) so you fold their content in rather than
contradict it. Skim the directory layout and a few entry-point files to
understand the architecture.

Write `ROOT/CLAUDE.md` capturing what someone can't guess in five seconds:

- **Commands** — the real build / test / lint / run / typecheck invocations, as
  used in this repo (from scripts, Makefile, CI config — not generic guesses).
- **Architecture** — the big picture that needs several files to see: the major
  components and how they fit, key entry points, where things live.
- **Conventions** — non-obvious patterns, gotchas, house rules a newcomer would
  trip on.

Keep it lean and specific to this repo. Don't restate generic best practices or
anything already in the user's global `~/.claude/CLAUDE.md` — it's always loaded,
so repeating it is pure noise. If `ROOT/CLAUDE.md` already exists, **augment**
it: preserve the user's wording, refresh what's stale, add what's missing, and
confirm before any large rewrite.

## Phase 2 — Codegraph index (conditional)

Read `references/codegraph.md` and follow it. In short: only for a git repo with
the `codegraph` CLI installed, no existing `.codegraph/`, and a source tree
large enough to be worth it (≈40+ source files or ≈5000+ source lines). When it
qualifies, show the user the size numbers, confirm, then run
`codegraph init "ROOT"` and report `codegraph status`. Otherwise skip it — and
in the final report say why (small repo / not git / CLI missing / already
indexed), so the decision is visible rather than silent.

## Phase 3 — Pick plugins & MCP servers

The picker offers **everything installed**, with the items that fit this repo
floated to the top as recommendations. It can also recommend — and install —
things that aren't installed yet but clearly fit (e.g. a language server for a
language the repo uses).

### Discover what exists

One call gives both halves — `claude plugin list --available --json` returns
`{ "installed": [...], "available": [...] }`:

- `installed[]` — each `{ id: "name@marketplace", enabled, scope, ... }`: what's
  installed and whether it's on. Cross-check per-project `enabledPlugins` in
  `ROOT/.claude/settings.json`, since `enabled` there is the global state.
- `available[]` — hundreds of `{ pluginId, name, description, marketplaceName }`
  entries: the not-installed universe. **Don't** pull it all into the picker;
  scan it only for the obvious fits described below.

For MCP servers: `claude mcp list` (text lines `name: command - status`), plus
`ROOT/.mcp.json` and `enabledMcpjsonServers` in `ROOT/.claude/settings.json`.

If the `--json` call fails, fall back to plain `claude plugin list` and
`~/.claude/plugins/installed_plugins.json`.

### The recommendation brain

Load `${CLAUDE_SKILL_DIR}/catalog.json`: a `marketplaces` map (marketplace →
GitHub repo, used when installing), `plugins[]` (each `id`, `description`,
optional `suggest`), and `mcpServers{}` (each `description`, a `config` copied
verbatim into `.mcp.json`, optional `suggest`). The catalog is **not** the
universe — it's the recommendation overlay on top of what's installed.

Mark an item **recommended** when its catalog `suggest` matches the Phase-0
languages/signals:

- `{"always": true}` → always.
- `{"languages": [...]}` → any listed language detected.
- `{"signals": [...]}` → any listed signal present.

Also recommend the obvious fits the catalog doesn't spell out: an installed
plugin whose purpose plainly matches (a language server for a detected
language), and — scanning the `--available` list — a not-installed fit, almost
always a `*-lsp` matching a detected language. Keep recommendations
high-precision: when unsure, leave an item in "other," don't preselect it.

### Present

Two groups, **Plugins** and **MCP servers**. Within each, list **Recommended**
first (preselected), then **Other installed** (not preselected). Tag every line
so the action is unambiguous:

- `(on)` — already enabled in this project; stays on.
- `(enable)` — installed, will be enabled for this project.
- `(install)` — not installed; will be fetched, then enabled.
- `(add)` — MCP server that will be written into `.mcp.json`.

Line format: `<tag> name — description`. Then let the user adjust. Use
`AskUserQuestion` (multiSelect) only when a group has ≤4 items; otherwise ask in
plain text — the installed list is usually long — and accept names, numbers,
`all`, `none`, or `recommended`.

**Argument shortcuts** (`$ARGUMENTS`):
- `--all` — preselect every **recommended** item (not every installed plugin);
  still confirm before acting.
- a space/comma-separated list of plugin `id`s or MCP names — preselect exactly
  those, installing any that are missing, then skip the prompt and go straight
  to confirmation.

## Phase 4 — Apply the choices

Confirm the whole plan before anything with side effects: list what will be
**installed** (network), **enabled**, and **written**, then proceed. Skip this
extra confirmation only when the user already narrowed the set via arguments.

**Install chosen `(install)` plugins.** For each, ensure its marketplace is
registered — if the `@marketplace` half isn't in `claude plugin marketplace
list`, add it from the catalog `marketplaces` map (`claude plugin marketplace
add <repo>`). Then `claude plugin install <id> --scope project`. For a chosen
item not in the catalog, install it by its `pluginId` from the `available[]`
list (its `marketplaceName` tells you which marketplace to register first).

**MCP servers** need no pre-install: their `config` (npx/bunx/http) is written
into `.mcp.json` and fetched on first run.

Then persist config — merge, never clobber; change only the relevant keys.

**`ROOT/.claude/settings.json`** (create if missing):
- Every chosen plugin (already installed, newly installed, or already present):
  `enabledPlugins["<id>"] = true`. Leave unrelated entries alone; only set an
  entry to `false` if the user explicitly turned off one that was `true`.
- Every chosen MCP server: add its name to `enabledMcpjsonServers` (create the
  array if absent; no duplicates) so it's pre-approved. Don't set
  `enableAllProjectMcpServers` unless the user asks to approve everything.

**`ROOT/.mcp.json`** (only if MCP servers were chosen; create if missing):
- Under `mcpServers`, add each chosen server's `config` verbatim, keyed by its
  catalog name. Preserve servers already there.

Validate every file you touched is valid JSON (`python3 -m json.tool <file>` or
`jq . <file>`). Re-running must converge: no duplicate array entries, no flipped
unrelated settings, no reinstall of a plugin that's already present.

## Phase 5 — Report

Summarize concretely:
- CLAUDE.md — created or updated, and the gist of what went in.
- Codegraph — indexed (with the `status` numbers), or skipped and why.
- Plugins **newly installed** (if any), plugins enabled, and MCP servers
  added/approved — with the exact file paths written.
- **Restart reminder**: installs, enables, and MCP changes take effect on the
  next Claude Code start. For any MCP server using `${VAR}` placeholders (e.g.
  `GITHUB_TOKEN`), name the env vars the user must set.

## Notes

- `catalog.json` is the single source of truth for what the picker offers and
  what it preselects — edit it to change either.
- This skill is self-contained; it supersedes the older `project-setup` picker.
