<!--
DRAFT, NOT PUBLISHED. Design of 2026-10-14 (numbers: where a company calls from). Outside NAV in src/config.mjs.
-->

# Numbers

Your organization's own phone numbers: the number people see when your team or your AI agents call. Without a number of your own, calls go out from the Kanutus shared number.

> [!soon] Renting numbers is coming soon. Until then, `GET /v1/numbers` lists only the shared number and `POST /v1/numbers` answers `403 numbers_disabled`.

Needs `numbers:read` to list and `numbers:write` to rent or cancel (off by default).

## List your numbers

```bash
curl {{API}}/v1/numbers -H "Authorization: Bearer $KANUTUS_KEY"
```

```json
{
  "data": [
    {
      "id": "num_4QpZ81",
      "e164": "+14155550142",
      "label": "Sales US",
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

`status`: `review` (documents being checked, nothing charged), `active`, `suspended` (payment overdue), `cancelled`. `acquired.via`: `app_rent`, `staff_provision`, `port`, `platform`.

## Find a number to rent

```bash
curl "{{API}}/v1/numbers/available?country=BR&area_code=11&type=local" -H "Authorization: Bearer $KANUTUS_KEY"
```

Each result has the number, city, type, activation and monthly price, and `requirements` (for example `["company_registration", "proof_of_address", "service_address"]`). In Brazil they come from your company verification.

## Rent

```bash
curl -X POST {{API}}/v1/numbers \
  -H "Authorization: Bearer $KANUTUS_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"e164": "+551140401234", "label": "São Paulo"}'
```

Renting spends money, so a key cannot finish it alone: the answer is `202` with `status: "needs_owner_approval"` and an `approve_url`. After an owner approves in the app, the number goes to `review` and then `active`. Activation is charged when it becomes active; the monthly fee renews on the same day each month (invoice or card on file).

## Cancel

`DELETE /v1/numbers/{id}` keeps the number until the end of the paid month, then returns it to the carrier. It may not be recoverable.

## Use a number on a call

Pass `from` in [`POST /v1/calls`](/guides/translated-call). Without it, the default number is used.

## Errors

| Status | Code | When |
| --- | --- | --- |
| 403 | `numbers_disabled` | Renting numbers is not available for your organization or plan. |
| 403 | `numbers_limit_reached` | Your plan's number limit was reached. |
| 409 | `number_unavailable` | Someone else took that number. Search again. |
| 422 | `documents_required` | The country requires documents your company verification does not have. |
| 409 | `number_not_active` | The number is under review, suspended or cancelled. |
