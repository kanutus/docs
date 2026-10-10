# Webhooks

Kanutus sends an HTTPS `POST` to your server when something happens: a room started, a meeting was booked, an agent session ended, a spending limit was reached.

## Create an endpoint

In the app: **Developers → Webhooks → Add** (use **Test** for test endpoints). Or with the API (needs `webhooks:write`):

```bash
curl -X POST {{API}}/v1/webhook-endpoints \
  -H "Authorization: Bearer $KANUTUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-system.com/kanutus", "events": ["meeting.created", "booking.created", "session.ended"]}'
```

The answer includes the signing secret `whsec_…`. **It is shown only once**: store it with your other secrets.

The URL must be `https`, public, with no redirect. Private, loopback and cloud metadata addresses are refused.

## The event

```json
{
  "id": "evt_8c1Zq…",
  "type": "booking.created",
  "created": 1791668000,
  "livemode": true,
  "org_id": "…",
  "api_version": "v1",
  "data": { "object": { "id": "…" } }
}
```

Events carry ids and the minimum needed (phone numbers are masked). **Never transcript text**: fetch it with your credential.

## Verify the signature

Every request has a `Kanutus-Signature` header:

```text
Kanutus-Signature: t=1791668000,v1=5f2b…
```

`v1` is the HMAC-SHA256 of `"<t>.<raw body>"` with your secret, in hex. Compute it over the **raw body** (before parsing JSON), compare in constant time, and refuse timestamps older than 5 minutes. During a secret rotation two `v1=` values come in the same header for 24 hours: accept the request if **any** of them matches.

:::tabs
```js Node.js
import crypto from "node:crypto";

export function verifyKanutus(rawBody, header, secret, toleranceS = 300) {
  const parts = header.split(",").map((p) => p.trim().split("="));
  const t = Number(parts.find(([k]) => k === "t")?.[1]);
  if (!Number.isFinite(t) || Math.abs(Date.now() / 1000 - t) > toleranceS) return false;
  const want = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return parts.some(([k, v]) => k === "v1" && v.length === want.length &&
    crypto.timingSafeEqual(Buffer.from(v), Buffer.from(want)));
}
```
```python Python
import hmac, hashlib, time

def verify_kanutus(raw_body: bytes, header: str, secret: str, tolerance_s: int = 300) -> bool:
    parts = [p.strip().split("=", 1) for p in header.split(",")]
    t = next((int(v) for k, v in parts if k == "t"), None)
    if t is None or abs(time.time() - t) > tolerance_s:
        return False
    want = hmac.new(secret.encode(), f"{t}.".encode() + raw_body, hashlib.sha256).hexdigest()
    return any(k == "v1" and hmac.compare_digest(v, want) for k, v in parts)
```
:::

## Answer quickly, retries

- Answer with any `2xx` within **10 seconds**. Do the heavy work afterwards (a queue).
- Anything else is retried with exponential backoff: **1 min, 5 min, 30 min, 2 h, 6 h, 12 h, 24 h, 24 h** (about 3 days).
- An endpoint that keeps failing for 3 days is disabled, and the owner gets an email.
- Order is not guaranteed and the same event can arrive twice: use `id` to deduplicate.
- Missed something? `GET /v1/events` lists the last 30 days of events. In the app you can see each delivery and resend it.
- Rotate the secret with `POST /v1/webhook-endpoints/{id}/rotate-secret`; send a signed test with `POST /v1/webhook-endpoints/{id}/test`.

## Event types

| Event | When |
| --- | --- |
| `room.started` | A room was created through the API |
| `room.ended`, `room.participant_joined`, `room.participant_left` | Room life cycle {soon} |
| `session.started`, `session.ended` | An AI agent joined or left a room |
| `meeting.created`, `meeting.canceled` | A meeting was scheduled or canceled |
| `meeting.updated` | A meeting changed {soon} |
| `booking.created` | A time was booked on a booking link |
| `booking.rescheduled`, `booking.canceled` | Changes to a booking {soon} |
| `transcript.ready` | A transcript can be read |
| `summary.ready` | A summary can be read {soon} |
| `call.blocked` | A call was refused (destination or purpose not allowed) |
| `call.ringing`, `call.answered`, `call.voicemail`, `call.completed`, `call.failed` | Phone call progress {soon} |
| `voice.consent_completed`, `voice.ready`, `voice.failed` | Voice cloning with consent {soon} |
| `usage.threshold` | A key reached 80% or 100% of its spending limit |
| `credential.expiring` | A key expires soon {soon} |
