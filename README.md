# Sistema SAC com IA

Chat de atendimento ao cliente que responde com base nos documentos da empresa, com painel administrativo para alimentar a base e conectar uma IA.

## Como rodar

Requer Node.js 18+.

```bash
npm install
npm start
```

- Chat do cliente: http://localhost:3000
- Painel admin: http://localhost:3000/admin (senha inicial: `admin`, troque em **Segurança**)

Variáveis de ambiente opcionais: `PORT`, `ADMIN_PASSWORD` (senha inicial), `ANTHROPIC_API_KEY` (usada se nenhuma chave for salva no painel), `DATA_DIR`.

## Páginas

| Página | O que faz |
|---|---|
| `/` | Chat do cliente: respostas em tempo real, sugestões de perguntas, fontes, avaliação 👍/👎 |
| `/admin` → Documentos | Envio de PDF, Word (.docx), TXT, Markdown, CSV, JSON e HTML; editor de texto para FAQs; ativar/desativar; teste de busca |
| `/admin` → Conexão com IA | Claude (Anthropic), OpenAI, Gemini, Groq, OpenRouter, Ollama local ou qualquer API compatível com OpenAI; botão de testar conexão |
| `/admin` → Personalização | Nome, cor, boas-vindas, sugestões, contato humano, instruções de tom de voz |
| `/admin` → Conversas | Histórico de atendimentos, filtros por avaliação negativa e por falhas |

## Como a IA usa os documentos

- **Base pequena** (até ~300 mil caracteres, com Claude): a base inteira vai junto com cada pergunta, com cache de prompt — melhor qualidade e custo baixo.
- **Base grande** (ou outros provedores): o sistema busca os trechos mais relevantes (BM25) e envia só eles.
- **Sem IA conectada**: o chat responde com o trecho mais relevante encontrado.

O modo pode ser forçado em *Conexão com IA → Opções avançadas*.

## Dados

Tudo fica na pasta `data/` (JSON): `config.json` (inclui a chave de API — não versione), `documents.json`, `conversations.json`.

## Antes de colocar em produção

- Troque a senha do admin.
- Sirva atrás de HTTPS (Nginx, Caddy, etc.).
- Faça backup da pasta `data/`.
