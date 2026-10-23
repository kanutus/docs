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
  { group: { en: "Guides", pt: "Guias" }, items: ["guides/agent-in-room", "guides/schedule-meeting", "guides/translated-call", "guides/transcripts", "numbers"] },
  { group: { en: "Build", pt: "Integrar" }, items: ["webhooks", "errors", "responsible-use"] },
  { group: { en: "API reference", pt: "Referência da API" }, items: ["reference", "@reference"] },
];

/** OpenAPI tag -> page slug under /reference, in sidebar order. */
export const TAGS = [
  { tag: "Account", slug: "account", en: "Account and usage", pt: "Conta e uso" },
  { tag: "Voices", slug: "voices", en: "Voices", pt: "Vozes" },
  { tag: "Avatars", slug: "avatars", en: "Avatars", pt: "Avatares" },
  { tag: "Rooms", slug: "rooms", en: "Rooms", pt: "Salas" },
  { tag: "Calendar", slug: "calendar", en: "Meetings and booking", pt: "Reuniões e agendamento" },
  { tag: "Agents", slug: "agents", en: "AI agent in a room", pt: "Agente de IA na sala" },
  { tag: "Transcripts", slug: "transcripts", en: "Transcripts", pt: "Transcrições" },
  { tag: "Numbers", slug: "numbers", en: "Phone numbers", pt: "Números" },
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
  "GET /v1/voices/catalog": { scope: "voices:read" },
  "POST /v1/voices/generic": { scope: "voices:write" },
  "POST /v1/voices": { scope: "voices:clone", soon: true },
  "GET /v1/voices/{id}": { scope: "voices:read" },
  "DELETE /v1/voices/{id}": { scope: "voices:write" },
  "GET /v1/avatars": { scope: "voices:read" },
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
  "GET /v1/sessions/{id}/look": { scope: "rooms:join", soon: true },
  "POST /v1/sessions/{id}/chat": { scope: "rooms:join", soon: true },
  "POST /v1/sessions/{id}/interrupt": { scope: "rooms:join", soon: true },
  "POST /v1/sessions/{id}/leave": { scope: "rooms:join", soon: true },
  "GET /v1/transcripts": { scope: "transcripts:read" },
  "GET /v1/transcripts/{id}": { scope: "transcripts:read" },
  "GET /v1/numbers": { scope: "numbers:read" },
  "GET /v1/calls/quote": { scope: "calls:read" },
  "POST /v1/calls": { scope: "calls:dial" },
  "GET /v1/calls": { scope: "calls:read" },
  "GET /v1/calls/{id}": { scope: "calls:read" },
  "POST /v1/calls/{id}/hangup": { scope: "calls:dial" },
  "POST /v1/calls/{id}/dtmf": { scope: "calls:dial" },
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
  "GET /v1/voices/catalog": "Vozes genéricas que você pode escolher (sem consentimento)",
  "POST /v1/voices/generic": "Escolher uma voz genérica do catálogo (entra nas suas vozes)",
  "POST /v1/voices": "Clonar uma voz com consentimento verificável: devolve um link para a pessoa ler a frase de consentimento e gravar ao vivo",
  "GET /v1/voices/{id}": "Ler uma voz (e o status do consentimento)",
  "DELETE /v1/voices/{id}": "Apagar uma voz: revoga um clone consentido ou remove uma voz genérica escolhida",
  "GET /v1/avatars": "Listar os avatares publicados da Kanutus: cada pessoa vem em variações (ângulos e ambientes) com os vídeos de comportamento que você pode escolher",
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
  "GET /v1/sessions/{id}/look": "Olhar agora: um quadro novo da câmera e da tela compartilhada dos participantes (sessões com `see_participants`)",
  "POST /v1/sessions/{id}/chat": "Escrever no chat da sala como o agente de IA (texto, grátis)",
  "POST /v1/sessions/{id}/interrupt": "Parar de falar agora (a voz que está tocando e as falas na fila)",
  "POST /v1/sessions/{id}/leave": "Sair da sala",
  "GET /v1/transcripts": "Transcrições que esta credencial pode ler",
  "GET /v1/transcripts/{id}": "Ler uma transcrição",
  "GET /v1/numbers": "Números de onde a dona ou o dono da chave pode ligar (\"Ligar de\")",
  "GET /v1/calls/quote": "Cotar um destino e conferir a finalidade da ligação naquele país",
  "POST /v1/calls": "Fazer uma ligação traduzida como agente de IA (sempre se anuncia como IA)",
  "GET /v1/calls": "Ligações feitas por esta credencial",
  "GET /v1/calls/{id}": "Ler uma ligação",
  "POST /v1/calls/{id}/hangup": "Desligar (idempotente: uma ligação encerrada volta como está)",
  "POST /v1/calls/{id}/dtmf": "Apertar teclas do telefone (DTMF) em menus como \"tecle 2 para vendas\": 0-9, * e #, até 32",
  "GET /v1/webhook-endpoints": "Listar endpoints de webhook",
  "POST /v1/webhook-endpoints": "Criar endpoint de webhook (o segredo de assinatura aparece uma vez)",
  "DELETE /v1/webhook-endpoints/{id}": "Apagar um endpoint de webhook",
  "POST /v1/webhook-endpoints/{id}/rotate-secret": "Trocar o segredo de assinatura (os dois assinam por 24 h)",
  "POST /v1/webhook-endpoints/{id}/test": "Enviar agora um evento de teste assinado",
  "GET /v1/events": "Eventos recentes (para conciliar o que o webhook perdeu; 30 dias)",
};

/** English summaries that replace the OpenAPI ones (public copy never names suppliers or internal services). */
export const SUMMARY_EN = {
  "DELETE /v1/voices/{id}": "Delete a voice: revokes a consented clone or removes a chosen generic voice",
};
