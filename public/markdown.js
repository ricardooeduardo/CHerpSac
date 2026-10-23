// Renderizador de Markdown pequeno e seguro (escapa todo HTML antes de formatar).
(function () {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  function inline(text) {
    const codes = [];
    let s = esc(text).replace(/`([^`]+)`/g, (_, c) => {
      codes.push(c);
      return `\u0000${codes.length - 1}\u0000`;
    });
    s = s
      .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|tel:)[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[\s(])((?:https?:\/\/)[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
  }

  function render(md) {
    const lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
    const out = [];
    let list = null; // "ul" | "ol"
    let para = [];
    let inCode = false;
    let code = [];

    const flushPara = () => {
      if (para.length) out.push(`<p>${para.map(inline).join("<br>")}</p>`);
      para = [];
    };
    const closeList = () => {
      if (list) out.push(`</${list}>`);
      list = null;
    };

    for (const line of lines) {
      if (line.trim().startsWith("```")) {
        if (inCode) {
          out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
          code = [];
          inCode = false;
        } else {
          flushPara();
          closeList();
          inCode = true;
        }
        continue;
      }
      if (inCode) {
        code.push(line);
        continue;
      }
      const heading = line.match(/^(#{1,4})\s+(.*)$/);
      const ul = line.match(/^\s*[-*•]\s+(.*)$/);
      const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
      const quote = line.match(/^>\s?(.*)$/);
      if (!line.trim()) {
        flushPara();
        closeList();
      } else if (heading) {
        flushPara();
        closeList();
        out.push(`<h4>${inline(heading[2])}</h4>`);
      } else if (ul || ol) {
        flushPara();
        const type = ul ? "ul" : "ol";
        if (list !== type) {
          closeList();
          out.push(`<${type}>`);
          list = type;
        }
        out.push(`<li>${inline((ul || ol)[1])}</li>`);
      } else if (quote) {
        flushPara();
        closeList();
        out.push(`<blockquote>${inline(quote[1])}</blockquote>`);
      } else {
        closeList();
        para.push(line);
      }
    }
    if (inCode) out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
    flushPara();
    closeList();
    return out.join("");
  }

  window.renderMarkdown = render;
  window.escapeHtml = esc;
})();
