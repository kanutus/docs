# API reference

Generated from the API's [OpenAPI 3.1 file](/openapi.json) (also at `{{API}}/v1/openapi.json`). Every endpoint has examples in curl, Node.js and Python, responses by status and a **Try it** panel that calls the real API with your test key. Press `/` to search.

## Base URL

```text
{{API}}/v1
```

## Authentication

```http
Authorization: Bearer kt_live_...
```

An API key or an OAuth access token. See [Authentication](/authentication).

## Conventions

- JSON in and out (`Content-Type: application/json`). Dates in ISO 8601, times in UTC unless they carry an offset.
- `POST` requests that create something need `Idempotency-Key` ([why](/errors#idempotency)).
- Objects created with a test key have `"livemode": false`.
- Lists come in `{ "data": [...] }`.
- Errors: `application/problem+json` with a stable `code` ([list](/errors)).
- Languages (`speak_lang`, `hear_lang`, `langs`, `agent_lang`, `remote_lang`…): 2-letter codes, one of `pt`, `en`, `es`, `it`, `fr`, `de`, `nl`, `tr`, `zh`, `ja`, `ko`, `ru`, `pl`, `uk`, `sv`, `vi` (a region like `pt-BR` is accepted). Any other language is refused with `400`.

## Endpoints

::: cards
- [Account and usage](/reference/account) — `GET /v1/me`, balance and usage.
- [Voices](/reference/voices) — List, generic catalog, choose and delete; cloning with consent {soon}.
- [Avatars](/reference/avatars) — The published Kanutus avatars: variations (angles and settings), behavior clips, photos and previews.
- [Rooms](/reference/rooms) — Create, list, read, end, guest links.
- [Meetings and booking](/reference/calendar) — Meetings, booking links, free times, bookings.
- [AI agent in a room](/reference/agents) — Join, say, listen, leave {soon}.
- [Transcripts](/reference/transcripts) — What this credential can read.
- [Phone calls](/reference/calls) — Quote and place translated calls.
- [Webhooks and events](/reference/webhooks) — Endpoints, secrets, tests, event log.
:::

## SDKs

Official TypeScript and Python SDKs generated from this file are coming soon {soon}. Meanwhile, the OpenAPI file works with any generator (for example `openapi-typescript` or `openapi-python-client`).
