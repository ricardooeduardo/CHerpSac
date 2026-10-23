(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = window.escapeHtml;

  // ---------------------------------------------------------------------------
  // Sessão e API
  // ---------------------------------------------------------------------------
  let token = null;
  try {
    token = sessionStorage.getItem("sac-admin-token");
  } catch {}

  async function api(path, options = {}) {
    const res = await fetch("/api/admin" + path, {
      ...options,
      headers: { "content-type": "application/json", authorization: "Bearer " + token, ...(options.headers || {}) },
      body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== "/login") {
      showLogin();
      throw new Error(data.error || "Sessão expirada.");
    }
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
    return data;
  }

  function toast(msg, bad = false) {
    const el = document.createElement("div");
    el.className = "toast" + (bad ? " bad" : "");
    el.textContent = msg;
    $("#toasts").appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  function showLogin() {
    token = null;
    try {
      sessionStorage.removeItem("sac-admin-token");
    } catch {}
    $("#shell").classList.add("hidden");
    $("#login").classList.remove("hidden");
    $("#loginPassword").focus();
  }

  function showShell() {
    $("#login").classList.add("hidden");
    $("#shell").classList.remove("hidden");
    go(location.hash.slice(1) || "overview");
  }

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#loginError").textContent = "";
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: $("#loginPassword").value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      token = data.token;
      try {
        sessionStorage.setItem("sac-admin-token", token);
      } catch {}
      $("#loginPassword").value = "";
      showShell();
    } catch (err) {
      $("#loginError").textContent = err.message || "Não foi possível entrar.";
    }
  });

  $("#logout").addEventListener("click", async () => {
    await api("/logout", { method: "POST" }).catch(() => {});
    showLogin();
  });

  // ---------------------------------------------------------------------------
  // Navegação
  // ---------------------------------------------------------------------------
  const loaders = {
    overview: loadOverview,
    documents: loadDocuments,
    ai: loadAi,
    branding: loadBranding,
    conversations: loadConversations,
    security: () => {},
  };

  function go(view) {
    if (!loaders[view]) view = "overview";
    $$("#nav a").forEach((a) => a.classList.toggle("active", a.dataset.view === view));
    $$(".view").forEach((v) => v.classList.toggle("active", v.dataset.view === view));
    if (location.hash.slice(1) !== view) history.replaceState(null, "", "#" + view);
    Promise.resolve(loaders[view]()).catch((err) => toast(err.message, true));
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-view]:not(section), [data-goto]");
    if (!link || link.tagName === "SECTION") return;
    e.preventDefault();
    go(link.dataset.goto || link.dataset.view);
  });

  window.addEventListener("hashchange", () => {
    if (token) go(location.hash.slice(1));
  });

  const fmtDate = (iso) =>
    new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  const fmtNum = (n) => Number(n).toLocaleString("pt-BR");
  const fmtSize = (chars) => (chars > 1000 ? `${fmtNum(Math.round(chars / 1000))} mil caracteres` : `${chars} caracteres`);

  // ---------------------------------------------------------------------------
  // Visão geral
  // ---------------------------------------------------------------------------
  async function loadOverview() {
    const s = await api("/stats");
    const alerts = [];
    if (s.defaultPassword)
      alerts.push(`<div class="alert warn"><span>⚠️ Você está usando a senha inicial do painel. Troque-a antes de publicar o sistema.</span><a class="btn sm" data-goto="security">Trocar senha</a></div>`);
    if (!s.aiConfigured)
      alerts.push(`<div class="alert warn"><span>🤖 Nenhuma IA conectada. O chat está respondendo só com trechos dos documentos, sem interpretar a pergunta.</span><a class="btn sm" data-goto="ai">Conectar IA</a></div>`);
    if (!s.activeDocuments)
      alerts.push(`<div class="alert warn"><span>📄 A base de conhecimento está vazia. Envie documentos para a IA ter o que responder.</span><a class="btn sm" data-goto="documents">Adicionar documentos</a></div>`);
    $("#alerts").innerHTML = alerts.join("");

    const satisfaction = s.feedbackUp + s.feedbackDown ? Math.round((s.feedbackUp / (s.feedbackUp + s.feedbackDown)) * 100) + "%" : "—";
    const cards = [
      ["Documentos ativos", fmtNum(s.activeDocuments), `${fmtNum(s.documents)} no total · ${fmtSize(s.totalChars)}`],
      ["Trechos indexados", fmtNum(s.chunks), s.contextMode === "full" ? "Base inteira enviada à IA" : "Busca por trechos relevantes"],
      ["Conversas", fmtNum(s.conversations), `${fmtNum(s.messagesLast24h)} mensagens nas últimas 24h`],
      ["Satisfação", satisfaction, `👍 ${s.feedbackUp} · 👎 ${s.feedbackDown}`],
      ["IA", s.aiConfigured ? "Conectada" : "Desligada", s.aiConfigured ? s.model : "Configure em Conexão com IA"],
    ];
    $("#stats").innerHTML = cards
      .map(([l, v, sub]) => `<div class="stat"><div class="label">${l}</div><div class="value">${esc(String(v))}</div><div class="sub">${esc(sub)}</div></div>`)
      .join("");
  }

  // ---------------------------------------------------------------------------
  // Documentos
  // ---------------------------------------------------------------------------
  let docs = [];

  async function loadDocuments() {
    docs = await api("/documents");
    renderDocs();
  }

  function renderDocs() {
    const q = $("#docFilter").value.trim().toLowerCase();
    const list = docs.filter((d) => !q || d.title.toLowerCase().includes(q) || (d.filename || "").toLowerCase().includes(q));
    $("#docCount").textContent = docs.length;
    if (!list.length) {
      $("#docList").innerHTML = `<div class="empty">${docs.length ? "Nenhum documento encontrado." : "Nenhum documento ainda. Envie arquivos acima ou clique em <b>+ Escrever texto</b>."}</div>`;
      return;
    }
    $("#docList").innerHTML = list
      .map(
        (d) => `
        <div class="doc-row ${d.enabled ? "" : "disabled"}" data-id="${d.id}">
          <div class="doc-icon">${esc((d.type || "txt").slice(0, 4))}</div>
          <div style="min-width:0">
            <div class="doc-title" data-act="edit">${esc(d.title)}</div>
            <div class="doc-sub">${fmtSize(d.chars)} · atualizado ${fmtDate(d.updatedAt)}${d.filename ? " · " + esc(d.filename) : ""}</div>
          </div>
          <label class="switch" title="${d.enabled ? "Ativo: a IA usa este documento" : "Inativo: a IA ignora este documento"}">
            <input type="checkbox" data-act="toggle" ${d.enabled ? "checked" : ""}><span></span>
          </label>
          <div class="doc-actions">
            <button class="btn sm" data-act="edit">Editar</button>
            <button class="btn sm danger" data-act="delete">Excluir</button>
          </div>
        </div>`
      )
      .join("");
  }

  $("#docFilter").addEventListener("input", renderDocs);

  $("#docList").addEventListener("click", async (e) => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    const id = e.target.closest(".doc-row")?.dataset.id;
    if (!act || !id || act === "toggle") return;
    const doc = docs.find((d) => d.id === id);
    if (act === "edit") openDocModal(id);
    if (act === "delete" && confirm(`Excluir "${doc.title}" da base de conhecimento?`)) {
      try {
        await api("/documents/" + id, { method: "DELETE" });
        toast("Documento excluído.");
        loadDocuments();
      } catch (err) {
        toast(err.message, true);
      }
    }
  });

  $("#docList").addEventListener("change", async (e) => {
    if (e.target.dataset.act !== "toggle") return;
    const id = e.target.closest(".doc-row").dataset.id;
    try {
      await api("/documents/" + id, { method: "PUT", body: { enabled: e.target.checked } });
      toast(e.target.checked ? "Documento ativado." : "Documento desativado.");
      loadDocuments();
    } catch (err) {
      toast(err.message, true);
    }
  });

  // Modal de criação/edição
  let editingId = null;
  async function openDocModal(id) {
    editingId = id || null;
    $("#docModalTitle").textContent = id ? "Editar documento" : "Novo documento de texto";
    $("#docEnabledWrap").classList.toggle("hidden", !id);
    if (id) {
      const doc = await api("/documents/" + id);
      $("#docTitle").value = doc.title;
      $("#docText").value = doc.text;
      $("#docEnabled").checked = doc.enabled;
      $("#docMeta").textContent = `${fmtSize(doc.text.length)} · criado ${fmtDate(doc.createdAt)}`;
    } else {
      $("#docTitle").value = "";
      $("#docText").value = "";
      $("#docMeta").textContent = "Dica: escreva no formato pergunta e resposta.";
    }
    $("#docModal").showModal();
    $("#docTitle").focus();
  }
  $("#newTextDoc").addEventListener("click", () => openDocModal());

  $("#docForm").addEventListener("submit", async (e) => {
    if (e.submitter?.value !== "save") return;
    e.preventDefault();
    const body = { title: $("#docTitle").value, text: $("#docText").value };
    if (!body.title.trim() || !body.text.trim()) return toast("Preencha título e conteúdo.", true);
    try {
      if (editingId) {
        body.enabled = $("#docEnabled").checked;
        await api("/documents/" + editingId, { method: "PUT", body });
      } else {
        await api("/documents", { method: "POST", body: { ...body, type: "texto" } });
      }
      $("#docModal").close();
      toast("Documento salvo.");
      loadDocuments();
    } catch (err) {
      toast(err.message, true);
    }
  });

  // Upload e extração de texto (feita no navegador)
  const loadedScripts = {};
  function loadScript(src) {
    loadedScripts[src] ||= new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Não foi possível carregar o leitor de arquivos. Verifique a internet."));
      document.head.appendChild(s);
    });
    return loadedScripts[src];
  }

  const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const MAMMOTH = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";

  async function extractText(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "pdf") {
      await loadScript(PDFJS);
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const content = await (await pdf.getPage(i)).getTextContent();
        pages.push(content.items.map((it) => it.str + (it.hasEOL ? "\n" : "")).join(""));
      }
      return pages.join("\n\n");
    }
    if (ext === "docx") {
      await loadScript(MAMMOTH);
      const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return result.value;
    }
    if (ext === "html" || ext === "htm") {
      const doc = new DOMParser().parseFromString(await file.text(), "text/html");
      doc.querySelectorAll("script,style,noscript").forEach((n) => n.remove());
      doc.querySelectorAll("p,div,li,h1,h2,h3,h4,h5,h6,tr,br,section,article").forEach((n) => n.append("\n"));
      return doc.body.textContent.replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*/g, "\n\n");
    }
    return file.text();
  }

  async function handleFiles(files) {
    for (const file of files) {
      const row = document.createElement("div");
      row.className = "upload";
      row.innerHTML = `<span class="name">${esc(file.name)}</span><span class="st">Lendo arquivo…</span>`;
      $("#uploads").prepend(row);
      const st = $(".st", row);
      try {
        if (file.size > 30 * 1024 * 1024) throw new Error("Arquivo maior que 30 MB.");
        const text = (await extractText(file)).trim();
        if (!text) throw new Error("Nenhum texto encontrado (PDF escaneado como imagem?).");
        st.textContent = "Enviando…";
        await api("/documents", {
          method: "POST",
          body: {
            title: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
            filename: file.name,
            type: file.name.split(".").pop().toLowerCase(),
            text,
          },
        });
        st.textContent = `✓ Adicionado (${fmtSize(text.length)})`;
        st.classList.add("ok");
      } catch (err) {
        st.textContent = "✗ " + err.message;
        st.classList.add("bad");
      }
    }
    loadDocuments();
    setTimeout(() => $$(".upload .st.ok").forEach((el) => el.closest(".upload").remove()), 6000);
  }

  const dz = $("#dropzone");
  $("#fileInput").addEventListener("change", (e) => {
    handleFiles([...e.target.files]);
    e.target.value = "";
  });
  ["dragenter", "dragover"].forEach((ev) =>
    dz.addEventListener(ev, (e) => {
      e.preventDefault();
      dz.classList.add("over");
    })
  );
  ["dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, () => dz.classList.remove("over")));
  dz.addEventListener("drop", (e) => {
    e.preventDefault();
    handleFiles([...e.dataTransfer.files]);
  });

  $("#searchTest").addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = $("#searchQuery").value.trim();
    if (!query) return;
    const results = await api("/search-test", { method: "POST", body: { query } });
    $("#searchResults").innerHTML = results.length
      ? results
          .map(
            (r) => `<div class="result"><div class="r-head"><span>${esc(r.title)} · parte ${r.part}</span><span class="muted">relevância ${r.score}</span></div><div class="r-text">${esc(r.text)}</div></div>`
          )
          .join("")
      : `<p class="muted">Nenhum trecho encontrado. Talvez falte um documento sobre esse assunto.</p>`;
  });

  // ---------------------------------------------------------------------------
  // Conexão com IA
  // ---------------------------------------------------------------------------
  const PRESETS = {
    anthropic: { name: "Claude", by: "Anthropic", provider: "anthropic", tag: "Recomendado", keyUrl: "https://console.anthropic.com/settings/keys", keyHint: "sk-ant-…" },
    openai: { name: "OpenAI", by: "ChatGPT / GPT", provider: "openai", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini", keyUrl: "https://platform.openai.com/api-keys", keyHint: "sk-…" },
    gemini: { name: "Google Gemini", by: "Google AI Studio", provider: "openai", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-2.5-flash", keyUrl: "https://aistudio.google.com/apikey", keyHint: "AIza…" },
    groq: { name: "Groq", by: "Modelos abertos, rápidos", provider: "openai", baseUrl: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile", keyUrl: "https://console.groq.com/keys", keyHint: "gsk_…" },
    openrouter: { name: "OpenRouter", by: "Vários modelos, uma chave", provider: "openai", baseUrl: "https://openrouter.ai/api/v1", model: "provedor/modelo", keyUrl: "https://openrouter.ai/keys", keyHint: "sk-or-…" },
    ollama: { name: "Ollama", by: "IA local, sem custo", provider: "openai", baseUrl: "http://localhost:11434/v1", model: "llama3.1", noKey: true },
    custom: { name: "Personalizado", by: "Qualquer API compatível com OpenAI", provider: "openai", baseUrl: "", model: "nome-do-modelo" },
  };
  const CLAUDE_MODELS = [
    ["claude-opus-5-5", "Claude Opus 5.5", "Mais inteligente para interpretar · padrão"],
    ["claude-sonnet-5-5", "Claude Sonnet 5.5", "Ótimo equilíbrio entre custo e qualidade"],
    ["claude-haiku-5-5", "Claude Haiku 5.5", "Mais rápido e econômico, alto volume"],
    ["claude-fable-5-1", "Claude Fable 5.1", "Capacidade máxima, custo mais alto"],
  ];

  let aiState = null;
  let preset = "anthropic";
  let claudeModel = "claude-opus-5-5";

  $("#providers").innerHTML = Object.entries(PRESETS)
    .map(([id, p]) => `<button type="button" class="provider" data-preset="${id}">${p.tag ? `<span class="tag">${p.tag}</span>` : ""}<b>${p.name}</b><small>${p.by}</small></button>`)
    .join("");
  $("#modelOptions").innerHTML = CLAUDE_MODELS.map(
    ([id, name, desc]) => `<label class="model" data-model="${id}"><input type="radio" name="claudeModel" value="${id}"><b>${name}</b><small>${desc}</small></label>`
  ).join("");

  $("#providers").addEventListener("click", (e) => {
    const btn = e.target.closest(".provider");
    if (!btn) return;
    const changed = btn.dataset.preset !== preset;
    preset = btn.dataset.preset;
    if (changed && preset !== "anthropic") {
      const p = PRESETS[preset];
      $("#baseUrl").value = p.baseUrl;
      $("#modelText").value = preset === "custom" || preset === "openrouter" ? "" : p.model;
    }
    if (changed) $("#apiKey").value = "";
    renderAiForm();
  });
  $("#modelOptions").addEventListener("click", (e) => {
    const card = e.target.closest(".model");
    if (!card) return;
    claudeModel = card.dataset.model;
    renderAiForm();
  });

  function renderAiForm() {
    const p = PRESETS[preset];
    const isClaude = p.provider === "anthropic";
    $$(".provider").forEach((b) => b.classList.toggle("active", b.dataset.preset === preset));
    $$(".model").forEach((m) => m.classList.toggle("active", m.dataset.model === claudeModel));
    $("#baseUrlField").classList.toggle("hidden", isClaude);
    $("#modelSelectField").classList.toggle("hidden", !isClaude);
    $("#modelTextField").classList.toggle("hidden", isClaude);
    $("#effortField").classList.toggle("hidden", !isClaude);
    $("#keyField").classList.toggle("hidden", Boolean(p.noKey));
    $("#modelText").placeholder = p.model || "";

    const sameProvider = aiState && aiState.preset === preset;
    const saved = sameProvider && aiState.hasKey;
    $("#apiKey").placeholder = saved ? `Chave salva (${aiState.keyPreview}) — deixe em branco para manter` : p.keyHint || "Cole a chave de API";
    let help = p.keyUrl ? `Crie uma chave em <a href="${p.keyUrl}" target="_blank" rel="noopener">${new URL(p.keyUrl).host}</a>. ` : "";
    if (isClaude && aiState?.envKey && !saved) help += "Uma chave já foi encontrada na variável de ambiente ANTHROPIC_API_KEY do servidor. ";
    help += "A chave fica guardada só no servidor e nunca é enviada ao navegador do cliente.";
    $("#keyHelp").innerHTML = help;
  }

  $("#toggleKey").addEventListener("click", () => {
    const input = $("#apiKey");
    input.type = input.type === "password" ? "text" : "password";
    $("#toggleKey").textContent = input.type === "password" ? "Mostrar" : "Ocultar";
  });

  function setAiStatus() {
    const on = aiState.hasKey || aiState.envKey || (aiState.provider === "openai" && aiState.baseUrl);
    const el = $("#aiStatus");
    el.className = "pill " + (on ? "ok" : "off");
    el.textContent = on ? `Conectado · ${aiState.model}` : "Nenhuma IA conectada";
  }

  async function loadAi() {
    aiState = await api("/ai");
    preset = aiState.preset || aiState.provider || "anthropic";
    if (!PRESETS[preset]) preset = aiState.provider === "anthropic" ? "anthropic" : "custom";
    if (aiState.provider === "anthropic") claudeModel = aiState.model;
    else {
      $("#baseUrl").value = aiState.baseUrl || "";
      $("#modelText").value = aiState.model || "";
    }
    $("#apiKey").value = "";
    $("#effort").value = aiState.effort || "low";
    $("#contextMode").value = aiState.contextMode || "auto";
    $("#maxTokens").value = aiState.maxTokens || 16000;
    $("#testResult").innerHTML = "";
    setAiStatus();
    renderAiForm();
  }

  function aiFormBody() {
    const p = PRESETS[preset];
    const isClaude = p.provider === "anthropic";
    const body = {
      preset,
      provider: p.provider,
      baseUrl: isClaude ? "" : $("#baseUrl").value.trim(),
      model: isClaude ? claudeModel : $("#modelText").value.trim(),
      effort: $("#effort").value,
      contextMode: $("#contextMode").value,
      maxTokens: Number($("#maxTokens").value) || 16000,
    };
    const key = $("#apiKey").value.trim();
    if (key) body.apiKey = key;
    // Trocar de provedor sem informar chave nova: não reaproveita a chave do provedor anterior.
    else if (aiState && aiState.preset !== preset) body.clearKey = true;
    return body;
  }

  $("#testAi").addEventListener("click", async () => {
    const body = aiFormBody();
    if (!body.model) return toast("Informe o modelo.", true);
    $("#testResult").innerHTML = `<div class="test wait">Testando conexão com ${esc(body.model)}…</div>`;
    $("#testAi").disabled = true;
    try {
      const r = await api("/ai/test", { method: "POST", body });
      $("#testResult").innerHTML = r.ok
        ? `<div class="test ok">✓ Funcionou em ${(r.ms / 1000).toFixed(1)}s. Resposta da IA: “${esc(r.reply)}”</div>`
        : `<div class="test bad">✗ ${esc(r.error)}</div>`;
    } catch (err) {
      $("#testResult").innerHTML = `<div class="test bad">✗ ${esc(err.message)}</div>`;
    } finally {
      $("#testAi").disabled = false;
    }
  });

  $("#aiForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = aiFormBody();
    if (!body.model) return toast("Informe o modelo.", true);
    if (body.provider === "openai" && !body.baseUrl) return toast("Informe a URL base da API.", true);
    try {
      aiState = await api("/ai", { method: "PUT", body });
      $("#apiKey").value = "";
      setAiStatus();
      renderAiForm();
      toast("Conexão salva.");
    } catch (err) {
      toast(err.message, true);
    }
  });

  // ---------------------------------------------------------------------------
  // Personalização
  // ---------------------------------------------------------------------------
  const bForm = $("#brandingForm");
  async function loadBranding() {
    const b = await api("/branding");
    for (const key of ["companyName", "assistantName", "primaryColor", "contact", "welcome", "instructions", "fallbackMessage"]) {
      bForm.elements[key].value = b[key] || "";
    }
    bForm.elements.suggestions.value = (b.suggestions || []).join("\n");
    bForm.elements.showSources.checked = b.showSources !== false;
    $("#colorText").value = b.primaryColor || "#2563eb";
  }
  bForm.elements.primaryColor.addEventListener("input", (e) => ($("#colorText").value = e.target.value));
  $("#colorText").addEventListener("input", (e) => {
    if (/^#[0-9a-f]{6}$/i.test(e.target.value)) bForm.elements.primaryColor.value = e.target.value;
  });
  bForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = bForm.elements;
    try {
      await api("/branding", {
        method: "PUT",
        body: {
          companyName: f.companyName.value,
          assistantName: f.assistantName.value,
          primaryColor: f.primaryColor.value,
          contact: f.contact.value,
          welcome: f.welcome.value,
          instructions: f.instructions.value,
          fallbackMessage: f.fallbackMessage.value,
          suggestions: f.suggestions.value.split("\n"),
          showSources: f.showSources.checked,
        },
      });
      toast("Personalização salva.");
    } catch (err) {
      toast(err.message, true);
    }
  });

  // ---------------------------------------------------------------------------
  // Conversas
  // ---------------------------------------------------------------------------
  let convs = [];
  let openConv = null;

  async function loadConversations() {
    convs = await api("/conversations");
    renderConvs();
  }

  function renderConvs() {
    const f = $("#convFilter").value;
    const list = convs.filter((c) => f === "all" || (f === "down" && c.down) || (f === "problems" && c.problems));
    $("#convList").innerHTML = list.length
      ? list
          .map(
            (c) => `<div class="conv-item ${c.id === openConv ? "active" : ""}" data-id="${c.id}">
              <div class="c-top"><span>${fmtDate(c.updatedAt)}</span><span>${c.count} msgs${c.up ? " · 👍" + c.up : ""}${c.down ? " · 👎" + c.down : ""}${c.problems ? " · ⚠️" : ""}</span></div>
              <div class="c-prev">${esc(c.preview || "(sem mensagem)")}</div></div>`
          )
          .join("")
      : `<div class="empty">Nenhuma conversa ${f === "all" ? "ainda" : "com esse filtro"}.</div>`;
  }
  $("#convFilter").addEventListener("change", renderConvs);

  $("#convList").addEventListener("click", async (e) => {
    const id = e.target.closest(".conv-item")?.dataset.id;
    if (!id) return;
    openConv = id;
    renderConvs();
    const c = await api("/conversations/" + id);
    $("#convDetail").innerHTML =
      `<div class="d-head"><div><b>Conversa de ${fmtDate(c.startedAt)}</b><div class="muted" style="font-size:12.5px">${c.messages.length} mensagens</div></div>
        <button class="btn sm danger" id="delConv">Excluir conversa</button></div>` +
      c.messages
        .map((m) => {
          const flags = [];
          if (m.feedback === "up") flags.push("👍 avaliada como útil");
          if (m.feedback === "down") flags.push("👎 avaliada como não útil");
          if (m.noAi) flags.push("⚠️ respondida sem IA");
          if (m.error) flags.push("⚠️ erro: " + m.error);
          if (m.sources?.length) flags.push("Fontes: " + m.sources.join(", "));
          const body = m.role === "user" ? esc(m.content) : renderMarkdown(m.content);
          return `<div class="msg ${m.role} ${m.error || m.noAi || m.feedback === "down" ? "flag" : ""}">${body}
            <div class="msg-meta">${new Date(m.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}${flags.length ? " · " + esc(flags.join(" · ")) : ""}</div></div>`;
        })
        .join("");
    $("#delConv").onclick = async () => {
      if (!confirm("Excluir esta conversa do histórico?")) return;
      await api("/conversations/" + id, { method: "DELETE" });
      openConv = null;
      $("#convDetail").innerHTML = `<p class="muted center">Selecione uma conversa.</p>`;
      toast("Conversa excluída.");
      loadConversations();
    };
  });

  // ---------------------------------------------------------------------------
  // Segurança
  // ---------------------------------------------------------------------------
  $("#passwordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target.elements;
    if (f.next.value !== f.confirm.value) return toast("A confirmação não confere com a nova senha.", true);
    try {
      await api("/password", { method: "POST", body: { current: f.current.value, next: f.next.value } });
      e.target.reset();
      toast("Senha alterada.");
    } catch (err) {
      toast(err.message, true);
    }
  });

  // ---------------------------------------------------------------------------
  // Início
  // ---------------------------------------------------------------------------
  if (token) {
    api("/stats").then(showShell, showLogin);
  } else {
    showLogin();
  }
})();
