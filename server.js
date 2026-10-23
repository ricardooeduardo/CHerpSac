import express from "express";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as store from "./lib/store.js";
import { search, indexStats } from "./lib/search.js";
import { streamAnswer, testConnection, isConfigured, AIError } from "./lib/ai.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const FULL_CONTEXT_CHAR_LIMIT = 300_000; // ~75 mil tokens: abaixo disso a base inteira vai para a IA
const HISTORY_LIMIT = 20; // mensagens anteriores enviadas à IA

const app = express();
app.use(express.json({ limit: "40mb" }));
app.use(express.static(path.join(here, "public"), { extensions: ["html"] }));

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const clientIp = (req) => req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "";

const rateBuckets = new Map();
function rateLimited(ip, max = 20, windowMs = 60_000) {
  const now = Date.now();
  const hits = (rateBuckets.get(ip) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  rateBuckets.set(ip, hits);
  return hits.length > max;
}

function publicBranding() {
  const { branding, ai } = store.getConfig();
  return { ...branding, instructions: undefined, aiConfigured: isConfigured(ai) };
}

function activeDocs() {
  return store.listDocuments().filter((d) => d.enabled);
}

function useFullContext(ai) {
  const total = activeDocs().reduce((s, d) => s + d.text.length, 0);
  if (ai.contextMode === "full") return true;
  if (ai.contextMode === "search") return false;
  return ai.provider === "anthropic" && total <= FULL_CONTEXT_CHAR_LIMIT;
}

const escapeAttr = (s) => String(s).replace(/"/g, "'");

function buildSystemPrompt(fullContext) {
  const { branding } = store.getConfig();
  const contact = branding.contact ? ` (${branding.contact})` : "";
  let prompt = `Você é ${branding.assistantName}, assistente virtual do SAC (Serviço de Atendimento ao Cliente) da empresa ${branding.companyName}.

Seu trabalho é tirar dúvidas de clientes usando as informações oficiais da empresa${fullContext ? " que estão em <base_de_conhecimento>" : " que acompanham cada pergunta em <trechos_relevantes>"}.

Como atender:
- Responda com base nas informações oficiais. Quando a resposta não estiver nelas, diga isso com honestidade e oriente o cliente a falar com um atendente humano${contact}. Nunca invente preços, prazos, políticas, links ou dados.
- Interprete a intenção do cliente mesmo com erros de digitação, gírias ou perguntas vagas. Se a pergunta for ambígua, peça um esclarecimento curto.
- Seja cordial, empático e objetivo, como um bom atendente. Prefira respostas curtas; use listas ou passo a passo quando ajudar.
- Fale naturalmente em nome da empresa, sem citar "documentos", "trechos" ou "base de conhecimento".
- Responda no idioma em que o cliente escreveu.
- Se o assunto não tiver relação com a empresa, redirecione gentilmente para o atendimento.`;

  if (branding.instructions?.trim()) {
    prompt += `\n\nInstruções adicionais da empresa:\n${branding.instructions.trim()}`;
  }
  if (fullContext) {
    const docs = activeDocs()
      .map((d) => `<documento titulo="${escapeAttr(d.title)}">\n${d.text}\n</documento>`)
      .join("\n\n");
    prompt += `\n\n<base_de_conhecimento>\n${docs || "(nenhum documento cadastrado ainda)"}\n</base_de_conhecimento>`;
  }
  return prompt;
}

function formatContext(results) {
  if (!results.length) return "<trechos_relevantes>\n(nenhum trecho encontrado para esta pergunta)\n</trechos_relevantes>";
  const body = results.map((r) => `<trecho documento="${escapeAttr(r.title)}">\n${r.text}\n</trecho>`).join("\n\n");
  return `<trechos_relevantes>\n${body}\n</trechos_relevantes>`;
}

function toApiMessages(conv) {
  // Só texto: o histórico é montado sempre do mesmo jeito (append-only), o que favorece o cache.
  const recent = conv.messages.slice(-HISTORY_LIMIT);
  while (recent.length && recent[0].role !== "user") recent.shift();
  return recent.map((m) => ({
    role: m.role,
    content: m.role === "user" && m.context ? `${m.context}\n\nMensagem do cliente:\n${m.content}` : m.content || "…",
  }));
}

// ---------------------------------------------------------------------------
// API pública (chat)
// ---------------------------------------------------------------------------
app.get("/api/public/config", (req, res) => res.json(publicBranding()));

app.post("/api/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim().slice(0, 4000);
  if (!message) return res.status(400).json({ error: "Mensagem vazia." });
  const ip = clientIp(req);
  if (rateLimited(ip)) return res.status(429).json({ error: "Muitas mensagens em pouco tempo. Aguarde um instante." });

  const { ai, branding } = store.getConfig();
  let conv = req.body?.conversationId && store.getConversation(req.body.conversationId);
  if (!conv) conv = store.createConversation({ ip });

  const fullContext = useFullContext(ai);
  const results = search(store.listDocuments(), message, fullContext ? 3 : 6);
  const top = results[0]?.score || 0;
  const sources = [...new Set(results.filter((r) => r.score >= top * 0.5).map((r) => r.title))].slice(0, 3);

  store.appendMessage(conv, { role: "user", content: message, context: fullContext ? undefined : formatContext(results) });

  res.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  const controller = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) controller.abort();
  });

  store.appendMessage(conv, { role: "assistant", content: "", sources });
  const index = conv.messages.length - 1;
  const saved = conv.messages[index];
  send({ type: "meta", conversationId: conv.id, index, sources: branding.showSources === false ? [] : sources });

  try {
    if (!isConfigured(ai)) {
      // Sem IA conectada: responde com o trecho mais relevante encontrado.
      const best = results[0];
      saved.content = best
        ? `Encontrei esta informação que pode ajudar:\n\n${best.text.slice(0, 900)}${best.text.length > 900 ? "…" : ""}`
        : branding.fallbackMessage;
      saved.noAi = true;
      send({ type: "delta", text: saved.content });
    } else {
      const result = await streamAnswer(ai, {
        system: buildSystemPrompt(fullContext),
        messages: toApiMessages({ messages: conv.messages.slice(0, -1) }),
        signal: controller.signal,
        onText: (text) => {
          saved.content += text;
          send({ type: "delta", text });
        },
      });
      if (result.refused || !saved.content.trim()) {
        const extra = (saved.content ? "\n\n" : "") + branding.fallbackMessage;
        saved.content += extra;
        send({ type: "delta", text: extra });
      }
    }
    store.touchConversation();
    send({ type: "done" });
  } catch (err) {
    if (err.name === "AbortError") return;
    console.error("[chat]", err);
    saved.error = err.message;
    saved.content = saved.content || branding.fallbackMessage;
    store.touchConversation();
    send({ type: "error", message: "Não consegui responder agora. Tente novamente em instantes." });
  } finally {
    res.end();
  }
});

app.post("/api/chat/feedback", (req, res) => {
  const { conversationId, index, value } = req.body || {};
  const conv = store.getConversation(conversationId);
  const msg = conv?.messages[index];
  if (!msg || msg.role !== "assistant") return res.status(404).json({ error: "Mensagem não encontrada." });
  msg.feedback = value === "up" || value === "down" ? value : undefined;
  store.touchConversation();
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Autenticação do admin
// ---------------------------------------------------------------------------
const sessions = new Map(); // token -> expiração
const SESSION_MS = 12 * 60 * 60 * 1000;

app.post("/api/admin/login", (req, res) => {
  if (rateLimited("login:" + clientIp(req), 10)) return res.status(429).json({ error: "Muitas tentativas. Aguarde um minuto." });
  if (!store.checkPassword(String(req.body?.password || ""))) return res.status(401).json({ error: "Senha incorreta." });
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_MS);
  res.json({ token, defaultPassword: store.usingDefaultPassword() });
});

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const exp = sessions.get(token);
  if (!exp || exp < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: "Sessão expirada. Entre novamente." });
  }
  next();
}
app.use("/api/admin", requireAdmin);

app.post("/api/admin/logout", (req, res) => {
  sessions.delete((req.headers.authorization || "").replace(/^Bearer\s+/i, ""));
  res.json({ ok: true });
});

app.post("/api/admin/password", (req, res) => {
  const { current, next: newPassword } = req.body || {};
  if (!store.checkPassword(String(current || ""))) return res.status(400).json({ error: "Senha atual incorreta." });
  if (!newPassword || String(newPassword).length < 6) return res.status(400).json({ error: "A nova senha precisa ter pelo menos 6 caracteres." });
  store.setPassword(String(newPassword));
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Admin: visão geral
// ---------------------------------------------------------------------------
app.get("/api/admin/stats", (req, res) => {
  const docs = store.listDocuments();
  const convs = store.listConversations();
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  let up = 0, down = 0, last24h = 0, unanswered = 0;
  for (const c of convs) {
    for (const m of c.messages) {
      if (m.feedback === "up") up++;
      if (m.feedback === "down") down++;
      if (m.role === "user" && new Date(m.at).getTime() > dayAgo) last24h++;
      if (m.role === "assistant" && (m.error || m.noAi)) unanswered++;
    }
  }
  const { ai } = store.getConfig();
  res.json({
    documents: docs.length,
    activeDocuments: docs.filter((d) => d.enabled).length,
    totalChars: docs.filter((d) => d.enabled).reduce((s, d) => s + d.text.length, 0),
    chunks: indexStats(docs).chunks,
    conversations: convs.length,
    messagesLast24h: last24h,
    feedbackUp: up,
    feedbackDown: down,
    unanswered,
    aiConfigured: isConfigured(ai),
    provider: ai.preset || ai.provider,
    model: ai.model,
    contextMode: useFullContext(ai) ? "full" : "search",
    defaultPassword: store.usingDefaultPassword(),
  });
});

// ---------------------------------------------------------------------------
// Admin: documentos
// ---------------------------------------------------------------------------
const docSummary = ({ text, ...rest }) => ({ ...rest, chars: text.length, preview: text.slice(0, 200) });

app.get("/api/admin/documents", (req, res) => res.json(store.listDocuments().map(docSummary).reverse()));

app.get("/api/admin/documents/:id", (req, res) => {
  const doc = store.getDocument(req.params.id);
  if (!doc) return res.status(404).json({ error: "Documento não encontrado." });
  res.json(doc);
});

app.post("/api/admin/documents", (req, res) => {
  const { title, filename, type, text } = req.body || {};
  const clean = String(text || "").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!clean) return res.status(400).json({ error: "O documento não tem texto." });
  res.json(docSummary(store.addDocument({ title: String(title || "").trim(), filename, type, text: clean })));
});

app.put("/api/admin/documents/:id", (req, res) => {
  const patch = {};
  if (req.body.title !== undefined) patch.title = String(req.body.title).trim() || "Documento sem título";
  if (req.body.text !== undefined) patch.text = String(req.body.text).trim();
  if (req.body.enabled !== undefined) patch.enabled = Boolean(req.body.enabled);
  const doc = store.updateDocument(req.params.id, patch);
  if (!doc) return res.status(404).json({ error: "Documento não encontrado." });
  res.json(docSummary(doc));
});

app.delete("/api/admin/documents/:id", (req, res) => {
  if (!store.deleteDocument(req.params.id)) return res.status(404).json({ error: "Documento não encontrado." });
  res.json({ ok: true });
});

app.post("/api/admin/search-test", (req, res) => {
  res.json(search(store.listDocuments(), String(req.body?.query || ""), 5));
});

// ---------------------------------------------------------------------------
// Admin: conexão com IA
// ---------------------------------------------------------------------------
function maskedAi() {
  const { apiKey, ...ai } = store.getConfig().ai;
  return {
    ...ai,
    hasKey: Boolean(apiKey),
    keyPreview: apiKey ? `${apiKey.slice(0, 7)}…${apiKey.slice(-4)}` : "",
    envKey: !apiKey && ai.provider === "anthropic" && Boolean(process.env.ANTHROPIC_API_KEY),
  };
}

function aiFromBody(body) {
  const current = store.getConfig().ai;
  const next = {};
  for (const key of ["provider", "preset", "baseUrl", "model", "effort", "contextMode"]) {
    if (body[key] !== undefined) next[key] = String(body[key]).trim();
  }
  if (body.maxTokens !== undefined) next.maxTokens = Math.max(256, Math.min(128000, Number(body.maxTokens) || 16000));
  if (body.clearKey) next.apiKey = "";
  else if (body.apiKey) next.apiKey = String(body.apiKey).trim();
  return { current, next };
}

app.get("/api/admin/ai", (req, res) => res.json(maskedAi()));

app.put("/api/admin/ai", (req, res) => {
  const { next } = aiFromBody(req.body || {});
  store.updateConfig("ai", next);
  res.json(maskedAi());
});

app.post("/api/admin/ai/test", async (req, res) => {
  const { current, next } = aiFromBody(req.body || {});
  const candidate = { ...current, ...next };
  if (!isConfigured(candidate)) return res.status(400).json({ ok: false, error: "Preencha a chave de API / URL e o modelo." });
  try {
    res.json(await testConnection(candidate));
  } catch (err) {
    res.status(200).json({ ok: false, error: err instanceof AIError ? err.message : String(err.message || err) });
  }
});

// ---------------------------------------------------------------------------
// Admin: personalização
// ---------------------------------------------------------------------------
app.get("/api/admin/branding", (req, res) => res.json(store.getConfig().branding));

app.put("/api/admin/branding", (req, res) => {
  const b = req.body || {};
  const patch = {};
  for (const key of ["companyName", "assistantName", "welcome", "primaryColor", "instructions", "contact", "fallbackMessage"]) {
    if (b[key] !== undefined) patch[key] = String(b[key]).slice(0, 8000);
  }
  if (Array.isArray(b.suggestions)) patch.suggestions = b.suggestions.map((s) => String(s).trim()).filter(Boolean).slice(0, 6);
  if (b.showSources !== undefined) patch.showSources = Boolean(b.showSources);
  res.json(store.updateConfig("branding", patch));
});

// ---------------------------------------------------------------------------
// Admin: conversas
// ---------------------------------------------------------------------------
app.get("/api/admin/conversations", (req, res) => {
  const list = store
    .listConversations()
    .filter((c) => c.messages.length)
    .map((c) => ({
      id: c.id,
      startedAt: c.startedAt,
      updatedAt: c.updatedAt,
      count: c.messages.length,
      preview: c.messages.find((m) => m.role === "user")?.content.slice(0, 140) || "",
      up: c.messages.filter((m) => m.feedback === "up").length,
      down: c.messages.filter((m) => m.feedback === "down").length,
      problems: c.messages.filter((m) => m.error || m.noAi).length,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json(list);
});

app.get("/api/admin/conversations/:id", (req, res) => {
  const conv = store.getConversation(req.params.id);
  if (!conv) return res.status(404).json({ error: "Conversa não encontrada." });
  res.json({ ...conv, messages: conv.messages.map(({ context, ...m }) => m) });
});

app.delete("/api/admin/conversations/:id", (req, res) => {
  if (!store.deleteConversation(req.params.id)) return res.status(404).json({ error: "Conversa não encontrada." });
  res.json({ ok: true });
});

app.get("/admin", (req, res) => res.sendFile(path.join(here, "public", "admin.html")));

app.listen(PORT, () => {
  console.log(`\n  SAC rodando:`);
  console.log(`  • Chat do cliente:  http://localhost:${PORT}`);
  console.log(`  • Painel admin:     http://localhost:${PORT}/admin`);
  if (store.usingDefaultPassword()) console.log(`  • Senha inicial do admin: "${process.env.ADMIN_PASSWORD || "admin"}" (troque em Segurança)\n`);
});
