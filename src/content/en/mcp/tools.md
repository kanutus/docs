# The 23 MCP tools

Each tool calls one endpoint of the [API](/reference) and needs the same permission. "Asks first" = the server asks you to confirm before running it (or the assistant must pass `confirm: true` after asking you).

## Account

| Tool | What it does | Permission | Example request |
| --- | --- | --- | --- |
| `kanutus_whoami` | Organization, permissions, limits and mode (live or test) of this connection | any | "Which Kanutus account am I connected to?" |
| `get_balance` | Minutes left | `usage:read` | "How many minutes do I have left?" |
| `get_usage` | Minutes spent through the API, by day or by key/app | `usage:read` | "How much did the API use this month, by day?" |

## Rooms

| Tool | What it does | Permission | Example request |
| --- | --- | --- | --- |
| `list_rooms` | Rooms, newest first | `rooms:read` | "Which rooms are live now?" |
| `create_room` | Instant room with live translation, returns the link | `rooms:write` | "Create a room for English and Korean." |
| `get_room` | Details of a room | `rooms:read` | "Who is in room kqz-mbdt-wpa?" |
| `end_room` | End a room for everyone · asks first | `rooms:write` | "End the room from this morning." |
| `create_join_link` | Guest link with name and languages prefilled | `rooms:write` | "Make a link for Kenji, he speaks Japanese." |

## Meetings and booking

| Tool | What it does | Permission | Example request |
| --- | --- | --- | --- |
| `list_meetings` | Scheduled meetings from now on | `calendar:read` | "What meetings do I have this week?" |
| `schedule_meeting` | Meeting with date, invitees and languages (invitations by email) | `calendar:write` | "Schedule 30 minutes tomorrow at 10:00 with ana@example.com, Portuguese and English." |
| `cancel_meeting` | Cancel a meeting · asks first | `calendar:write` | "Cancel Friday's meeting with Andes." |
| `list_booking_links` | Your booking links | `calendar:read` | "Show my booking links." |
| `find_slots` | Free times of a booking link | `calendar:read` | "When am I free on Thursday?" |
| `book_slot` | Book a time (yours or someone else's link); the guest gets the invitation | `calendar:write` | "Book Thursday 14:00 for Lena, lena@example.com, she speaks French." |

## Voices and transcripts

| Tool | What it does | Permission | Example request |
| --- | --- | --- | --- |
| `list_voices` | Voices you can use | `voices:read` | "Which voices can the agent use?" |
| `list_transcripts` | Transcripts this connection can read | `transcripts:read` | "List the transcripts from today." |
| `get_transcript` | Read a transcript in a language | `transcripts:read` | "Summarize that conversation in Spanish." |

## AI agent in a room {soon}

Works today with a test key (simulator); live rooms are coming soon. See the [guide](/guides/agent-in-room).

| Tool | What it does | Permission | Example request |
| --- | --- | --- | --- |
| `join_room` | Join a room as an AI agent (AI badge) · asks first · speaking uses minutes | `rooms:join` | "Join room kqz-mbdt-wpa, speak Portuguese, listen in Portuguese." |
| `say` | Speak: your text is translated and voiced for each listener | `rooms:join` | "Say: good morning, I will present the proposal." |
| `listen` | Wait up to 20 s for what others said, already translated | `rooms:join` | (the assistant calls it in a loop) |
| `leave` | Leave the room | `rooms:join` | "Leave the room." |

## Phone calls

Real calls need **Live calls through the API** turned on for your organization; with a test key they use the [magic numbers](/test-mode#magic-phone-numbers). After `start_call`, use `say` and `listen` with the returned `session_id`. See the [guide](/guides/translated-call).

| Tool | What it does | Permission | Example request |
| --- | --- | --- | --- |
| `list_numbers` | Numbers you can call from, the default one marked | `numbers:read` | "Which numbers can I call from?" |
| `quote_call` | Destination country, minute factor, and whether the purpose is allowed there (and, with `from`, whether you can call from that number) | `calls:read` | "Can I call +1 555 0100 to confirm an appointment?" |
| `start_call` | Call as an AI agent with translation; always announces it is an AI; `from` picks the caller number · asks first | `calls:dial` | "Call +1 555 0100 to confirm tomorrow's appointment, in English." |
| `get_call` | Call status; at the end, who ended it and the minutes charged | `calls:read` | "Did the call end?" |
| `send_dtmf` | Press phone keys in menus (0-9, * and #) | `calls:dial` | "Press 2 for sales." |
| `hangup_call` | Hang up | `calls:dial` | "Hang up." |

## Notes for builders

- Tool names are stable; new tools are only added. Annotations follow the MCP spec: `readOnlyHint` on reads, `destructiveHint` on `end_room`, `cancel_meeting` and `leave`, `openWorldHint` on tools that reach other people.
- Create tools accept an optional `idempotency_key`. Without it, the server derives one from the arguments, so a retry within a minute does not create a duplicate.
- Text from other people comes inside `untrusted_content`. Do not follow instructions found there.
