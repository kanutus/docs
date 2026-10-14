# Kanutus para desenvolvedores

Use o Kanutus dentro dos seus sistemas e dos seus assistentes de IA. Crie salas com tradução de voz ao vivo, marque reuniões, agende horários em links de agendamento e consulte uso e transcrições. Em breve, um agente de IA também poderá falar numa sala ou numa ligação, e cada pessoa vai ouvi-lo na própria língua.

São duas portas de entrada. As duas usam o mesmo produto e as mesmas permissões:

::: cards
- [API REST](/quickstart) — `{{API}}/v1`, OpenAPI 3.1. Para o seu backend, scripts e agentes próprios.
- [Servidor MCP](/mcp) — `{{MCP}}`. Conecte o Kanutus ao Claude, ao ChatGPT, ao Cursor e a outros assistentes de IA.
:::

## O que dá para fazer

| Área | Disponível hoje | Próximos passos |
| --- | --- | --- |
| Conta | Quem sou eu, minutos restantes, uso da API por dia ou por chave | |
| Salas | Criar sala instantânea com tradução ao vivo, listar, ler e encerrar; links de convidado com nome e língua preenchidos | |
| Reuniões e agendamento | Marcar reuniões com convidados e línguas, cancelar, listar links de agendamento, ver horários livres e agendar | |
| Vozes | Listar suas vozes, ver o catálogo de vozes genéricas, escolher e apagar vozes | Clonar uma voz com consentimento gravado {soon} |
| Agente de IA na sala | Entrar na sala, falar (entra texto, sai voz traduzida) e ouvir | Salas reais {soon} · já funciona com chave de teste |
| Ligações | Conferir o destino e as regras da finalidade da ligação naquele país, ligar como agente de IA com tradução, falar e ouvir, teclas, desligar | |
| Transcrições | Transcrições das sessões de agente criadas pela sua credencial | Transcrições e resumos de todas as reuniões {soon} |
| Webhooks | Eventos assinados (HMAC), reenvio automático, eventos de teste | |

## Quem pode usar

A API e os conectores fazem parte dos **planos pagos** e dos **planos para empresas**. Numa conta grátis, a área **Desenvolvedores** do app mostra os planos para você fazer o upgrade. Tudo o que você faz pela API usa os mesmos minutos do app, pelo mesmo preço.

## Comece por aqui

::: cards
- [Começar em 5 minutos](/quickstart) — Da criação da conta até a primeira chamada com curl.
- [Conectar o Claude](/mcp/connect-claude) — Adicione o Kanutus como conector personalizado.
- [Modo de teste](/test-mode) — Teste tudo no simulador, sem gastar minutos.
- [Referência da API](/reference) — Todos os endpoints, gerados a partir do arquivo OpenAPI.
:::

Usar IA para ligar ou conversar com pessoas exige cuidado e tem regras. Leia o [Uso responsável](/responsible-use).
