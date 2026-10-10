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
