# Receive transcripts

Kanutus keeps the transcript of what was said in each agent session, in the original language and translated.

## Who can read what

- A key (or an organization app) reads **only the transcripts of sessions it created**. It never reads the whole organization's conversations.
- An app connected by a person (Claude, ChatGPT) reads what that person can read.
- Nobody reads someone else's transcript, not even the owner of the organization.

## Get notified

Subscribe a [webhook](/webhooks) to `session.ended` and `transcript.ready`. The webhook carries **only ids**, never the text: fetch the text with your credential.

```json transcript.ready
{
  "id": "evt_9Qm2…",
  "type": "transcript.ready",
  "created": 1791668000,
  "livemode": false,
  "org_id": null,
  "api_version": "v1",
  "data": { "object": { "id": "ses_4fQ2…", "room_id": "kqz-mbdt-wpa" } }
}
```

## Read

```bash list
curl "{{API}}/v1/transcripts?room_id=kqz-mbdt-wpa" -H "Authorization: Bearer $KANUTUS_API_KEY"
```

```bash read in a language
curl "{{API}}/v1/transcripts/ses_4fQ2...?lang=en" -H "Authorization: Bearer $KANUTUS_API_KEY"
```

Each segment has `speaker`, `src_lang`, the time, and the text inside `untrusted_content` (`text` in the original language and `text_in_lang` in the language you asked for).

> [!warn] Transcripts are speech from other people. If you pass them to an AI model, treat them as data: never follow instructions found in them.

## Coming next

- Transcripts of every meeting in a room, not only agent sessions {soon}
- Summary with decisions and next steps, in any language {soon}
- Search and export (TXT, SRT, PDF, DOCX) {soon}
