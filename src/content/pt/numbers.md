# Números

Os números de telefone da sua organização: o número que aparece para quem recebe a ligação do seu time. Sem número próprio, as ligações saem do número compartilhado da Kanutus (+1 646 518 1033).

> [!note] Alugar número é feito no app, por Dono ou Gestor de uma organização com a empresa verificada. Alugar pela API {soon}; listar e ligar deles pela API já funciona ([abaixo](#ligue-de-um-numero-pela-api)).

## Alugue no app

1. Abra **Ligações › Números** em [{{APP}}/org/phone/numbers]({{APP}}/org/phone/numbers) e clique em **Alugar número**.
2. Escolha o país, o DDD (código de área) e o tipo (fixo ou 0800). A lista mostra os números livres, a ativação e a mensalidade.
3. Confira o resumo: quanto é cobrado quando o número fica ativo, de onde sai a cobrança e os documentos que o país exige.
4. Clique em **Alugar** e confirme com o código do seu app autenticador.

Hoje dá para alugar números dos Estados Unidos, do Canadá e do Brasil.

## Situação do número

| Situação | O que vale |
| --- | --- |
| Em análise | Documentos enviados à operadora. Nada é cobrado e o número ainda não liga. |
| Ativo | Liga. A ativação é cobrada no dia e a mensalidade todo mês, no mesmo dia. |
| Recusado | A operadora ou a Kanutus recusou os documentos. O motivo aparece na lista; reenvie e peça outro número. |
| Suspenso | Pagamento em atraso há 7 dias. Não liga. |
| Cancelado | Devolvido à operadora. Some do "Ligar de"; o histórico fica. |

Nos Estados Unidos e no Canadá não há documentos: o número fica ativo assim que a operadora confirma. No Brasil a operadora pede o Cartão CNPJ, um comprovante de endereço de até 90 dias e o endereço onde o serviço é prestado. Eles vêm da verificação da sua empresa, sem reenviar nada.

## Preço e cobrança

Cada número tem uma ativação (cobrada uma vez, quando fica ativo) e uma mensalidade, sem pró-rata no primeiro mês. O preço fica fechado no dia do aluguel.

| País · tipo | Ativação | Mensalidade |
| --- | --- | --- |
| Estados Unidos · fixo | US$ 5 / R$ 29 | US$ 5 / R$ 29 |
| Estados Unidos · 0800 | US$ 10 / R$ 55 | US$ 10 / R$ 55 |
| Canadá · fixo | US$ 5 / R$ 29 | US$ 5 / R$ 29 |
| Canadá · 0800 | US$ 10 / R$ 55 | US$ 10 / R$ 55 |
| Brasil · fixo | US$ 8 / R$ 39 | US$ 8 / R$ 39 |

- **Contrato Enterprise:** os números inclusos no contrato saem a zero; os outros entram na fatura mensal.
- **Sem fatura:** cartão. Pedimos o cartão no primeiro aluguel e a cobrança acontece só quando o número fica ativo.
- **Minutos não pagam número:** o saldo em minutos é só para as ligações.

Quantos números a organização pode ter: Business, 1; Enterprise, o que estiver no contrato.

Se um pagamento falhar, avisamos o Dono no mesmo dia. Depois de 7 dias o número fica suspenso. Depois de 30 dias ele volta para a operadora e pode não ter volta.

## Quem usa cada número

Na página do número, escolha os grupos (departamentos, perfis de acesso, grupos do login da empresa) e as pessoas que podem ligar e receber por ele. Sem nenhum grupo ou pessoa marcado, todos que podem ligar usam o número.

O **número padrão da organização** vem marcado em "Ligar de". Quem não pode usar o padrão liga pelo primeiro número que pode usar ou, se não houver, pelo número compartilhado da Kanutus.

## Ligue de um número pela API

`GET /v1/numbers` lista os números de onde a pessoa dona da chave pode ligar agora: os números ativos da sua organização que essa pessoa pode usar (grupos e pessoas do número) e o número compartilhado da Kanutus, quando ele é oferecido. Permissão: `numbers:read`.

```bash
curl "{{API}}/v1/numbers" -H "Authorization: Bearer $KANUTUS_KEY"
```

```json
{
  "data": [
    { "id": "9b2f6c1e-4d0a-4f55-8a43-2f1d6c7e0a11", "e164": "+16465550142", "label": "Vendas", "status": "active", "shared": false, "default": true },
    { "id": "3c8d0a52-71e4-4b9a-9f0e-6a2b5d1c7e33", "e164": "+5511955550100", "label": "Escritório Brasil", "status": "active", "shared": false, "default": false }
  ]
}
```

- `default: true` é o número usado quando você não manda `from`.
- `shared: true` é o número compartilhado da Kanutus, não um dos seus.
- Mande o `id` do número em `from` no [POST /v1/calls](/guides/translated-call) (e no `GET /v1/calls/quote` para conferir antes). O E.164 também é aceito.
- As mesmas regras do app: empresa verificada, Ligações liberada e a pessoa dona da chave num grupo que pode ligar (senão, `403`). Uma chave limitada a alguns números só lista esses.
- `limit` (1–100, padrão 50).

| Status | Código | Quando |
| --- | --- | --- |
| 404 | `number_not_found` | O número `from` não é da sua organização. |
| 409 | `number_not_active` | O número `from` está em análise, suspenso ou cancelado. |
| 403 | `number_not_member` | A pessoa dona da chave não está entre as pessoas ou grupos que usam esse número. |
| 403 | `number_not_allowed` | A chave está limitada a outros números. |
| 409 | `number_required` | A sua organização não tem número próprio. Alugue um no app e ligue de novo. |

Com uma chave `kt_test_`, a lista traz dois números do simulador (`num_test_main`, o padrão, e `num_test_sales`); `from: "num_test_inactive"` responde `number_not_active` e `from: "num_test_not_member"` responde `number_not_member`. Veja [Modo de teste](/test-mode).

## Cancele

Na página do número, **Cancelar número** pede que você digite o número para confirmar. Ele continua funcionando até o fim do mês pago e depois volta para a operadora. Não há estorno, e o número pode não ter volta.
