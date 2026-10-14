# Webhooks

O Kanutus manda um `POST` HTTPS para o seu servidor quando algo acontece: uma sala começou, uma reunião foi agendada, uma sessão de agente terminou, um limite de gasto foi atingido.

## Crie um endpoint

No app: **Desenvolvedores → Webhooks → Adicionar** (no modo **Teste** para endpoints de teste). Ou pela API, com a permissão `webhooks:write`:

```bash
curl -X POST {{API}}/v1/webhook-endpoints \
  -H "Authorization: Bearer $KANUTUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://seu-sistema.com/kanutus", "events": ["meeting.created", "booking.created", "session.ended"]}'
```

A resposta traz o segredo de assinatura `whsec_…`. **Ele aparece uma única vez**: guarde-o junto com os seus outros segredos.

A URL precisa ser `https` e pública, sem redirecionamento. Endereços privados, de loopback e de metadados de nuvem são recusados.

## O evento

```json
{
  "id": "evt_8c1Zq…",
  "type": "booking.created",
  "created": 1791668000,
  "livemode": true,
  "org_id": "…",
  "api_version": "v1",
  "data": { "object": { "id": "…" } }
}
```

Os eventos levam ids e só o mínimo necessário; os números de telefone vão mascarados. **Texto de transcrição nunca vai no evento**: busque-o com a sua credencial.

## Confira a assinatura

Toda requisição traz o cabeçalho `Kanutus-Signature`:

```text
Kanutus-Signature: t=1791668000,v1=5f2b…
```

`v1` é o HMAC-SHA256, em hexadecimal, de `"<t>.<corpo bruto>"` calculado com o seu segredo. Para conferir:

- calcule sobre o **corpo bruto**, antes de interpretar o JSON;
- compare em tempo constante;
- recuse carimbos de tempo com mais de 5 minutos.

Durante a troca de segredo, o mesmo cabeçalho traz dois valores `v1=` por 24 horas. Aceite a requisição se **qualquer um** deles bater.

:::tabs
```js Node.js
import crypto from "node:crypto";

export function verifyKanutus(rawBody, header, secret, toleranceS = 300) {
  const parts = header.split(",").map((p) => p.trim().split("="));
  const t = Number(parts.find(([k]) => k === "t")?.[1]);
  if (!Number.isFinite(t) || Math.abs(Date.now() / 1000 - t) > toleranceS) return false;
  const want = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return parts.some(([k, v]) => k === "v1" && v.length === want.length &&
    crypto.timingSafeEqual(Buffer.from(v), Buffer.from(want)));
}
```
```python Python
import hmac, hashlib, time

def verify_kanutus(raw_body: bytes, header: str, secret: str, tolerance_s: int = 300) -> bool:
    parts = [p.strip().split("=", 1) for p in header.split(",")]
    t = next((int(v) for k, v in parts if k == "t"), None)
    if t is None or abs(time.time() - t) > tolerance_s:
        return False
    want = hmac.new(secret.encode(), f"{t}.".encode() + raw_body, hashlib.sha256).hexdigest()
    return any(k == "v1" and hmac.compare_digest(v, want) for k, v in parts)
```
:::

## Responda rápido; o Kanutus tenta de novo

- Responda com qualquer `2xx` em até **10 segundos** e deixe o trabalho pesado para depois (numa fila).
- Qualquer outra resposta é reenviada com espera exponencial: **1 min, 5 min, 30 min, 2 h, 6 h, 12 h, 24 h, 24 h** (cerca de 3 dias).
- Um endpoint que falha sem parar por 3 dias é desativado, e o Dono recebe um e-mail.
- A ordem dos eventos não é garantida, e o mesmo evento pode chegar duas vezes: use o `id` para descartar repetidos.
- Perdeu algum evento? `GET /v1/events` lista os eventos dos últimos 30 dias. No app, dá para ver cada entrega e reenviar.
- Para trocar o segredo, use `POST /v1/webhook-endpoints/{id}/rotate-secret`. Para mandar um teste assinado, use `POST /v1/webhook-endpoints/{id}/test`.

## Tipos de evento

| Evento | Quando |
| --- | --- |
| `room.started` | Uma sala foi criada pela API |
| `room.ended`, `room.participant_joined`, `room.participant_left` | Ciclo de vida da sala {soon} |
| `session.started`, `session.ended` | Um agente de IA entrou ou saiu de uma sala |
| `meeting.created`, `meeting.canceled` | Uma reunião foi marcada ou cancelada |
| `meeting.updated` | Uma reunião mudou {soon} |
| `booking.created` | Um horário foi agendado num link de agendamento |
| `booking.rescheduled`, `booking.canceled` | Mudanças num agendamento {soon} |
| `transcript.ready` | Uma transcrição já pode ser lida |
| `summary.ready` | Um resumo já pode ser lido {soon} |
| `call.blocked` | Uma ligação foi recusada (destino ou finalidade não permitidos) |
| `call.ringing`, `call.answered`, `call.voicemail`, `call.completed`, `call.failed` | Andamento da ligação |
| `call.ended` | Sempre o último evento da ligação, depois de acertar os minutos: `status`, `billed_seconds` e `ended_by` (`agent`, `remote`, `limit` ou `system`) |
| `voice.consent_completed`, `voice.ready`, `voice.failed` | Clonagem de voz com consentimento {soon} |
| `usage.threshold` | Uma chave chegou a 80% ou 100% do limite de gasto |
| `credential.expiring` | Uma chave vai vencer em breve {soon} |
| `academy.completed` | Uma pessoa da organização concluiu todas as aulas de uma trilha da Kanutus Academy |
| `academy.certified` | Uma pessoa da organização recebeu um certificado da Kanutus Academy (código e link de verificação; sem nome nem e-mail) |
