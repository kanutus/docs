# Numbers

Your organization's own phone numbers: the number people see when your team calls them. Without a number of your own, calls go out from the Kanutus shared number (+1 646 518 1033).

> [!note] Numbers are rented in the app by an owner or manager of an organization whose company is verified. Renting through the API {soon}; listing them and calling from them through the API works today ([below](#call-from-a-number-through-the-api)).

## Rent in the app

1. Open **Calls › Numbers** at [{{APP}}/org/phone/numbers]({{APP}}/org/phone/numbers) and click **Rent a number**.
2. Choose the country, the area code and the type (local or toll-free). The list shows the free numbers, the activation and the monthly fee.
3. Check the summary: what is charged when the number becomes active, where the charge goes and the documents the country requires.
4. Click **Rent** and confirm with the code from your authenticator app.

Today you can rent numbers in the United States, Canada and Brazil.

## Number status

| Status | What it means |
| --- | --- |
| Under review | Documents sent to the carrier. Nothing is charged and the number does not call yet. |
| Active | It calls. Activation is charged that day and the monthly fee every month, on the same day. |
| Rejected | The carrier or Kanutus rejected the documents. The reason shows in the list; send them again and request another number. |
| Suspended | Payment 7 days late. It does not call. |
| Cancelled | Returned to the carrier. It leaves "Call from"; the history stays. |

In the United States and Canada there are no documents: the number is active as soon as the carrier confirms. In Brazil the carrier asks for the company registration card (CNPJ), a proof of address up to 90 days old and the address where the service is provided. They come from your company verification, nothing to send again.

## Price and billing

Each number has an activation (charged once, when it becomes active) and a monthly fee, with no proration in the first month. The price is locked on the day you rent.

| Country · type | Activation | Monthly |
| --- | --- | --- |
| United States · local | US$ 5 / R$ 29 | US$ 5 / R$ 29 |
| United States · toll-free | US$ 10 / R$ 55 | US$ 10 / R$ 55 |
| Canada · local | US$ 5 / R$ 29 | US$ 5 / R$ 29 |
| Canada · toll-free | US$ 10 / R$ 55 | US$ 10 / R$ 55 |
| Brazil · local | US$ 8 / R$ 39 | US$ 8 / R$ 39 |

- **Enterprise contract:** numbers included in the contract cost zero; the others go on the monthly invoice.
- **No invoice:** card. We ask for a card on the first rental and charge only when the number becomes active.
- **Minutes don't pay for numbers:** your minute balance is only for calls.

How many numbers an organization can have: Business, 1; Enterprise, what the contract says.

If a payment fails, we warn the owner the same day. After 7 days the number is suspended. After 30 days it goes back to the carrier and may not be recoverable.

## Who uses each number

On the number's page, choose the groups (departments, access profiles, company login groups) and the people who can call and receive with it. With no group or person selected, everyone who can call uses the number.

The **organization's default number** is pre-selected in "Call from". People who can't use the default call from the first number they can use or, if there is none, from the Kanutus shared number.

## Call from a number through the API

`GET /v1/numbers` lists the numbers the key's owner can call from right now: active numbers of your organization that this person can use (the number's groups and people), plus the Kanutus shared number when it is offered. Permission: `numbers:read`.

```bash
curl "{{API}}/v1/numbers" -H "Authorization: Bearer $KANUTUS_KEY"
```

```json
{
  "data": [
    { "id": "9b2f6c1e-4d0a-4f55-8a43-2f1d6c7e0a11", "e164": "+16465550142", "label": "Sales", "status": "active", "shared": false, "default": true },
    { "id": "3c8d0a52-71e4-4b9a-9f0e-6a2b5d1c7e33", "e164": "+5511955550100", "label": "Brazil office", "status": "active", "shared": false, "default": false }
  ]
}
```

- `default: true` is the number used when you don't send `from`.
- `shared: true` is the Kanutus shared number, not one of your own.
- Send a number's `id` as `from` in [POST /v1/calls](/guides/translated-call) (and in `GET /v1/calls/quote` to check it first). The E.164 is also accepted.
- The same rules as the app: your company is verified, Calls is turned on and the key's owner is in a group allowed to call (otherwise `403`). A key limited to some numbers only lists those.
- `limit` (1–100, default 50).

| Status | Code | When |
| --- | --- | --- |
| 404 | `number_not_found` | The `from` number is not one of your organization's numbers. |
| 409 | `number_not_active` | The `from` number is under review, suspended or cancelled. |
| 403 | `number_not_member` | The key's owner is not among the people or groups that use that number. |
| 403 | `number_not_allowed` | The key is limited to other numbers. |
| 409 | `number_required` | Your organization has no number of its own. Rent one in the app, then call again. |

With a `kt_test_` key the list has two simulator numbers (`num_test_main`, the default, and `num_test_sales`); `from: "num_test_inactive"` answers `number_not_active` and `from: "num_test_not_member"` answers `number_not_member`. See [Test mode](/test-mode).

## Cancel

On the number's page, **Cancel number** asks you to type the number to confirm. It keeps working until the end of the paid month and then goes back to the carrier. There is no refund, and the number may not be recoverable.
