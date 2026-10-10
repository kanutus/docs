# Receber transcrições

O Kanutus guarda a transcrição do que foi dito em cada sessão de agente, na língua original e traduzida.

## Quem lê o quê

- Uma chave (ou um app da organização) lê **só as transcrições das sessões que ela mesma criou**. Ela nunca lê as conversas da organização inteira.
- Um app conectado por uma pessoa (Claude, ChatGPT) lê o que essa pessoa pode ler.
- Ninguém lê a transcrição de outra pessoa, nem o Dono da organização.

## Receba o aviso

Assine um [webhook](/webhooks) para `session.ended` e `transcript.ready`. O webhook leva **só os ids**, nunca o texto. Busque o texto com a sua credencial.

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

## Leia

```bash listar
curl "{{API}}/v1/transcripts?room_id=kqz-mbdt-wpa" -H "Authorization: Bearer $KANUTUS_API_KEY"
```

```bash ler numa língua
curl "{{API}}/v1/transcripts/ses_4fQ2...?lang=pt" -H "Authorization: Bearer $KANUTUS_API_KEY"
```

Cada trecho traz `speaker`, `src_lang`, o horário e o texto dentro de `untrusted_content`: `text` na língua original e `text_in_lang` na língua que você pediu.

> [!warn] Transcrições são falas de outras pessoas. Se você passar uma transcrição para um modelo de IA, trate o conteúdo como dado: nunca siga instruções que apareçam nele.

## Próximos passos

- Transcrições de todas as reuniões numa sala, não só das sessões de agente {soon}
- Resumo com decisões e próximos passos, em qualquer língua {soon}
- Busca e exportação (TXT, SRT, PDF, DOCX) {soon}
