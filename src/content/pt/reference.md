# Referência da API

Esta referência é gerada a partir do [arquivo OpenAPI 3.1](/openapi.json) da API (também em `{{API}}/v1/openapi.json`). Cada endpoint traz exemplos em curl, Node.js e Python, as respostas por status e um painel **Testar agora**, que chama a API de verdade com a sua chave de teste. Aperte `/` para buscar.

## URL base

```text
{{API}}/v1
```

## Autenticação

```http
Authorization: Bearer kt_live_...
```

Use uma chave de API ou um token de acesso OAuth. Veja [Autenticação](/authentication).

## Convenções

- JSON na entrada e na saída (`Content-Type: application/json`). Datas em ISO 8601; horários em UTC, a não ser que tragam o fuso.
- Requisições `POST` que criam algo precisam do `Idempotency-Key` ([por quê](/errors#idempotencia)).
- Objetos criados com uma chave de teste vêm com `"livemode": false`.
- Listas vêm no formato `{ "data": [...] }`.
- Erros: `application/problem+json` com um `code` estável ([lista](/errors)).
- Línguas (`speak_lang`, `hear_lang`, `langs`, `agent_lang`, `remote_lang`…): códigos, uma destas: `pt` (português do Brasil), `pt-PT` (português de Portugal), `en`, `es`, `it`, `fr`, `de`, `nl`, `tr`, `zh`, `ja`, `ko`, `ru`, `pl`, `uk`, `sv`, `vi`, `da`, `nb`, `hi`, `ar`, `el`, `id`, `cs`, `fi`, `ro`, `hu` (aceita região, como `pt-BR`). Qualquer outra língua é recusada com `400`.

## Endpoints

::: cards
- [Conta e uso](/reference/account) — `GET /v1/me`, saldo e uso.
- [Vozes](/reference/voices) — Listar, catálogo genérico, escolher e apagar; clonagem com consentimento {soon}.
- [Avatares](/reference/avatars) {soon} — Os avatares da Kanutus para o agente aparecer na câmera. Por enquanto a lista vem vazia.
- [Salas](/reference/rooms) — Criar, listar, ler, encerrar e gerar links de convidado.
- [Reuniões e agendamento](/reference/calendar) — Reuniões, links de agendamento, horários livres e agendamentos.
- [Agente de IA na sala](/reference/agents) — Entrar, falar, ouvir e sair {soon}.
- [Transcrições](/reference/transcripts) — O que esta credencial pode ler.
- [Ligações](/reference/calls) — Cotar destinos e fazer ligações traduzidas.
- [Webhooks e eventos](/reference/webhooks) — Endpoints, segredos, testes e registro de eventos.
:::

## SDKs

Os SDKs oficiais em TypeScript e Python, gerados a partir deste arquivo, chegam em breve {soon}. Enquanto isso, o arquivo OpenAPI funciona com qualquer gerador, por exemplo o `openapi-typescript` ou o `openapi-python-client`.
