# Ligação traduzida

Um agente de IA liga para um número de telefone e se apresenta como assistente de IA. Ele conversa com a pessoa na língua dela, enquanto você (ou o seu agente) escreve e lê na sua.

> [!soon] Ligações reais chegam em breve. Com uma chave `kt_test_`, você já pode montar a integração inteira usando os [números mágicos](/test-mode#numeros-magicos). Com uma chave de produção, `POST /v1/calls` responde `501 not_available_yet`.

## 1. Confira o destino e a finalidade

Toda ligação declara uma **finalidade**: `transactional`, `scheduling`, `support` ou `marketing`. O que é permitido depende do país. Nos EUA, por exemplo, marketing para celular exige consentimento prévio por escrito; no Brasil, o telemarketing tem regras próprias. Consulte antes de ligar:

```bash
curl "{{API}}/v1/calls/quote?to=%2B15550100&purpose=scheduling" \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY"
```

A resposta informa o país, o tipo de número, o fator do minuto e se o destino é permitido. Em `purpose`, diz também se essa finalidade é permitida ali e o que ela exige (`requires`, por exemplo `["written_consent"]`). Números premium e de custo compartilhado são sempre bloqueados.

## 2. Faça a ligação

Exige a permissão `calls:dial`. Ela vem desativada por padrão, e só o Dono pode ativá-la.

```bash
curl -X POST {{API}}/v1/calls \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"to": "+1 555 0100", "purpose": "scheduling",
       "consent": {"kind": "existing_customer", "ref": "crm-4821"},
       "agent_lang": "pt", "remote_lang": "en"}'
```

- `agent_lang`: a língua em que você escreve e lê. `remote_lang`: a língua de quem recebe a ligação.
- `consent`: o consentimento que você tem dessa pessoa e a sua referência ao registro dele.
- A resposta traz o `id` e o `status` da ligação; `ai_disclosure` é sempre `true`.

Acompanhe a ligação com `GET /v1/calls/{id}` ou pelos [webhooks](/webhooks) `call.*` (`call.answered`, `call.voicemail`, `call.completed`, `call.failed`, `call.blocked`).

## Custo

`ceil(max(tempo de conversa, 30 s) × fator do destino)` minutos, com a tradução incluída. A cotação mostra o fator. Valem os limites por ligação e por dia da sua chave.

## Próximos passos

- Falar e ouvir durante a ligação com `say` e `listen`, e mandar tons de teclado para menus de atendimento {soon}
- Colocar alguém da sua organização na ligação, falando pelo app do Kanutus {soon}
- Atender ligações recebidas com um agente {soon}

Leia o [Uso responsável](/responsible-use) antes de ligar para as pessoas.
