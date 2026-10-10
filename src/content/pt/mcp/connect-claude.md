# Conectar o Claude

<div class="logos"><img src="/assets/logos/claude.svg" alt="Claude" width="28" height="28"></div>

Adicione o Kanutus como **conector personalizado**. Com a mesma conta, ele passa a funcionar no claude.ai, no Claude Desktop e nos apps do Claude para celular.

## claude.ai e Claude Desktop

1. No Claude, abra **Configurações → Conectores** e clique em **Adicionar conector personalizado**.
2. Dê o nome **Kanutus** e cole a URL do conector:
   ```text
   {{MCP}}
   ```
3. Clique em **Adicionar** e depois em **Conectar**. Uma janela do Kanutus vai abrir: entre com a sua conta Kanutus.
4. Escolha a organização e as permissões e clique em **Permitir**. Desmarque o que você não quer que o assistente faça.
5. Numa conversa, abra o menu de ferramentas e confira se o **Kanutus** está ligado. Pergunte: *"Quantos minutos do Kanutus eu ainda tenho?"*

> [!note] Os conectores personalizados existem nos planos pagos do Claude. Nos planos Team e Enterprise, talvez um Owner precise adicionar o conector para a organização antes. Os nomes dos menus do Claude mudam de vez em quando; procure por **Conectores**.

Para desconectar, remova o conector no Claude ou clique em **Desconectar** no Kanutus, em **Desenvolvedores → Apps conectados**.

## Claude Code

Adicione o servidor remoto e faça login pelo próprio Claude Code:

```bash terminal
claude mcp add --transport http kanutus {{MCP}}
```

Depois, rode `/mcp` no Claude Code, escolha **kanutus** e clique em **Authenticate**. O navegador abre a tela de permissão do Kanutus. Use `--scope user` para ter o conector em todos os projetos, ou `--scope project` para compartilhá-lo com o time pelo `.mcp.json`.

Para remover:

```bash terminal
claude mcp remove kanutus
```

## Experimente

- "Crie uma sala do Kanutus chamada *Sync semanal* para português e japonês e me mande o link."
- "Marque uma reunião amanhã às 15h, horário de Brasília, com kenji@exemplo.com, em português e japonês."
- "Liste meus links de agendamento e mostre os horários livres na quinta."

Veja [todas as ferramentas](/mcp/tools).
