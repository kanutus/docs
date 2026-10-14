# Autenticação

Toda requisição leva uma credencial no cabeçalho `Authorization`:

```http
Authorization: Bearer kt_live_...
```

Existem dois tipos de credencial. Os dois passam pelas mesmas permissões, limites e registros.

| Credencial | Para quem | Validade |
| --- | --- | --- |
| **Chave de API** `kt_live_…` / `kt_test_…` | Seus servidores, scripts e agentes próprios | 30, 90 ou 365 dias, ou até a data que você escolher |
| Token de acesso **OAuth 2.1** | Apps que agem em nome de uma pessoa: Claude, ChatGPT, apps de parceiros | 15 minutos, renovado com um refresh token (30 dias, rotativo) |
| App da organização (client credentials) {soon} | Parceiros que se integram como serviço da organização | 15 minutos |

## Chaves de API

Crie as chaves no app, em **Desenvolvedores → Chaves de API** (veja o [Começar em 5 minutos](/quickstart)).

- Chaves `kt_live_…` funcionam em produção e gastam minutos. Chaves `kt_test_…` usam o [simulador](/test-mode) e nunca gastam minutos.
- A chave **aparece uma única vez**. O Kanutus guarda só um hash dela. Se perder, revogue a chave e crie outra.
- A revogação vale em **menos de um minuto**.
- A chave pertence à **organização** (ou à sua conta, no plano pessoal). Se quem a criou sair da organização, ela continua funcionando, mas passa a **só ler** até um Dono revisá-la. Nesse caso, `GET /v1/me` mostra `needs_review: true`.
- A chave **nunca pode mais do que a pessoa que a criou**. Se o papel dessa pessoa diminuir, a chave perde as mesmas permissões.
- A chave tem um checksum no final para que scanners de segredos possam reconhecê-la. Se uma chave vazar, considere-a comprometida e revogue.

> [!warn] Guarde as chaves no servidor. Nunca coloque uma chave numa página web, num app de celular, num repositório público ou num prompt.

## Permissões

Cada chave ou app conectado tem um conjunto de permissões (escopos). A [referência](/reference) mostra a permissão que cada endpoint exige. Sem a permissão, a resposta é `403 insufficient_scope`.

| Permissão | O que libera |
| --- | --- |
| `usage:read` | Minutos restantes e uso da API |
| `members:read` | Lista de membros da organização |
| `rooms:read` / `rooms:write` | Ler salas · criar, encerrar e gerar links de convidado |
| `rooms:join` | Agente de IA na sala: entrar, falar e ouvir |
| `calls:read` | Histórico de ligações e cotação de destinos |
| `calls:dial` | Fazer ligações traduzidas como agente de IA |
| `numbers:read` | Números de telefone da empresa |
| `contacts:read` / `contacts:write` | Contatos de telefonia |
| `calendar:read` / `calendar:write` | Reuniões, links de agendamento, horários livres e agendamentos |
| `booking:write` | Criar e editar links de agendamento |
| `voices:read` / `voices:write` | Listar vozes e os avatares publicados · renomear e apagar |
| `voices:clone` | Pedir a clonagem da voz de alguém, sempre com o consentimento gravado da pessoa {soon} |
| `transcripts:read` | Transcrições que esta credencial pode ler |
| `webhooks:write` · `events:read` | Endpoints de webhook · registro de eventos |

`GET /v1/me` funciona com qualquer credencial válida.

## Papéis prontos

Ao criar uma chave, você pode escolher um papel em vez de marcar as permissões uma a uma:

| Papel | Permissões |
| --- | --- |
| **Somente leitura** | `usage:read rooms:read calls:read calendar:read voices:read transcripts:read` |
| **Assistente de reuniões** | `rooms:read rooms:write rooms:join calendar:read calendar:write voices:read transcripts:read` |
| **Agente de telefone** | `calls:read calls:dial numbers:read contacts:read contacts:write voices:read transcripts:read` |
| **Agenda** | `calendar:read calendar:write booking:write members:read` |
| **Integração completa** | todas, menos `voices:clone` e `calls:answer`, que você marca à parte |
| **Personalizado** | você escolhe cada permissão |

## Restrições e limite de gasto

Além das permissões, dá para restringir cada chave:

- **Limite de gasto** em minutos por dia, por mês e por ligação. Ao atingir o limite, a API responde `402 spend_limit_reached`. Um evento `usage.threshold` é enviado ao chegar a 80% e a 100% do limite.
- **Departamento** (organizações): os minutos saem da cota desse departamento.
- **Números de telefone** usados como identificador de chamada, **países de destino** e **línguas** em que o agente fala e ouve.
- **Endereços IP** permitidos (opcional).
- **Limite de requisições**: 60 por minuto, por padrão. Toda resposta traz os cabeçalhos `RateLimit-*`.

A regra vale sempre e é conferida a cada requisição: **o que a chave pode fazer = papel de quem a criou ∩ permissões da chave ∩ restrições dela**.

## OAuth 2.1 (apps que agem em nome de uma pessoa)

É o que o Claude e o ChatGPT usam quando você adiciona o Kanutus como conector. Você só precisa disto se estiver criando um app que outras pessoas vão conectar à conta Kanutus delas.

- Descoberta: `{{API}}/.well-known/oauth-authorization-server` (RFC 8414). O servidor MCP publica `/.well-known/oauth-protected-resource` (RFC 9728).
- **Authorization code + PKCE (só S256)**. Os fluxos implicit e password não são aceitos.
- **Dynamic Client Registration** (RFC 7591) em `{{API}}/oauth/register`. Apps novos aparecem como "não verificado" na tela de permissão até o Kanutus verificá-los.
- A pessoa entra em `{{APP}}/oauth/authorize`, escolhe a organização, pode desmarcar permissões e clica em **Permitir**.
- Envie `resource` (RFC 8707) com a URL da API ou do servidor MCP. O token só vale para esse endereço.
- Os tokens de acesso são JWT (ES256) e valem 15 minutos. As chaves públicas ficam em `{{API}}/.well-known/jwks.json`. Os refresh tokens são rotativos: reusar um antigo revoga a cadeia inteira.
- A pessoa pode desconectar um app quando quiser em **Desenvolvedores → Apps conectados**.

```bash descoberta
curl {{API}}/.well-known/oauth-authorization-server
```

## Organizações e papéis no app

- **Dono** e **Gestor** abrem **Desenvolvedores** e criam chaves. O Gestor só cria chaves para os próprios departamentos, e só se o Dono permitir.
- Conta pessoal em plano pago: as chaves usam os seus próprios minutos.
- Ninguém lê a transcrição de outra pessoa pela API, nem o Dono. Uma chave só lê as transcrições das sessões que ela mesma criou.
