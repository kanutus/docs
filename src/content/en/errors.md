# Limits and errors

## Error format

Errors use `application/problem+json` (RFC 9457). `code` is stable and safe to branch on; `message` is for people and can change. Every response carries an `X-Request-Id`: include it when you contact us.

```json
{
  "type": "https://docs.kanutus.com/errors#insufficient_scope",
  "title": "insufficient_scope",
  "status": 403,
  "code": "insufficient_scope",
  "message": "This credential lacks the permission rooms:write.",
  "request_id": "req_0NjjmC1WyEw2Tmyz1rwP"
}
```

## Codes

| HTTP | `code` | What to do |
| --- | --- | --- |
| 400 | `invalid_request` | Fix the request; `message` says which field |
| 400 | `idempotency_key_required` | Send an `Idempotency-Key` header on create requests |
| 401 | `unauthorized` | Missing, invalid, expired or revoked credential |
| 402 | `spend_limit_reached` | The key reached its spending limit (day, month or per call) or there are no minutes left |
| 403 | `insufficient_scope` | The credential lacks the permission; the `WWW-Authenticate` header names it |
| 403 | `needs_review` | The person who created the key left; it can only read until an owner reviews it |
| 403 | `paid_plan_required` | The account is on the free plan |
| 403 | `ip_not_allowed` | The request came from an IP outside the key's allow-list |
| 403 | `language_not_allowed`, `voice_not_allowed`, `number_not_allowed`, `destination_not_allowed` | Outside the key's restrictions or the country rules |
| 403 | `org_blocked`, `org_suspended` | The organization was blocked or suspended; contact us |
| 404 | `not_found` | It does not exist or this credential cannot see it |
| 409 | `idempotency_mismatch` | Same `Idempotency-Key` with a different body |
| 409 | `idempotency_in_progress` | The first request with this key is still running; retry in a moment |
| 409 | `slot_taken` | The booking time was taken in the meantime |
| 409 | `session_ended` | The agent session already ended |
| 429 | `rate_limited` | Too many requests; wait for `Retry-After` |
| 429 | `too_many_sessions` | Too many agent sessions at the same time |
| 429 | `test_daily_limit` | Test keys allow 1,000 requests per day |
| 501 | `not_available_yet` | Coming soon in live mode; works with a `kt_test_` key |
| 503 | `api_disabled`, `mcp_disabled`, `booking_unavailable` | Temporarily unavailable; retry later |

## Rate limits

- **60 requests per minute** per credential by default (business plans can have more). Test keys also have **1,000 requests per day**.
- Every response has `RateLimit-Limit`, `RateLimit-Remaining` and `RateLimit-Reset`. A `429` also has `Retry-After` (seconds).
- Retry `429` and `5xx` with exponential backoff and jitter. Do not retry `4xx` other than `409 idempotency_in_progress`.

## Idempotency

Create requests (`POST /v1/rooms`, `/meetings`, `/bookings`, `/calls`, `/rooms/{id}/agent-sessions`) require an `Idempotency-Key` header: any unique value up to 255 characters, such as a UUID. If the network fails, send the same request **with the same key**: you get the original answer instead of a second room, booking or call. Keys are kept for 24 hours per credential.

## Versions

The version is in the path (`/v1`). New fields and endpoints can appear at any time, so ignore fields you do not know. A breaking change would come as `/v2`, with 12 months of overlap and an email to the owners of keys that use the old route. Each response carries `Kanutus-Version`.
