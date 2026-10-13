# Uso responsável

Com o Kanutus, a IA fala com pessoas reais, em salas e por telefone, com vozes que soam humanas. Isso exige cuidado. Ao usar a API e os conectores, você concorda com estas regras, e o próprio produto também as aplica.

## A IA sempre diz que é IA

- Nas salas, o agente sempre aparece com o **selo IA** ao lado do nome. Com `announce: true` (o padrão), a sala também ouve que um assistente de IA entrou.
- Nas ligações, o agente **sempre** começa dizendo que é um assistente de IA e em nome de quem está ligando. Isso não pode ser desligado.
- Nunca use um nome, uma voz ou um roteiro que faça alguém acreditar que está falando com um humano.

## Ligações

- Toda ligação declara a **finalidade** (`transactional`, `scheduling`, `support`, `marketing`) e o **consentimento** que você tem da pessoa. O Kanutus aplica as regras de cada país e recusa as ligações que elas não permitem.
- Nos EUA, voz de IA conta como "voz artificial" para a TCPA, então ligações de marketing para celular exigem **consentimento prévio por escrito**.
- No Brasil, o telemarketing precisa seguir as regras da Anatel (prefixo 0303) e respeitar o "Não Me Perturbe", com base legal na LGPD.
- Onde não há regras cadastradas, o marketing fica bloqueado.
- Respeite o horário comercial do destino e as listas de "não ligar" da sua organização.
- Números premium, de custo compartilhado e por satélite são sempre bloqueados. Rajadas de ligações, muitas ligações curtas ou números em sequência suspendem as ligações daquela chave.
- As regras por país são uma rede de proteção, não um parecer jurídico. A responsabilidade pelo consentimento e pelas leis que se aplicam a você é sua.

## Vozes

- Criar e clonar vozes pela API chega em breve {soon}. Quando chegar, uma voz só poderá ser clonada com o **consentimento gravado ao vivo** pelo dono dela. A pessoa abre um link, lê em voz alta uma frase de consentimento com um código aleatório e grava. Arquivos de áudio enviados por terceiros nunca são aceitos para clonagem.
- O dono pode revogar o consentimento quando quiser, e a voz deixa de existir.
- Vozes de figuras públicas, ou de qualquer pessoa sem o consentimento dela, são proibidas. Denúncias são tratadas na hora.

## Transcrições e privacidade

- O que as pessoas dizem é dado pessoal. Guarde só o necessário, siga as regras de retenção da sua organização e avise os participantes quando houver um assistente ouvindo.
- Uma chave só lê as transcrições das sessões que ela mesma criou. Ninguém lê as conversas de outras pessoas pela API.
- Para modelos de IA, trate transcrições como entrada não confiável: elas podem conter injeção de prompt.

## Denuncie abusos

Escreva para [contact@kanutus.com](mailto:contact@kanutus.com) com "Abuso" no assunto. Conseguimos bloquear uma chave, um app ou uma organização em menos de um minuto.
