// Persistência simples em arquivos JSON na pasta data/.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(here, "..", "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

const DEFAULT_CONFIG = {
  ai: {
    provider: "anthropic", // "anthropic" | "openai" (qualquer API compatível com OpenAI)
    preset: "anthropic",
    apiKey: "",
    baseUrl: "",
    model: "claude-opus-5-5",
    effort: "low",
    maxTokens: 16000,
    contextMode: "auto", // "auto" | "full" | "search"
  },
  branding: {
    companyName: "Minha Empresa",
    assistantName: "Assistente Virtual",
    welcome: "Olá! 👋 Sou o assistente virtual. Como posso ajudar você hoje?",
    primaryColor: "#2563eb",
    suggestions: ["Quais são os horários de atendimento?", "Como faço para trocar um produto?", "Quais formas de pagamento vocês aceitam?"],
    instructions: "",
    contact: "",
    showSources: true,
    fallbackMessage:
      "Desculpe, não encontrei essa informação na nossa base. Você pode falar com um atendente humano pelos nossos canais oficiais.",
  },
  admin: { salt: "", passwordHash: "" },
};

function file(name) {
  return path.join(DATA_DIR, name);
}

function readJson(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file(name), "utf8"));
  } catch {
    return structuredClone(fallback);
  }
}

function writeJson(name, value) {
  const tmp = file(name + ".tmp");
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file(name));
}

export const newId = () => crypto.randomUUID();

// ---------- Configuração ----------
let config = readJson("config.json", DEFAULT_CONFIG);
config = {
  ai: { ...DEFAULT_CONFIG.ai, ...config.ai },
  branding: { ...DEFAULT_CONFIG.branding, ...config.branding },
  admin: { ...DEFAULT_CONFIG.admin, ...config.admin },
};

export function getConfig() {
  return config;
}

export function updateConfig(section, patch) {
  config[section] = { ...config[section], ...patch };
  writeJson("config.json", config);
  return config[section];
}

// ---------- Senha do admin ----------
function hash(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function usingDefaultPassword() {
  return !config.admin.passwordHash;
}

export function checkPassword(password) {
  if (usingDefaultPassword()) return password === (process.env.ADMIN_PASSWORD || "admin");
  const expected = Buffer.from(config.admin.passwordHash, "hex");
  const got = Buffer.from(hash(String(password), config.admin.salt), "hex");
  return expected.length === got.length && crypto.timingSafeEqual(expected, got);
}

export function setPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  updateConfig("admin", { salt, passwordHash: hash(password, salt) });
}

// ---------- Documentos ----------
let documents = readJson("documents.json", []);

export function listDocuments() {
  return documents;
}

export function getDocument(id) {
  return documents.find((d) => d.id === id);
}

export function addDocument({ title, filename, type, text }) {
  const doc = {
    id: newId(),
    title: title || filename || "Documento sem título",
    filename: filename || "",
    type: type || "texto",
    text,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  documents.push(doc);
  writeJson("documents.json", documents);
  return doc;
}

export function updateDocument(id, patch) {
  const doc = getDocument(id);
  if (!doc) return null;
  for (const key of ["title", "text", "enabled"]) {
    if (patch[key] !== undefined) doc[key] = patch[key];
  }
  doc.updatedAt = new Date().toISOString();
  writeJson("documents.json", documents);
  return doc;
}

export function deleteDocument(id) {
  const before = documents.length;
  documents = documents.filter((d) => d.id !== id);
  writeJson("documents.json", documents);
  return documents.length < before;
}

// ---------- Conversas ----------
let conversations = readJson("conversations.json", []);
let saveTimer = null;

function saveConversations() {
  // Agrupa gravações para não escrever o arquivo a cada token.
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => writeJson("conversations.json", conversations), 300);
}

export function listConversations() {
  return conversations;
}

export function getConversation(id) {
  return conversations.find((c) => c.id === id);
}

export function createConversation(meta = {}) {
  const conv = {
    id: newId(),
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ip: meta.ip || "",
    messages: [],
  };
  conversations.push(conv);
  saveConversations();
  return conv;
}

export function appendMessage(conv, message) {
  conv.messages.push({ ...message, at: new Date().toISOString() });
  conv.updatedAt = new Date().toISOString();
  saveConversations();
}

export function touchConversation() {
  saveConversations();
}

export function deleteConversation(id) {
  const before = conversations.length;
  conversations = conversations.filter((c) => c.id !== id);
  saveConversations();
  return conversations.length < before;
}
