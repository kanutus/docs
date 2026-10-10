# Conectar o ChatGPT

<div class="logos"><img src="/assets/logos/openai.svg" alt="ChatGPT" width="28" height="28"></div>

O ChatGPT se conecta a servidores MCP remotos pelo **modo desenvolvedor**.

1. No ChatGPT, abra **Configurações → Apps e conectores → Configurações avançadas** e ligue o **Modo desenvolvedor**.
2. Volte em **Apps e conectores** e clique em **Criar**.
3. Dê o nome **Kanutus**, cole a URL do conector e escolha **OAuth** como autenticação:
   ```text
   {{MCP}}
   ```
4. Confirme que confia no app e clique em **Criar**. O ChatGPT abre o login do Kanutus: entre, escolha a organização e as permissões e clique em **Permitir**.
5. Numa conversa nova, adicione o **Kanutus** pelo menu de ferramentas (botão **+**) e pergunte: *"Quantos minutos do Kanutus eu ainda tenho?"*

> [!note] O modo desenvolvedor existe nos planos pagos do ChatGPT. Nos planos Business e Enterprise, talvez um administrador do workspace precise liberá-lo. A OpenAI muda esses menus com frequência; se algum nome estiver diferente, procure por **Conectores** ou **Apps** nas Configurações.

O ChatGPT pede confirmação antes de ações que alteram alguma coisa. O Kanutus também pergunta antes de gastar minutos ou de entrar em contato com pessoas (veja a [segurança](/mcp#seguranca-embutida)).

Para desconectar, apague o conector no ChatGPT ou clique em **Desconectar** no Kanutus, em **Desenvolvedores → Apps conectados**.
