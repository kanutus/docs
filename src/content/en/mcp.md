# Kanutus MCP server

The [Model Context Protocol](https://modelcontextprotocol.io) (MCP) is the open standard AI assistants use to call outside tools. The Kanutus MCP server gives an assistant such as Claude or ChatGPT **23 tools**: create rooms with live translation, schedule meetings, book times, read your minutes and transcripts, and take part in a room as an AI agent.

<div class="logos"><img src="/assets/logos/claude.svg" alt="Claude" width="28" height="28"><img src="/assets/logos/openai.svg" alt="ChatGPT" width="28" height="28"></div>

## The connector URL

```text connector URL
{{MCP}}
```

- **Remote, Streamable HTTP, OAuth 2.1.** You sign in with your Kanutus account on the Kanutus consent screen, choose the organization and the permissions, and the assistant gets a token that can do only that. Your password never goes to the assistant.
- Works on the **paid plans** and **business plans**, like the API.
- Your organization owner may require approval before members connect apps.

## Connect your assistant

::: cards
- [Claude](/mcp/connect-claude) — claude.ai, Claude Desktop, Claude mobile and Claude Code.
- [ChatGPT](/mcp/connect-chatgpt) — chatgpt.com and the ChatGPT apps (developer mode).
- [Cursor, VS Code and others](/mcp/other-clients) — Any client that speaks MCP over HTTP with OAuth.
- [The 23 tools](/mcp/tools) — What the assistant can do, with examples.
:::

## What to ask

Once connected, just ask in plain language. The assistant only does what the permissions you granted allow.

- "Create a room for a call with Kenji. I speak Portuguese and he speaks Japanese."
- "Schedule a 30-minute meeting tomorrow at 10:00 with ana@example.com, in English and Spanish."
- "How many minutes do I have left?"
- "Find a free time next week on my booking link and book it for Lena (French)."

## Safety built in

- **Asks before acting.** Actions that spend minutes or reach other people (ending a room, joining as an agent, calling a phone) ask you to confirm first. Assistants that cannot ask must send `confirm: true`, and should only do so after asking you.
- **Untrusted content.** Anything said or written by other people (transcripts, room titles, names) comes back inside `untrusted_content`. It is data, never instructions for the assistant.
- **No duplicates.** Create requests carry an idempotency key, so an assistant that retries never creates the same thing twice.
- **Open source.** The server is MIT licensed and only talks to the public Kanutus API, with your permissions: [github.com/kanutus/mcp](https://github.com/kanutus/mcp).

## Run it locally (stdio) {soon}

A local version that runs on your machine with an API key, for clients that only support local servers:

```json claude_desktop_config.json
{
  "mcpServers": {
    "kanutus": {
      "command": "npx",
      "args": ["-y", "@kanutus/mcp"],
      "env": { "KANUTUS_API_KEY": "kt_test_..." }
    }
  }
}
```

The `@kanutus/mcp` package is not on npm yet. Until it is, use the remote URL above (Claude Desktop, Claude Code, Cursor and VS Code all support it).
