// Refresh src/openapi.json from the live API (or KANUTUS_API_URL), then run `pnpm build`.
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { API_URL } from "../src/config.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const res = await fetch(`${API_URL}/v1/openapi.json`);
if (!res.ok) throw new Error(`GET ${API_URL}/v1/openapi.json -> ${res.status}`);
const spec = await res.json();
if (!String(spec.openapi).startsWith("3.")) throw new Error("not an OpenAPI 3 document");
writeFileSync(join(ROOT, "src/openapi.json"), JSON.stringify(spec, null, 2) + "\n");
console.log(`src/openapi.json <- ${API_URL} (version ${spec.info?.version}, ${Object.keys(spec.paths).length} paths)`);
