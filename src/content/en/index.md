# Kanutus for developers

Put Kanutus inside your systems and your AI assistants: create rooms with live voice translation, schedule meetings, book times on booking links, read usage and transcripts, and (soon) let an AI agent speak in a room or on a phone call, each listener hearing it in their own language.

There are two ways in, both on top of the same product and the same permissions:

::: cards
- [REST API](/quickstart) — `{{API}}/v1`, OpenAPI 3.1. For your backend, scripts and your own agents.
- [MCP server](/mcp) — `{{MCP}}`. Connect Kanutus to Claude, ChatGPT, Cursor and other AI assistants.
:::

## What you can do

| Area | Available today | Next |
| --- | --- | --- |
| Account | Who am I, minutes left, API usage by day or by key | |
| Rooms | Create an instant room with live translation, list, read, end it, guest links with name and language prefilled | |
| Meetings and booking | Schedule meetings with invitees and languages, cancel, list booking links, free times, book a time | |
| Voices | List your voices, browse the generic catalog, choose and delete voices | Clone a voice with recorded consent {soon} |
| AI agent in a room | Join a room, speak (text in, translated voice out), listen | Live rooms {soon} · works today with a test key |
| Phone calls | Check a destination and the rules for the call purpose in that country | Translated calls by an AI agent {soon} · works today with a test key |
| Transcripts | Transcripts of the agent sessions your credential created | Transcripts and summaries of every meeting {soon} |
| Webhooks | Signed events (HMAC), automatic retries, test events | |

## Who can use it

The API and the connectors are part of the **paid plans** and the **business plans**. On a free account, the **Developers** area in the app shows the plans instead, so you can upgrade. Everything you do through the API uses the same minutes as the app, at the same price.

## Start here

::: cards
- [Quickstart](/quickstart) — From sign-up to your first call with curl in 5 minutes.
- [Connect Claude](/mcp/connect-claude) — Add Kanutus as a custom connector.
- [Test mode](/test-mode) — Try everything with the simulator, without using minutes.
- [API reference](/reference) — Every endpoint, generated from the OpenAPI file.
:::

Using AI to call or talk to people comes with rules. Please read [Responsible use](/responsible-use).
