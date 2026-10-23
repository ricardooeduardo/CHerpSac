// Conexão com o provedor de IA: Claude (SDK oficial da Anthropic) ou qualquer API compatível com OpenAI.
import Anthropic from "@anthropic-ai/sdk";

// Modelos Claude que aceitam o fallback automático no servidor em caso de recusa.
const SERVER_FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-opus-5", "claude-fable-5-1", "claude-sonnet-5-5"]);

export class AIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function isConfigured(ai) {
  if (!ai?.model) return false;
  if (ai.provider === "anthropic") return Boolean(ai.apiKey || process.env.ANTHROPIC_API_KEY);
  return Boolean(ai.baseUrl);
}

function friendlyAnthropicError(err) {
  if (err instanceof Anthropic.AuthenticationError) return new AIError("Chave de API inválida ou revogada.", 401);
  if (err instanceof Anthropic.PermissionDeniedError) return new AIError("A chave não tem permissão para usar este modelo.", 403);
  if (err instanceof Anthropic.NotFoundError) return new AIError("Modelo não encontrado. Verifique o nome do modelo.", 404);
  if (err instanceof Anthropic.RateLimitError) return new AIError("Limite de uso da IA atingido. Tente novamente em instantes.", 429);
  if (err instanceof Anthropic.BadRequestError) return new AIError("Requisição recusada pela IA: " + (err.error?.error?.message || err.message), 400);
  if (err instanceof Anthropic.APIConnectionError) return new AIError("Não foi possível conectar à API da Anthropic.", 502);
  if (err instanceof Anthropic.APIError) return new AIError("Erro do provedor de IA: " + err.message, err.status || 500);
  if (/authentication|apiKey|api key/i.test(err?.message || "")) return new AIError("Chave de API não configurada.", 401);
  return err;
}

async function streamAnthropic(ai, { system, messages, onText, signal }) {
  const client = new Anthropic({
    ...(ai.apiKey ? { apiKey: ai.apiKey } : {}),
    ...(ai.baseUrl ? { baseURL: ai.baseUrl } : {}),
  });
  const params = {
    model: ai.model,
    max_tokens: Number(ai.maxTokens) || 16000,
    // O bloco de sistema (instruções + base de conhecimento) é estável, então fica em cache.
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages,
    output_config: { effort: ai.effort || "low" },
  };
  if (SERVER_FALLBACK_MODELS.has(ai.model) && !ai.baseUrl) {
    params.betas = ["server-side-fallback-2026-07-01"];
    params.fallbacks = "default";
  }

  try {
    const stream = client.beta.messages.stream(params, { signal });
    let text = "";
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        text += event.delta.text;
        onText?.(event.delta.text);
      }
    }
    const final = await stream.finalMessage();
    return {
      text,
      refused: final.stop_reason === "refusal",
      truncated: final.stop_reason === "max_tokens",
      model: final.model,
      usage: final.usage,
    };
  } catch (err) {
    throw friendlyAnthropicError(err);
  }
}

async function streamOpenAICompatible(ai, { system, messages, onText, signal }) {
  const url = ai.baseUrl.replace(/\/+$/, "") + "/chat/completions";
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      signal,
      headers: {
        "content-type": "application/json",
        ...(ai.apiKey ? { authorization: `Bearer ${ai.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: ai.model,
        stream: true,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new AIError(`Não foi possível conectar a ${url}: ${err.message}`, 502);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let detail = body;
    try {
      detail = JSON.parse(body).error?.message || body;
    } catch {}
    const hint = res.status === 401 ? "Chave de API inválida. " : res.status === 404 ? "Endpoint ou modelo não encontrado. " : "";
    throw new AIError(`${hint}Erro ${res.status}: ${String(detail).slice(0, 300)}`, res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let finish = null;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        const choice = json.choices?.[0];
        const delta = choice?.delta?.content;
        if (delta) {
          text += delta;
          onText?.(delta);
        }
        if (choice?.finish_reason) finish = choice.finish_reason;
      } catch {}
    }
  }
  return { text, refused: finish === "content_filter", truncated: finish === "length", model: ai.model };
}

export function streamAnswer(ai, opts) {
  if (ai.provider === "anthropic") return streamAnthropic(ai, opts);
  return streamOpenAICompatible(ai, opts);
}

export async function testConnection(ai) {
  const started = Date.now();
  const result = await streamAnswer(ai, {
    system: "Você está sendo testado. Responda em uma frase curta.",
    messages: [{ role: "user", content: "Responda apenas: Conexão funcionando!" }],
  });
  return { ok: true, reply: result.text.trim(), model: result.model, ms: Date.now() - started };
}
