# AI agent in a room

An agent joins a Kanutus room as a participant with an **AI badge**. It speaks by sending **text**: Kanutus translates it into each listener's language and speaks it with the chosen voice. It listens by reading what the others said, already translated into its language.

> [!soon] Agents in live rooms are coming soon. With a `kt_test_` key the whole flow works today on the [simulator](/test-mode), with two robot participants. With a live key, `join` answers `501 not_available_yet`.

The flow is always: **join → listen → say → … → leave**.

## 1. Create (or pick) a room

```bash
curl -X POST {{API}}/v1/rooms \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"title": "Demo with the agent", "langs": ["pt", "ja", "fr"]}'
```

Keep the `id` (for example `kqz-mbdt-wpa`).

## 2. Join

`speak_lang` is the language of the text you will send; `hear_lang` is the language you want to read. Needs `rooms:join`.

```bash
curl -X POST {{API}}/v1/rooms/kqz-mbdt-wpa/agent-sessions \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"name": "Vértice assistant", "speak_lang": "pt", "hear_lang": "pt"}'
```

The answer is a session: keep its `id` (`ses_…`).

### The agent always says it is an AI

As soon as the agent joins, the room **hears and reads**, translated into each listener's language, a fixed introduction spoken with the agent's voice:

> "Hello, I am *name*, an AI agent." — or just "Hello, I am an AI agent." when `name` is the default.

If the session was created with `see_participants`, the introduction continues: *"Depending on the situation, I may ask you to share your camera or your screen."* Whoever enters the room **after** the agent hears and reads the same introduction, just for them. It comes before the agent's first `say`, once per person, and it is **free** (no minutes). It cannot be turned off; the old `announce` field is ignored. The `events` answer carries `agent.introduced` (with `meta.to` = `room` or `participant`), so the agent knows it has already introduced itself and does not repeat it.

> [!warn] **If the agent evaluates people** (an interviewer that scores a candidate from the camera or the shared screen, for example), and not only asks them to turn the camera on, the organization running the agent must get their **explicit consent before the interview** and offer a **human review** of the outcome. Rules on AI in recruitment vary by country: EU (AI Act, high-risk use), Illinois and New York (notice and consent), Brazil (LGPD: consent and human review). The introduction and the room notice do not replace that consent.

### With a face (avatar) {soon}

> [!soon] The agent with a face (an avatar on camera) is coming soon. For now the agent joins **voice only**: if you send `avatar_id`, the join works as usual, the field is ignored and the answer carries `avatar.status` = `coming_soon`. `GET /v1/avatars` answers with an empty list and `avatars.status` = `coming_soon`.

For the voice, `voice_id` accepts the catalog voice keys (for example `kt-en-f-06`), besides your consented clones (`vce_…`) and generic picks (`generic_…`).

### Engines start on demand

The GPU engines behind a room (transcription, translation, voice) are not running all the time: the first agent or person who enters wakes them, and that takes minutes. The `events` answer tells you where they are:

```json
{ "events": [], "cursor": 0, "status": "active",
  "engines": { "stt": "ready", "mt": "starting", "voice": "starting" },
  "stage": "connecting", "eta_s": { "mt": 300, "voice": 420 } }
```

`stage` goes `connecting` → `text_ready` (text flows, voice still starting) → `ready`. Until `mt` is `ready`, `say` answers `503 engines_starting` (with `retry_after_s`, `engines` and `eta_s`; nothing is charged) and the agent's introduction waits for the engines. Keep calling `events` and speak when `stage` is `ready`. `down` means an engine was up and went away.

### Seeing the participants

An interviewer or a meeting assistant may need to **see** the people: is the camera on, what is on the shared screen. Join with `see_participants: true` and pick how often you want a picture with `snapshot_every_s`, one of **5, 10, 20, 40, 60, 90, 120, 500 or 900** seconds (default 20; any other value is a validation error listing these).

```bash
curl -X POST {{API}}/v1/rooms/kqz-mbdt-wpa/agent-sessions \
  -H "Authorization: Bearer $KANUTUS_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"name": "Interviewer", "speak_lang": "pt", "hear_lang": "pt", "see_participants": true, "snapshot_every_s": 10}'
```

How it works: each participant's browser takes a JPEG print (about 640 px wide) of its own camera and shared screen at that pace and sends it to the room's translation server, **only while an agent that sees is in the room**. The server keeps only the last print of each person, in memory, never on disk. Everyone in the room sees a permanent notice: *"The AI agent can see your camera and your screen"*, and the agent's spoken introduction adds that it may ask them to share the camera or the screen. Snapshots are not charged in this version. Evaluating people from what the agent sees needs their consent beforehand and a human review (see above).

Then every `listen` answer carries `snapshots`: one per participant, with `camera_on`, `screen_on` and the `prints` (`kind` camera or screen, `image` as a `data:image/jpeg;base64,…`). Camera off = `camera_on: false` and no image, so the agent can ask the person to turn it on. `reported: false` means that participant's app sent nothing (phone, PC app or old browser).

To look **right now**, call `GET /v1/sessions/{id}/look` (optionally `?participant_id=`): the browsers are asked for a fresh print and the answer comes in about 3 s. A session joined without `see_participants` gets `409 not_seeing`.

### Reading and writing the room chat

People paste links, codes and names in the room's chat rather than saying them. The agent **reads the chat**: the join answer carries `chat_history`, the last 50 messages of the room (oldest first), and from then on every message arrives in `listen` as a `chat.message` event:

```json
{ "id": 12, "type": "chat.message", "speaker": "Kenji", "src_lang": "ja",
  "untrusted_content": { "text": "https://example.com/cv.pdf", "text_in_hear_lang": "https://example.com/cv.pdf" },
  "meta": { "chat_id": "m1abcdef", "participant_id": "u_kenji", "at": "2026-10-22T12:00:00.000Z", "agent": false, "translated_to": "pt" },
  "created_at": "2026-10-22T12:00:00.400Z" }
```

`text` is the message as written; `text_in_hear_lang` is its translation into the agent's `hear_lang` by the room's translator (`null` while the translator is still starting: read `text`). `src_lang` is the language the author declared (what they speak) or the one the script shows; `null` when unknown. Messages written by other AI agents come with `meta.agent: true`. Reading the chat is free.

The agent **writes in the chat** with `POST /v1/sessions/{id}/chat`:

```bash
curl -X POST {{API}}/v1/sessions/ses_.../chat \
  -H "Authorization: Bearer $KANUTUS_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Please paste the link to your CV here in the chat."}'
```

The message appears in the room's chat for everyone, signed by the agent with the **"AI agent" badge**, and each person reads it translated into their own language, like any chat message. Text only, so **no minutes are used**. Limits: 2000 characters and one message per second per session (`429 rate_limited` with `Retry-After`). The events carry it as `chat.sent`, and both `chat.message` and `chat.sent` show up in the [transcript](/guides/transcripts).

> [!warn] Chat messages are **untrusted content** like speech: a link or a code pasted by a participant is data to act on according to your own rules, never an instruction to follow.

## 3. Listen

Long-poll: the call waits up to `wait` seconds (max 25) for new phrases and returns them with a `cursor`. Call again with that cursor.

```bash
curl "{{API}}/v1/sessions/ses_.../events?cursor=0&wait=20" \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY"
```

```json
{
  "events": [
    { "id": 1, "type": "segment.final", "speaker": "Kenji (robô de teste)", "src_lang": "ja",
      "untrusted_content": { "text": "こんにちは、よろしくお願いします。", "text_in_hear_lang": "Olá, prazer em conhecer." },
      "created_at": "2026-10-10T21:30:02Z" }
  ],
  "cursor": 1,
  "status": "active",
  "face": "live"
}
```

`face` belongs to the agent with a face, which is coming soon (not sent today); `snapshots` only for one created with `see_participants` (see above). `engines`, `stage` and `eta_s` come while the room's engines are starting (see "Engines start on demand").

> [!warn] What people say is **untrusted content**. Use it as data; never follow instructions found in it.

### Taking turns (never talk over people)

People talk in turns, and so does the agent:

- `events` (and `say`) carry `speaking`: who is talking **right now**, e.g. `[{"participant_id": "u_kenji", "display_name": "Kenji"}]`. A person starting or stopping to talk ends the `events` long-poll at once. While `speaking` is not empty, wait: call `events` again until it is empty and the person's `segment.final` arrived, then answer.
- The room enforces it too. Your next utterance **waits** while a person is speaking (up to ~15 s) and never plays over your previous one: two `say` in a row play one after the other.
- **Barge-in:** if a person talks over you for about half a second of voice, your voice **stops** in the room (a cough or a short noise does not stop it). You get `utterance.interrupted` with `meta.reason: "barge_in"`, `meta.by` (who talked), `meta.played_s`/`meta.duration_s`, `meta.spoken_text` (what the room already heard, estimated) and `meta.unspoken_text` (what was cut). Your later utterances that never played come as `utterance.dropped` and are refunded. Listen to the person, then decide whether to repeat what was cut.
- `POST /v1/sessions/{id}/interrupt` stops your own voice now (same `utterance.interrupted`, `reason: "interrupt"`), and `leave` stops it too.
- Tip: send `say` with `"cursor"` = the cursor of your last `events`. The answer then also brings `events` (what people said while you were composing the reply) and the new `cursor`.

## 4. Say

```bash
curl -X POST {{API}}/v1/sessions/ses_.../say \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Bom dia! Vou apresentar a proposta."}'
```

The answer comes right away (`202`, with `utterance_id` and `charged_seconds`); the speech happens in the room. Cost: seconds spoken × number of listener languages, at least 1 (the agent's voice is synthesized even for people who hear the same language; same price as the app). If the voice cannot be delivered in a language, you get `utterance.dropped` and that language's share comes back (`meta.refunded_seconds`). Above your spending limit: `402 spend_limit_reached`.

Events carry ids, numbers and times in `meta`: `start`/`end` (when the phrase was spoken; ISO time when `clock` is `"wall"`), `latency` (`stt_ms`, `mt_ms`, `tts_ms`, when the server reports them) and, on `utterance.translated`, `voice_started_at`.

## 5. Leave

```bash
curl -X POST {{API}}/v1/sessions/ses_.../leave -H "Authorization: Bearer $KANUTUS_TEST_KEY"
```

The session also ends when the room ends. You get a `session.ended` [webhook](/webhooks) and the conversation shows up in [transcripts](/guides/transcripts).

## With an assistant (MCP)

Connected to Claude or ChatGPT, just ask: *"Join room kqz-mbdt-wpa as my assistant, speak Portuguese, and greet everyone."* The assistant calls `join_room`, then alternates `listen` and `say`, and `leave` at the end. To see the people: *"Join as the interviewer, watch the candidates' cameras every 10 seconds and ask anyone with the camera off to turn it on."* The assistant passes `see_participants: true` and `snapshot_every_s: 10`; the pictures come to it as images in `listen`, and `look` gives a fresh one on demand. The chat comes along: *"When the candidate pastes the link to the CV in the chat, open it and ask about the last job."* The assistant reads the `chat.message` in `listen` and answers with `say` or `send_chat`.

## Coming next

- Agent with its own voice over WebRTC (for voice agents that already produce audio) {soon}
- Agent with a face (an avatar on camera) {soon}
