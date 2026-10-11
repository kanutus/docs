// docs.kanutus.com: copy buttons, code tabs, mobile menu, "on this page" highlight. Works without it too.
(() => {
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy]");
    if (b) {
      const code = b.closest(".code").querySelector("pre code").innerText;
      navigator.clipboard?.writeText(code).then(() => {
        const old = b.textContent;
        b.textContent = b.dataset.copied || "Copied";
        setTimeout(() => (b.textContent = old), 1500);
      });
      return;
    }
    const tab = e.target.closest("[data-tab]");
    if (tab) {
      const box = tab.closest("[data-tabs]");
      box.querySelectorAll("[data-tab]").forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      box.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== tab.dataset.tab));
      return;
    }
    const menu = e.target.closest("[data-menu]");
    if (menu) {
      const open = document.body.classList.toggle("nav-open");
      menu.setAttribute("aria-expanded", String(open));
    }
  });
  // language selector (same as kanutus.com): Escape / click outside close it; a click remembers the choice for every
  // Kanutus subdomain (cookie kt_lang on .kanutus.com). Arriving from outside the docs on a page in another language
  // than the remembered one sends you to the same page in that language (never while moving inside the docs).
  const lang = document.querySelector("details.langsel");
  if (lang) {
    document.addEventListener("click", (e) => { if (lang.open && !lang.contains(e.target)) lang.open = false; });
    lang.addEventListener("keydown", (e) => { if (e.key === "Escape" && lang.open) { lang.open = false; lang.querySelector("summary").focus(); } });
    lang.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-lang]");
      if (!a) return;
      const dom = /(^|\.)kanutus\.com$/.test(location.hostname) ? "; Domain=.kanutus.com" : "";
      document.cookie = `kt_lang=${a.dataset.lang}; Path=/; Max-Age=31536000; SameSite=Lax${dom}${location.protocol === "https:" ? "; Secure" : ""}`;
    });
    const want = (document.cookie.match(/(?:^|; )kt_lang=([^;]*)/) || [])[1];
    const here = lang.querySelector('a[aria-current="true"]');
    let internal = false;
    try { internal = !!document.referrer && new URL(document.referrer).host === location.host; } catch {}
    const target = want && lang.querySelector(`a[data-lang="${want}"]`);
    if (!internal && target && here && here !== target) location.replace(target.getAttribute("href") + location.hash);
  }
  // endpoint search (reference pages)
  document.querySelectorAll("[data-ref-search]").forEach((box) => {
    const input = box.querySelector("input");
    const list = box.querySelector("ul");
    const data = JSON.parse(box.querySelector("script").textContent);
    const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const render = () => {
      const q = norm(input.value.trim());
      if (!q) return (list.hidden = true);
      const words = q.split(/\s+/);
      const hits = data.filter((d) => words.every((w) => norm(`${d.m} ${d.p} ${d.s} ${d.g}`).includes(w))).slice(0, 12);
      list.innerHTML = hits.length
        ? hits.map((d) => `<li><a href="${d.u}"><span class="method method-${d.m.toLowerCase()}">${d.m}</span><code>${d.p}</code><small>${d.s.replace(/</g, "&lt;")}</small></a></li>`).join("")
        : `<li class="empty">${box.dataset.empty}</li>`;
      list.hidden = false;
    };
    input.addEventListener("input", render);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") list.querySelector("a")?.click();
      if (e.key === "Escape") (input.value = ""), render();
    });
    document.addEventListener("click", (e) => !box.contains(e.target) && (list.hidden = true));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement?.tagName || "")) {
      const s = document.querySelector("[data-ref-search] input");
      if (s) e.preventDefault(), s.focus();
    }
  });

  // "Try it": calls the real API from the browser; the key lives only in sessionStorage of this tab
  const KEY = "kanutus_docs_key";
  const getKey = () => { try { return sessionStorage.getItem(KEY) || ""; } catch { return ""; } };
  document.querySelectorAll("[data-try]").forEach((box) => {
    const keyInput = box.querySelector("[data-key]");
    box.addEventListener("toggle", () => box.open && !keyInput.value && (keyInput.value = getKey()));
    keyInput.addEventListener("change", () => { try { sessionStorage.setItem(KEY, keyInput.value.trim()); } catch {} });
    box.querySelector("[data-send]").addEventListener("click", async () => {
      const out = box.querySelector(".try-out");
      const status = box.querySelector("[data-status]");
      const pre = box.querySelector("[data-out]");
      let path = box.dataset.path;
      const query = new URLSearchParams();
      for (const inp of box.querySelectorAll("[data-param]")) {
        const v = inp.value.trim() || (inp.dataset.in === "path" ? inp.placeholder : "");
        if (inp.dataset.in === "path") path = path.replace(`{${inp.dataset.param}}`, encodeURIComponent(v));
        else if (v) query.set(inp.dataset.param, v);
      }
      const headers = { Authorization: `Bearer ${keyInput.value.trim()}` };
      if (box.hasAttribute("data-idem")) headers["Idempotency-Key"] = crypto.randomUUID();
      const bodyEl = box.querySelector("[data-body]");
      let body;
      if (bodyEl) {
        try { body = JSON.stringify(JSON.parse(bodyEl.value)); } catch { status.textContent = "JSON?"; pre.textContent = "Invalid JSON body"; out.hidden = false; return; }
        headers["Content-Type"] = "application/json";
      }
      const url = `${box.dataset.api}${path}${query.toString() ? "?" + query : ""}`;
      status.textContent = "…";
      out.hidden = false;
      const t0 = performance.now();
      try {
        const r = await fetch(url, { method: box.dataset.method, headers, body });
        const text = await r.text();
        let shown = text;
        try { shown = JSON.stringify(JSON.parse(text), null, 2); } catch {}
        status.textContent = `${r.status} · ${Math.round(performance.now() - t0)} ms${r.headers.get("x-request-id") ? " · " + r.headers.get("x-request-id") : ""}`;
        pre.textContent = shown;
      } catch (err) {
        status.textContent = "network error";
        pre.textContent = String(err);
      }
    });
  });

  const links = [...document.querySelectorAll(".toc a")];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        links.forEach((a) => a.classList.remove("on"));
        map.get(en.target.id)?.classList.add("on");
      }
    },
    { rootMargin: "-70px 0px -70% 0px" },
  );
  map.forEach((_, id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });
})();
