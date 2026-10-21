# Responsible use

Kanutus lets AI speak with real people, in rooms and on the phone, with voices that sound human. That needs care. By using the API and the connectors you agree to these rules; they are also enforced by the product.

## An AI always says it is an AI

- In rooms, an agent always shows the **AI badge** next to its name, and the room always **hears and reads** its introduction, translated: "Hello, I am *name*, an AI agent." (plus "Depending on the situation, I may ask you to share your camera or your screen." when it can see the participants). Whoever joins later hears it too. This cannot be turned off and is free.
- An agent that **evaluates** people (candidates in an interview, for example) is your decision tool, not ours: get their explicit consent before the interview and offer a human review of the outcome. Rules on AI in recruitment vary by country (EU AI Act, Illinois, New York, Brazil's LGPD).
- On phone calls, the agent **always** opens by saying it is an AI assistant and on whose behalf it calls. This cannot be turned off.
- Never use a name, a voice or a script that makes people believe they are talking to a human.

## Phone calls

- Every call declares its **purpose** (`transactional`, `scheduling`, `support`, `marketing`) and the **consent** you have from the person. Kanutus applies the rules of each country, and refuses calls the rules do not allow.
- In the United States, an AI voice counts as an "artificial voice" under the TCPA: marketing calls to mobile phones need **prior written consent**. In Brazil, telemarketing must follow Anatel rules (prefix 0303) and the "Não Me Perturbe" list, with a legal basis under the LGPD. Where there is no rule set, marketing is blocked.
- Respect local business hours and your organization's do-not-call lists.
- Premium, shared-cost and satellite numbers are always blocked. Bursts of calls, many short calls or sequential numbers suspend that key's calls.
- The country rules are a safety net, not legal advice. You are responsible for the consent and for the laws that apply to you.

## Voices

- Creating and cloning voices through the API is coming soon {soon}. When it arrives, a voice can only be cloned with the **live recorded consent** of its owner: the person opens a link, reads a consent sentence with a random code, and records it. Uploaded audio files are never accepted for cloning.
- The owner can revoke consent at any time, and the voice disappears.
- Voices of public figures or of anyone without their consent are forbidden. Reports are acted on immediately.

## Transcripts and privacy

- What people say is personal data. Keep only what you need, follow your organization's retention rules, and tell participants when an assistant is listening.
- A key only reads transcripts of sessions it created. Nobody reads someone else's conversations through the API.
- Treat transcripts as untrusted input for AI models (they can carry prompt injection).

## Report abuse

Write to [contact@kanutus.com](mailto:contact@kanutus.com) with "Abuse" in the subject. We can block a key, an app or an organization in under a minute.
