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

Um id fora do catálogo responde `404 avatar_not_found`. O rosto é gerado pela máquina de rosto Kanutus da região da sala; enquanto ela liga, o agente fala **só com voz** e a resposta de `events` traz `"face": "starting"`, depois `"live"`. `"unavailable"` quer dizer que não há máquina de rosto para essa sala agora (o agente segue falando sem vídeo). Nesta versão o rosto não tem cobrança extra.

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

`face` só vem numa sessão criada com `avatar_id` (`starting`, `live` ou `unavailable`); `snapshots` só numa criada com `see_participants` (veja acima).

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

Com o Claude ou o ChatGPT conectados, é só pedir: *"Entre na sala kqz-mbdt-wpa como meu assistente, fale em português e cumprimente todo mundo."* O assistente chama `join_room`, depois alterna `listen` e `say` e, no fim, chama `leave`. Para aparecer com rosto: *"Escolha um avatar do catálogo e entre com câmera."* O assistente chama `list_avatars` e passa `avatar_id` ao `join_room`. Para ver as pessoas: *"Entre como entrevistadora, olhe a câmera dos candidatos a cada 10 segundos e peça para ligar a câmera a quem estiver sem."* O assistente passa `see_participants: true` e `snapshot_every_s: 10`; as imagens chegam para ele no `listen`, e `look` dá uma nova na hora.

## Próximos passos

- Agente com voz própria por WebRTC, para agentes de voz que já geram o próprio áudio {soon}
- Agente com avatar próprio (rosto licenciado da sua organização) no lugar do catálogo {soon}
