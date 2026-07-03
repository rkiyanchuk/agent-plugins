# Codegraph index (reference)

Codegraph builds a SQLite knowledge graph of a codebase's symbols, edges, and
call paths. Querying it (via the `mcp__codegraph__*` tools or `codegraph
explore`) replaces a grep-and-read loop with one round-trip, so it pays off on
codebases big enough that navigation is a real cost. On tiny repos the index
overhead isn't worth it — Read/Grep/Glob are fine there.

## Build it only when all of these hold

1. **It's a git repo** — you found a root with `git rev-parse --show-toplevel`.
2. **The CLI is installed** — `command -v codegraph` succeeds. If missing, don't
   silently skip: mention it can be added (`npm i -g @codegraph/cli` or the
   user's usual install), and move on.
3. **Not already indexed** — no `.codegraph/` directory at the repo root. If one
   exists, offer `codegraph sync` (fast, incremental) instead of a re-init.
4. **The tree is large enough** — see the heuristic below.

Never run `codegraph init` on `$HOME` or a filesystem root.

## Size heuristic

Count git-tracked source files and their lines. Run from the repo root:

```sh
git ls-files -z -- '*.py' '*.pyi' '*.ts' '*.tsx' '*.js' '*.jsx' '*.mjs' '*.cjs' \
  '*.go' '*.rs' '*.java' '*.kt' '*.kts' '*.swift' '*.rb' '*.php' '*.cs' '*.scala' \
  '*.c' '*.h' '*.cc' '*.cpp' '*.hpp' '*.m' '*.mm' '*.lua' '*.vue' '*.svelte' \
  | tr '\0' '\n' | grep -c .
```

For a line count of those same files:

```sh
git ls-files -z -- '*.py' '*.pyi' '*.ts' '*.tsx' '*.js' '*.jsx' '*.mjs' '*.cjs' \
  '*.go' '*.rs' '*.java' '*.kt' '*.kts' '*.swift' '*.rb' '*.php' '*.cs' '*.scala' \
  '*.c' '*.h' '*.cc' '*.cpp' '*.hpp' '*.m' '*.mm' '*.lua' '*.vue' '*.svelte' \
  | xargs -0 wc -l 2>/dev/null | tail -1
```

**Suggest codegraph when** source files ≥ **40** OR source lines ≥ **5000**.
These are guidelines, not gates — a 35-file repo with deep call graphs is a fine
candidate, a 60-file repo of generated boilerplate is not. Use judgment and tell
the user the numbers you saw.

## Running it

Confirm with the user first — indexing can take from seconds to a couple of
minutes and starts a background daemon. Then:

```sh
codegraph init "<repo-root>"      # builds the initial index into .codegraph/
codegraph status "<repo-root>"    # symbols/files/edges indexed — report this
```

The **codegraph MCP server is global**, not per-project: once `.codegraph/`
exists, `mcp__codegraph__*` tools resolve it automatically on the next session.
So building the index is all that's needed — you don't add anything to
`.mcp.json` for codegraph. If the MCP isn't installed in this agent at all,
`codegraph install` adds it.

## Extension → language map

Used both here (sizing) and by the plugin picker (LSP suggestions):

| language   | extensions                          | LSP plugin              |
|------------|-------------------------------------|-------------------------|
| python     | `.py` `.pyi`                        | `pyright-lsp`           |
| typescript | `.ts` `.tsx`                        | `typescript-lsp`        |
| javascript | `.js` `.jsx` `.mjs` `.cjs`          | `typescript-lsp`        |
| rust       | `.rs`                               | `rust-analyzer-lsp`     |
| go         | `.go`                               | `gopls-lsp`             |
| lua        | `.lua`                              | `lua-lsp`               |
| swift      | `.swift`                            | `swift-lsp`             |
| (other)    | `.java` `.kt` `.c/.h` `.cpp` `.rb` …| counted for size only   |
