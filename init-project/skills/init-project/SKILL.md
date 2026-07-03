---
name: init-project
description: Bootstrap Claude Code in a project from scratch. Analyze the codebase and write or refresh CLAUDE.md (like /init), build a codegraph index when the repo is a large enough source tree, and interactively enable the right plugins and MCP servers — with defaults preselected from the repo's contents — writing them into .claude/settings.json and .mcp.json. Use this when setting up a new or freshly cloned project, onboarding Claude Code to a repo, or when the user runs /init-project.
argument-hint: "[--all | plugin/mcp names]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
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

Load the catalog: `${CLAUDE_SKILL_DIR}/catalog.json` — `plugins[]` (each an
`id` = `name@marketplace`, a `description`, and an optional `suggest` rule) and
`mcpServers{}` (each a `description`, `config` copied verbatim into `.mcp.json`,
and an optional `suggest`).

Gather current state so the picker is accurate and idempotent:

- `ROOT/.claude/settings.json` → which `enabledPlugins` are already `true`, and
  the existing `enabledMcpjsonServers`.
- `ROOT/.mcp.json` → MCP servers already configured.
- `claude plugin list` (best-effort; ignore failure) → what's installed.

**Compute defaults** by matching each catalog item's `suggest` against the
Phase-0 languages and signals:

- `{"always": true}` → preselect always.
- `{"languages": [...]}` → preselect if any listed language was detected.
- `{"signals": [...]}` → preselect if any listed signal is present.
- no `suggest` → offered, not preselected.

Anything already enabled in this project stays selected (mark it `(on)`).

**Present** two short grouped lists — Plugins and MCP servers — each line
`name — description`, with a leading marker for preselected/`(on)` items so the
user sees the recommendation at a glance. Then let them adjust. Use
`AskUserQuestion` (multiSelect) only when a group has ≤4 items; otherwise ask in
plain text and let them reply with names, numbers, `all`, or `none` — the lists
are usually longer than a 4-option picker allows.

**Argument shortcuts** (`$ARGUMENTS`):
- `--all` — preselect every catalog item; still confirm before writing.
- a space/comma-separated list of plugin `id`s or MCP names — preselect exactly
  those, skip the prompt, go straight to confirmation.

## Phase 4 — Write the project config

Merge, never clobber. Read each file, change only the relevant keys, preserve
everything else and the existing formatting where practical.

**`ROOT/.claude/settings.json`** (create if missing):
- For each chosen plugin: `enabledPlugins["<id>"] = true`. Leave unrelated
  entries alone. Only set an entry to `false` if the user explicitly deselected
  one that was previously `true`.
- For each chosen MCP server: add its name to `enabledMcpjsonServers` (create
  the array if absent; don't duplicate) so the user isn't re-prompted to approve
  it. Don't set `enableAllProjectMcpServers` unless the user asks to approve
  everything.

**`ROOT/.mcp.json`** (only if MCP servers were chosen; create if missing):
- Under `mcpServers`, add each chosen server's `config` verbatim, keyed by its
  catalog name. Preserve servers already there.

Validate every file you touched is valid JSON (`python3 -m json.tool <file>` or
`jq . <file>`). Re-running the whole skill must converge, not pile up duplicates
or flip unrelated settings.

## Phase 5 — Report

Summarize concretely:
- CLAUDE.md — created or updated, and the gist of what went in.
- Codegraph — indexed (with the `status` numbers), or skipped and why.
- Plugins enabled and MCP servers added/approved, with exact file paths written.
- **Restart reminder**: plugin and MCP changes take effect on the next Claude
  Code start. For any MCP server using `${VAR}` placeholders (e.g.
  `GITHUB_TOKEN`), name the env vars the user must set.

## Notes

- `catalog.json` is the single source of truth for what the picker offers and
  what it preselects — edit it to change either.
- This skill is self-contained; it supersedes the older `project-setup` picker.
