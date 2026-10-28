# Quickstart

From zero to your first API call in about five minutes. There is no separate developer account: you use your own Kanutus account.

## 1. Create your account and choose a plan

1. Go to [app.kanutus.com]({{APP}}) and sign in with Google or with a link sent to your email.
2. The API is part of the **paid plans** and the **business plans**. Open **Subscription and minutes** in the app and pick one. If your company already uses Kanutus, ask an owner or manager of the organization to give you access.

## 2. Open Developers

In the app menu, open **Developers**:

- **Personal account:** in the main menu, below **Subscription and minutes** ([{{APP}}/developers]({{APP}}/developers)).
- **Organization:** under **Management → Developers** ([{{APP}}/org/developers]({{APP}}/org/developers)). Owners and managers see it.

> [!tip] Use the **Production | Test** switch at the top right. In **Test**, keys start with `kt_test_` and everything runs on the [simulator](/test-mode), without using minutes. Start there.

## 3. Create a key

1. Switch to **Test** and click **Create key**.
2. Give it a name (for example "My first test"), choose a role (**Read only** is enough to start), a spending limit and how long it lasts.
3. Click **Create** and **copy the key now**. It is shown only once. If you lose it, create another one.

Keep the key on your server, in an environment variable. Never put it in a browser, a mobile app or a public repository.

```bash terminal
export KANUTUS_API_KEY="kt_test_..."
```

## 4. Make your first call

`GET /v1/me` tells you who the key belongs to, its permissions and its limits:

```bash curl
curl {{API}}/v1/me -H "Authorization: Bearer $KANUTUS_API_KEY"
```

```json response
{
  "credential": { "kind": "key", "id": "…", "name": "My first test", "mode": "test", "needs_review": false },
  "organization": null,
  "user": { "id": "…", "name": "Ana" },
  "permissions": ["usage:read", "rooms:read", "calls:read", "calendar:read", "voices:read", "transcripts:read"],
  "limits": { "spend_day_minutes": 60, "spend_month_minutes": null, "per_call_minutes": null, "requests_per_minute": 60, "spent_today_minutes": 0, "spent_month_minutes": 0 },
  "pricing": { "api_minute_factor": 1, "listen_text_factor": 0.1 }
}
```

Then create a room. Every request that creates something needs an `Idempotency-Key` (any unique value; repeating it returns the same result instead of creating twice). This needs a key with `rooms:write`, for example the **Meeting assistant** role:

:::tabs
```bash curl
curl -X POST {{API}}/v1/rooms \
  -H "Authorization: Bearer $KANUTUS_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"title": "Proposal with Andes", "langs": ["en", "es"]}'
```
```js Node.js
const res = await fetch("{{API}}/v1/rooms", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.KANUTUS_API_KEY}`,
    "Idempotency-Key": crypto.randomUUID(),
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ title: "Proposal with Andes", langs: ["en", "es"] }),
});
const room = await res.json();
console.log(room.url);
```
```python Python
import os, uuid, requests

r = requests.post(
    "{{API}}/v1/rooms",
    headers={
        "Authorization": f"Bearer {os.environ['KANUTUS_API_KEY']}",
        "Idempotency-Key": str(uuid.uuid4()),
    },
    json={"title": "Proposal with Andes", "langs": ["en", "es"]},
)
print(r.json()["url"])
```
:::

The answer has the room `url`: open it, share it, and each person hears the others in their own language.

**Who pays.** By default (`"bill_mode": "host"`) the room's minutes come from your account, including people with a Kanutus account outside your organization and guests without an account. With `"bill_mode": "each"` every Kanutus account pays its own part; guests without an account still use your minutes. People in your organization use the organization's quota either way.

## Next steps

::: cards
- [Authentication](/authentication) — Keys, OAuth, permissions, roles and spending limits.
- [Connect Claude or ChatGPT](/mcp) — The same features inside your AI assistant.
- [Webhooks](/webhooks) — Get notified when something happens.
- [API reference](/reference) — All endpoints.
:::
