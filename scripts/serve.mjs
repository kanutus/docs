// Local preview with Vercel-like clean URLs: /quickstart -> quickstart/index.html, unknown -> 404.html.
// Usage: node scripts/serve.mjs [port] [dir]   (default 4174, apps/docs)
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(process.argv[3] || resolve(dirname(fileURLToPath(import.meta.url)), ".."));
const PORT = Number(process.argv[2] || process.env.PORT || 4174);
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".ttf": "font/ttf", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8" };

export function resolvePath(root, urlPath) {
  const p = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (p.endsWith("/") && p.length > 1) return { redirect: p.slice(0, -1) };
  const safe = normalize(p).replace(/^(\.\.[/\\])+/, "");
  for (const c of p === "/" ? ["index.html"] : [safe, join(safe, "index.html"), safe + ".html"]) {
    const f = resolve(root, "." + (c.startsWith("/") || c.startsWith("\\") ? c : "/" + c));
    if (f.startsWith(root) && existsSync(f) && statSync(f).isFile()) return { file: f, status: 200 };
  }
  return { file: resolve(root, "404.html"), status: 404 };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createServer((req, res) => {
    const r = resolvePath(ROOT, req.url || "/");
    if (r.redirect) return res.writeHead(308, { location: r.redirect }).end();
    res.writeHead(r.status, { "content-type": TYPES[extname(r.file)] || "application/octet-stream", "cache-control": "no-store" });
    createReadStream(r.file).pipe(res);
  }).listen(PORT, () => console.log(`docs preview -> http://localhost:${PORT}`));
}
