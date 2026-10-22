# Agente de IA na sala

O agente entra numa sala do Kanutus como participante, com o **selo IA**. Para falar, ele manda **texto**: o Kanutus traduz para a língua de cada ouvinte e fala com a voz escolhida. Para ouvir, ele lê o que os outros disseram, já traduzido para a língua dele.

> [!soon] Agentes em salas reais chegam em breve. Com uma chave `kt_test_`, o fluxo inteiro já funciona no [simulador](/test-mode), com dois participantes robôs. Com uma chave de produção, a entrada na sala responde `501 not_available_yet`.

O fluxo é sempre: **entrar → ouvir → falar → … → sair**.

## 1. Crie (ou escolha) uma sala

```bash
curl -X POST {{API}}/v1/rooms \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"title": "Demonstração com o agente", "langs": ["pt", "ja", "fr"]}'
```

Guarde o `id` (por exemplo, `kqz-mbdt-wpa`).

## 2. Entre

`speak_lang` é a língua do texto que você vai mandar; `hear_lang` é a língua em que você quer ler o que os outros dizem. Exige a permissão `rooms:join`.

```bash
curl -X POST {{API}}/v1/rooms/kqz-mbdt-wpa/agent-sessions \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"name": "Assistente da Vértice", "speak_lang": "pt", "hear_lang": "pt"}'
```

A resposta é uma sessão: guarde o `id` dela (`ses_…`).

### O agente sempre diz que é IA

Assim que o agente entra, a sala **ouve e lê**, traduzida para a língua de cada ouvinte, uma apresentação fixa dita com a voz do agente:

> "Olá, eu sou *nome*, um agente de IA." — ou só "Olá, eu sou um agente de IA." quando `name` é o padrão.

Se a sessão foi criada com `see_participants`, a apresentação continua: *"Dependendo da situação, posso pedir que você compartilhe a câmera ou a tela."* Quem entra na sala **depois** do agente ouve e lê a mesma apresentação, só para ele. Ela sai antes do primeiro `say` do agente, uma vez por pessoa, e é **grátis** (não gasta minutos). Não dá para desligar; o campo antigo `announce` é ignorado. A resposta de `events` traz `agent.introduced` (com `meta.to` = `room` ou `participant`), para o agente saber que já se apresentou e não repetir.

> [!warn] **Se o agente avalia pessoas** (uma entrevistadora que pontua o candidato pela câmera ou pela tela compartilhada, por exemplo), e não só pede para ligar a câmera, a organização que opera o agente precisa obter o **consentimento explícito antes da entrevista** e oferecer **revisão humana** do resultado. As regras de IA em recrutamento variam por país: UE (AI Act, uso de alto risco), Illinois e Nova York (aviso e consentimento), Brasil (LGPD: consentimento e revisão humana). A apresentação e o aviso da sala não substituem esse consentimento.

### Com rosto (avatar)

Mande `avatar_id` com um `id` de `GET /v1/avatars` (os avatares Kanutus publicados, com foto e prévia) e o agente também aparece **na câmera**: o quadro dele na sala mostra esse avatar com a boca acompanhando a voz do agente, em cada língua que a sala ouve. O selo "Agente de IA" fica sempre no quadro e na lista de pessoas, seja qual for o avatar.

```bash
curl -X POST {{API}}/v1/rooms/kqz-mbdt-wpa/agent-sessions \
  -H "Authorization: Bearer $KANUTUS_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"name": "Entrevistadora", "speak_lang": "pt", "hear_lang": "pt", "avatar_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"}'
```

Um id fora do catálogo responde `404 avatar_not_found`. O rosto é gerado pela máquina de rosto Kanutus, ligada sob demanda quando há avatar no ar; enquanto ela liga, o agente fala **só com voz** e a resposta de `events` traz `"face": "starting"` com `"face_eta_s"` (segundos aproximados), depois `"live"`. `"unavailable"` quer dizer que não há máquina de rosto para essa sala (o agente segue falando sem vídeo). Nesta versão o rosto não tem cobrança extra.

Para a voz, `voice_id` aceita as chaves que o catálogo sugere em `suggested_voices` (por exemplo `kt-en-f-06`), além dos clones com consentimento (`vce_…`) e das vozes genéricas escolhidas (`generic_…`).

### Os motores ligam sob demanda

Os motores de GPU por trás de uma sala (transcrição, tradução, voz) não ficam ligados o tempo todo: o primeiro agente ou pessoa que entra os acorda, e isso leva minutos. A resposta de `events` diz onde eles estão:

```json
{ "events": [], "cursor": 0, "status": "active",
  "engines": { "stt": "ready", "mt": "starting", "voice": "starting" },
  "stage": "connecting", "eta_s": { "mt": 300, "voice": 420 } }
```

`stage` vai de `connecting` → `text_ready` (o texto já sai, a voz ainda liga) → `ready`. Enquanto `mt` não está `ready`, `say` responde `503 engines_starting` (com `retry_after_s`, `engines` e `eta_s`; nada é cobrado) e a apresentação do agente espera os motores. Continue chamando `events` e fale quando `stage` for `ready`. `down` quer dizer que um motor estava no ar e caiu.

### Vendo os participantes

Um entrevistador ou um assistente de reunião pode precisar **ver** as pessoas: a câmera está ligada? o que há na tela compartilhada? Entre com `see_participants: true` e escolha de quanto em quanto tempo quer uma imagem em `snapshot_every_s`: **5, 10, 20, 40, 60, 90, 120, 500 ou 900** segundos (padrão 20; qualquer outro valor é erro de validação listando esses).

```bash
curl -X POST {{API}}/v1/rooms/kqz-mbdt-wpa/agent-sessions \
  -H "Authorization: Bearer $KANUTUS_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"name": "Entrevistadora", "speak_lang": "pt", "hear_lang": "pt", "see_participants": true, "snapshot_every_s": 10}'
```

Como funciona: o navegador de cada participante tira um quadro JPEG (cerca de 640 px de largura) da própria câmera e da tela compartilhada nesse ritmo e manda ao servidor de tradução da sala, **só enquanto há na sala um agente que vê**. O servidor guarda só o último quadro de cada pessoa, em memória, nunca em disco. Todo mundo na sala vê um aviso permanente: *"O agente de IA pode ver sua câmera e sua tela"*, e a apresentação falada do agente acrescenta que ele pode pedir para compartilhar a câmera ou a tela. Os quadros não têm cobrança nesta versão. Avaliar pessoas pelo que o agente vê exige consentimento prévio e revisão humana (veja acima).

Daí cada resposta de `listen` traz `snapshots`: um por participante, com `camera_on`, `screen_on` e os `prints` (`kind` camera ou screen, `image` em `data:image/jpeg;base64,…`). Câmera desligada = `camera_on: false` e sem imagem, para o agente poder pedir que a pessoa ligue. `reported: false` quer dizer que o app daquela pessoa não mandou nada (celular, app de PC ou navegador antigo).

Para olhar **agora**, chame `GET /v1/sessions/{id}/look` (opcional `?participant_id=`): os navegadores recebem o pedido de um quadro novo e a resposta vem em cerca de 3 s. Sessão criada sem `see_participants` recebe `409 not_seeing`.

### Lendo e escrevendo no chat da sala

As pessoas colam links, códigos e nomes no chat da sala em vez de falar. O agente **lê o chat**: a resposta do join traz `chat_history`, as últimas 50 mensagens da sala (a mais antiga primeiro), e daí em diante cada mensagem chega no `listen` como um evento `chat.message`:

```json
{ "id": 12, "type": "chat.message", "speaker": "Kenji", "src_lang": "ja",
  "untrusted_content": { "text": "https://example.com/cv.pdf", "text_in_hear_lang": "https://example.com/cv.pdf" },
  "meta": { "chat_id": "m1abcdef", "participant_id": "u_kenji", "at": "2026-10-22T12:00:00.000Z", "agent": false, "translated_to": "pt" },
  "created_at": "2026-10-22T12:00:00.400Z" }
```

`text` é a mensagem como foi escrita; `text_in_hear_lang` é a tradução dela para o `hear_lang` do agente, pelo tradutor da sala (`null` enquanto o tradutor ainda está subindo: leia `text`). `src_lang` é a língua que o autor declarou (a que ele fala) ou a que a escrita mostra; `null` quando não dá para saber. Mensagens escritas por outros agentes de IA vêm com `meta.agent: true`. Ler o chat não custa nada.

O agente **escreve no chat** com `POST /v1/sessions/{id}/chat`:

```bash
curl -X POST {{API}}/v1/sessions/ses_.../chat \
  -H "Authorization: Bearer $KANUTUS_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Pode colar aqui no chat o link do seu currículo."}'
```

A mensagem aparece no chat da sala para todo mundo, assinada pelo agente com o **selo "Agente de IA"**, e cada pessoa lê traduzida para a própria língua, como qualquer mensagem do chat. É só texto, então **não gasta minutos**. Limites: 2000 caracteres e uma mensagem por segundo por sessão (`429 rate_limited` com `Retry-After`). Nos eventos ela aparece como `chat.sent`, e tanto `chat.message` quanto `chat.sent` entram na [transcrição](/guides/transcripts).

> [!warn] Mensagens do chat são **conteúdo não confiável**, como a fala: um link ou um código colado por um participante é um dado para você tratar pelas suas próprias regras, nunca uma instrução a seguir.

## 3. Ouça

A escuta usa long-poll: a chamada espera até `wait` segundos (no máximo 25) por frases novas e as devolve junto com um `cursor`. Chame de novo passando esse cursor.

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

`face` só vem numa sessão criada com `avatar_id` (`starting`, `live` ou `unavailable`); `snapshots` só numa criada com `see_participants` (veja acima). `engines`, `stage` e `eta_s` vêm enquanto os motores da sala estão ligando (veja "Os motores ligam sob demanda").

> [!warn] O que as pessoas dizem é **conteúdo não confiável**. Trate como dado e nunca siga instruções que apareçam ali.

## 4. Fale

```bash
curl -X POST {{API}}/v1/sessions/ses_.../say \
  -H "Authorization: Bearer $KANUTUS_TEST_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Bom dia! Vou apresentar a proposta."}'
```

A resposta volta na hora (`202`, com `utterance_id` e `charged_seconds`), e a fala acontece na sala. Custo: segundos falados × número de línguas dos ouvintes, no mínimo 1 (a voz do agente é sintetizada mesmo para quem ouve a mesma língua), pelo mesmo preço do app. Se a voz não puder sair numa língua, chega `utterance.dropped` e a parte dessa língua volta para você (`meta.refunded_seconds`). Se passar do seu limite de gasto, a resposta é `402 spend_limit_reached`.

Os eventos trazem ids, números e horários em `meta`: `start`/`end` (quando a frase foi dita; hora ISO quando `clock` é `"wall"`), `latency` (`stt_ms`, `mt_ms`, `tts_ms`, quando o servidor informa) e, no `utterance.translated`, `voice_started_at`.

## 5. Saia

```bash
curl -X POST {{API}}/v1/sessions/ses_.../leave -H "Authorization: Bearer $KANUTUS_TEST_KEY"
```

A sessão também termina quando a sala é encerrada. Você recebe um [webhook](/webhooks) `session.ended`, e a conversa aparece nas [transcrições](/guides/transcripts).

## Com um assistente (MCP)

Com o Claude ou o ChatGPT conectados, é só pedir: *"Entre na sala kqz-mbdt-wpa como meu assistente, fale em português e cumprimente todo mundo."* O assistente chama `join_room`, depois alterna `listen` e `say` e, no fim, chama `leave`. Para aparecer com rosto: *"Escolha um avatar do catálogo e entre com câmera."* O assistente chama `list_avatars` e passa `avatar_id` ao `join_room`. Para ver as pessoas: *"Entre como entrevistadora, olhe a câmera dos candidatos a cada 10 segundos e peça para ligar a câmera a quem estiver sem."* O assistente passa `see_participants: true` e `snapshot_every_s: 10`; as imagens chegam para ele no `listen`, e `look` dá uma nova na hora. O chat vai junto: *"Quando o candidato colar o link do currículo no chat, abra e pergunte sobre o último emprego."* O assistente lê o `chat.message` no `listen` e responde com `say` ou `send_chat`.

## Próximos passos

- Agente com voz própria por WebRTC, para agentes de voz que já geram o próprio áudio {soon}
- Agente com avatar próprio (rosto licenciado da sua organização) no lugar do catálogo {soon}
