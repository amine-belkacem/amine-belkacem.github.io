(() => {
  const P = window.PROFILE, PROJ = window.PROJECTS, DOM = window.DOMAINS;
  const ST = window.STATUS, UI = window.UI, EXP = window.EXPERIENCE, SK = window.SKILLS;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* extra interface strings for this design */
  const X = {
    en: {
      live: "Open to work · Mar 2027", eyebrow: "embedded systems / fpga / embedded ai",
      stats: ["projects", "complete", "domains"], details: "Details", sec: ["Method", "Featured work", "All projects", "Skills", "Path", "Contact"],
      contactTitle: "Got a hardware problem worth measuring?", ch1: "CH1 · DIGITAL", ch2: "CH2 · ANALOG",
      top: "Back to top",
    },
    fr: {
      live: "Disponible · mars 2027", eyebrow: "systèmes embarqués / fpga / ia embarquée",
      stats: ["projets", "terminés", "domaines"], details: "Détails", sec: ["Méthode", "Projets phares", "Tous les projets", "Compétences", "Parcours", "Contact"],
      contactTitle: "Un problème matériel qui mérite d'être mesuré ?", ch1: "CH1 · NUMÉRIQUE", ch2: "CH2 · ANALOGIQUE",
      top: "Haut de page",
    },
  };

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
  const pad = (n) => String(n).padStart(2, "0");

  const icon = {
    gh: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
    in: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M3 5h18v14H3zM3 6l9 7 9-7"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 3v12m0 0 5-5m-5 5-5-5M4 19h16"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M7 17 17 7M8 7h9v9"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M6 6l12 12M18 6 6 18"/></svg>',
  };
  const mIcons = [
    '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"/>',
    '<path d="M12 3 3 8v8l9 5 9-5V8zM8 12l3 3 5-6"/>',
    '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"/>',
  ];

  const badge = (p) =>
    `<span class="badge s-${p.status}"><i></i>${esc(t(ST[p.status]))}</span><span class="stage">${esc(t(p.stage))}</span>`;
  const tags = (p) => p.domains.map((d) => `<span class="tag">${esc(domName(d))}</span>`).join("");
  const repoLink = (p, cls = "btn") =>
    p.repo
      ? `<a class="${cls}" href="${p.repo}" target="_blank" rel="noopener">${icon.gh}${esc(UI[lang].repo)}</a>`
      : `<span class="${cls} disabled">${esc(UI[lang].soon)}</span>`;
  const secHead = (i, extra = "") =>
    `<p class="kicker"><span>// ${pad(i + 1)}</span><i></i></p><h2>${esc(X[lang].sec[i])}${extra}</h2>`;

  function renderStatic() {
    const u = UI[lang], x = X[lang];
    document.documentElement.lang = lang;
    document.title = `${P.name.replace("BELKACEM", "Belkacem")} · Portfolio`;

    const ids = ["projects", "skills", "path", "contact"];
    $("#nav").innerHTML = u.nav.map((n, i) => `<a href="#${ids[i]}"><span>${pad(i + 1)}</span>${esc(n)}</a>`).join("");
    $("#live").innerHTML = `<i></i>${esc(x.live)}`;
    $("#langBtn").textContent = u.lang;
    $("#langBtn").title = u.langTitle;
    $("#pdfLink").innerHTML = `${icon.pdf}<span>PDF</span>`;
    $("#pdfLink").href = `portfolio-${lang}.pdf`;
    $("#pdfLink").title = u.pdf;

    const done = PROJ.filter((p) => p.status === "done").length;
    const parts = P.name.split(" ");
    $("#heroInner").innerHTML = `
      <p class="eyebrow"><span class="caret">&gt;</span> ${esc(x.eyebrow)}<span class="cursor"></span></p>
      <h1><span class="l1">${esc(parts.slice(0, -1).join(" "))}</span><span class="l2">${esc(parts.at(-1))}</span></h1>
      <p class="school">${esc(t(P.school))}</p>
      <p class="pitch">${esc(t(P.pitch))}</p>
      <p class="seeking"><i></i>${esc(t(P.seeking))}</p>
      <div class="links">
        <a class="btn primary" href="#projects">${esc(u.nav[0])}${icon.arrow}</a>
        <a class="btn" href="${P.github}" target="_blank" rel="noopener">${icon.gh}GitHub</a>
        <a class="btn" href="${P.linkedin}" target="_blank" rel="noopener">${icon.in}LinkedIn</a>
        <a class="btn" href="portfolio-${lang}.pdf">${icon.pdf}${esc(u.pdf)}</a>
      </div>
      <dl class="stats">
        <div><dt data-count="${PROJ.length}">${PROJ.length}</dt><dd>${esc(x.stats[0])}</dd></div>
        <div><dt data-count="${done}">${pad(done)}</dt><dd>${esc(x.stats[1])}</dd></div>
        <div><dt data-count="${DOM.length}">${pad(DOM.length)}</dt><dd>${esc(x.stats[2])}</dd></div>
      </dl>`;
    $("#readouts").innerHTML = `<span class="r1">${esc(x.ch1)}</span><span class="r2">${esc(x.ch2)}</span>
      <span class="r3">${PROJ.length} PRJ · ${done} OK · ${DOM.length} DOM</span>`;

    const items = SK.flatMap((g) => g.items);
    $("#marquee").innerHTML = [...items, ...items].map((s) => `<span>${esc(s)}</span>`).join("");

    $("#method").innerHTML = secHead(0) + `<div class="method">` + u.methodItems.map(([h, d], i) => `
      <div class="m-item reveal spot"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${mIcons[i]}</svg>
      <span class="num">${pad(i + 1)}</span><h3>${esc(h)}</h3><p>${esc(d)}</p></div>`).join("") + "</div>";

    const feats = PROJ.filter((p) => p.featured);
    $("#featHead").innerHTML = secHead(1);
    $("#featured").innerHTML = feats.map((p, i) => `
      <article class="feat reveal" data-id="${p.id}">
        <div class="screen spot" data-open="${p.id}" tabindex="0" role="button" aria-label="${esc(t(p.title))}">
          <div class="screen-bar"><span></span><span></span><span></span><em>fig · ${esc(p.id)}</em></div>
          <div class="screen-img">${img(p) ? `<img src="${img(p)}" alt="" loading="lazy">` : ""}</div>
          <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
        </div>
        <div class="feat-body">
          <p class="idx">${pad(i + 1)} <span>/ ${pad(feats.length)}</span></p>
          <div class="meta">${badge(p)}</div>
          <h3>${esc(t(p.title))}</h3>
          <p class="lead">${esc(t(p.tagline))}</p>
          <ul class="results">${p.results.slice(0, 3).map((r) => `<li>${esc(t(r))}</li>`).join("")}</ul>
          <div class="chips">${p.stack.slice(0, 6).map((s) => `<span>${esc(s)}</span>`).join("")}</div>
          <div class="links">
            <button class="btn primary" type="button" data-open="${p.id}">${esc(x.details)}${icon.arrow}</button>
            ${repoLink(p)}
          </div>
        </div>
      </article>`).join("");

    renderFilters();
    renderGrid();

    $("#skills").innerHTML = secHead(3) + `<div class="skills">` + SK.map((g, i) => `
      <div class="skill-group reveal spot"><p class="num">${pad(i + 1)}</p><h3>${esc(t(g))}</h3><div class="chips">${g.items.map((s) => `<span>${esc(s)}</span>`).join("")}</div></div>`).join("") +
      `</div><p class="langs"><strong>${lang === "fr" ? "Langues" : "Languages"}</strong> ${esc(t(P.languages))}</p>`;

    $("#path").innerHTML = secHead(4) + `<ol class="timeline">` + EXP.map((e) => `
      <li class="reveal"><span class="when">${esc(t(e.when))}</span><div><h3>${esc(t(e.title))}</h3><p>${esc(t(e.where))}</p></div></li>`).join("") + "</ol>";

    $("#contact").innerHTML = secHead(5) + `
      <div class="contact-card reveal">
        <p class="big">${esc(x.contactTitle)}</p>
        <p>${esc(u.contactText)}</p>
        <div class="links">
          <a class="btn primary" href="mailto:${P.email}">${icon.mail}${esc(P.email)}</a>
          <a class="btn" href="${P.linkedin}" target="_blank" rel="noopener">${icon.in}LinkedIn</a>
          <a class="btn" href="${P.github}" target="_blank" rel="noopener">${icon.gh}github.com/amine-belkacem</a>
        </div>
      </div>`;

    $("#footer").innerHTML = `<span>© ${new Date().getFullYear()} ${esc(P.name)}</span><span>${esc(u.cvNote)}</span><a href="#top">${esc(x.top)} ↑</a>`;
    renderPrint();
    window.FX.reveal();
    window.FX.countUp($("#heroInner"));
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
    $("#allHead").innerHTML = secHead(2, ` <span class="count">${pad(list.length)}</span>`);
    $("#grid").innerHTML = list.map((p) => `
      <article class="card spot reveal in" data-open="${p.id}" tabindex="0" role="button">
        <div class="card-top"><span class="pid">P-${pad(PROJ.indexOf(p) + 1)}</span><span class="go">${icon.arrow}</span></div>
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
      ${forPrint ? "" : `<button class="x" type="button" data-close aria-label="${esc(u.close)}">${icon.close}</button>`}
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
        ${forPrint ? `<span class="repo-url">${p.repo ? p.repo.replace("https://", "") : esc(u.soon)}</span>` : repoLink(p, "btn primary")}
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
  modal.addEventListener("close", () => {
    if (location.hash.startsWith("#p=")) history.replaceState(null, "", location.pathname + location.search);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-close]")) modal.close();
  });

  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) { domain = chip.dataset.d; renderFilters(); renderGrid(); return; }
    if (e.target.closest("a")) return;
    const el = e.target.closest("[data-open]");
    if (el) openProject(el.dataset.open);
  });
  document.addEventListener("keydown", (e) => {
    const el = e.target.closest && e.target.closest(".card[data-open], .screen[data-open]");
    if (el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openProject(el.dataset.open); }
  });

  $("#langBtn").addEventListener("click", () => {
    lang = lang === "en" ? "fr" : "en";
    store.set("pf.lang", lang);
    const open = modal.open && location.hash.slice(3);
    renderStatic();
    if (open) openProject(open, false);
  });

  const bar = $(".topbar");
  addEventListener("scroll", () => bar.classList.toggle("scrolled", scrollY > 20), { passive: true });

  renderStatic();
  window.FX.init();
  if (location.hash.startsWith("#p=")) openProject(location.hash.slice(3), false);
})();
