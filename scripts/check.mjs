// pnpm test: same pages in every language, internal links resolve, no leftover placeholders, committed output in sync.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolvePath } from "./serve.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = mkdtempSync(join(tmpdir(), "kt-docs-"));
const errors = [];
try {
  execFileSync(process.execPath, [join(ROOT, "scripts/build.mjs"), out], { stdio: "pipe" });
  const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
  const md = (lang) => walk(join(ROOT, "src/content", lang)).map((f) => relative(join(ROOT, "src/content", lang), f).replace(/\\/g, "/")).sort();
  const en = md("en").join(","), pt = md("pt").join(",");
  if (en !== pt) errors.push(`content files differ between en and pt:\n  en: ${en}\n  pt: ${pt}`);
  // assets live in apps/docs, pages in the build dir
  for (const file of walk(out).filter((f) => f.endsWith(".html"))) {
    const html = readFileSync(file, "utf8");
    const page = relative(out, file).replace(/\\/g, "/");
    if (/\{\{[A-Z_]+\}\}/.test(html)) errors.push(`${page}: unreplaced {{placeholder}}`);
    if (/\{soon\}/.test(html)) errors.push(`${page}: unreplaced {soon}`);
    if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${page}: no <title>`);
    for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"#]*)(?:#[^"]*)?"/g)) {
      const base = href.startsWith("/assets/") || /^\/(favicon|apple-touch)/.test(href) ? ROOT : out;
      if (resolvePath(base, href).status !== 200) errors.push(`${page}: broken link ${href}`);
    }
  }
  // committed output == fresh build
  for (const file of walk(out)) {
    const rel = relative(out, file);
    const committed = join(ROOT, rel);
    if (!existsSync(committed) || readFileSync(committed, "utf8") !== readFileSync(file, "utf8")) errors.push(`stale or missing: ${rel.replace(/\\/g, "/")} (run pnpm build)`);
  }
} finally {
  rmSync(out, { recursive: true, force: true });
}
if (errors.length) {
  console.error(errors.slice(0, 60).join("\n"));
  console.error(`\n${errors.length} problem(s)`);
  process.exit(1);
}
console.log("docs: ok");
