// docs.kanutus.com: shared settings. Copy lives in src/content/<lang>/*.md; the API reference comes from src/openapi.json.
//
// Public URLs shown in every example (override with KANUTUS_API_URL / KANUTUS_MCP_URL to build against another environment).
const trim = (s) => s.replace(/\/+$/, "");
export const API_URL = trim(process.env.KANUTUS_API_URL || "https://api.kanutus.com");
export const MCP_URL = trim(process.env.KANUTUS_MCP_URL || "https://mcp.kanutus.com/mcp");
export const APP_URL = trim(process.env.KANUTUS_APP_URL || "https://app.kanutus.com");
export const SITE_URL = "https://kanutus.com";
export const DOCS_URL = "https://docs.kanutus.com";

/** English at the root, Portuguese under /pt (same convention as kanutus.com). */
export const LANGS = [
  { code: "en", prefix: "", html: "en", name: "English" },
  { code: "pt", prefix: "/pt", html: "pt-BR", name: "Português" },
];

/**
 * Sidebar. `slug` = file name in src/content/<lang>/ (and URL path); "reference" pages are generated from OpenAPI.
 * Titles come from the first `# ` heading of each Markdown file.
 */
export const NAV = [
  { group: { en: "Get started", pt: "Começar" }, items: ["index", "quickstart", "authentication", "test-mode"] },
  { group: { en: "Connect AI assistants (MCP)", pt: "Assistentes de IA (MCP)" }, items: ["mcp", "mcp/connect-claude", "mcp/connect-chatgpt", "mcp/other-clients", "mcp/tools"] },
  { group: { en: "Guides", pt: "Guias" }, items: ["guides/agent-in-room", "guides/schedule-meeting", "guides/translated-call", "guides/transcripts"] },
  { group: { en: "Build", pt: "Integrar" }, items: ["webhooks", "errors", "responsible-use"] },
  { group: { en: "API reference", pt: "Referência da API" }, items: ["reference", "@reference"] },
];

/** OpenAPI tag -> page slug under /reference, in sidebar order. */
export const TAGS = [
  { tag: "Account", slug: "account", en: "Account and usage", pt: "Conta e uso" },
  { tag: "Voices", slug: "voices", en: "Voices", pt: "Vozes" },
  { tag: "Rooms", slug: "rooms", en: "Rooms", pt: "Salas" },
  { tag: "Calendar", slug: "calendar", en: "Meetings and booking", pt: "Reuniões e agendamento" },
  { tag: "Agents", slug: "agents", en: "AI agent in a room", pt: "Agente de IA na sala" },
  { tag: "Transcripts", slug: "transcripts", en: "Transcripts", pt: "Transcrições" },
  { tag: "Calls", slug: "calls", en: "Phone calls", pt: "Ligações" },
  { tag: "Webhooks", slug: "webhooks", en: "Webhooks and events", pt: "Webhooks e eventos" },
];

/**
 * Permission needed by each route (from apps/api/src/v1, `need(c, deps, scope)`); `null` = any valid credential.
 * `soon` = live mode answers 501 "coming soon" today (works with kt_test_ keys on the simulator).
 */
export const ROUTES = {
  "GET /v1/me": { scope: null },
  "GET /v1/balance": { scope: "usage:read" },
  "GET /v1/usage": { scope: "usage:read" },
  "GET /v1/voices": { scope: "voices:read" },
  "GET /v1/rooms": { scope: "rooms:read" },
  "POST /v1/rooms": { scope: "rooms:write" },
  "GET /v1/rooms/{id}": { scope: "rooms:read" },
  "DELETE /v1/rooms/{id}": { scope: "rooms:write" },
  "POST /v1/rooms/{id}/join-links": { scope: "rooms:write" },
  "GET /v1/meetings": { scope: "calendar:read" },
  "POST /v1/meetings": { scope: "calendar:write" },
  "DELETE /v1/meetings/{id}": { scope: "calendar:write" },
  "GET /v1/event-types": { scope: "calendar:read" },
  "GET /v1/event-types/{id}/slots": { scope: "calendar:read" },
  "POST /v1/bookings": { scope: "calendar:write" },
  "POST /v1/rooms/{id}/agent-sessions": { scope: "rooms:join", soon: true },
  "GET /v1/sessions/{id}": { scope: "rooms:join", soon: true },
  "POST /v1/sessions/{id}/say": { scope: "rooms:join", soon: true },
  "GET /v1/sessions/{id}/events": { scope: "rooms:join", soon: true },
  "POST /v1/sessions/{id}/leave": { scope: "rooms:join", soon: true },
  "GET /v1/transcripts": { scope: "transcripts:read" },
  "GET /v1/transcripts/{id}": { scope: "transcripts:read" },
  "GET /v1/calls/quote": { scope: "calls:read" },
  "POST /v1/calls": { scope: "calls:dial", soon: true },
  "GET /v1/calls": { scope: "calls:read" },
  "GET /v1/calls/{id}": { scope: "calls:read" },
  "GET /v1/webhook-endpoints": { scope: "webhooks:write" },
  "POST /v1/webhook-endpoints": { scope: "webhooks:write" },
  "DELETE /v1/webhook-endpoints/{id}": { scope: "webhooks:write" },
  "POST /v1/webhook-endpoints/{id}/rotate-secret": { scope: "webhooks:write" },
  "POST /v1/webhook-endpoints/{id}/test": { scope: "webhooks:write" },
  "GET /v1/events": { scope: "events:read" },
};

/** Portuguese summaries of each route (the OpenAPI summaries are in English). */
export const SUMMARY_PT = {
  "GET /v1/me": "Quem sou eu: organização, permissões e limites desta credencial",
  "GET /v1/balance": "Minutos restantes (pool/cota da organização ou plano pessoal)",
  "GET /v1/usage": "Uso da API por dia ou por credencial",
  "GET /v1/voices": "Listar vozes (seus clones e as vozes genéricas escolhidas)",
  "GET /v1/rooms": "Listar salas",
  "POST /v1/rooms": "Criar uma sala instantânea",
  "GET /v1/rooms/{id}": "Ler uma sala",
  "DELETE /v1/rooms/{id}": "Encerrar a sala para todos",
  "POST /v1/rooms/{id}/join-links": "Criar link de convidado (nome e língua preenchidos)",
  "GET /v1/meetings": "Listar reuniões agendadas",
  "POST /v1/meetings": "Agendar uma reunião (sala com data, convidados e línguas)",
  "DELETE /v1/meetings/{id}": "Cancelar uma reunião agendada",
  "GET /v1/event-types": "Listar seus links de agendamento (tipos de evento)",
  "GET /v1/event-types/{id}/slots": "Horários livres de um link de agendamento",
  "POST /v1/bookings": "Agendar um horário num link (seu ou de outra pessoa)",
  "POST /v1/rooms/{id}/agent-sessions": "Entrar na sala como agente de IA (texto entra, voz traduzida sai)",
  "GET /v1/sessions/{id}": "Ler uma sessão de agente",
  "POST /v1/sessions/{id}/say": "Falar: o texto é traduzido para cada ouvinte e falado com a voz escolhida",
  "GET /v1/sessions/{id}/events": "Ouvir: frases novas desde o cursor (long-poll de até `wait` segundos)",
  "POST /v1/sessions/{id}/leave": "Sair da sala",
  "GET /v1/transcripts": "Transcrições que esta credencial pode ler",
  "GET /v1/transcripts/{id}": "Ler uma transcrição",
  "GET /v1/calls/quote": "Cotar um destino e conferir a finalidade da ligação naquele país",
  "POST /v1/calls": "Fazer uma ligação traduzida como agente de IA (sempre se anuncia como IA)",
  "GET /v1/calls": "Ligações feitas por esta credencial",
  "GET /v1/calls/{id}": "Ler uma ligação",
  "GET /v1/webhook-endpoints": "Listar endpoints de webhook",
  "POST /v1/webhook-endpoints": "Criar endpoint de webhook (o segredo de assinatura aparece uma vez)",
  "DELETE /v1/webhook-endpoints/{id}": "Apagar um endpoint de webhook",
  "POST /v1/webhook-endpoints/{id}/rotate-secret": "Trocar o segredo de assinatura (os dois assinam por 24 h)",
  "POST /v1/webhook-endpoints/{id}/test": "Enviar agora um evento de teste assinado",
  "GET /v1/events": "Eventos recentes (para conciliar o que o webhook perdeu; 30 dias)",
};
