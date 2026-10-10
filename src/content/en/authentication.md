# Authentication

Every request carries a credential in the `Authorization` header:

```http
Authorization: Bearer kt_live_...
```

There are two kinds of credential. Both go through the same permissions, limits and logs.

| Credential | For | Lifetime |
| --- | --- | --- |
| **API key** `kt_live_…` / `kt_test_…` | Your servers, scripts and your own agents | 30, 90 or 365 days, or a date you choose |
| **OAuth 2.1** access token | Apps acting on behalf of a person: Claude, ChatGPT, partner apps | 15 minutes, renewed with a refresh token (30 days, rotating) |
| Organization app (client credentials) {soon} | Partners integrating as a service of the organization | 15 minutes |

## API keys

Create keys in **Developers → API keys** in the app (see the [Quickstart](/quickstart)).

- `kt_live_…` keys work in production and use minutes. `kt_test_…` keys use the [simulator](/test-mode) and never use minutes.
- The key is **shown once**. Kanutus keeps only a hash of it. If you lose it, revoke it and create another.
- Revoking takes effect in **less than a minute**.
- A key belongs to the **organization** (or to your account, on a personal plan). It keeps working if the person who created it leaves, but then it becomes **read only** until an owner reviews it (`needs_review: true` in `GET /v1/me`).
- A key can **never do more than the person who created it**. If that person's role goes down, the key goes down with it.
- Keys have a checksum at the end, so secret scanners can recognise them. Treat a leaked key as compromised: revoke it.

> [!warn] Keep keys on the server. Never put a key in a web page, a mobile app, a public repository or a prompt.

## Permissions

Each key or connected app has a set of permissions (scopes). The [reference](/reference) shows the permission each endpoint needs. Missing permission = `403 insufficient_scope`.

| Permission | What it allows |
| --- | --- |
| `usage:read` | Minutes left and API usage |
| `members:read` | List members of the organization |
| `rooms:read` / `rooms:write` | Read rooms · create, end, guest links |
| `rooms:join` | AI agent in a room: join, speak, listen |
| `calls:read` | Call history and destination quotes |
| `calls:dial` | Place translated calls as an AI agent |
| `numbers:read` | Company phone numbers |
| `contacts:read` / `contacts:write` | Phone contacts |
| `calendar:read` / `calendar:write` | Meetings, booking links, free times, bookings |
| `booking:write` | Create and edit booking links |
| `voices:read` / `voices:write` | List voices · rename and delete |
| `voices:clone` | Ask someone to clone their voice (always with their recorded consent) {soon} |
| `transcripts:read` | Transcripts this credential can read |
| `webhooks:write` · `events:read` | Webhook endpoints · event log |

`GET /v1/me` works with any valid credential.

## Ready-made roles

When creating a key you can pick a role instead of ticking permissions one by one:

| Role | Permissions |
| --- | --- |
| **Read only** | `usage:read rooms:read calls:read calendar:read voices:read transcripts:read` |
| **Meeting assistant** | `rooms:read rooms:write rooms:join calendar:read calendar:write voices:read transcripts:read` |
| **Phone agent** | `calls:read calls:dial numbers:read contacts:read contacts:write voices:read transcripts:read` |
| **Calendar** | `calendar:read calendar:write booking:write members:read` |
| **Full integration** | everything except `voices:clone` and `calls:answer`, which you tick separately |
| **Custom** | your choice |

## Restrictions and spending limit

On top of permissions, each key can be restricted:

- **Spending limit** in minutes per day, per month and per call. When reached, the API answers `402 spend_limit_reached`, and a `usage.threshold` event goes out at 80% and 100%.
- **Department** (organizations): minutes come from that department's quota.
- **Phone numbers** used as caller ID, **destination countries**, **languages** the agent speaks and hears.
- **IP addresses** allowed (optional).
- **Rate limit**: 60 requests per minute by default. Every response has `RateLimit-*` headers.

The rule is always: **what the key can do = the creator's role ∩ the key's permissions ∩ its restrictions**, checked on every request.

## OAuth 2.1 (apps acting for a person)

This is what Claude and ChatGPT use when you add Kanutus as a connector. You only need it if you are building an app that other people connect to their Kanutus account.

- Discovery: `{{API}}/.well-known/oauth-authorization-server` (RFC 8414). The MCP server publishes `/.well-known/oauth-protected-resource` (RFC 9728).
- **Authorization code + PKCE (S256 only)**. No implicit flow, no password flow.
- **Dynamic Client Registration** (RFC 7591) at `{{API}}/oauth/register`. New apps show as "not verified" on the consent screen until Kanutus verifies them.
- The person signs in at `{{APP}}/oauth/authorize`, chooses the organization, can untick permissions, and clicks **Allow**.
- Send `resource` (RFC 8707) with the URL of the API or the MCP server; the token only works there.
- Access tokens are JWT (ES256), 15 minutes; public keys at `{{API}}/.well-known/jwks.json`. Refresh tokens rotate; reusing an old one revokes the whole chain.
- People can disconnect an app at any time in **Developers → Connected apps**.

```bash discovery
curl {{API}}/.well-known/oauth-authorization-server
```

## Organizations and roles in the app

- **Owner** and **manager** can open **Developers** and create keys (a manager only for their own departments, if the owner allows it).
- Personal account on a paid plan: the keys use your own minutes.
- Nobody reads someone else's transcript through the API, not even an owner. A key only reads transcripts of sessions it created.
