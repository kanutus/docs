# Cursor, VS Code and other clients

Any MCP client that supports **Streamable HTTP** with **OAuth 2.1** (PKCE and dynamic client registration) can use the remote server. The client discovers everything from the URL: on the first request the server answers `401` with a `WWW-Authenticate` header that points to `/.well-known/oauth-protected-resource`, which names the Kanutus authorization server.

## Cursor

In **Cursor Settings → MCP → Add new MCP server**, or in `~/.cursor/mcp.json` (all projects) or `.cursor/mcp.json` (one project):

```json mcp.json
{
  "mcpServers": {
    "kanutus": { "url": "{{MCP}}" }
  }
}
```

Cursor shows **Needs login** next to the server: click it to sign in to Kanutus.

## VS Code (GitHub Copilot agent mode)

In `.vscode/mcp.json`, or with the **MCP: Add Server** command:

```json .vscode/mcp.json
{
  "servers": {
    "kanutus": { "type": "http", "url": "{{MCP}}" }
  }
}
```

Start the server from the file or the MCP list and accept the sign-in.

## Claude Code

```bash terminal
claude mcp add --transport http kanutus {{MCP}}
```

Then `/mcp` → **kanutus** → **Authenticate**. See [Connect Claude](/mcp/connect-claude#claude-code).

## Clients that only run local servers

Until the local package is published {soon}, you can bridge the remote server with the community package `mcp-remote`, which handles the sign-in in your browser:

```json config
{
  "mcpServers": {
    "kanutus": { "command": "npx", "args": ["-y", "mcp-remote", "{{MCP}}"] }
  }
}
```

## Your own agent

If you are writing your own agent, in whatever framework you use (LangGraph, the OpenAI Agents SDK or your own code), you have two options:

- Use the MCP server with an OAuth token, like the clients above; or
- Call the [REST API](/reference) directly with an API key. It is simpler for a backend and gives you [webhooks](/webhooks).

The official MCP SDK in TypeScript connects like this (the SDK runs the OAuth flow through an `authProvider`):

```ts agent.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const transport = new StreamableHTTPClientTransport(new URL("{{MCP}}"), { authProvider });
const client = new Client({ name: "my-agent", version: "1.0.0" });
await client.connect(transport);
console.log((await client.listTools()).tools.map((t) => t.name));
const balance = await client.callTool({ name: "get_balance", arguments: {} });
```
