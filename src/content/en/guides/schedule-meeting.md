# Schedule a meeting

Two ways: schedule a meeting directly (you set the time and invite people), or book a free time on a booking link (like Calendly).

## Schedule directly

`POST /v1/meetings` creates a room with a date. Invitees get the invitation by email with the link and a calendar file. Needs `calendar:write`.

```bash
curl -X POST {{API}}/v1/meetings \
  -H "Authorization: Bearer $KANUTUS_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review with Kenji",
    "starts_at": "2026-10-12T10:00:00-03:00",
    "duration_min": 30,
    "invitees": ["kenji@example.com"],
    "langs": ["pt", "ja"]
  }'
```

- `starts_at` is ISO 8601 **with the time zone offset**.
- `langs` are the languages of the participants (it helps Kanutus get ready).
- The answer is a room with `status: "scheduled"` and its `url`.

List with `GET /v1/meetings?from=…&to=…` and cancel with `DELETE /v1/meetings/{id}` (invitees are told).

## Book on a booking link

1. List your booking links (needs `calendar:read`):
   ```bash
   curl {{API}}/v1/event-types -H "Authorization: Bearer $KANUTUS_API_KEY"
   ```
2. Get the free times (UTC) of one of them:
   ```bash
   curl "{{API}}/v1/event-types/<event_type_id>/slots?from=2026-10-13&to=2026-10-17" \
     -H "Authorization: Bearer $KANUTUS_API_KEY"
   ```
3. Book one for a guest (needs `calendar:write`). The guest gets the invitation by email:
   ```bash
   curl -X POST {{API}}/v1/bookings \
     -H "Authorization: Bearer $KANUTUS_API_KEY" \
     -H "Idempotency-Key: $(uuidgen)" \
     -H "Content-Type: application/json" \
     -d '{"event_type_id": "<event_type_id>", "start": "2026-10-14T13:00:00Z",
          "guest": {"name": "Lena", "email": "lena@example.com", "speak": "fr", "tz": "Europe/Paris"}}'
   ```

To book on **someone else's** link, send `page` and `event` (the slugs in their booking URL) instead of `event_type_id`. If the time was taken in the meantime: `409 slot_taken`.

## Events

`meeting.created`, `meeting.canceled` and `booking.created` arrive at your [webhooks](/webhooks).

## With an assistant (MCP)

*"Find a free time next Tuesday afternoon on my 30-minute link and book it for lena@example.com, she speaks French."* The assistant uses `list_booking_links`, `find_slots` and `book_slot`.
