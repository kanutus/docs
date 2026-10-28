# Começar em 5 minutos

Do zero até a sua primeira chamada à API em uns cinco minutos. Não existe uma conta separada para desenvolvedores: você usa a sua própria conta Kanutus.

## 1. Crie sua conta e escolha um plano

1. Acesse [app.kanutus.com]({{APP}}) e entre com o Google ou com um link enviado para o seu e-mail.
2. A API faz parte dos **planos pagos** e dos **planos para empresas**. No app, abra **Assinatura e minutos** e escolha um plano. Se a sua empresa já usa o Kanutus, peça acesso a um Dono ou Gestor da organização.

## 2. Abra Desenvolvedores

No menu do app, abra **Desenvolvedores**:

- **Conta pessoal:** no menu principal, logo abaixo de **Assinatura e minutos** ([{{APP}}/developers]({{APP}}/developers)).
- **Organização:** em **Gestão → Desenvolvedores** ([{{APP}}/org/developers]({{APP}}/org/developers)). Donos e Gestores veem essa opção.

> [!tip] No canto superior direito há a chave **Produção | Teste**. Em **Teste**, as chaves começam com `kt_test_` e tudo roda no [simulador](/test-mode), sem gastar minutos. Comece por ele.

## 3. Crie uma chave

1. Mude para **Teste** e clique em **Criar chave**.
2. Dê um nome (por exemplo, "Meu primeiro teste") e escolha um papel (**Somente leitura** basta para começar), um limite de gasto e a validade.
3. Clique em **Criar** e **copie a chave na hora**. Ela só aparece uma vez. Se perder, crie outra.

Guarde a chave no seu servidor, numa variável de ambiente. Nunca a coloque num navegador, num app de celular ou num repositório público.

```bash terminal
export KANUTUS_API_KEY="kt_test_..."
```

## 4. Faça a primeira chamada

`GET /v1/me` mostra a quem a chave pertence, que permissões ela tem e quais são os limites dela:

```bash curl
curl {{API}}/v1/me -H "Authorization: Bearer $KANUTUS_API_KEY"
```

```json resposta
{
  "credential": { "kind": "key", "id": "…", "name": "Meu primeiro teste", "mode": "test", "needs_review": false },
  "organization": null,
  "user": { "id": "…", "name": "Ana" },
  "permissions": ["usage:read", "rooms:read", "calls:read", "calendar:read", "voices:read", "transcripts:read"],
  "limits": { "spend_day_minutes": 60, "spend_month_minutes": null, "per_call_minutes": null, "requests_per_minute": 60, "spent_today_minutes": 0, "spent_month_minutes": 0 },
  "pricing": { "api_minute_factor": 1, "listen_text_factor": 0.1 }
}
```

Agora crie uma sala. Toda requisição que cria algo precisa do cabeçalho `Idempotency-Key`. Use qualquer valor único: se você repetir a mesma requisição com o mesmo valor, recebe o mesmo resultado em vez de criar a sala duas vezes. Para criar salas, a chave precisa da permissão `rooms:write`, que vem, por exemplo, no papel **Assistente de reuniões**:

:::tabs
```bash curl
curl -X POST {{API}}/v1/rooms \
  -H "Authorization: Bearer $KANUTUS_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"title": "Proposta com a Andes", "langs": ["pt", "es"]}'
```
```js Node.js
const res = await fetch("{{API}}/v1/rooms", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.KANUTUS_API_KEY}`,
    "Idempotency-Key": crypto.randomUUID(),
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ title: "Proposta com a Andes", langs: ["pt", "es"] }),
});
const room = await res.json();
console.log(room.url);
```
```python Python
import os, uuid, requests

r = requests.post(
    "{{API}}/v1/rooms",
    headers={
        "Authorization": f"Bearer {os.environ['KANUTUS_API_KEY']}",
        "Idempotency-Key": str(uuid.uuid4()),
    },
    json={"title": "Proposta com a Andes", "langs": ["pt", "es"]},
)
print(r.json()["url"])
```
:::

A resposta traz a `url` da sala. Abra ou compartilhe esse link: cada pessoa ouve as outras na própria língua.

**Quem paga.** Por padrão (`"bill_mode": "host"`) os minutos da sala saem da sua conta, inclusive os de quem tem conta Kanutus fora da sua organização e os de convidados sem conta. Com `"bill_mode": "each"` cada conta Kanutus paga a própria parte; quem não tem conta continua saindo dos seus minutos. Quem é da sua organização usa a cota da organização nos dois casos.

**Voz do convidado.** Por padrão (`"guest_voice_clone": true`) o convidado sem conta vê uma caixa opcional para ser ouvido na própria voz clonada; a cópia é apagada 3 dias depois do último uso. Mande `"guest_voice_clone": false` para nunca mostrar essa opção na sala. A caixa só aparece quando o recurso de voz do convidado está ligado na sua conta.

## Próximos passos

::: cards
- [Autenticação](/authentication) — Chaves, OAuth, permissões, papéis e limite de gasto.
- [Conectar o Claude ou o ChatGPT](/mcp) — Os mesmos recursos dentro do seu assistente de IA.
- [Webhooks](/webhooks) — Receba um aviso quando algo acontecer.
- [Referência da API](/reference) — Todos os endpoints.
:::
