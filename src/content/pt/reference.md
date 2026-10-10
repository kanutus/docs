# Referência da API

Esta referência é gerada a partir do [arquivo OpenAPI 3.1](/openapi.json) da API. Há também uma versão interativa em [{{API}}/docs]({{API}}/docs).

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

## Endpoints

::: cards
- [Conta e uso](/reference/account) — `GET /v1/me`, saldo, uso e vozes.
- [Salas](/reference/rooms) — Criar, listar, ler, encerrar e gerar links de convidado.
- [Reuniões e agendamento](/reference/calendar) — Reuniões, links de agendamento, horários livres e agendamentos.
- [Agente de IA na sala](/reference/agents) — Entrar, falar, ouvir e sair {soon}.
- [Transcrições](/reference/transcripts) — O que esta credencial pode ler.
- [Ligações](/reference/calls) — Cotar destinos e fazer ligações traduzidas {soon}.
- [Webhooks e eventos](/reference/webhooks) — Endpoints, segredos, testes e registro de eventos.
:::

## SDKs

Os SDKs oficiais em TypeScript e Python, gerados a partir deste arquivo, chegam em breve {soon}. Enquanto isso, o arquivo OpenAPI funciona com qualquer gerador, por exemplo o `openapi-typescript` ou o `openapi-python-client`.
