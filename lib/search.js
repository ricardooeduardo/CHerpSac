// Busca na base de conhecimento: divide documentos em trechos e ranqueia com BM25.
const STOPWORDS = new Set(
  (
    "a o e é de do da dos das em no na nos nas um uma uns umas por para pra com sem que se ao aos " +
    "à às ou mas como mais menos muito muita seu sua seus suas meu minha meus minhas eu voce vc " +
    "voces nos ele ela eles elas isso isto esse essa este esta aquele aquela ser estar ter tem " +
    "ha foi sao era qual quais quando onde porque pois tambem ja nao sim ola oi bom boa dia tarde noite " +
    "obrigado obrigada favor gostaria queria quero preciso posso pode the of and to is in for"
  ).split(/\s+/)
);

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Radical simples por truncamento (funciona bem para português sem dependências).
function stem(token) {
  let t = token;
  if (t.length > 4 && t.endsWith("s")) t = t.slice(0, -1);
  return t.length > 6 ? t.slice(0, 6) : t;
}

export function tokenize(text) {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

// Divide o texto em trechos de ~1200 caracteres respeitando parágrafos.
export function chunkText(text, size = 1200, overlap = 200) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  let current = "";
  for (const p of paragraphs) {
    if (current && current.length + p.length + 2 > size) {
      chunks.push(current);
      current = current.slice(-overlap) + "\n\n" + p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
    while (current.length > size * 1.5) {
      chunks.push(current.slice(0, size));
      current = current.slice(size - overlap);
    }
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}

let index = { chunks: [], df: new Map(), avgLen: 0, signature: "" };

export function buildIndex(documents) {
  const active = documents.filter((d) => d.enabled);
  const signature = active.map((d) => d.id + d.updatedAt).join("|");
  if (signature === index.signature) return index;

  const chunks = [];
  for (const doc of active) {
    for (const [i, text] of chunkText(doc.text).entries()) {
      const tokens = tokenize(doc.title + " " + text);
      const tf = new Map();
      for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
      chunks.push({ docId: doc.id, title: doc.title, part: i + 1, text, tf, len: tokens.length });
    }
  }
  const df = new Map();
  for (const c of chunks) for (const t of c.tf.keys()) df.set(t, (df.get(t) || 0) + 1);
  const avgLen = chunks.reduce((s, c) => s + c.len, 0) / (chunks.length || 1);
  index = { chunks, df, avgLen, signature };
  return index;
}

export function search(documents, query, limit = 6) {
  const { chunks, df, avgLen } = buildIndex(documents);
  const terms = [...new Set(tokenize(query))];
  if (!terms.length || !chunks.length) return [];
  const N = chunks.length;
  const k1 = 1.4;
  const b = 0.75;
  const scored = chunks.map((c) => {
    let score = 0;
    for (const t of terms) {
      const f = c.tf.get(t);
      if (!f) continue;
      const n = df.get(t) || 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * c.len) / avgLen)));
    }
    return { ...c, score };
  });
  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ docId, title, part, text, score }) => ({ docId, title, part, text, score: Number(score.toFixed(3)) }));
}

export function indexStats(documents) {
  const { chunks } = buildIndex(documents);
  return { chunks: chunks.length };
}
