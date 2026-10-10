# API reference

Generated from the [OpenAPI 3.1 file](/openapi.json) of the API. Also available interactively at [{{API}}/docs]({{API}}/docs).

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

## Endpoints

::: cards
- [Account and usage](/reference/account) — `GET /v1/me`, balance, usage, voices.
- [Rooms](/reference/rooms) — Create, list, read, end, guest links.
- [Meetings and booking](/reference/calendar) — Meetings, booking links, free times, bookings.
- [AI agent in a room](/reference/agents) — Join, say, listen, leave {soon}.
- [Transcripts](/reference/transcripts) — What this credential can read.
- [Phone calls](/reference/calls) — Quote and place translated calls {soon}.
- [Webhooks and events](/reference/webhooks) — Endpoints, secrets, tests, event log.
:::

## SDKs

Official TypeScript and Python SDKs generated from this file are coming soon {soon}. Meanwhile, the OpenAPI file works with any generator (for example `openapi-typescript` or `openapi-python-client`).
