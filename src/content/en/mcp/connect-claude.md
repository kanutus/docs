# Connect Claude

<div class="logos"><img src="/assets/logos/claude.svg" alt="Claude" width="28" height="28"></div>

Add Kanutus as a **custom connector**. It then works in claude.ai, Claude Desktop and the Claude mobile apps with the same account.

## claude.ai and Claude Desktop

1. In Claude, open **Settings → Connectors** and click **Add custom connector**.
2. Name it **Kanutus** and paste the connector URL:
   ```text
   {{MCP}}
   ```
3. Click **Add**, then **Connect**. A Kanutus window opens: sign in with your Kanutus account.
4. Choose the organization and the permissions, and click **Allow**. You can untick anything you do not want the assistant to do.
5. Back in a chat, open the tools menu and make sure **Kanutus** is on. Ask: *"How many Kanutus minutes do I have left?"*

> [!note] Custom connectors are available on Claude's paid plans. On Team and Enterprise, an owner may need to add the connector for the organization first. Menu names change from time to time in Claude; look for **Connectors**.

To disconnect, remove the connector in Claude, or click **Disconnect** in Kanutus **Developers → Connected apps**.

## Claude Code

Add the remote server and sign in from inside Claude Code:

```bash terminal
claude mcp add --transport http kanutus {{MCP}}
```

Then run `/mcp` in Claude Code, choose **kanutus** and **Authenticate**. Your browser opens the Kanutus consent screen. Use `--scope user` to have it in every project, or `--scope project` to share it with your team through `.mcp.json`.

Remove it with:

```bash terminal
claude mcp remove kanutus
```

## Try it

- "Create a Kanutus room called *Weekly sync* for English and Japanese and give me the link."
- "Schedule a meeting tomorrow at 15:00 São Paulo time with kenji@example.com, Portuguese and Japanese."
- "List my booking links and show the free times on Thursday."

See [all tools](/mcp/tools).
