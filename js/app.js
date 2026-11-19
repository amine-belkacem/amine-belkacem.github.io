(() => {
  const P = window.PROFILE, PROJ = window.PROJECTS, DOM = window.DOMAINS;
  const ST = window.STATUS, UI = window.UI, EXP = window.EXPERIENCE, SK = window.SKILLS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const headless = navigator.webdriver || /HeadlessChrome/.test(navigator.userAgent);   // PDF build
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const G = window.gsap;
  if (G) G.registerPlugin(ScrollTrigger, Flip);

  const X = {
    en: {
      eyebrow: "embedded systems · fpga · embedded ai",
      roles: ["VHDL on FPGA", "analog front ends in SPICE", "int8 down to ARM NEON", "side-channel security", "AI that fits on a board", "soft-PLCs and real-time Linux"],
      iBuild: "I build", stats: ["projects", "complete", "domains"], details: "Open project", sec: ["Method", "Featured work", "All projects", "Skills", "Path", "Contact"],
      contactTitle: "Got a hardware problem worth measuring?", hint: "drag the cursor · click the chip", search: "Search projects, tools, results…",
      status: { all: "All", done: "Complete", wip: "In progress", early: "Just started" }, empty: "No project matches. Try another word.",
      skillHint: "Click a skill to see the projects that use it.", copy: "Copy e-mail", copied: "E-mail copied", palette: "Jump to a section or a project…",
      palSec: "Sections", palProj: "Projects", palAct: "Actions", actLang: "Passer en français", actPdf: "Download the PDF", actMail: "Copy my e-mail",
      boot: ["MAB-26 boot ROM v2.0", "probing FPGA fabric ........ ok", "loading 25 project modules .. ok", "checking every number ...... measured", "ready"],
      top: "Back to top", cmd: "Search", next: "Next", prev: "Previous", featNote: "Scroll →", cursorOpen: "OPEN", cursorPing: "PING", cursorFilter: "FILTER",
    },
    fr: {
      eyebrow: "systèmes embarqués · fpga · ia embarquée",
      roles: ["du VHDL sur FPGA", "des étages analogiques en SPICE", "de l'int8 jusqu'au NEON", "de la sécurité matérielle", "de l'IA qui tient sur une carte", "des automates sur Linux temps réel"],
      iBuild: "Je conçois", stats: ["projets", "terminés", "domaines"], details: "Voir le projet", sec: ["Méthode", "Projets phares", "Tous les projets", "Compétences", "Parcours", "Contact"],
      contactTitle: "Un problème matériel qui mérite d'être mesuré ?", hint: "bougez la souris · cliquez sur la puce", search: "Chercher un projet, un outil, un résultat…",
      status: { all: "Tous", done: "Terminés", wip: "En cours", early: "Démarrés" }, empty: "Aucun projet ne correspond. Essayez un autre mot.",
      skillHint: "Cliquez sur une compétence pour voir les projets qui l'utilisent.", copy: "Copier l'e-mail", copied: "E-mail copié", palette: "Aller à une section ou un projet…",
      palSec: "Sections", palProj: "Projets", palAct: "Actions", actLang: "Switch to English", actPdf: "Télécharger le PDF", actMail: "Copier mon e-mail",
      boot: ["MAB-26 boot ROM v2.0", "sondage de la matrice FPGA .. ok", "chargement de 25 projets .... ok", "vérification des chiffres ... mesurés", "prêt"],
      top: "Haut de page", cmd: "Chercher", next: "Suivant", prev: "Précédent", featNote: "Défilez →", cursorOpen: "VOIR", cursorPing: "PING", cursorFilter: "FILTRER",
    },
  };

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };
  const params = new URLSearchParams(location.search);
  let lang = params.get("lang") || store.get("pf.lang") || ((navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en");
  if (!UI[lang]) lang = "en";
  const state = { domain: "all", status: "all", q: "", skill: null };

  const t = (o) => (o && typeof o === "object" ? o[lang] ?? o.en : o ?? "");
  const domName = (id) => t(DOM.find((d) => d.id === id));
  const pad = (n) => String(n).padStart(2, "0");
  const IMG = new Set(["aes128-sidechannel-lab", "audio-deepfake-generalization", "autorange-current-profiler", "eurosat-onboard-transfer", "fp8-mac-vhdl", "fraud-detection-alert-budget", "french-bpe-tokenizer", "health-monitor-iot", "home-assistant-weather-station", "int8-neon-inference-pi5", "lunarlander-dqn-vs-ppo", "optimizers-low-precision", "plc-drift-twin", "qt6-uart-fpga-api", "sky130-opamp-sizing-bench", "spam-classic-vs-transformer-edge"]);
  const JPG = new Set(["face-attendance-raspberry-pi", "smart-house-solar-energy"]);
  const img = (p) => (IMG.has(p.id) ? `assets/img/${p.id}.png` : JPG.has(p.id) ? `assets/img/${p.id}.jpg` : null);

  const I = {
    gh: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
    in: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M3 5h18v14H3zM3 6l9 7 9-7"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 3v12m0 0 5-5m-5 5-5-5M4 19h16"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M7 17 17 7M8 7h9v9"/></svg>',
    right: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M5 12h14m-6-6 6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M19 12H5m6-6-6 6 6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M6 6l12 12M18 6 6 18"/></svg>',
    copy: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M8 8h12v12H8zM4 16V4h12"/></svg>',
    hash: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M5 9h14M5 15h14M10 3 8 21M16 3l-2 18"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  };
  const mIcons = ['<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"/>', '<path d="M12 3 3 8v8l9 5 9-5V8zM8 12l3 3 5-6"/>', '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"/>'];

  const badge = (p) => `<span class="badge s-${p.status}"><i></i>${esc(t(ST[p.status]))}</span><span class="stage">${esc(t(p.stage))}</span>`;
  const tags = (p) => p.domains.map((d) => `<span class="tag">${esc(domName(d))}</span>`).join("");
  const repoLink = (p, cls = "btn") => (p.repo
    ? `<a class="${cls}" href="${p.repo}" target="_blank" rel="noopener">${I.gh}${esc(UI[lang].repo)}</a>`
    : `<span class="${cls} disabled">${esc(UI[lang].soon)}</span>`);
  const secHead = (i, extra = "") => `<p class="kicker"><span>${pad(i + 1)}</span><i></i><em>${esc(X[lang].sec[i])}</em></p><h2 class="scramble" data-text="${esc(X[lang].sec[i])}">${esc(X[lang].sec[i])}</h2>${extra}`;
  const split = (s) => { let i = 0; return s.split(" ").map((w) => `<span class="word">${[...w].map((c) => `<span class="ch" style="--i:${i++}">${esc(c)}</span>`).join("")}</span>`).join(" "); };

  /* ================= render ================= */
  function render() {
    const u = UI[lang], x = X[lang];
    document.documentElement.lang = lang;
    const ids = ["projects", "skills", "path", "contact"];
    $("#nav").innerHTML = u.nav.map((n, i) => `<a href="#${ids[i]}" class="magnetic"><span>${pad(i + 1)}</span>${esc(n)}</a>`).join("");
    $("#langBtn").textContent = u.lang; $("#langBtn").title = u.langTitle;
    $("#pdfLink").innerHTML = `${I.pdf}<span>PDF</span>`; $("#pdfLink").href = `portfolio-${lang}.pdf`;
    $("#cmdLabel").textContent = x.cmd;

    const done = PROJ.filter((p) => p.status === "done").length;
    const parts = P.name.split(" ");
    $("#heroInner").innerHTML = `
      <p class="eyebrow"><span class="led"></span>${esc(x.eyebrow)}</p>
      <h1 class="name"><span class="l1">${split(parts.slice(0, -1).join(" "))}</span><span class="l2">${split(parts.at(-1))}</span></h1>
      <p class="roleline">${esc(x.iBuild)} <span class="role" id="role"></span><span class="caret"></span></p>
      <p class="pitch">${esc(t(P.pitch))}</p>
      <div class="links">
        <a class="btn primary magnetic" href="#featured" data-cursor="↓">${esc(u.nav[0])}${I.arrow}</a>
        <a class="btn magnetic" href="${P.github}" target="_blank" rel="noopener">${I.gh}GitHub</a>
        <a class="btn magnetic" href="${P.linkedin}" target="_blank" rel="noopener">${I.in}LinkedIn</a>
        <a class="btn magnetic print-hide" href="portfolio-${lang}.pdf">${I.pdf}${esc(u.pdf)}</a>
      </div>
      <div class="hero-foot">
        <dl class="stats">
          <div><dt data-count="${PROJ.length}">${PROJ.length}</dt><dd>${esc(x.stats[0])}</dd></div>
          <div><dt data-count="${done}">${pad(done)}</dt><dd>${esc(x.stats[1])}</dd></div>
          <div><dt data-count="${DOM.length}">${pad(DOM.length)}</dt><dd>${esc(x.stats[2])}</dd></div>
        </dl>
        <p class="seeking"><i></i><span>${esc(t(P.seeking))}</span></p>
      </div>
      `;
    $("#heroHint").innerHTML = `<span class="ping"></span>${esc(x.hint)}`;

    const skills = SK.flatMap((g) => g.items);
    $("#mq1").innerHTML = [...skills, ...skills].map((s) => `<span>${esc(s)}</span>`).join("");
    const titles = PROJ.map((p) => t(p.title));
    $("#mq2").innerHTML = [...titles, ...titles].map((s) => `<span>${esc(s)}</span>`).join("");

    $("#method").innerHTML = secHead(0) + `<div class="method"><svg class="wire" preserveAspectRatio="none" viewBox="0 0 1000 10" aria-hidden="true"><path d="M0 5H1000"/></svg>` +
      u.methodItems.map(([h, d], i) => `<div class="m-item rv tilt spot"><div class="m-ic"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${mIcons[i]}</svg></div><span class="num">${pad(i + 1)}</span><h3>${esc(h)}</h3><p>${esc(d)}</p></div>`).join("") + "</div>";

    const feats = PROJ.filter((p) => p.featured);
    $("#featHead").innerHTML = secHead(1, `<p class="hs-note">${esc(x.featNote)}</p>`);
    $("#hsTrack").innerHTML = feats.map((p, i) => `
      <article class="panel" data-open="${p.id}" data-cursor="${esc(x.cursorOpen)}">
        <div class="panel-media tilt">
          <div class="screen-bar"><span></span><span></span><span></span><em>fig · ${esc(p.id)}</em></div>
          <div class="screen-img">${img(p) ? `<img src="${img(p)}" alt="" loading="lazy">` : ""}</div>
          <div class="scan"></div>
        </div>
        <div class="panel-body">
          <p class="idx">${pad(i + 1)}<span>/${pad(feats.length)}</span></p>
          <div class="meta">${badge(p)}</div>
          <h3>${esc(t(p.title))}</h3>
          <p class="headline">${esc(t(p.results[0]))}</p>
          <div class="chips">${p.stack.slice(0, 5).map((s) => `<span>${esc(s)}</span>`).join("")}</div>
          <span class="btn primary">${esc(x.details)}${I.arrow}</span>
        </div>
      </article>`).join("");
    $("#hsCount").textContent = `01 / ${pad(feats.length)}`;

    $("#allHead").innerHTML = secHead(2, `<span class="count" id="count"></span>`);
    $("#search").placeholder = x.search; $("#search").value = state.skill || state.q;
    $("#statusSeg").innerHTML = ["all", "done", "wip", "early"].map((s) => `<button type="button" data-s="${s}" class="${state.status === s ? "on" : ""}">${esc(x.status[s])}</button>`).join("");
    $("#empty").textContent = x.empty;
    renderFilters(); renderGrid(false);

    const used = (s) => PROJ.filter((p) => usesSkill(p, s)).length;
    $("#skills").innerHTML = secHead(3, `<p class="sec-sub">${esc(x.skillHint)}</p>`) + `<div class="skills">` + SK.map((g, i) => `
      <div class="skill-group rv spot"><p class="num">${pad(i + 1)}</p><h3>${esc(t(g))}</h3>
      <div class="chips">${g.items.map((s) => { const n = used(s); return `<button type="button" class="sk" data-skill="${esc(s)}" data-cursor="${esc(x.cursorFilter)}"${n ? "" : " disabled"}>${esc(s)}${n ? `<small>${n}</small>` : ""}</button>`; }).join("")}</div></div>`).join("") +
      `</div><p class="langs"><strong>${lang === "fr" ? "Langues" : "Languages"}</strong> ${esc(t(P.languages))}</p>`;

    $("#path").innerHTML = secHead(4) + `<ol class="timeline"><span class="tl-line"><i></i></span>` + EXP.map((e) => `
      <li class="rv"><span class="when">${esc(t(e.when))}</span><div class="tl-card spot"><h3>${esc(t(e.title))}</h3><p>${esc(t(e.where))}</p></div></li>`).join("") + "</ol>";

    $("#contact").innerHTML = secHead(5) + `
      <div class="contact-card spot">
        <p class="big">${x.contactTitle.split(" ").map((w) => `<span class="w"><span>${esc(w)}</span></span>`).join(" ")}</p>
        <p class="sub">${esc(u.contactText)}</p>
        <div class="links">
          <a class="btn primary magnetic" href="mailto:${P.email}">${I.mail}${esc(P.email)}</a>
          <button class="btn magnetic" type="button" id="copyMail">${I.copy}${esc(x.copy)}</button>
          <a class="btn magnetic" href="${P.linkedin}" target="_blank" rel="noopener">${I.in}LinkedIn</a>
          <a class="btn magnetic" href="${P.github}" target="_blank" rel="noopener">${I.gh}GitHub</a>
        </div>
        <div class="orbit" aria-hidden="true"><i></i><i></i><i></i></div>
      </div>`;
    $("#footer").innerHTML = `<span>© ${new Date().getFullYear()} ${esc(P.name)}</span><span>${esc(u.cvNote)}</span><a href="#top">${esc(x.top)} ↑</a>`;
    renderPrint();
  }

  /* a skill label like "C / C++" or "UART · SPI · I2C" matches a project's tool list exactly, not by loose substring */
  function usesSkill(p, skill) {
    const alts = skill.toLowerCase().split(/\s*[/·]\s*/).filter(Boolean);
    const re = (a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return p.stack.some((raw) => {
      const s = raw.toLowerCase();
      const word = (hay, n) => new RegExp(`(^|[^a-z0-9+])${re(n)}\\d*($|[^a-z0-9+])`).test(hay);
      return alts.some((a) => (a.length <= 3 ? new RegExp(`^${re(a)}\\d*$`).test(s) : word(s, a) || (s.length > 3 && word(a, s))));
    });
  }
  function matches(p) {
    if (state.domain !== "all" && !p.domains.includes(state.domain)) return false;
    if (state.status !== "all" && p.status !== state.status) return false;
    if (state.skill) return usesSkill(p, state.skill);
    if (!state.q) return true;
    const hay = [t(p.title), t(p.tagline), p.stack.join(" "), p.domains.map(domName).join(" "), ...p.results.map(t), p.id].join(" ").toLowerCase();
    return state.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }
  function renderFilters() {
    const u = UI[lang];
    const n = (id) => PROJ.filter((p) => id === "all" || p.domains.includes(id)).length;
    $("#filters").innerHTML = [{ id: "all", en: u.allDomains, fr: u.allDomains }, ...DOM]
      .map((d) => `<button type="button" class="chip${d.id === state.domain ? " on" : ""}" data-d="${d.id}" aria-pressed="${d.id === state.domain}">${esc(t(d))}<small>${n(d.id)}</small></button>`).join("");
  }
  function cardHTML(p) {
    return `<article class="card spot tilt" data-id="${p.id}" data-open="${p.id}" tabindex="0" role="button" data-cursor="${esc(X[lang].cursorOpen)}">
      <div class="card-top"><span class="pid">P-${pad(PROJ.indexOf(p) + 1)}</span><span class="go">${I.arrow}</span></div>
      <div class="meta">${badge(p)}</div>
      <h3>${esc(t(p.title))}</h3>
      <p>${esc(t(p.tagline))}</p>
      <div class="card-foot"><div class="tags">${tags(p)}</div>${p.year ? `<span class="year">${esc(p.year)}</span>` : ""}</div>
    </article>`;
  }
  function renderGrid(animate = true) {
    const grid = $("#grid");
    const order = { done: 0, wip: 1, early: 2 };
    const list = PROJ.filter(matches).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || order[a.status] - order[b.status]);
    const flipState = animate && G && !reduce ? Flip.getState($$(".card", grid)) : null;
    const existing = new Map($$(".card", grid).map((c) => [c.dataset.id, c]));
    const frag = document.createDocumentFragment();
    for (const p of list) {
      let c = existing.get(p.id);
      if (!c) { const tmp = document.createElement("div"); tmp.innerHTML = cardHTML(p); c = tmp.firstElementChild; }
      frag.appendChild(c); existing.delete(p.id);
    }
    existing.forEach((c) => c.remove());
    grid.appendChild(frag);
    $("#count") && ($("#count").textContent = `${pad(list.length)} / ${PROJ.length}`);
    $("#empty").hidden = list.length > 0;
    if (flipState) {
      Flip.from(flipState, { duration: 0.6, ease: "power3.inOut", absolute: true, stagger: 0.015,
        onEnter: (els) => G.fromTo(els, { opacity: 0, scale: 0.9, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.03 }),
        onLeave: (els) => G.to(els, { opacity: 0, scale: 0.9, duration: 0.3 }) });
    }
    ScrollTrigger && ScrollTrigger.refresh && setTimeout(() => ScrollTrigger.refresh(), 650);
  }

  function detail(p, forPrint = false) {
    const u = UI[lang], pic = img(p);
    const idx = PROJ.indexOf(p);
    return `
      ${forPrint ? "" : `<div class="m-nav"><button class="icon-btn" type="button" data-step="-1" aria-label="${esc(X[lang].prev)}">${I.left}</button><span class="pid">P-${pad(idx + 1)} / ${PROJ.length}</span><button class="icon-btn" type="button" data-step="1" aria-label="${esc(X[lang].next)}">${I.right}</button><button class="icon-btn" type="button" data-close aria-label="${esc(u.close)}">${I.close}</button></div>`}
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
        ${forPrint ? "" : `<span class="kbd-hint"><kbd>←</kbd><kbd>→</kbd> <kbd>Esc</kbd></span>`}
      </div>`;
  }
  function renderPrint() {
    const u = UI[lang];
    $("#printList").innerHTML = `<h2>${esc(u.all)}</h2>` + DOM.map((d) => {
      const ps = PROJ.filter((p) => p.domains[0] === d.id);
      return ps.length ? `<h3 class="print-dom">${esc(t(d))}</h3>` + ps.map((p) => `<article class="print-item">${detail(p, true)}</article>`).join("") : "";
    }).join("");
  }

  /* ================= motion ================= */
  let ctx = null, roleTimer = null;
  function animate() {
    if (ctx) ctx.revert();
    clearInterval(roleTimer);
    startRoles();
    countUp();
    if (!G || reduce) { $$(".rv").forEach((e) => (e.style.opacity = 1)); return; }
    ctx = G.context(() => {
      // reveal on scroll
      ScrollTrigger.batch(".rv", { start: "top 88%", onEnter: (els) => G.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.08, overwrite: true }) });
      G.set(".rv", { opacity: 0 });
      // scramble headings
      $$(".scramble").forEach((h) => ScrollTrigger.create({ trigger: h, start: "top 85%", once: true, onEnter: () => scramble(h) }));
      // method wire draws through the cards
      const wire = $(".wire path");
      if (wire) G.fromTo(wire, { strokeDashoffset: 1000 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".method", start: "top 80%", end: "bottom 50%", scrub: true } });
      // timeline line
      G.fromTo(".tl-line i", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 75%", end: "bottom 60%", scrub: true } });
      $$(".timeline li").forEach((li) => ScrollTrigger.create({ trigger: li, start: "top 70%", toggleClass: "lit" }));
      // contact words
      G.from(".contact-card .w > span", { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.05, scrollTrigger: { trigger: ".contact-card", start: "top 80%" } });
      // marquee speed follows scroll velocity
      const mq = [G.to("#mq1", { xPercent: -50, duration: 70, ease: "none", repeat: -1 }), G.fromTo("#mq2", { xPercent: -50 }, { xPercent: 0, duration: 90, ease: "none", repeat: -1 })];
      ScrollTrigger.create({ onUpdate: (s) => { const v = 1 + Math.min(6, Math.abs(s.getVelocity()) / 400); mq.forEach((m) => G.to(m, { timeScale: v, duration: 0.2, overwrite: true, onComplete: () => G.to(m, { timeScale: 1, duration: 1.2 }) })); } });
      // horizontal featured gallery (desktop)
      const mm = G.matchMedia();
      mm.add("(min-width: 900px)", () => {
        const track = $("#hsTrack");
        const dist = () => track.scrollWidth - innerWidth + 64;
        const tween = G.to(track, { x: () => -dist(), ease: "none", scrollTrigger: {
          trigger: "#featured", pin: "#hsPin", start: "top top", end: () => `+=${dist()}`, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (s) => { $("#hsBar").style.transform = `scaleX(${s.progress})`; const n = $$(".panel").length; $("#hsCount").textContent = `${pad(Math.min(n, 1 + Math.floor(s.progress * n * 0.999)))} / ${pad(n)}`; },
        } });
        $$(".panel").forEach((pnl) => G.fromTo(pnl.querySelector(".panel-media"), { scale: 0.86, rotateY: -14 }, { scale: 1, rotateY: 0, ease: "none", scrollTrigger: { trigger: pnl, containerAnimation: tween, start: "left 100%", end: "left 35%", scrub: true } }));
      });
      // hero parallax out
      G.to("#heroInner", { y: -120, opacity: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
    });
  }
  function introHero() {
    if (!G || reduce) return;
    const tl = G.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".name .ch", { yPercent: 120, rotate: 8, opacity: 0, duration: 1, stagger: 0.025 })
      .from(".eyebrow, .roleline", { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, 0.2)
      .from(".pitch, .hero-inner .links .btn, .hero-foot > *", { y: 24, opacity: 0, duration: 0.8, stagger: 0.06 }, 0.45)
      .from(".hero-hint, .scroll-cue", { opacity: 0, duration: 1 }, 1);
  }
  const GLYPHS = "01<>/\\[]{}#$%&*+=?ABCDEFGHJKLMNPQRSTUVWXYZ";
  function scramble(el) {
    const text = el.dataset.text || el.textContent; if (reduce) return;
    let f = 0; const total = 22;
    const run = () => {
      el.textContent = [...text].map((c, i) => (c === " " || i < (f / total) * text.length) ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join("");
      if (++f <= total) requestAnimationFrame(run); else el.textContent = text;
    };
    run();
  }
  function startRoles() {
    const el = $("#role"); if (!el) return;
    const roles = X[lang].roles, gen = (startRoles.gen = (startRoles.gen || 0) + 1);
    let i = 0, c = 0, del = false;
    if (reduce) { el.textContent = roles[0]; return; }
    const tick = () => {
      if (gen !== startRoles.gen) return;           // a newer run (language switch) took over
      const r = roles[i];
      let wait = del ? 22 : 55;
      if (!del) { el.textContent = r.slice(0, ++c); if (c === r.length) { del = true; wait = 1700; } }
      else { el.textContent = r.slice(0, --c); if (c === 0) { del = false; i = (i + 1) % roles.length; wait = 300; } }
      setTimeout(tick, wait);
    };
    tick();
  }
  let counters = [];
  function countUp() {
    counters.forEach((c) => c.kill()); counters = [];
    $$("[data-count]").forEach((el) => {
      const to = +el.dataset.count, fin = () => (el.textContent = pad(to));
      if (!G || reduce || headless || matchMedia("print").matches) return fin();
      const o = { v: 0 };
      counters.push(G.to(o, { v: to, duration: 1.6, delay: 0.6, ease: "power3.out", onUpdate: () => (el.textContent = pad(Math.round(o.v))), onComplete: fin }));
    });
  }
  addEventListener("beforeprint", () => { counters.forEach((c) => c.kill()); $$("[data-count]").forEach((el) => (el.textContent = pad(+el.dataset.count))); });

  /* ================= cursor, magnetic, tilt ================= */
  function pointerFx() {
    const cur = $("#cursor"), dot = $("#cursorDot"), lab = $("#cursorLabel");
    if (!fine) { cur.remove(); dot.remove(); return; }
    document.body.classList.add("has-cursor");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      const spot = e.target.closest && e.target.closest(".spot");
      if (spot) { const r = spot.getBoundingClientRect(); spot.style.setProperty("--mx", `${mx - r.left}px`); spot.style.setProperty("--my", `${my - r.top}px`); }
      const tl = e.target.closest && e.target.closest(".tilt");
      if (tl && !reduce) { const r = tl.getBoundingClientRect(); const ry = ((mx - r.left) / r.width - 0.5) * 10, rx = -((my - r.top) / r.height - 0.5) * 8; tl.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`; }
      const lbl = e.target.closest && e.target.closest("[data-cursor]");
      const act = e.target.closest && e.target.closest("a, button, [data-open], input, label");
      cur.classList.toggle("label", !!lbl); cur.classList.toggle("act", !!act && !lbl);
      if (lbl) lab.textContent = lbl.dataset.cursor;
    }, { passive: true });
    addEventListener("pointerout", (e) => { const tl = e.target.closest && e.target.closest(".tilt"); if (tl && !tl.contains(e.relatedTarget)) tl.style.transform = ""; });
    addEventListener("chiphover", (e) => { cur.classList.toggle("label", e.detail); lab.textContent = X[lang].cursorPing; document.body.classList.toggle("chip-hot", e.detail); });
    addEventListener("pointerdown", () => cur.classList.add("down")); addEventListener("pointerup", () => cur.classList.remove("down"));
    document.addEventListener("mouseleave", () => cur.classList.add("gone")); document.addEventListener("mouseenter", () => cur.classList.remove("gone"));
    const loop = () => { cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18; cur.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); };
    loop();
    // magnetic buttons
    document.addEventListener("pointermove", (e) => {
      $$(".magnetic").forEach((m) => {
        const r = m.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy), R = Math.max(r.width, r.height) * 0.9;
        m.style.transform = d < R && !reduce ? `translate(${dx * 0.25}px, ${dy * 0.3}px)` : "";
      });
    }, { passive: true });
  }

  /* ================= modal ================= */
  const modal = $("#modal");
  let current = null;
  function openProject(id, from) {
    const p = PROJ.find((q) => q.id === id); if (!p) return;
    current = id;
    $("#modalBody").innerHTML = detail(p);
    if (!modal.open) {
      modal.showModal();
      if (G && !reduce) {
        const r = from && from.getBoundingClientRect(), m = modal.getBoundingClientRect();
        const vars = r ? { x: r.left + r.width / 2 - (m.left + m.width / 2), y: r.top + r.height / 2 - (m.top + m.height / 2), scale: 0.4 } : { y: 30, scale: 0.96 };
        G.fromTo(modal, { ...vars, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.55, ease: "expo.out" });
      }
    } else if (G && !reduce) {
      G.fromTo("#modalBody > *", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.02 });
    }
    modal.scrollTop = 0;
    history.replaceState(null, "", `#p=${id}`);
  }
  function step(d) { const i = PROJ.findIndex((p) => p.id === current); openProject(PROJ[(i + d + PROJ.length) % PROJ.length].id); }
  modal.addEventListener("close", () => { current = null; if (location.hash.startsWith("#p=")) history.replaceState(null, "", location.pathname + location.search); });
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-close]")) return modal.close();
    const s = e.target.closest("[data-step]"); if (s) step(+s.dataset.step);
  });

  /* ================= command palette ================= */
  const pal = $("#palette"), palIn = $("#palInput"), palList = $("#palList");
  let palItems = [], palSel = 0;
  function palData() {
    const x = X[lang], u = UI[lang];
    const secs = [["method", x.sec[0]], ["featured", x.sec[1]], ["projects", x.sec[2]], ["skills", x.sec[3]], ["path", x.sec[4]], ["contact", x.sec[5]]];
    return [
      ...secs.map(([id, n]) => ({ g: x.palSec, icon: I.hash, label: n, run: () => document.getElementById(id).scrollIntoView({ behavior: reduce ? "auto" : "smooth" }) })),
      ...PROJ.map((p) => ({ g: x.palProj, icon: I.arrow, label: t(p.title), sub: t(ST[p.status]), key: p.stack.join(" ") + " " + p.id, run: () => openProject(p.id) })),
      { g: x.palAct, icon: I.bolt, label: x.actLang, run: toggleLang },
      { g: x.palAct, icon: I.pdf, label: x.actPdf, run: () => (location.href = `portfolio-${lang}.pdf`) },
      { g: x.palAct, icon: I.copy, label: x.actMail, run: copyMail },
      { g: x.palAct, icon: I.gh, label: "GitHub", run: () => open(P.github, "_blank", "noopener") },
      { g: x.palAct, icon: I.in, label: "LinkedIn", run: () => open(P.linkedin, "_blank", "noopener") },
    ].concat([]).map((it) => ({ ...it, u }));
  }
  function palRender() {
    const q = palIn.value.trim().toLowerCase();
    palItems = palData().filter((it) => !q || (it.label + " " + (it.key || "") + " " + (it.sub || "")).toLowerCase().includes(q)).slice(0, 40);
    palSel = Math.min(palSel, Math.max(0, palItems.length - 1));
    let g = "";
    palList.innerHTML = palItems.map((it, i) => {
      const head = it.g !== g ? `<li class="pal-g">${esc((g = it.g))}</li>` : "";
      return `${head}<li class="pal-it${i === palSel ? " sel" : ""}" data-i="${i}" role="option">${it.icon}<span>${esc(it.label)}</span>${it.sub ? `<em>${esc(it.sub)}</em>` : ""}</li>`;
    }).join("") || `<li class="pal-g">${esc(X[lang].empty)}</li>`;
    const sel = $(".pal-it.sel", palList); sel && sel.scrollIntoView({ block: "nearest" });
  }
  function palOpen() { if (modal.open) modal.close(); palIn.value = ""; palSel = 0; palIn.placeholder = X[lang].palette; palRender(); pal.showModal(); palIn.focus(); }
  function palRun(i) { const it = palItems[i]; if (!it) return; pal.close(); setTimeout(it.run, 60); }
  palIn.addEventListener("input", () => { palSel = 0; palRender(); });
  palIn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); palSel = Math.min(palItems.length - 1, palSel + 1); palRender(); }
    if (e.key === "ArrowUp") { e.preventDefault(); palSel = Math.max(0, palSel - 1); palRender(); }
    if (e.key === "Enter") { e.preventDefault(); palRun(palSel); }
  });
  palList.addEventListener("click", (e) => { const li = e.target.closest(".pal-it"); if (li) palRun(+li.dataset.i); });
  pal.addEventListener("click", (e) => { if (e.target === pal) pal.close(); });
  $("#cmdBtn").addEventListener("click", palOpen);

  /* ================= misc actions ================= */
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 1800); }
  async function copyMail() { try { await navigator.clipboard.writeText(P.email); toast(X[lang].copied); } catch { location.href = `mailto:${P.email}`; } }
  function toggleLang() {
    lang = lang === "en" ? "fr" : "en"; store.set("pf.lang", lang);
    const open = current; if (modal.open) modal.close();
    render(); animate(); ScrollTrigger && ScrollTrigger.refresh();
    if (open) openProject(open);
  }

  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) { state.domain = chip.dataset.d; renderFilters(); renderGrid(); return; }
    const seg = e.target.closest("#statusSeg button");
    if (seg) { state.status = seg.dataset.s; $$("#statusSeg button").forEach((b) => b.classList.toggle("on", b === seg)); renderGrid(); return; }
    const sk = e.target.closest(".sk");
    if (sk) {
      state.skill = sk.dataset.skill; state.q = ""; state.domain = "all"; state.status = "all";
      $("#search").value = state.skill; $(".search").classList.add("skill-on"); renderFilters(); $$("#statusSeg button").forEach((b) => b.classList.toggle("on", b.dataset.s === "all"));
      document.getElementById("projects").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      setTimeout(() => renderGrid(), 450); return;
    }
    if (e.target.closest("#copyMail")) return copyMail();
    if (e.target.closest("a")) return;
    const el = e.target.closest("[data-open]");
    if (el) openProject(el.dataset.open, el);
  });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.open ? pal.close() : palOpen(); return; }
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName) && !pal.open) { e.preventDefault(); palOpen(); return; }
    if (modal.open && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { step(e.key === "ArrowRight" ? 1 : -1); return; }
    const el = e.target.closest && e.target.closest(".card[data-open]");
    if (el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openProject(el.dataset.open, el); }
  });
  let st; $("#search").addEventListener("input", (e) => {
    if (state.skill) { state.skill = null; $(".search").classList.remove("skill-on"); }
    clearTimeout(st); st = setTimeout(() => { state.q = e.target.value.trim(); renderGrid(); }, 140);
  });
  $("#searchClear").addEventListener("click", () => { $("#search").value = ""; state.q = ""; state.skill = null; $(".search").classList.remove("skill-on"); renderGrid(); });
  $("#langBtn").addEventListener("click", toggleLang);

  const bar = $("#topbar"), prog = $("#progress");
  addEventListener("scroll", () => {
    bar.classList.toggle("scrolled", scrollY > 20);
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  }, { passive: true });

  /* ================= boot ================= */
  function boot(done) {
    const el = $("#boot"), log = $("#bootLog"), barI = $("#bootBar");
    let seen = false; try { seen = sessionStorage.getItem("pf.boot") === "1"; sessionStorage.setItem("pf.boot", "1"); } catch { /* ignore */ }
    if (seen || reduce || !G || headless || params.has("noboot")) { el.remove(); document.body.classList.remove("booting"); return done(); }
    const lines = X[lang].boot; let i = 0;
    const next = () => {
      if (i < lines.length) { log.insertAdjacentHTML("beforeend", `<p><span>[${(0.12 * (i + 1)).toFixed(3)}]</span> ${esc(lines[i])}</p>`); barI.style.transform = `scaleX(${(i + 1) / lines.length})`; i++; setTimeout(next, 190); }
      else {
        G.to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.8, ease: "expo.inOut", onComplete: () => el.remove() });
        document.body.classList.remove("booting"); setTimeout(done, 250);
      }
    };
    el.addEventListener("click", () => { i = lines.length; });
    next();
  }

  render();
  pointerFx();
  boot(() => { introHero(); animate(); if (location.hash.startsWith("#p=")) openProject(location.hash.slice(3)); });
})();
