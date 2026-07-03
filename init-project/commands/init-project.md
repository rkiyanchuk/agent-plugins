---
description: Bootstrap Claude Code in this project — analyze the repo and write CLAUDE.md, optionally build a codegraph index, and interactively enable the right plugins & MCP servers.
argument-hint: "[--all | plugin/mcp names]"
---

Bootstrap Claude Code in the current project by running the **init-project**
skill. Invoke it (via the Skill tool) and follow its full workflow end to end:

1. Analyze the codebase and write or refresh `CLAUDE.md` (like `/init`).
2. Build a codegraph index if the repo is a large enough source tree.
3. Interactively enable the right plugins and MCP servers for this project,
   with defaults preselected from the repo's contents, and persist them to
   `.claude/settings.json` and `.mcp.json`.

Pass any arguments straight through to the skill: $ARGUMENTS
