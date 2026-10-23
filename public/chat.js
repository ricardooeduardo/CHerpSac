(function () {
  const $ = (id) => document.getElementById(id);
  const messagesEl = $("messages");
  const form = $("form");
  const input = $("input");
  const sendBtn = $("send");

  const ICONS = {
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0 4-8a3 3 0 0 1 3 3v4h5.5a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.1 21H7"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3zm0 0-4 8a3 3 0 0 1-3-3v-4H4.5a2 2 0 0 1-2-2.3l1.4-8A2 2 0 0 1 5.9 3H17"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>',
    doc: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  };

  let config = { assistantName: "Assistente Virtual", companyName: "", welcome: "Olá! Como posso ajudar?", suggestions: [] };
  // Estado salvo no navegador para a conversa sobreviver a um recarregamento.
  let state = load() || { conversationId: null, messages: [] };
  let busy = false;

  function load() {
    try {
      return JSON.parse(localStorage.getItem("sac-chat"));
    } catch {
      return null;
    }
  }
  function save() {
    try {
      localStorage.setItem("sac-chat", JSON.stringify(state));
    } catch {}
  }

  const initials = (name) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "AV";

  function applyConfig() {
    document.documentElement.style.setProperty("--brand", config.primaryColor || "#2563eb");
    $("assistantName").textContent = config.assistantName;
    $("companyName").textContent = config.companyName ? `${config.companyName} • online` : "Online";
    $("avatar").textContent = initials(config.assistantName);
    document.title = `Atendimento ${config.companyName || ""}`.trim();
  }

  function scrollDown() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function botRow() {
    const row = document.createElement("div");
    row.className = "row bot";
    row.innerHTML = `<div class="avatar small">${escapeHtml(initials(config.assistantName))}</div><div class="stack"><div class="bubble"></div></div>`;
    messagesEl.appendChild(row);
    return row;
  }

  function renderMessage(msg, index) {
    if (msg.role === "user") {
      const row = document.createElement("div");
      row.className = "row user";
      row.innerHTML = `<div class="stack"><div class="bubble"></div></div>`;
      row.querySelector(".bubble").textContent = msg.content;
      messagesEl.appendChild(row);
      return row;
    }
    const row = botRow();
    const bubble = row.querySelector(".bubble");
    if (msg.error) bubble.classList.add("error");
    bubble.innerHTML = renderMarkdown(msg.content);
    if (index !== undefined && !msg.welcome) addMeta(row, msg, index);
    return row;
  }

  function addMeta(row, msg, index) {
    const meta = document.createElement("div");
    meta.className = "meta";
    for (const s of msg.sources || []) {
      const pill = document.createElement("span");
      pill.className = "source";
      pill.title = "Fonte: " + s;
      pill.innerHTML = ICONS.doc + `<span>${escapeHtml(s)}</span>`;
      meta.appendChild(pill);
    }
    if (!msg.error) {
      const actions = document.createElement("span");
      actions.className = "actions";
      actions.innerHTML = `
        <button data-v="up" title="Resposta útil" class="${msg.feedback === "up" ? "on" : ""}">${ICONS.up}</button>
        <button data-v="down" title="Resposta não ajudou" class="${msg.feedback === "down" ? "on" : ""}">${ICONS.down}</button>
        <button data-v="copy" title="Copiar">${ICONS.copy}</button>`;
      actions.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        if (btn.dataset.v === "copy") {
          navigator.clipboard?.writeText(msg.content);
          return;
        }
        msg.feedback = msg.feedback === btn.dataset.v ? null : btn.dataset.v;
        actions.querySelectorAll("button[data-v=up],button[data-v=down]").forEach((b) => b.classList.toggle("on", b.dataset.v === msg.feedback));
        save();
        if (msg.serverIndex !== undefined) {
          fetch("/api/chat/feedback", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ conversationId: state.conversationId, index: msg.serverIndex, value: msg.feedback }),
          }).catch(() => {});
        }
      });
      meta.appendChild(actions);
    }
    row.querySelector(".stack").appendChild(meta);
  }

  function renderAll() {
    messagesEl.innerHTML = "";
    renderMessage({ role: "assistant", content: config.welcome, welcome: true });
    if (!state.messages.length && config.suggestions?.length) {
      const wrap = document.createElement("div");
      wrap.className = "suggestions";
      for (const s of config.suggestions) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = s;
        b.onclick = () => send(s);
        wrap.appendChild(b);
      }
      messagesEl.appendChild(wrap);
    }
    state.messages.forEach((m, i) => renderMessage(m, i));
    scrollDown();
  }

  async function send(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    sendBtn.disabled = true;
    input.value = "";
    autosize();

    messagesEl.querySelector(".suggestions")?.remove();
    const userMsg = { role: "user", content: text };
    state.messages.push(userMsg);
    renderMessage(userMsg);

    const row = botRow();
    const bubble = row.querySelector(".bubble");
    bubble.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
    scrollDown();

    const botMsg = { role: "assistant", content: "", sources: [] };
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, conversationId: state.conversationId }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Não foi possível enviar sua mensagem.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();
        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const ev = JSON.parse(part.slice(6));
          if (ev.type === "meta") {
            state.conversationId = ev.conversationId;
            botMsg.serverIndex = ev.index;
            botMsg.sources = ev.sources || [];
          } else if (ev.type === "delta") {
            botMsg.content += ev.text;
            bubble.innerHTML = renderMarkdown(botMsg.content);
            scrollDown();
          } else if (ev.type === "error") {
            if (!botMsg.content) {
              botMsg.content = ev.message;
              botMsg.error = true;
            }
          }
        }
      }
      if (!botMsg.content) throw new Error("Não recebi resposta. Tente novamente.");
    } catch (err) {
      if (!botMsg.content) {
        botMsg.content = err.message;
        botMsg.error = true;
      }
    }
    if (botMsg.error) bubble.classList.add("error");
    bubble.innerHTML = renderMarkdown(botMsg.content);
    state.messages.push(botMsg);
    addMeta(row, botMsg, state.messages.length - 1);
    save();
    scrollDown();
    busy = false;
    sendBtn.disabled = !input.value.trim();
    input.focus();
  }

  function autosize() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
  }

  input.addEventListener("input", () => {
    autosize();
    sendBtn.disabled = busy || !input.value.trim();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input.value);
    }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
  });
  $("newChat").addEventListener("click", () => {
    if (busy) return;
    state = { conversationId: null, messages: [] };
    save();
    renderAll();
    input.focus();
  });

  fetch("/api/public/config")
    .then((r) => r.json())
    .then((c) => {
      config = { ...config, ...c };
    })
    .catch(() => {})
    .finally(() => {
      applyConfig();
      renderAll();
      input.focus();
    });
})();
