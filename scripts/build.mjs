// docs.kanutus.com generator: Markdown (src/content/<lang>/*.md) + OpenAPI (src/openapi.json) -> static HTML.
// No dependencies. Output is committed (like apps/site); Vercel serves the files as they are.
//   node scripts/build.mjs            -> writes into apps/docs
//   node scripts/build.mjs <outDir>   -> writes elsewhere (used by check.mjs to detect stale output)
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { API_URL, APP_URL, DOCS_URL, LANGS, MCP_URL, NAV, ROUTES, SITE_URL, SUMMARY_EN, SUMMARY_PT, TAGS } from "../src/config.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(process.argv[2] || ROOT);
const spec = JSON.parse(readFileSync(join(ROOT, "src/openapi.json"), "utf8"));

const UI = {
  en: {
    docs: "Docs", openApp: "Open the app", site: "kanutus.com", menu: "Menu", onThisPage: "On this page", copy: "Copy", copied: "Copied",
    prev: "Previous", next: "Next", soon: "Soon", permission: "Permission", anyCredential: "any valid credential", params: "Parameters",
    body: "Request body", response: "Response", errors: "Errors", example: "Example", name: "Name", in: "In", type: "Type", required: "Required",
    description: "Description", yes: "yes", soonOp: "Live mode answers 501 coming soon. Try it now with a kt_test_ key (simulator).",
    edit: "Something wrong or missing? Write to", notFound: "Page not found", notFoundBody: "This page does not exist (or moved).", backHome: "Go to the docs home",
    langLabel: "Language", spec: "OpenAPI 3.1 file", skip: "Skip to content", fields: "Fields", searchPh: "Search endpoints (rooms, meetings, webhook…)", noResults: "No endpoint found", tryIt: "Try it", tryNote: "Runs from your browser against the real API. Use a kt_test_ key: nothing is charged. The key stays in this tab only.", tryKey: "API key", trySend: "Send request", responses: "Responses by status", errorCodes: "See all error codes", signIn: "Sign in / Create account", signInShort: "Sign in",
  },
  pt: {
    docs: "Docs", openApp: "Abrir o app", site: "kanutus.com", menu: "Menu", onThisPage: "Nesta página", copy: "Copiar", copied: "Copiado",
    prev: "Anterior", next: "Próximo", soon: "Em breve", permission: "Permissão", anyCredential: "qualquer credencial válida", params: "Parâmetros",
    body: "Corpo da requisição", response: "Resposta", errors: "Erros", example: "Exemplo", name: "Nome", in: "Onde", type: "Tipo", required: "Obrigatório",
    description: "Descrição", yes: "sim", soonOp: "Em produção responde 501 (em breve). Já dá para testar com uma chave kt_test_ (simulador).",
    edit: "Achou algo errado ou faltando? Escreva para", notFound: "Página não encontrada", notFoundBody: "Esta página não existe (ou mudou de lugar).", backHome: "Ir para o início da documentação",
    langLabel: "Idioma", spec: "Arquivo OpenAPI 3.1", skip: "Pular para o conteúdo", fields: "Campos", searchPh: "Buscar endpoints (salas, reuniões, webhook…)", noResults: "Nenhum endpoint encontrado", tryIt: "Testar agora", tryNote: "Roda no seu navegador contra a API de verdade. Use uma chave kt_test_: nada é cobrado. A chave fica só nesta aba.", tryKey: "Chave de API", trySend: "Enviar requisição", responses: "Respostas por status", errorCodes: "Ver todos os códigos de erro", signIn: "Entrar / Criar conta", signInShort: "Entrar",
  },
};

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/<[^>]+>/g, "").replace(/`/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const vars = (s) => s.replaceAll("{{API}}", API_URL).replaceAll("{{MCP}}", MCP_URL).replaceAll("{{APP}}", APP_URL);
const pageUrl = (L, slug) => (slug === "index" ? L.prefix || "/" : `${L.prefix}/${slug}`);
const badge = (L, kind = "soon") => `<span class="badge badge-${kind}">${esc(UI[L.code].soon)}</span>`;

function inline(s, L) {
  const codes = [];
  let out = esc(s).replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  out = out
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, "$1<em>$2</em>")
    .replace(/\{soon\}/g, badge(L))
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
      const h = href.replace(/&amp;/g, "&");
      const ext = /^https?:/.test(h);
      const url = !ext && h.startsWith("/") && !h.startsWith("/assets") && !h.startsWith("/openapi") ? (h === "/" ? L.prefix || "/" : L.prefix + h) : h;
      return `<a href="${esc(url)}"${ext ? ' rel="noopener" target="_blank"' : ""}>${text}</a>`;
    });
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
}

function codeBlock(lang, title, body, L) {
  const label = title || lang || "";
  return `<div class="code"><div class="code-head"><span>${esc(label)}</span><button type="button" class="copy" data-copy data-copied="${esc(UI[L.code].copied)}">${esc(UI[L.code].copy)}</button></div><pre><code${lang ? ` class="lang-${esc(lang)}"` : ""}>${esc(body)}</code></pre></div>`;
}

/** Small Markdown subset: headings, paragraphs, lists, code fences, tables, callouts, ::: cards / ::: tabs, raw HTML lines. */
function md(src, L) {
  const lines = vars(src).replace(/\r/g, "").split("\n");
  const html = [];
  const toc = [];
  let title = "";
  let i = 0;
  const para = [];
  const flush = () => {
    if (para.length) html.push(`<p>${inline(para.join(" "), L)}</p>`);
    para.length = 0;
  };
  const readFence = () => {
    const m = /^```(\S*)\s*(.*)$/.exec(lines[i]);
    const body = [];
    i++;
    while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
    i++;
    return { lang: m[1], title: m[2], body: body.join("\n") };
  };
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      flush();
      const f = readFence();
      html.push(codeBlock(f.lang, f.title, f.body, L));
      continue;
    }
    if (/^:::\s*tabs/.test(line)) {
      flush();
      i++;
      const tabs = [];
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) {
        if (/^```/.test(lines[i])) tabs.push(readFence());
        else i++;
      }
      i++;
      const id = `t${html.length}`;
      html.push(
        `<div class="tabs" data-tabs><div class="tab-list" role="tablist">${tabs.map((t, k) => `<button type="button" role="tab" aria-selected="${k === 0}" data-tab="${id}-${k}">${esc(t.title || t.lang)}</button>`).join("")}</div>` +
          tabs.map((t, k) => `<div class="tab-panel" data-panel="${id}-${k}"${k ? " hidden" : ""}>${codeBlock(t.lang, t.title, t.body, L)}</div>`).join("") +
          `</div>`,
      );
      continue;
    }
    if (/^:::\s*cards/.test(line)) {
      flush();
      i++;
      const cards = [];
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) {
        const m = /^-\s*\[([^\]]+)\]\(([^)]+)\)\s*(?:—|-)\s*(.*)$/.exec(lines[i]);
        if (m) cards.push(m);
        i++;
      }
      i++;
      html.push(`<div class="cards">${cards.map(([, t, h, d]) => `<a class="card" href="${esc(h.startsWith("/") ? (h === "/" ? L.prefix || "/" : L.prefix + h) : h)}"><strong>${inline(t, L)}</strong><span>${inline(d, L)}</span></a>`).join("")}</div>`);
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      flush();
      const level = h[1].length;
      const text = h[2];
      if (level === 1) {
        title = text.replace(/\{soon\}/g, "").trim();
        html.push(`<h1>${inline(text, L)}</h1>`);
      } else {
        const id = slugify(text.replace(/\{soon\}/g, ""));
        if (level === 2) toc.push({ id, text: text.replace(/\{soon\}/g, "").replace(/`/g, "").trim() });
        html.push(`<h${level} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${inline(text, L)}</h${level}>`);
      }
      i++;
      continue;
    }
    if (/^>\s*\[!(\w+)\]/.test(line)) {
      flush();
      const kind = /^>\s*\[!(\w+)\]\s*(.*)$/.exec(line);
      const body = [kind[2]];
      i++;
      while (i < lines.length && /^>/.test(lines[i])) body.push(lines[i++].replace(/^>\s?/, ""));
      html.push(`<div class="callout callout-${kind[1]}">${body.filter(Boolean).map((p) => `<p>${inline(p, L)}</p>`).join("")}</div>`);
      continue;
    }
    if (/^\|/.test(line)) {
      flush();
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|\s*$/g, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      html.push(`<div class="table"><table><thead><tr>${head.map((c) => `<th>${inline(c, L)}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c, L)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    const li = /^(\s*)(-|\d+\.)\s+(.*)$/.exec(line);
    if (li) {
      flush();
      const ordered = /\d/.test(li[2]);
      const items = [];
      while (i < lines.length) {
        const m = /^(-|\d+\.)\s+(.*)$/.exec(lines[i]);
        if (m && /\d/.test(m[1]) === ordered) {
          items.push({ text: m[2], code: [] });
          i++;
        } else if (/^\s{2,}```/.test(lines[i]) && items.length) {
          const indent = /^(\s*)/.exec(lines[i])[1].length;
          const f = /^\s*```(\S*)\s*(.*)$/.exec(lines[i]);
          const body = [];
          i++;
          while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) body.push(lines[i++].slice(indent));
          i++;
          items[items.length - 1].code.push(codeBlock(f[1], f[2], body.join("\n"), L));
        } else if (!lines[i].trim() && items.length) {
          const nx = lines.slice(i + 1).find((l) => l.trim());
          const same = nx && /^(-|\d+\.)\s+/.exec(nx);
          if (nx && (/^\s{2,}\S/.test(nx) || (same && /\d/.test(same[1]) === ordered))) i++;
          else break;
        } else if (/^\s{2,}\S/.test(lines[i]) && items.length) {
          items[items.length - 1].text += " " + lines[i].trim();
          i++;
        } else break;
      }
      const tag = ordered ? "ol" : "ul";
      html.push(`<${tag}${ordered ? ' class="steps"' : ""}>${items.map((it) => `<li><div>${inline(it.text, L)}</div>${it.code.join("")}</li>`).join("")}</${tag}>`);
      continue;
    }
    if (/^\s*<[a-z!/]/i.test(line)) {
      flush();
      html.push(line);
      i++;
      continue;
    }
    if (!line.trim()) {
      flush();
      i++;
      continue;
    }
    para.push(line.trim());
    i++;
  }
  flush();
  return { title, toc, html: html.join("\n") };
}

// ---------------------------------------------------------------- OpenAPI reference
function deref(s) {
  s = (s && s.$ref ? spec.components.schemas[s.$ref.split("/").pop()] : s) || {};
  if (!s.allOf) return s;
  const parts = s.allOf.map(deref);
  return { type: "object", properties: Object.assign({}, ...parts.map((p) => p.properties || {})), required: parts.flatMap((p) => p.required || []) };
}
function typeOf(s) {
  s = deref(s);
  if (s.enum) return s.enum.map((v) => JSON.stringify(v)).join(" | ");
  if (s.anyOf || s.oneOf) return (s.anyOf || s.oneOf).map(typeOf).join(" | ");
  const t = Array.isArray(s.type) ? s.type.filter((x) => x !== "null").join(" | ") + (s.type.includes("null") ? " | null" : "") : s.type;
  if (t === "array") return `${typeOf(s.items)}[]`;
  if (t === "object" || (!t && s.properties)) return "object";
  return t || "any";
}
function example(s, depth = 0) {
  s = deref(s);
  if (s.example !== undefined) return s.example;
  if (s.default !== undefined && s.default !== null) return s.default;
  if (s.enum) return s.enum[0];
  if (s.anyOf || s.oneOf) return example((s.anyOf || s.oneOf).find((x) => deref(x).type !== "null") || {}, depth);
  const t = Array.isArray(s.type) ? s.type.find((x) => x !== "null") : s.type;
  if (depth > 5) return null;
  if (t === "array") return [example(s.items, depth + 1)];
  if (t === "object" || s.properties) {
    const o = {};
    for (const [k, v] of Object.entries(s.properties || {})) o[k] = example(v, depth + 1);
    return o;
  }
  if (t === "integer" || t === "number") return s.minimum ?? 0;
  if (t === "boolean") return true;
  if (t === "string") return s.format === "date-time" ? "2026-10-12T13:00:00Z" : s.format === "email" ? "ana@example.com" : s.format === "uri" ? "https://example.com" : "string";
  return null;
}
/** Flattened field rows: name (dotted), type, required, description. */
function fields(s, prefix = "", req = [], out = [], depth = 0) {
  s = deref(s);
  const props = s.properties || (s.type === "array" || (Array.isArray(s.type) && s.type.includes("array")) ? deref(s.items).properties : null);
  const required = s.required || (s.items ? deref(s.items).required : []) || [];
  if (!props || depth > 3) return out;
  for (const [k, v] of Object.entries(props)) {
    const d = deref(v);
    const name = prefix ? `${prefix}.${k}` : k;
    const extra = [d.description, d.minLength != null || d.maxLength != null ? `length ${d.minLength ?? 0}–${d.maxLength ?? "∞"}` : "", d.minimum != null || d.maximum != null ? `${d.minimum ?? ""}…${d.maximum ?? ""}` : "", d.default != null && typeof d.default !== "object" ? `default ${JSON.stringify(d.default)}` : ""].filter(Boolean).join(" · ");
    out.push({ name, type: typeOf(d), required: required.includes(k), desc: extra });
    const inner = d.type === "array" || (Array.isArray(d.type) && d.type.includes("array")) ? deref(d.items) : d;
    if (inner.properties) fields(d, name + (inner === d ? "" : "[]"), [], out, depth + 1);
  }
  return out;
}
function fieldTable(rows, L) {
  const t = UI[L.code];
  if (!rows.length) return "";
  return `<div class="table"><table><thead><tr><th>${t.name}</th><th>${t.type}</th><th>${t.description}</th></tr></thead><tbody>${rows
    .map((r) => `<tr><td><code>${esc(r.name)}</code>${r.required ? ` <span class="req">${esc(t.required.toLowerCase())}</span>` : ""}</td><td><code class="type">${esc(r.type)}</code></td><td>${inline(r.desc || "", L)}</td></tr>`)
    .join("")}</tbody></table></div>`;
}
function curlFor(method, path, op) {
  const p = sampleIds(path);
  const q = (op.parameters || []).filter((x) => x.in === "query" && x.required).map((x) => `${x.name}=${encodeURIComponent(example(x.schema))}`);
  const lines = [`curl${method === "GET" ? "" : ` -X ${method}`} "${API_URL}${p}${q.length ? "?" + q.join("&") : ""}" \\`, `  -H "Authorization: Bearer $KANUTUS_API_KEY"`];
  if ((op.parameters || []).some((x) => x.in === "header" && x.name === "idempotency-key")) lines[lines.length - 1] += " \\", lines.push(`  -H "Idempotency-Key: $(uuidgen)"`);
  const body = op.requestBody?.content?.["application/json"]?.schema;
  if (body) {
    lines[lines.length - 1] += " \\";
    lines.push(`  -H "Content-Type: application/json" \\`, `  -d '${JSON.stringify(example(body))}'`);
  }
  return lines.join("\n");
}
function opsByTag(tag) {
  const ops = [];
  for (const [path, item] of Object.entries(spec.paths)) for (const [m, op] of Object.entries(item)) if ((op.tags || []).includes(tag)) ops.push({ method: m.toUpperCase(), path, op });
  return ops;
}
const opId = (method, path) => slugify(`${method} ${path}`);
function sampleId(path, name) {
  const segs = path.split("/");
  const i = segs.indexOf("{" + name + "}");
  const col = i > 0 ? segs[i - 1] : "";
  return col === "sessions" || col === "transcripts" ? "ses_4fQ2xWm9Lr7Tb1Kc8Zp3Vd5N" : col === "calls" ? "call_7Hn2Qd9Wk4Lp6Rt1Xb8Mc3Zf" : col === "event-types" || col === "webhook-endpoints" ? "8f14e45f-ceea-4c8e-9b3a-2f1d5a7c3b10" : "kqz-mbdt-wpa";
}
const sampleIds = (path) => path.replace(/\{(\w+)\}/g, (_, n) => sampleId(path, n));
function jsFor(method, path, op) {
  const body = op.requestBody?.content?.["application/json"]?.schema;
  const idem = (op.parameters || []).some((x) => x.in === "header" && x.name === "idempotency-key");
  const h = ["Authorization: `Bearer ${process.env.KANUTUS_API_KEY}`"];
  if (idem) h.push('"Idempotency-Key": crypto.randomUUID()');
  if (body) h.push('"Content-Type": "application/json"');
  return `const res = await fetch("${API_URL}${sampleIds(path)}", {\n  method: "${method}",\n  headers: {\n    ${h.join(",\n    ")},\n  },${body ? `\n  body: JSON.stringify(${JSON.stringify(example(body))}),` : ""}\n});\nconsole.log(res.status, await res.json());`;
}
function pyFor(method, path, op) {
  const body = op.requestBody?.content?.["application/json"]?.schema;
  const idem = (op.parameters || []).some((x) => x.in === "header" && x.name === "idempotency-key");
  const h = [`"Authorization": f"Bearer {os.environ['KANUTUS_API_KEY']}"`];
  if (idem) h.push('"Idempotency-Key": str(uuid.uuid4())');
  const py = (v) => JSON.stringify(v).replace(/\btrue\b/g, "True").replace(/\bfalse\b/g, "False").replace(/\bnull\b/g, "None");
  return `import os, uuid, requests\n\nr = requests.request(\n    "${method}",\n    "${API_URL}${sampleIds(path)}",\n    headers={${h.join(", ")}},${body ? `\n    json=${py(example(body))},` : ""}\n)\nprint(r.status_code, r.json())`;
}
/** Every operation, for the endpoint search on the reference pages. */
function searchIndex(L) {
  const out = [];
  for (const T of TAGS) for (const { method, path, op } of opsByTag(T.tag)) {
    const key = `${method} ${path}`;
    out.push({ m: method, p: path, s: L.code === "pt" ? SUMMARY_PT[key] || op.summary : SUMMARY_EN[key] || op.summary, g: T[L.code], u: `${L.prefix}/reference/${T.slug}#${opId(method, path)}` });
  }
  return out;
}
function searchBox(L) {
  const t = UI[L.code];
  return `<div class="ref-search" data-ref-search data-empty="${esc(t.noResults)}"><input type="search" placeholder="${esc(t.searchPh)}" aria-label="${esc(t.searchPh)}" autocomplete="off"><ul hidden></ul><script type="application/json">${JSON.stringify(searchIndex(L)).replace(/</g, "\\u003c")}</script></div>`;
}
function tryIt(method, path, op, L) {
  const t = UI[L.code];
  const params = (op.parameters || []).filter((p) => p.in === "path" || p.in === "query");
  const body = op.requestBody?.content?.["application/json"]?.schema;
  const idem = (op.parameters || []).some((x) => x.in === "header" && x.name === "idempotency-key");
  const ph = (p) => (p.in === "path" ? sampleId(path, p.name) : String(example(p.schema) ?? ""));
  const field = (p) => `<label><span><code>${esc(p.name)}</code> <small>${p.in}</small>${p.required ? ` <span class="req">${esc(t.required.toLowerCase())}</span>` : ""}</span><input data-param="${esc(p.name)}" data-in="${p.in}" placeholder="${esc(ph(p))}"${p.required ? " required" : ""}></label>`;
  const ex = body ? JSON.stringify(example(body), null, 2) : "";
  return `<details class="try" data-try data-method="${method}" data-path="${esc(path)}" data-api="${esc(API_URL)}"${idem ? " data-idem" : ""}>
<summary>${esc(t.tryIt)}</summary>
<div class="try-body">
<p class="try-note">${esc(t.tryNote)}</p>
<label><span>${esc(t.tryKey)}</span><input data-key type="password" autocomplete="off" placeholder="kt_test_..."></label>
${params.map(field).join("\n")}
${body ? `<label class="try-json"><span>${esc(t.body)} (JSON)</span><textarea data-body rows="${Math.min(14, ex.split("\n").length + 1)}" spellcheck="false">${esc(ex)}</textarea></label>` : ""}
<div class="try-actions"><button type="button" class="btn" data-send>${esc(t.trySend)}</button><code class="try-url">${method} ${esc(path)}</code></div>
<div class="try-out" hidden><div class="code"><div class="code-head"><span data-status></span><button type="button" class="copy" data-copy data-copied="${esc(t.copied)}">${esc(t.copy)}</button></div><pre><code data-out></code></pre></div></div>
</div>
</details>`;
}
function referencePage(T, L) {
  const t = UI[L.code];
  const toc = [];
  const parts = [`<h1>${esc(T[L.code])}</h1>`, searchBox(L)];
  for (const { method, path, op } of opsByTag(T.tag)) {
    const key = `${method} ${path}`;
    const meta = ROUTES[key] || {};
    const summary = L.code === "pt" ? SUMMARY_PT[key] || op.summary : SUMMARY_EN[key] || op.summary;
    const id = opId(method, path);
    toc.push({ id, text: `${method} ${path}` });
    const params = (op.parameters || []).map((p) => ({ name: p.name, type: `${p.in} · ${typeOf(p.schema)}`, required: !!p.required, desc: p.description || deref(p.schema).description || "" }));
    const body = op.requestBody?.content?.["application/json"]?.schema;
    const codes = Object.keys(op.responses);
    const okCode = codes.find((c) => /^2/.test(c));
    const ok = op.responses[okCode];
    const okSchema = ok?.content?.["application/json"]?.schema;
    const statusRows = codes.map((c) => {
      const r = op.responses[c];
      const inner = /^2/.test(c)
        ? okSchema ? codeBlock("json", c, JSON.stringify(example(okSchema), null, 2), L) : ""
        : codeBlock("json", `${c} application/problem+json`, JSON.stringify({ type: "https://docs.kanutus.com/errors", title: "<code>", status: Number(c), code: "<code>", message: "…", request_id: "req_…" }, null, 2), L) + `<p class="op-meta"><a href="${L.prefix}/errors">${esc(t.errorCodes)}</a></p>`;
      return `<details class="status"><summary><code class="st st-${c[0]}">${c}</code> ${inline(r.description || "", L)}</summary>${inner}</details>`;
    });
    parts.push(`<section class="op" id="${id}">
<h2><span class="method method-${method.toLowerCase()}">${method}</span><code class="path">${esc(path)}</code><a class="anchor" href="#${id}" aria-hidden="true">#</a></h2>
<p class="op-summary">${inline(summary, L)}${meta.soon ? " " + badge(L) : ""}</p>
<p class="op-meta">${t.permission}: ${meta.scope ? `<code>${meta.scope}</code>` : esc(t.anyCredential)}</p>
${meta.soon ? `<div class="callout callout-soon"><p>${esc(t.soonOp)}</p></div>` : ""}
${params.length ? `<h3>${t.params}</h3>${fieldTable(params, L)}` : ""}
${body ? `<h3>${t.body}</h3>${fieldTable(fields(body), L)}` : ""}
<h3>${t.response} <code>${okCode}</code></h3>
${okSchema ? fieldTable(fields(okSchema), L) : `<p>${esc(ok?.description || "")}</p>`}
<h3>${t.example}</h3>
<div class="tabs" data-tabs><div class="tab-list" role="tablist"><button type="button" role="tab" aria-selected="true" data-tab="${id}-c">curl</button><button type="button" role="tab" aria-selected="false" data-tab="${id}-j">Node.js</button><button type="button" role="tab" aria-selected="false" data-tab="${id}-p">Python</button></div><div class="tab-panel" data-panel="${id}-c">${codeBlock("bash", "curl", curlFor(method, path, op), L)}</div><div class="tab-panel" data-panel="${id}-j" hidden>${codeBlock("js", "Node.js", jsFor(method, path, op), L)}</div><div class="tab-panel" data-panel="${id}-p" hidden>${codeBlock("python", "Python", pyFor(method, path, op), L)}</div></div>
${tryIt(method, path, op, L)}
<h3>${t.responses}</h3>
<div class="statuses">${statusRows.join("")}</div>
</section>`);
  }
  return { title: T[L.code], toc, html: parts.join("\n") };
}

// ---------------------------------------------------------------- layout
function navHtml(L, current) {
  return NAV.map((g) => {
    const items = g.items.flatMap((slug) => (slug === "@reference" ? TAGS.map((T) => ({ slug: `reference/${T.slug}`, title: T[L.code], sub: true })) : [{ slug, title: titles[L.code][slug] }]));
    return `<div class="nav-group"><p>${esc(g.group[L.code])}</p><ul>${items.map((it) => `<li><a href="${pageUrl(L, it.slug)}"${it.slug === current ? ' aria-current="page"' : ""}${it.sub ? ' class="sub"' : ""}>${inline(it.title, L)}</a></li>`).join("")}</ul></div>`;
  }).join("");
}
const order = NAV.flatMap((g) => g.items.flatMap((s) => (s === "@reference" ? TAGS.map((T) => `reference/${T.slug}`) : [s])));
const titles = { en: {}, pt: {} };

function layout(L, slug, page) {
  const t = UI[L.code];
  const idx = order.indexOf(slug);
  const prev = idx > 0 ? order[idx - 1] : null;
  const next = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
  const titleOf = (s) => (s.startsWith("reference/") ? TAGS.find((T) => `reference/${T.slug}` === s)[L.code] : titles[L.code][s]);
  const plain = (s) => s.replace(/\{soon\}/g, "").replace(/`/g, "").trim();
  const alt = LANGS.map((A) => `<link rel="alternate" hreflang="${A.html}" href="${DOCS_URL}${pageUrl(A, slug) === "/" ? "" : pageUrl(A, slug)}">`).join("\n");
  const docTitle = slug === "index" ? `Kanutus ${t.docs}` : `${plain(page.title)} · Kanutus ${t.docs}`;
  const desc = page.desc || (L.code === "pt" ? "Documentação da API e do MCP do Kanutus: salas com tradução ao vivo, agenda, vozes, ligações e agentes de IA." : "Kanutus API and MCP documentation: rooms with live translation, scheduling, voices, calls and AI agents.");
  return `<!doctype html>
<html lang="${L.html}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(docTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${DOCS_URL}${pageUrl(L, slug) === "/" ? "" : pageUrl(L, slug)}">
${alt}
<meta name="theme-color" content="#000000">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/SpaceGrotesk-wght.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="/assets/tokens.css">
<link rel="stylesheet" href="/assets/docs.css">
<script src="/assets/docs.js" defer></script>
</head>
<body>
<a class="skip" href="#content">${t.skip}</a>
<header class="top">
<button type="button" class="menu-btn" data-menu aria-expanded="false" aria-controls="sidebar">${t.menu}</button>
<a class="brand" href="${L.prefix || "/"}" aria-label="Kanutus ${t.docs}"><img src="/assets/brand/kanutus-logo-dark.svg" alt="Kanutus" width="97" height="28"><span>${t.docs}</span></a>
<div class="top-right">
<nav class="lang" aria-label="${t.langLabel}">${LANGS.map((A) => `<a href="${pageUrl(A, slug === "404" ? "index" : slug)}" hreflang="${A.html}" lang="${A.html}"${A.code === L.code ? ' aria-current="true"' : ""}>${A.code.toUpperCase()}</a>`).join("")}</nav>
<a class="top-link" href="${SITE_URL}${L.code === "pt" ? "/pt" : ""}">${t.site}</a>
<a class="btn" href="${APP_URL}/developers"><span class="long">${t.signIn}</span><span class="short">${t.signInShort}</span></a>
</div>
</header>
<div class="shell">
<aside class="sidebar" id="sidebar">${navHtml(L, slug)}</aside>
<main id="content" class="content">
<article class="prose">
${slug === "reference" ? page.html.replace("</h1>", "</h1>\n" + searchBox(L)) : page.html}
</article>
<nav class="pager">${prev ? `<a class="prev" href="${pageUrl(L, prev)}"><span>${t.prev}</span><strong>${inline(titleOf(prev), L)}</strong></a>` : "<span></span>"}${next ? `<a class="next" href="${pageUrl(L, next)}"><span>${t.next}</span><strong>${inline(titleOf(next), L)}</strong></a>` : ""}</nav>
<footer class="foot"><p>${t.edit} <a href="mailto:mailing@kanutus.com">mailing@kanutus.com</a> · <a href="/openapi.json">${t.spec}</a> · © 2026 Kanutus</p></footer>
</main>
${page.toc.length > 1 ? `<aside class="toc"><p>${t.onThisPage}</p><ul>${page.toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ul></aside>` : ""}
</div>
</body>
</html>
`;
}

// ---------------------------------------------------------------- build
const write = (rel, content) => {
  const f = join(OUT, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, content);
};
const pages = [];
// every OpenAPI tag needs a page and every route a permission entry (otherwise the reference would hide or mislabel it)
for (const [path, item] of Object.entries(spec.paths)) for (const [m, op] of Object.entries(item)) {
  for (const tag of op.tags || []) if (!TAGS.some((T) => T.tag === tag)) throw new Error(`OpenAPI tag "${tag}" has no entry in TAGS (src/config.mjs)`);
  if (!(`${m.toUpperCase()} ${path}` in ROUTES)) throw new Error(`${m.toUpperCase()} ${path} has no entry in ROUTES (src/config.mjs)`);
}
for (const L of LANGS) {
  for (const slug of order) {
    if (slug.startsWith("reference/")) continue;
    const file = join(ROOT, "src/content", L.code, `${slug}.md`);
    if (!existsSync(file)) throw new Error(`missing ${L.code}/${slug}.md`);
    const raw = readFileSync(file, "utf8");
    const m = /^#\s+(.*)$/m.exec(raw);
    titles[L.code][slug] = m ? m[1] : slug;
  }
}
// clean previously generated output (only folders/files we own)
if (OUT === ROOT) for (const p of ["index.html", "404.html", "sitemap.xml", "pt", "quickstart", "authentication", "test-mode", "mcp", "guides", "webhooks", "errors", "responsible-use", "reference", "openapi.json"]) rmSync(join(OUT, p), { recursive: true, force: true });

for (const L of LANGS) {
  for (const slug of order) {
    const page = slug.startsWith("reference/") ? referencePage(TAGS.find((T) => `reference/${T.slug}` === slug), L) : md(readFileSync(join(ROOT, "src/content", L.code, `${slug}.md`), "utf8"), L);
    const rel = `${L.prefix.slice(1)}${L.prefix ? "/" : ""}${slug === "index" ? "" : slug + "/"}index.html`;
    write(rel, layout(L, slug, page));
    pages.push(`${DOCS_URL}${pageUrl(L, slug) === "/" ? "" : pageUrl(L, slug)}`);
  }
}
// 404 (bilingual)
write("404.html", layout(LANGS[0], "404", { title: UI.en.notFound, toc: [], html: `<h1>${UI.en.notFound}</h1><p>${UI.en.notFoundBody} <a href="/">${UI.en.backHome}</a>.</p><p lang="pt-BR">${UI.pt.notFoundBody} <a href="/pt">${UI.pt.backHome}</a>.</p>` }));
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`);
// the spec, with the public server URL of this build
const pub = structuredClone(spec);
for (const [path, item] of Object.entries(pub.paths)) for (const [m, op] of Object.entries(item)) if (SUMMARY_EN[`${m.toUpperCase()} ${path}`]) op.summary = SUMMARY_EN[`${m.toUpperCase()} ${path}`];
write("openapi.json", JSON.stringify({ ...pub, servers: [{ url: API_URL }] }, null, 2) + "\n");
if (OUT !== ROOT) for (const f of ["robots.txt"]) existsSync(join(ROOT, f)) && copyFileSync(join(ROOT, f), join(OUT, f));
console.log(`docs: ${pages.length} pages (${LANGS.map((L) => L.code).join(", ")}), API ${API_URL}, MCP ${MCP_URL}`);
