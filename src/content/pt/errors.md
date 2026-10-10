# Limites e erros

## Formato dos erros

Os erros vêm em `application/problem+json` (RFC 9457). O `code` é estável, então você pode usá-lo nas suas regras. Já a `message` é para pessoas e pode mudar. Toda resposta traz um `X-Request-Id`: inclua esse valor quando falar com a gente.

```json
{
  "type": "https://kanutus.com/developers/errors#insufficient_scope",
  "title": "insufficient_scope",
  "status": 403,
  "code": "insufficient_scope",
  "message": "This credential lacks the permission rooms:write.",
  "request_id": "req_0NjjmC1WyEw2Tmyz1rwP"
}
```

## Códigos

| HTTP | `code` | O que fazer |
| --- | --- | --- |
| 400 | `invalid_request` | Corrija a requisição; a `message` diz qual campo está errado |
| 400 | `idempotency_key_required` | Mande o cabeçalho `Idempotency-Key` nas requisições que criam algo |
| 401 | `unauthorized` | A credencial está ausente, inválida, vencida ou revogada |
| 402 | `spend_limit_reached` | A chave atingiu o limite de gasto (do dia, do mês ou por ligação) ou acabaram os minutos |
| 403 | `insufficient_scope` | Falta uma permissão à credencial; o cabeçalho `WWW-Authenticate` diz qual |
| 403 | `needs_review` | Quem criou a chave saiu da organização; ela só lê até um Dono revisá-la |
| 403 | `paid_plan_required` | A conta está no plano grátis |
| 403 | `ip_not_allowed` | A requisição veio de um IP fora da lista permitida da chave |
| 403 | `language_not_allowed`, `voice_not_allowed`, `number_not_allowed`, `destination_not_allowed` | Fora das restrições da chave ou das regras do país |
| 403 | `org_blocked`, `org_suspended` | A organização foi bloqueada ou suspensa; fale com a gente |
| 404 | `not_found` | Não existe ou esta credencial não tem acesso |
| 409 | `idempotency_mismatch` | O mesmo `Idempotency-Key` foi usado com um corpo diferente |
| 409 | `idempotency_in_progress` | A primeira requisição com essa chave ainda está rodando; tente de novo em instantes |
| 409 | `slot_taken` | O horário foi ocupado nesse meio-tempo |
| 409 | `session_ended` | A sessão do agente já terminou |
| 429 | `rate_limited` | Requisições demais; espere o tempo do `Retry-After` |
| 429 | `too_many_sessions` | Sessões de agente demais ao mesmo tempo |
| 429 | `test_daily_limit` | Chaves de teste aceitam 1.000 requisições por dia |
| 501 | `not_available_yet` | Ainda não está disponível em produção; funciona com uma chave `kt_test_` |
| 503 | `api_disabled`, `mcp_disabled`, `booking_unavailable` | Indisponível no momento; tente mais tarde |

## Limites de requisições

- O padrão é de **60 requisições por minuto** por credencial; planos para empresas podem ter mais. Chaves de teste também têm um limite de **1.000 requisições por dia**.
- Toda resposta traz `RateLimit-Limit`, `RateLimit-Remaining` e `RateLimit-Reset`. Um `429` também traz `Retry-After` (em segundos).
- Repita `429` e `5xx` com espera exponencial e jitter. Não repita outros `4xx`, a não ser `409 idempotency_in_progress`.

## Idempotência

As requisições que criam algo exigem o cabeçalho `Idempotency-Key`: `POST /v1/rooms`, `/meetings`, `/bookings`, `/calls` e `/rooms/{id}/agent-sessions`. Use qualquer valor único de até 255 caracteres, como um UUID. Se a rede falhar, mande a mesma requisição **com a mesma chave**: você recebe a resposta original em vez de uma segunda sala, agendamento ou ligação. As chaves ficam guardadas por 24 horas, por credencial.

## Versões

A versão vai no caminho (`/v1`). Campos e endpoints novos podem aparecer a qualquer momento, então ignore os campos que você não conhece. Uma mudança incompatível viria como `/v2`, com 12 meses de convivência entre as duas versões e um e-mail aos donos das chaves que usam a rota antiga. Toda resposta traz `Kanutus-Version`.
