# Connect ChatGPT

<div class="logos"><img src="/assets/logos/openai.svg" alt="ChatGPT" width="28" height="28"></div>

ChatGPT connects to remote MCP servers through **developer mode**.

1. In ChatGPT, open **Settings → Apps & Connectors → Advanced settings** and turn on **Developer mode**.
2. Back in **Apps & Connectors**, click **Create**.
3. Name it **Kanutus**, paste the connector URL and choose **OAuth** as the authentication:
   ```text
   {{MCP}}
   ```
4. Confirm that you trust the app and click **Create**. ChatGPT opens the Kanutus sign-in: sign in, choose the organization and the permissions, and click **Allow**.
5. In a new chat, add **Kanutus** from the tools menu (the **+** button) and ask: *"How many Kanutus minutes do I have left?"*

> [!note] Developer mode is available on ChatGPT's paid plans, and on Business and Enterprise a workspace admin may need to enable it. OpenAI changes these menus often; if a name differs, look for **Connectors** or **Apps** in Settings.

ChatGPT asks you to confirm actions that change things. Kanutus also asks before spending minutes or contacting people (see [safety](/mcp#safety-built-in)).

To disconnect, delete the connector in ChatGPT, or click **Disconnect** in Kanutus **Developers → Connected apps**.
