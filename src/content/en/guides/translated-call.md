# Translated phone call

An AI agent calls a phone number, introduces itself as an AI assistant, and talks with the person in their language while you (or your agent) write and read in yours.

> [!soon] Live phone calls are coming soon. With a `kt_test_` key you can build the whole integration today with the [magic numbers](/test-mode#magic-phone-numbers). With a live key, `POST /v1/calls` answers `501 not_available_yet`.

## 1. Check the destination and the purpose

Every call declares a **purpose**: `transactional`, `scheduling`, `support` or `marketing`. What is allowed depends on the country (for example, marketing to mobile phones in the US needs prior written consent; in Brazil telemarketing has its own rules). Ask first:

```bash
curl "{{API}}/v1/calls/quote?to=%2B15550100&purpose=scheduling" \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY"
```

The answer tells the country, the number type, the minute factor, whether the destination is allowed and, under `purpose`, whether that purpose is allowed and what it requires (`requires`, for example `["written_consent"]`). Premium and shared-cost numbers are always blocked.

## 2. Place the call

Needs `calls:dial` (a permission that is off by default; the owner enables it).

```bash
curl -X POST {{API}}/v1/calls \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"to": "+1 555 0100", "purpose": "scheduling",
       "consent": {"kind": "existing_customer", "ref": "crm-4821"},
       "agent_lang": "pt", "remote_lang": "en"}'
```

- `agent_lang`: the language you write and read in. `remote_lang`: the language of the person called.
- `consent`: what consent you have from that person, and your reference to the record.
- The answer has the call `id` and `status`; `ai_disclosure` is always `true`.

Follow the call with `GET /v1/calls/{id}` or the `call.*` [webhooks](/webhooks) (`call.answered`, `call.voicemail`, `call.completed`, `call.failed`, `call.blocked`).

## Cost

`ceil(max(talk time, 30 s) × destination factor)` minutes, translation included. The quote shows the factor. Your key's per-call limit and daily limit apply.

## Coming next

- Talk and listen during the call with `say` and `listen`, keypad tones for phone menus {soon}
- Connect a person from your organization to the call, speaking through the Kanutus app {soon}
- Answer incoming calls with an agent {soon}

Read [Responsible use](/responsible-use) before calling people.
