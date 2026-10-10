# Cursor, VS Code e outros clientes

O servidor remoto funciona com qualquer cliente MCP que aceite **Streamable HTTP** com **OAuth 2.1** (PKCE e registro dinâmico de cliente). O cliente descobre tudo a partir da URL. Na primeira requisição, o servidor responde `401` com um cabeçalho `WWW-Authenticate`. Esse cabeçalho aponta para `/.well-known/oauth-protected-resource`, que indica o servidor de autorização do Kanutus.

## Cursor

Em **Cursor Settings → MCP → Add new MCP server**, ou no arquivo `~/.cursor/mcp.json` (vale para todos os projetos) ou `.cursor/mcp.json` (vale só para um projeto):

```json mcp.json
{
  "mcpServers": {
    "kanutus": { "url": "{{MCP}}" }
  }
}
```

O Cursor mostra **Needs login** ao lado do servidor. Clique ali para entrar no Kanutus.

## VS Code (modo agente do GitHub Copilot)

No `.vscode/mcp.json`, ou com o comando **MCP: Add Server**:

```json .vscode/mcp.json
{
  "servers": {
    "kanutus": { "type": "http", "url": "{{MCP}}" }
  }
}
```

Inicie o servidor pelo arquivo ou pela lista de servidores MCP e aceite o login.

## Claude Code

```bash terminal
claude mcp add --transport http kanutus {{MCP}}
```

Depois, rode `/mcp`, escolha **kanutus** e clique em **Authenticate**. Veja [Conectar o Claude](/mcp/connect-claude#claude-code).

## Clientes que só rodam servidores locais

Enquanto o pacote local não é publicado {soon}, dá para fazer uma ponte com o servidor remoto usando o pacote da comunidade `mcp-remote`. Ele cuida do login no seu navegador:

```json config
{
  "mcpServers": {
    "kanutus": { "command": "npx", "args": ["-y", "mcp-remote", "{{MCP}}"] }
  }
}
```

## O seu próprio agente

Se você está escrevendo um agente próprio, em qualquer framework (LangGraph, OpenAI Agents SDK ou o seu próprio código), há dois caminhos:

- usar o servidor MCP com um token OAuth, como os clientes acima; ou
- chamar a [API REST](/reference) direto com uma chave de API. Para um backend é mais simples, e você ainda ganha os [webhooks](/webhooks).

Com o SDK oficial do MCP em TypeScript, a conexão fica assim (o SDK faz o fluxo OAuth por meio de um `authProvider`):

```ts agent.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const transport = new StreamableHTTPClientTransport(new URL("{{MCP}}"), { authProvider });
const client = new Client({ name: "meu-agente", version: "1.0.0" });
await client.connect(transport);
console.log((await client.listTools()).tools.map((t) => t.name));
const saldo = await client.callTool({ name: "get_balance", arguments: {} });
```
