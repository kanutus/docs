# Test mode

Keys that start with `kt_test_` run everything on a **simulator**. Nothing uses minutes, no phone rings and no GPU is used, but permissions, spending limits, webhooks and errors behave like production. Use it to build and to run your tests.

## How to get a test key

In the app, open **Developers** and switch **Production | Test** to **Test** (the bar turns yellow). Keys created there start with `kt_test_`. Test data is kept apart: objects come back with `"livemode": false`.

## What the simulator does

| Feature | In test mode |
| --- | --- |
| Rooms and meetings | Created for real (with `livemode: false`), so you can open the links |
| AI agent in a room | Works now. Two robot participants join: **Kenji** (speaks Japanese) and **Lena** (speaks French). They greet you and answer with fixed phrases, translated to your `hear_lang` |
| Phone calls | Works now with the magic numbers below |
| Voices | A cloned voice in test is a standard voice; nobody is contacted |
| Webhooks | Real deliveries to your test endpoints, same signature |
| Limits | Up to 1,000 requests per day per test key (`429 test_daily_limit`) |

## Magic phone numbers

| Number | What happens |
| --- | --- |
| `+1 555 0100` | Answers and replies with test phrases in English |
| `+55 11 5555 0100` | Answers in Portuguese |
| `+1 555 0101` | Busy |
| `+1 555 0102` | Goes to voicemail |
| `+1 555 0199` | Blocked destination (premium number) |

Any other number is checked against the real rules (country, number type, purpose of the call) and then simulated.

```bash quote a destination
curl "{{API}}/v1/calls/quote?to=%2B15550100&purpose=scheduling" \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY"
```

## Fire a test event

In **Developers → Webhooks** (Test), or with the API:

```bash
curl -X POST {{API}}/v1/webhook-endpoints/<endpoint_id>/test \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY"
```

## Going live

Create a `kt_live_` key in **Production** with the same permissions and swap it in. Agents in live rooms and live phone calls are {soon}: with a live key those endpoints answer `501 not_available_yet` today.
