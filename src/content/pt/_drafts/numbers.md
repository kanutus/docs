<!--
RASCUNHO, NÃO PUBLICADO. Design de 2026-10-14 (números: de onde a empresa liga). Fora do NAV em src/config.mjs.
-->

# Números

Os números de telefone da sua organização: o número que aparece para quem recebe a ligação do seu time ou dos seus agentes de IA. Sem número próprio, as ligações saem do número compartilhado da Kanutus.

> [!soon] Alugar números chega em breve. Até lá, `GET /v1/numbers` lista só o número compartilhado e `POST /v1/numbers` responde `403 numbers_disabled`.

Precisa de `numbers:read` para listar e `numbers:write` para alugar ou cancelar (vem desligada).

## Liste os seus números

```bash
curl {{API}}/v1/numbers -H "Authorization: Bearer $KANUTUS_KEY"
```

```json
{
  "data": [
    {
      "id": "num_4QpZ81",
      "e164": "+14155550142",
      "label": "Vendas EUA",
      "country": "US",
      "type": "local",
      "status": "active",
      "default": true,
      "acquired": { "via": "app_rent", "by": "Ana Souza", "at": "2026-10-02T17:10:00Z" },
      "price": { "activation": 1500, "monthly": 2900, "currency": "brl" },
      "next_charge_at": "2026-11-02T12:00:00Z",
      "can_call": true
    }
  ],
  "shared_fallback": "+16465181033"
}
```

`status`: `review` (documentos em análise, nada cobrado), `active`, `suspended` (pagamento atrasado), `cancelled`. `acquired.via`: `app_rent`, `staff_provision`, `port`, `platform`.

## Ache um número para alugar

```bash
curl "{{API}}/v1/numbers/available?country=BR&area_code=11&type=local" -H "Authorization: Bearer $KANUTUS_KEY"
```

Cada resultado traz o número, a cidade, o tipo, a ativação, a mensalidade e `requirements` (por exemplo `["company_registration", "proof_of_address", "service_address"]`). No Brasil eles vêm da verificação da sua empresa.

## Alugue

```bash
curl -X POST {{API}}/v1/numbers \
  -H "Authorization: Bearer $KANUTUS_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"e164": "+551140401234", "label": "São Paulo"}'
```

Alugar gasta dinheiro, então a chave não conclui sozinha: a resposta é `202` com `status: "needs_owner_approval"` e um `approve_url`. Depois que o Dono aprova no app, o número vai para `review` e depois para `active`. A ativação é cobrada quando ele fica ativo; a mensalidade renova no mesmo dia de cada mês (fatura ou cartão cadastrado).

## Cancele

`DELETE /v1/numbers/{id}` mantém o número até o fim do mês pago e depois devolve à operadora. Pode não ter volta.

## Use um número na ligação

Passe `from` no [`POST /v1/calls`](/guides/translated-call). Sem ele, vale o número padrão.

## Erros

| Status | Código | Quando |
| --- | --- | --- |
| 403 | `numbers_disabled` | Alugar números não está disponível para a sua organização ou plano. |
| 403 | `numbers_limit_reached` | O limite de números do seu plano foi atingido. |
| 409 | `number_unavailable` | Outra pessoa pegou esse número. Busque de novo. |
| 422 | `documents_required` | O país exige documentos que a verificação da sua empresa não tem. |
| 409 | `number_not_active` | O número está em análise, suspenso ou cancelado. |
