(() => {
  const P = window.PROFILE, PROJ = window.PROJECTS, DOM = window.DOMAINS;
  const ST = window.STATUS, UI = window.UI, EXP = window.EXPERIENCE, SK = window.SKILLS;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  const params = new URLSearchParams(location.search);
  let lang = params.get("lang") || store.get("pf.lang") ||
    ((navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en");
  if (!UI[lang]) lang = "en";
  let domain = "all";

  const t = (o) => (o && typeof o === "object" ? o[lang] ?? o.en : o ?? "");
  const domName = (id) => t(DOM.find((d) => d.id === id));
  const IMG = new Set([
    "aes128-sidechannel-lab", "audio-deepfake-generalization", "autorange-current-profiler",
    "eurosat-onboard-transfer", "fp8-mac-vhdl", "fraud-detection-alert-budget", "french-bpe-tokenizer",
    "health-monitor-iot", "home-assistant-weather-station", "int8-neon-inference-pi5",
    "lunarlander-dqn-vs-ppo", "optimizers-low-precision", "plc-drift-twin", "qt6-uart-fpga-api",
    "sky130-opamp-sizing-bench", "spam-classic-vs-transformer-edge",
  ]);
  const JPG = new Set(["face-attendance-raspberry-pi", "smart-house-solar-energy"]);
  const img = (p) => (IMG.has(p.id) ? `assets/img/${p.id}.png` : JPG.has(p.id) ? `assets/img/${p.id}.jpg` : null);

  const icon = {
    gh: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
    in: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M3 5h18v14H3zM3 6l9 7 9-7"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 3v12m0 0 5-5m-5 5-5-5M4 19h16"/></svg>',
  };

  const badge = (p) =>
    `<span class="badge s-${p.status}"><i></i>${esc(t(ST[p.status]))}</span><span class="stage">${esc(t(p.stage))}</span>`;
  const tags = (p) => p.domains.map((d) => `<span class="tag">${esc(domName(d))}</span>`).join("");
  const repoLink = (p, cls = "btn") =>
    p.repo
      ? `<a class="${cls}" href="${p.repo}" target="_blank" rel="noopener">${icon.gh}${esc(UI[lang].repo)}</a>`
      : `<span class="${cls} disabled">${esc(UI[lang].soon)}</span>`;

  function renderStatic() {
    const u = UI[lang];
    document.documentElement.lang = lang;
    document.title = `${P.name.replace("BELKACEM", "Belkacem")} · Portfolio`;

    const ids = ["projects", "skills", "path", "contact"];
    $("#nav").innerHTML = u.nav.map((n, i) => `<a href="#${ids[i]}">${esc(n)}</a>`).join("");
    $("#langBtn").textContent = u.lang;
    $("#langBtn").title = u.langTitle;
    $("#pdfLink").innerHTML = `${icon.pdf}<span>PDF</span>`;
    $("#pdfLink").href = `portfolio-${lang}.pdf`;
    $("#pdfLink").title = u.pdf;

    const done = PROJ.filter((p) => p.status === "done").length;
    const [first, ...rest] = P.name.split(" ");
    $("#hero").innerHTML = `
      <div class="hero-text">
        <p class="eyebrow">${esc(t(P.role))}</p>
        <h1>${esc(first)} ${esc(rest.slice(0, -1).join(" "))} <span>${esc(rest.at(-1))}</span></h1>
        <p class="school">${esc(t(P.school))}</p>
        <p class="pitch">${esc(t(P.pitch))}</p>
        <p class="seeking"><i></i>${esc(t(P.seeking))}</p>
        <div class="links">
          <a class="btn primary" href="${P.github}" target="_blank" rel="noopener">${icon.gh}GitHub</a>
          <a class="btn" href="${P.linkedin}" target="_blank" rel="noopener">${icon.in}LinkedIn</a>
          <a class="btn" href="mailto:${P.email}">${icon.mail}E-mail</a>
          <a class="btn" href="portfolio-${lang}.pdf">${icon.pdf}${esc(u.pdf)}</a>
        </div>
      </div>
      <dl class="stats">
        <div><dt>${PROJ.length}</dt><dd>${lang === "fr" ? "projets" : "projects"}</dd></div>
        <div><dt>${done}</dt><dd>${lang === "fr" ? "terminés" : "complete"}</dd></div>
        <div><dt>${DOM.length}</dt><dd>${lang === "fr" ? "domaines" : "domains"}</dd></div>
      </dl>`;

    $("#method").innerHTML = `<h2 class="sr">${esc(u.method)}</h2>` + u.methodItems
      .map(([h, d], i) => `<div><span class="num">0${i + 1}</span><h3>${esc(h)}</h3><p>${esc(d)}</p></div>`).join("");

    $("#featuredTitle").textContent = u.featured;
    $("#featured").innerHTML = PROJ.filter((p) => p.featured).map((p) => `
      <article class="feat" data-id="${p.id}" tabindex="0">
        <div class="thumb">${img(p) ? `<img src="${img(p)}" alt="" loading="lazy">` : ""}</div>
        <div class="feat-body">
          <div class="meta">${badge(p)}</div>
          <h3>${esc(t(p.title))}</h3>
          <p>${esc(t(p.tagline))}</p>
          <p class="headline">${esc(t(p.results[0]))}</p>
          <div class="tags">${tags(p)}</div>
        </div>
      </article>`).join("");

    $("#allTitle").textContent = u.all;
    renderFilters();
    renderGrid();

    $("#skills").innerHTML = `<h2>${esc(u.skills)}</h2><div class="skills">` + SK.map((g) => `
      <div class="skill-group"><h3>${esc(t(g))}</h3><div class="chips">${g.items.map((i) => `<span>${esc(i)}</span>`).join("")}</div></div>`).join("") +
      `</div><p class="langs"><strong>${lang === "fr" ? "Langues" : "Languages"}</strong> · ${esc(t(P.languages))}</p>`;

    $("#path").innerHTML = `<h2>${esc(u.path)}</h2><ol class="timeline">` + EXP.map((e) => `
      <li><span class="when">${esc(t(e.when))}</span><div><h3>${esc(t(e.title))}</h3><p>${esc(t(e.where))}</p></div></li>`).join("") + "</ol>";

    $("#contact").innerHTML = `<h2>${esc(u.contact)}</h2><p>${esc(u.contactText)}</p>
      <div class="links">
        <a class="btn primary" href="mailto:${P.email}">${icon.mail}${esc(P.email)}</a>
        <a class="btn" href="${P.linkedin}" target="_blank" rel="noopener">${icon.in}LinkedIn</a>
        <a class="btn" href="${P.github}" target="_blank" rel="noopener">${icon.gh}github.com/amine-belkacem</a>
      </div>`;

    $("#footer").innerHTML = `<span>© ${new Date().getFullYear()} ${esc(P.name)}</span><span>${esc(u.cvNote)}</span>`;
    renderPrint();
  }

  function renderFilters() {
    const u = UI[lang];
    const n = (id) => PROJ.filter((p) => id === "all" || p.domains.includes(id)).length;
    $("#filters").innerHTML = [{ id: "all", en: u.allDomains, fr: u.allDomains }, ...DOM]
      .map((d) => `<button type="button" class="chip${d.id === domain ? " on" : ""}" data-d="${d.id}" aria-pressed="${d.id === domain}">${esc(t(d))}<small>${n(d.id)}</small></button>`)
      .join("");
  }

  function renderGrid() {
    const order = { done: 0, wip: 1, early: 2 };
    const list = PROJ.filter((p) => domain === "all" || p.domains.includes(domain))
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || order[a.status] - order[b.status]);
    $("#count").textContent = UI[lang].count(list.length);
    $("#grid").innerHTML = list.map((p) => `
      <article class="card" data-id="${p.id}" tabindex="0">
        <div class="meta">${badge(p)}</div>
        <h3>${esc(t(p.title))}</h3>
        <p>${esc(t(p.tagline))}</p>
        <div class="card-foot"><div class="tags">${tags(p)}</div>${p.year ? `<span class="year">${esc(p.year)}</span>` : ""}</div>
      </article>`).join("");
  }

  function detail(p, forPrint = false) {
    const u = UI[lang];
    const pic = img(p);
    return `
      <div class="meta">${badge(p)}${p.year ? `<span class="year">${esc(p.year)}</span>` : ""}</div>
      <h2>${esc(t(p.title))}</h2>
      <p class="lead">${esc(t(p.tagline))}</p>
      ${pic ? `<figure><img src="${pic}" alt="${esc(t(p.title))}"></figure>` : ""}
      <h3>${esc(u.results)}</h3>
      <ul class="results">${p.results.map((r) => `<li>${esc(t(r))}</li>`).join("")}</ul>
      ${p.note ? `<p class="note">${esc(t(p.note))}</p>` : ""}
      <h3>${esc(u.stack)}</h3>
      <div class="chips">${p.stack.map((s) => `<span>${esc(s)}</span>`).join("")}</div>
      <div class="modal-foot">
        ${forPrint ? (p.repo ? `<span class="repo-url">${p.repo.replace("https://", "")}</span>` : `<span class="repo-url">${esc(u.soon)}</span>`) : repoLink(p, "btn primary")}
        ${forPrint ? "" : `<button class="btn" type="button" data-close>${esc(u.close)}</button>`}
      </div>`;
  }

  function renderPrint() {
    const u = UI[lang];
    $("#printList").innerHTML = `<h2>${esc(u.all)}</h2>` +
      DOM.map((d) => {
        const ps = PROJ.filter((p) => p.domains[0] === d.id);
        return ps.length ? `<h3 class="print-dom">${esc(t(d))}</h3>` + ps.map((p) => `<article class="print-item">${detail(p, true)}</article>`).join("") : "";
      }).join("");
  }

  const modal = $("#modal");
  function openProject(id, push = true) {
    const p = PROJ.find((x) => x.id === id);
    if (!p) return;
    $("#modalBody").innerHTML = detail(p);
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
    if (push) history.replaceState(null, "", `#p=${id}`);
  }
  function closeModal() {
    if (modal.open) modal.close();
  }
  modal.addEventListener("close", () => {
    if (location.hash.startsWith("#p=")) history.replaceState(null, "", location.pathname + location.search);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-close]")) closeModal();
  });

  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) { domain = chip.dataset.d; renderFilters(); renderGrid(); return; }
    const card = e.target.closest(".card, .feat");
    if (card) openProject(card.dataset.id);
  });
  document.addEventListener("keydown", (e) => {
    const card = e.target.closest && e.target.closest(".card, .feat");
    if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openProject(card.dataset.id); }
  });

  $("#langBtn").addEventListener("click", () => {
    lang = lang === "en" ? "fr" : "en";
    store.set("pf.lang", lang);
    const open = modal.open && location.hash.slice(3);
    renderStatic();
    if (open) openProject(open, false);
  });

  const root = document.documentElement;
  const savedTheme = store.get("pf.theme");
  if (savedTheme) root.dataset.theme = savedTheme;
  $("#themeBtn").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    store.set("pf.theme", root.dataset.theme);
  });

  renderStatic();
  if (location.hash.startsWith("#p=")) openProject(location.hash.slice(3), false);
})();
