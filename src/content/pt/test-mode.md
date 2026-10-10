# Modo de teste

Chaves que começam com `kt_test_` rodam tudo num **simulador**. Nada gasta minutos, nenhum telefone toca e nenhuma GPU é usada. Mesmo assim, permissões, limites de gasto, webhooks e erros funcionam como em produção. Use o modo de teste para desenvolver e para rodar os seus testes.

## Como criar uma chave de teste

No app, abra **Desenvolvedores** e mude a chave **Produção | Teste** para **Teste** (a barra fica amarela). As chaves criadas ali começam com `kt_test_`. Os dados de teste ficam separados: os objetos voltam com `"livemode": false`.

## O que o simulador faz

| Recurso | No modo de teste |
| --- | --- |
| Salas e reuniões | São criadas de verdade (com `livemode: false`), então você pode abrir os links |
| Agente de IA na sala | Já funciona. Dois participantes robôs entram na sala: **Kenji** (fala japonês) e **Lena** (fala francês). Eles cumprimentam e respondem com frases fixas, traduzidas para a sua `hear_lang` |
| Ligações | Já funcionam com os números mágicos abaixo |
| Vozes | Uma voz clonada no teste é uma voz padrão; ninguém é contatado |
| Webhooks | São entregues de verdade aos seus endpoints de teste, com a mesma assinatura |
| Limites | Até 1.000 requisições por dia por chave de teste (`429 test_daily_limit`) |

## Números mágicos

| Número | O que acontece |
| --- | --- |
| `+1 555 0100` | Atende e responde com frases de teste em inglês |
| `+55 11 5555 0100` | Atende em português |
| `+1 555 0101` | Ocupado |
| `+1 555 0102` | Cai na caixa postal |
| `+1 555 0199` | Destino bloqueado (número premium) |

Qualquer outro número passa pelas regras reais (país, tipo de número, finalidade da ligação) e depois é simulado.

```bash cotar um destino
curl "{{API}}/v1/calls/quote?to=%2B15550100&purpose=scheduling" \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY"
```

## Disparar um evento de teste

No app, em **Desenvolvedores → Webhooks** (no modo Teste), ou pela API:

```bash
curl -X POST {{API}}/v1/webhook-endpoints/<endpoint_id>/test \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY"
```

## Indo para produção

Crie uma chave `kt_live_` em **Produção** com as mesmas permissões e use-a no lugar da chave de teste. Agentes em salas reais e ligações reais estão {soon}: hoje, com uma chave de produção, esses endpoints respondem `501 not_available_yet`.
