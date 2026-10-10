# Agendar reunião

Há dois caminhos: marcar a reunião direto (você define o horário e convida as pessoas) ou agendar um horário livre num link de agendamento (como no Calendly).

## Marcar direto

`POST /v1/meetings` cria uma sala com data. Os convidados recebem o convite por e-mail, com o link e um arquivo de calendário. Exige a permissão `calendar:write`.

```bash
curl -X POST {{API}}/v1/meetings \
  -H "Authorization: Bearer $KANUTUS_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Revisão com Kenji",
    "starts_at": "2026-10-12T10:00:00-03:00",
    "duration_min": 30,
    "invitees": ["kenji@exemplo.com"],
    "langs": ["pt", "ja"]
  }'
```

- `starts_at` vai em ISO 8601 **com o fuso horário**.
- `langs` são as línguas dos participantes; elas ajudam o Kanutus a se preparar.
- A resposta é uma sala com `status: "scheduled"` e a `url` dela.

Para listar, use `GET /v1/meetings?from=…&to=…`. Para cancelar, use `DELETE /v1/meetings/{id}`; os convidados são avisados.

## Agendar num link de agendamento

1. Liste os seus links de agendamento (exige `calendar:read`):
   ```bash
   curl {{API}}/v1/event-types -H "Authorization: Bearer $KANUTUS_API_KEY"
   ```
2. Veja os horários livres (em UTC) de um deles:
   ```bash
   curl "{{API}}/v1/event-types/<event_type_id>/slots?from=2026-10-13&to=2026-10-17" \
     -H "Authorization: Bearer $KANUTUS_API_KEY"
   ```
3. Agende um horário para o convidado (exige `calendar:write`). Ele recebe o convite por e-mail:
   ```bash
   curl -X POST {{API}}/v1/bookings \
     -H "Authorization: Bearer $KANUTUS_API_KEY" \
     -H "Idempotency-Key: $(uuidgen)" \
     -H "Content-Type: application/json" \
     -d '{"event_type_id": "<event_type_id>", "start": "2026-10-14T13:00:00Z",
          "guest": {"name": "Lena", "email": "lena@exemplo.com", "speak": "fr", "tz": "Europe/Paris"}}'
   ```

Para agendar no link de **outra pessoa**, mande `page` e `event` (os trechos da URL de agendamento dela) em vez de `event_type_id`. Se o horário tiver sido ocupado nesse meio-tempo, a resposta é `409 slot_taken`.

## Eventos

`meeting.created`, `meeting.canceled` e `booking.created` chegam aos seus [webhooks](/webhooks).

## Com um assistente (MCP)

*"Ache um horário livre na terça que vem à tarde no meu link de 30 minutos e agende para lena@exemplo.com, ela fala francês."* O assistente usa `list_booking_links`, `find_slots` e `book_slot`.
