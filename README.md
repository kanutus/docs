# docs.kanutus.com

Public documentation of the Kanutus Partner API and MCP server. Static HTML generated from Markdown + the OpenAPI file, no
dependencies, output committed (same model as `apps/site`); Vercel serves the files as they are (project `kanutus-docs`,
repo `kanutus/docs`, published by `scripts/kanutus-publish.sh docs`).

| Path | What |
| --- | --- |
| `src/content/en/*.md`, `src/content/pt/*.md` | All copy. English at `/`, Portuguese at `/pt`. Same files in both languages (`pnpm test` fails otherwise). Title = first `# ` line |
| `src/config.mjs` | Public URLs (`API_URL`, `MCP_URL`, `APP_URL`), sidebar (`NAV`), reference tags, permission per route (`ROUTES`, from `need()` in `apps/api/src/v1`), Portuguese summaries |
| `src/openapi.json` | Snapshot of `https://api.kanutus.com/v1/openapi.json`; refresh with `pnpm openapi` |
| `scripts/build.mjs` | Markdown subset → HTML, `/reference/<tag>` pages from OpenAPI, sitemap, `/openapi.json` |
| `assets/` | `tokens.css` (copy of `packages/ui/src/tokens.css`), `docs.css`, `docs.js`, brand and partner logos |

Markdown extras: `{{API}}`, `{{MCP}}`, `{{APP}}` placeholders; `{soon}` = "Soon/Em breve" badge (never internal jargon);
`> [!note|tip|warn|soon]` callouts; `::: cards` (lines `- [Title](/link) — text`); `:::tabs` with fenced blocks
(the text after the language is the tab title). Avoid naming a content file `claude.md` (Windows treats it as `CLAUDE.md`).

```bash
cd apps/docs
pnpm openapi    # optional: pull the live OpenAPI
pnpm build      # regenerate HTML
pnpm test       # same pages in en/pt, internal links, placeholders, committed output in sync
pnpm preview    # http://localhost:4174
```
