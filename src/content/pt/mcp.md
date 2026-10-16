# Servidor MCP do Kanutus

O [Model Context Protocol](https://modelcontextprotocol.io) (MCP) é o padrão aberto que os assistentes de IA usam para acionar ferramentas externas. O servidor MCP do Kanutus dá a assistentes como o Claude e o ChatGPT **32 ferramentas**. Com elas, o assistente cria salas com tradução ao vivo, marca reuniões e agenda horários. Também consulta seus minutos e transcrições e participa de uma sala como agente de IA.

<div class="logos"><img src="/assets/logos/claude.svg" alt="Claude" width="28" height="28"><img src="/assets/logos/openai.svg" alt="ChatGPT" width="28" height="28"></div>

## A URL do conector

```text URL do conector
{{MCP}}
```

- **Remoto, Streamable HTTP, OAuth 2.1.** Você entra com a sua conta Kanutus na tela de permissão do próprio Kanutus e escolhe a organização e as permissões. O assistente recebe um token que só pode fazer o que você liberou. A sua senha nunca chega ao assistente.
- Funciona nos **planos pagos** e nos **planos para empresas**, como a API.
- O Dono da organização pode exigir aprovação antes de os membros conectarem apps.

## Conecte o seu assistente

::: cards
- [Claude](/mcp/connect-claude) — claude.ai, Claude Desktop, Claude no celular e Claude Code.
- [ChatGPT](/mcp/connect-chatgpt) — chatgpt.com e os apps do ChatGPT (modo desenvolvedor).
- [Cursor, VS Code e outros](/mcp/other-clients) — Qualquer cliente que fale MCP por HTTP com OAuth.
- [As 32 ferramentas](/mcp/tools) — O que o assistente consegue fazer, com exemplos.
:::

## O que pedir

Depois de conectar, é só pedir em linguagem natural. O assistente só faz o que as permissões que você deu permitem.

- "Crie uma sala para uma conversa com o Kenji. Eu falo português e ele fala japonês."
- "Marque uma reunião de 30 minutos amanhã às 10h com ana@exemplo.com, em português e espanhol."
- "Quantos minutos ainda tenho?"
- "Ache um horário livre na semana que vem no meu link de agendamento e agende para a Lena (francês)."

## Segurança embutida

- **Pergunta antes de agir.** Antes de qualquer ação que gaste minutos ou envolva outras pessoas, o assistente pede a sua confirmação: encerrar uma sala, entrar como agente, ligar para um telefone. Assistentes que não conseguem perguntar precisam mandar `confirm: true`, e só devem fazer isso depois de perguntar a você.
- **Conteúdo não confiável.** Tudo o que outras pessoas disseram ou escreveram volta dentro de `untrusted_content`: transcrições, títulos de sala, nomes. É dado, nunca instrução para o assistente.
- **Sem duplicatas.** As requisições de criação levam uma chave de idempotência. Se o assistente repetir uma chamada, nada é criado duas vezes.
- **Código aberto.** O servidor tem licença MIT e só conversa com a API pública do Kanutus, usando as suas permissões: [github.com/kanutus/mcp](https://github.com/kanutus/mcp).

## Rodar localmente (stdio) {soon}

Uma versão local, que roda na sua máquina com uma chave de API, para clientes que só aceitam servidores locais:

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

O pacote `@kanutus/mcp` ainda não está no npm. Até ele ser publicado, use a URL remota acima. Claude Desktop, Claude Code, Cursor e VS Code já aceitam essa URL.
