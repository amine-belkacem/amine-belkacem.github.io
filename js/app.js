/* Portfolio V3: renders the page from js/data.js, then adds motion (GSAP), then the 3D hero (js/scene.min.js).
   Order matters for speed: text first, animations second, 3D last (after the first interaction or when idle). */
(() => {
  const P = window.PROFILE, PROJ = window.PROJECTS, DOM = window.DOMAINS;
  const ST = window.STATUS, UI = window.UI, EXP = window.EXPERIENCE, SK = window.SKILLS;
  const PUBS = window.PUBLICATIONS || [], POSTS = window.POSTS || [], DEMOS = window.DEMOS || [];
  const SITE = window.SITE || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const root = document.documentElement;
  const headless = navigator.webdriver || /HeadlessChrome|Lighthouse/.test(navigator.userAgent);
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  /* "full" = every effect; "calm" = gentle fades, slower 3D, no tilt/cursor/parallax (default when the OS asks for less motion) */
  const motion = root.dataset.motion === "calm" ? "calm" : "full";
  const full = motion === "full";
  let G = null;   // GSAP, available once its deferred script has run

  const X = {
    en: {
      eyebrow: "embedded systems · fpga · embedded ai",
      roles: ["VHDL on FPGA", "analog front ends in SPICE", "int8 down to ARM NEON", "side-channel security", "AI that fits on a board", "soft-PLCs and real-time Linux"],
      iBuild: "I build", stats: ["projects", "complete", "domains"], details: "Open project",
      sec: ["Method", "Featured work", "All projects", "Writing & demos", "Skills", "Path", "Reports & theses", "Contact"],
      contactTitle: "Got a hardware problem worth measuring?", hint: "move the mouse · click the chip", search: "Search projects, tools, results…",
      status: { all: "All", done: "Complete", wip: "In progress", early: "Just started" }, empty: "No project matches. Try another word.",
      skillHint: "Click a skill to see the projects that use it.", copy: "Copy e-mail", copied: "E-mail copied", palette: "Jump to a section, a project or an article…",
      palSec: "Sections", palProj: "Projects", palPost: "Articles & demos", palAct: "Actions", actLang: "Passer en français", actPdf: "Download the PDF", actMail: "Copy my e-mail",
      top: "Back to top", cmd: "Search", next: "Next", prev: "Previous", featHint: "Drag, swipe or Shift + scroll to browse sideways. The mouse wheel keeps going down the page.",
      cursorOpen: "OPEN", cursorPing: "PING", cursorFilter: "FILTER",
      book: "Book a 15min to 1H call", bookMailSubject: "Internship: 15minute to 1H call", cv: "CV", cvTitle: "Printable CV",
      sheet: { problem: "Problem", constraint: "Constraint", result: "Key result", tools: "Tools", period: "Period", state: "State" },
      articles: "Articles", demos: "Live demos", read: "Read", tryIt: "Try it", minRead: (n) => `${n} min read`,
      writingSub: "Short write-ups of what I learned while measuring, and two projects you can play with in the browser.",
      pubsSub: "The written side of the projects. The list grows with each report.", open: "Open",
      updated: "Updated", lighthouse: "Lighthouse", lhMobile: "phone", motionFull: "Animations: full (click for calm)", motionCalm: "Animations: calm (click for full)",
      tabs: ["Work", "Projects", "Articles", "Contact", "CV"], skip: "Skip to content",
    },
    fr: {
      eyebrow: "systèmes embarqués · fpga · ia embarquée",
      roles: ["du VHDL sur FPGA", "des étages analogiques en SPICE", "de l'int8 jusqu'au NEON", "de la sécurité matérielle", "de l'IA qui tient sur une carte", "des automates sur Linux temps réel"],
      iBuild: "Je conçois", stats: ["projets", "terminés", "domaines"], details: "Voir le projet",
      sec: ["Méthode", "Projets phares", "Tous les projets", "Articles & démos", "Compétences", "Parcours", "Rapports & mémoires", "Contact"],
      contactTitle: "Un problème matériel qui mérite d'être mesuré ?", hint: "bougez la souris · cliquez sur la puce", search: "Chercher un projet, un outil, un résultat…",
      status: { all: "Tous", done: "Terminés", wip: "En cours", early: "Démarrés" }, empty: "Aucun projet ne correspond. Essayez un autre mot.",
      skillHint: "Cliquez sur une compétence pour voir les projets qui l'utilisent.", copy: "Copier l'e-mail", copied: "E-mail copié", palette: "Aller à une section, un projet ou un article…",
      palSec: "Sections", palProj: "Projets", palPost: "Articles & démos", palAct: "Actions", actLang: "Switch to English", actPdf: "Télécharger le PDF", actMail: "Copier mon e-mail",
      top: "Haut de page", cmd: "Chercher", next: "Suivant", prev: "Précédent", featHint: "Glissez, balayez ou Maj + molette pour parcourir. La molette seule continue la page.",
      cursorOpen: "VOIR", cursorPing: "PING", cursorFilter: "FILTRER",
      book: "Prendre rendez-vous (15 min à 1H)", bookMailSubject: "Stage : échange de 15 minutes à 1H", cv: "CV", cvTitle: "CV imprimable",
      sheet: { problem: "Problème", constraint: "Contrainte", result: "Résultat clé", tools: "Outils", period: "Période", state: "État" },
      articles: "Articles", demos: "Démos en direct", read: "Lire", tryIt: "Essayer", minRead: (n) => `${n} min de lecture`,
      writingSub: "De courts articles sur ce que j'ai appris en mesurant, et deux projets à manipuler dans le navigateur.",
      pubsSub: "Le côté écrit des projets. La liste s'allonge à chaque rapport.", open: "Ouvrir",
      updated: "Mis à jour le", lighthouse: "Lighthouse", lhMobile: "mobile", motionFull: "Animations : complètes (cliquez pour calmes)", motionCalm: "Animations : calmes (cliquez pour complètes)",
      tabs: ["Phares", "Projets", "Articles", "Contact", "CV"], skip: "Aller au contenu",
    },
  };

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };
  const params = new URLSearchParams(location.search);
  let lang = params.get("lang") || store.get("pf.lang") || ((navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en");
  if (!UI[lang]) lang = "en";
  const state = { domain: "all", status: "all", q: "", skill: null, expanded: false };

  const t = (o) => (o && typeof o === "object" ? o[lang] ?? o.en : o ?? "");
  const domName = (id) => t(DOM.find((d) => d.id === id));
  const pad = (n) => String(n).padStart(2, "0");
  /* figure size (px) so the browser reserves the space before the image arrives */
  const DIMS = {"aes128-sidechannel-lab": [960, 432], "audio-deepfake-generalization": [960, 489], "autorange-current-profiler": [960, 538], "eurosat-onboard-transfer": [960, 384], "fp8-mac-vhdl": [659, 510], "fraud-detection-alert-budget": [960, 375], "french-bpe-tokenizer": [960, 390], "health-monitor-iot": [960, 468], "home-assistant-weather-station": [960, 540], "int8-neon-inference-pi5": [960, 368], "lunarlander-dqn-vs-ppo": [960, 551], "optimizers-low-precision": [960, 780], "plc-drift-twin": [960, 900], "qt6-uart-fpga-api": [960, 232], "sky130-opamp-sizing-bench": [960, 461], "smart-house-solar-energy": [905, 861], "spam-classic-vs-transformer-edge": [960, 320]};
  const img = (p) => (DIMS[p.id] ? `assets/img/${p.id}.webp` : null);
  const imgTag = (p, alt = "", lazy = true) => {
    const d = DIMS[p.id]; if (!d) return "";
    // 480 px version for phones, full 960 px elsewhere
    const set = d[0] > 480 ? ` srcset="assets/img/${p.id}-480.webp 480w, assets/img/${p.id}.webp ${d[0]}w" sizes="(max-width: 899px) 92vw, 600px"` : "";
    return `<img src="assets/img/${p.id}.webp"${set} alt="${esc(alt)}" width="${d[0]}" height="${d[1]}"${lazy ? ' loading="lazy"' : ""} decoding="async">`;
  };
  const fmtDate = (iso) => { try { return new Date(iso + "T12:00:00").toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" }); } catch { return iso; } };
  const bookingHref = () => P.booking || `mailto:${P.email}?subject=${encodeURIComponent(X[lang].bookMailSubject)}`;

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
    cal: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5"/></svg>',
    doc: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',
    spark: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
    star: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3 9.5l6.1-.9z"/></svg>',
    grid: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>',
    pen: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
    chat: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 5h16v11H9l-5 4z"/></svg>',
    file: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M6 3h9l4 4v14H6zM14 3v5h5"/></svg>',
  };
  const mIcons = ['<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"/>', '<path d="M12 3 3 8v8l9 5 9-5V8zM8 12l3 3 5-6"/>', '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"/>'];

  const badge = (p) => `<span class="badge s-${p.status}"><i></i>${esc(t(ST[p.status]))}</span><span class="stage">${esc(t(p.stage))}</span>`;
  const tags = (p) => p.domains.map((d) => `<span class="tag">${esc(domName(d))}</span>`).join("");
  const repoLink = (p, cls = "btn") => (p.repo
    ? `<a class="${cls}" href="${p.repo}" target="_blank" rel="noopener">${I.gh}${esc(UI[lang].repo)}</a>`
    : `<span class="${cls} disabled">${esc(UI[lang].soon)}</span>`);
  const secHead = (i, extra = "") => `<p class="kicker"><span>${pad(i + 1)}</span><i></i><em>${esc(X[lang].sec[i])}</em></p><h2 class="scramble" data-text="${esc(X[lang].sec[i])}">${esc(X[lang].sec[i])}</h2>${extra}`;
  const split = (s) => { let i = 0; return s.split(" ").map((w) => `<span class="word">${[...w].map((c) => `<span class="ch" style="--i:${i++}">${esc(c)}</span>`).join("")}</span>`).join(" "); };

  /* the datasheet table at the top of every project */
  const sheet = (p, compact = false) => {
    const s = X[lang].sheet;
    const rows = [
      [s.problem, t(p.problem)],
      [s.constraint, t(p.constraint)],
      [s.result, t(p.results[0])],
      [s.tools, p.stack.join(" · ")],
      [s.period, t(p.period)],
      [s.state, `${t(ST[p.status])} · ${t(p.stage)}`],
    ].filter(([, v]) => v);
    return `<table class="sheet${compact ? " compact" : ""}"><caption class="sr">Datasheet</caption><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>`;
  };

  /* ================= render ================= */
  function render() {
    const u = UI[lang], x = X[lang];
    root.lang = lang;
    $(".skip").textContent = x.skip;
    const navIds = [["featured", x.sec[1]], ["projects", x.sec[2]], ["writing", x.sec[3]], ["skills", x.sec[4]], ["contact", x.sec[7]]];
    $("#nav").innerHTML = navIds.map(([id, n], i) => `<a href="#${id}" class="magnetic"><span>${pad(i + 1)}</span>${esc(n)}</a>`).join("");
    $("#langBtn").textContent = u.lang; $("#langBtn").setAttribute("aria-label", `${u.lang}, ${u.langTitle}`); $("#langBtn").title = u.langTitle;
    $("#pdfLink").innerHTML = `${I.pdf}<span>PDF</span>`; $("#pdfLink").href = `portfolio-${lang}.pdf`;
    $("#cmdLabel").textContent = x.cmd; $("#cmdBtn").setAttribute("aria-label", `${x.cmd} (Ctrl K)`);
    const mt = full ? x.motionFull : x.motionCalm;
    $("#motionBtn").innerHTML = `${I.spark}<span class="sr">${esc(mt)}</span>`; $("#motionBtn").title = mt; $("#motionBtn").classList.toggle("calm", !full);

    const done = PROJ.filter((p) => p.status === "done").length;
    const parts = P.name.split(" ");
    // first load: keep the pre-rendered hero nodes (already painted), only drop the other language.
    // Re-creating identical nodes would count as a new, later "largest paint" for the browser.
    const pre = !params.has("prerender") && $(`#heroInner .pre[data-l="${lang}"]`);
    if (pre) {
      // the wrapper stays (display: contents); moving its children would re-insert them
      $$("#heroInner .pre").forEach((el) => el !== pre && el.remove());
      pre.classList.add("live");
      const role = $("#heroInner .role"); if (role) role.id = "role";
    } else $("#heroInner").innerHTML = `
      <p class="eyebrow"><span class="led"></span>${esc(x.eyebrow)}</p>
      <h1 class="name"><span class="l1">${split(parts.slice(0, -1).join(" "))}</span><span class="l2">${split(parts.at(-1))}</span></h1>
      <p class="roleline">${esc(x.iBuild)} <span class="role" id="role">${esc(x.roles[0])}</span><span class="caret"></span></p>
      <p class="pitch">${esc(t(P.pitch))}</p>
      <ul class="avail" aria-label="Availability">${t(P.availability).map((a, i) => `<li>${i ? "" : '<i class="dot"></i>'}${esc(a)}</li>`).join("")}</ul>
      <div class="links">
        <a class="btn primary magnetic" href="#featured" data-cursor="↓">${esc(x.sec[1])}${I.arrow}</a>
        <a class="btn magnetic" href="${esc(bookingHref())}"${P.booking ? ' target="_blank" rel="noopener"' : ""} data-ev="book">${I.cal}${esc(x.book)}</a>
        <a class="btn magnetic" href="cv/?lang=${lang}" data-ev="cv">${I.doc}${esc(x.cv)}</a>
        <a class="btn magnetic icon-only" href="${P.github}" target="_blank" rel="noopener" aria-label="GitHub">${I.gh}</a>
        <a class="btn magnetic icon-only" href="${P.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">${I.in}</a>
      </div>
      <dl class="stats">
        <div><dt data-count="${PROJ.length}">${pad(PROJ.length)}</dt><dd>${esc(x.stats[0])}</dd></div>
        <div><dt data-count="${done}">${pad(done)}</dt><dd>${esc(x.stats[1])}</dd></div>
        <div><dt data-count="${DOM.length}">${pad(DOM.length)}</dt><dd>${esc(x.stats[2])}</dd></div>
      </dl>`;
    $("#heroHint").innerHTML = `<span class="ping"></span>${esc(x.hint)}`;

    const skills = SK.flatMap((g) => g.items);
    $("#mq1").innerHTML = [...skills, ...skills].map((s) => `<span>${esc(s)}</span>`).join("");
    const titles = PROJ.map((p) => t(p.title));
    $("#mq2").innerHTML = [...titles, ...titles].map((s) => `<span>${esc(s)}</span>`).join("");

    $("#method").innerHTML = secHead(0) + `<div class="method"><svg class="wire" preserveAspectRatio="none" viewBox="0 0 1000 10" aria-hidden="true"><path d="M0 5H1000"/></svg>` +
      u.methodItems.map(([h, d], i) => `<div class="m-item rv tilt spot"><div class="m-ic"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${mIcons[i]}</svg></div><span class="num">${pad(i + 1)}</span><h3>${esc(h)}</h3><p>${esc(d)}</p></div>`).join("") + "</div>";

    const feats = PROJ.filter((p) => p.featured);
    $("#featHead").innerHTML = secHead(1);
    $("#featTabs").innerHTML = feats.map((p, i) => `
      <button type="button" class="ft-item${i ? "" : " on"}" data-goto="${i}">
        <span class="ft-n">${pad(i + 1)}</span><span class="ft-t">${esc(t(p.title))}</span><i class="ft-dot s-${p.status}"></i>
      </button>`).join("");
    $("#featFoot").innerHTML = `
      <button type="button" class="icon-btn" data-fstep="-1" aria-label="${esc(x.prev)}">${I.left}</button>
      <div class="ft-bar"><i id="ftBar"></i></div>
      <span class="ft-count" id="ftCount">01 / ${pad(feats.length)}</span>
      <button type="button" class="icon-btn" data-fstep="1" aria-label="${esc(x.next)}">${I.right}</button>
      <p class="ft-hint">${esc(x.featHint)}</p>`;
    $("#featList").innerHTML = feats.map((p, i) => `
      <article class="panel${i ? "" : " in"}" data-open="${p.id}" data-cursor="${esc(x.cursorOpen)}">
        <div class="panel-media tilt">
          <div class="screen-bar"><span></span><span></span><span></span><em>fig · ${esc(p.id)}</em></div>
          <div class="screen-img">${imgTag(p)}</div>
        </div>
        <div class="panel-body">
          <p class="idx">${pad(i + 1)}<span>/${pad(feats.length)}</span></p>
          <div class="meta">${badge(p)}</div>
          <h3><a href="#p=${p.id}" class="open-link" data-open="${p.id}">${esc(t(p.title))}</a></h3>
          <p class="problem">${esc(t(p.problem))}</p>
          <p class="headline">${esc(t(p.results[0]))}</p>
          <div class="chips">${p.stack.slice(0, 5).map((s) => `<span>${esc(s)}</span>`).join("")}</div>
          <span class="btn primary" aria-hidden="true">${esc(x.details)}${I.arrow}</span>
        </div>
      </article>`).join("");
    setupFeatured();

    $("#allHead").innerHTML = secHead(2, `<span class="count" id="count"></span>`);
    $("#search").placeholder = x.search; $("#search").value = state.skill || state.q;
    $("#statusSeg").innerHTML = ["all", "done", "wip", "early"].map((s) => `<button type="button" data-s="${s}" class="${state.status === s ? "on" : ""}" aria-pressed="${state.status === s}">${esc(x.status[s])}</button>`).join("");
    $("#empty").textContent = x.empty;
    renderFilters(); renderGrid(false);

    $("#writing").innerHTML = secHead(3, `<p class="sec-sub">${esc(x.writingSub)}</p>`) + `
      <div class="writing">
        <div class="w-col"><h3 class="w-h">${I.pen}${esc(x.articles)}</h3>
          ${POSTS.map((b) => `<a class="post rv spot" href="blog/${b.slug}.html?lang=${lang}" data-ev="post-${b.slug}">
            <span class="post-meta"><span class="tag">${esc(b.tag)}</span><span>${esc(fmtDate(b.date))}</span><span>${esc(x.minRead(b.min))}</span></span>
            <span class="post-t">${esc(t(b.title))}</span><span class="post-s">${esc(t(b.summary))}</span>
            <span class="post-go">${esc(x.read)} ${I.arrow}</span></a>`).join("")}
        </div>
        <div class="w-col"><h3 class="w-h">${I.play}${esc(x.demos)}</h3>
          ${DEMOS.map((d) => `<a class="demo-card rv spot" href="demo/${d.slug}.html?lang=${lang}" data-ev="demo-${d.slug}">
            <span class="demo-art demo-${d.slug}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
            <span class="post-t">${esc(t(d.title))}</span><span class="post-s">${esc(t(d.summary))}</span>
            <span class="post-go">${esc(x.tryIt)} ${I.arrow}</span></a>`).join("")}
        </div>
      </div>`;

    const used = (s) => PROJ.filter((p) => usesSkill(p, s)).length;
    $("#skills").innerHTML = secHead(4, `<p class="sec-sub">${esc(x.skillHint)}</p>`) + `<div class="skills">` + SK.map((g, i) => `
      <div class="skill-group rv spot"><p class="num">${pad(i + 1)}</p><h3>${esc(t(g))}</h3>
      <div class="chips">${g.items.map((s) => { const n = used(s); return `<button type="button" class="sk" data-skill="${esc(s)}" data-cursor="${esc(x.cursorFilter)}"${n ? "" : " disabled"}>${esc(s)}${n ? `<small>${n}</small>` : ""}</button>`; }).join("")}</div></div>`).join("") +
      `</div><p class="langs"><strong>${lang === "fr" ? "Langues" : "Languages"}</strong> ${esc(t(P.languages))}</p>`;

    $("#path").innerHTML = secHead(5) + `<div class="timeline-wrap"><span class="tl-line" aria-hidden="true"><i></i></span><ol class="timeline">` + EXP.map((e) => `
      <li class="rv"><span class="when">${esc(t(e.when))}</span><div class="tl-card spot"><h3>${esc(t(e.title))}</h3><p>${esc(t(e.where))}</p></div></li>`).join("") + "</ol></div>";

    $("#pubs").innerHTML = secHead(6, `<p class="sec-sub">${esc(x.pubsSub)}</p>`) + `<ol class="pubs">` + PUBS.map((b) => `
      <li class="pub rv"><span class="when">${esc(b.year)}</span><div><p class="pub-kind">${esc(t(b.kind))}</p><h3>${esc(t(b.title))}</h3><p class="pub-where">${esc(t(b.where))}</p></div>
      ${b.link ? `<a class="btn small" href="${b.link}" target="_blank" rel="noopener">${I.gh}${esc(x.open)}</a>` : ""}</li>`).join("") + "</ol>";

    $("#contact").innerHTML = secHead(7) + `
      <div class="contact-card spot">
        <p class="big">${x.contactTitle.split(" ").map((w) => `<span class="w"><span>${esc(w)}</span></span>`).join(" ")}</p>
        <p class="sub">${esc(u.contactText)}</p>
        <p class="print-only">${esc(P.email)} · linkedin.com/in/mohamed-amine-belkacem-262582391 · github.com/amine-belkacem · amine-belkacem.github.io</p>
        <ul class="avail">${t(P.availability).map((a, i) => `<li>${i ? "" : '<i class="dot"></i>'}${esc(a)}</li>`).join("")}</ul>
        <div class="links">
          <a class="btn primary magnetic" href="${esc(bookingHref())}"${P.booking ? ' target="_blank" rel="noopener"' : ""} data-ev="book">${I.cal}${esc(x.book)}</a>
          <a class="btn magnetic" href="mailto:${P.email}">${I.mail}${esc(P.email)}</a>
          <button class="btn magnetic" type="button" id="copyMail">${I.copy}${esc(x.copy)}</button>
          <a class="btn magnetic" href="cv/?lang=${lang}" data-ev="cv">${I.doc}${esc(x.cvTitle)}</a>
          <a class="btn magnetic icon-only" href="${P.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">${I.in}</a>
          <a class="btn magnetic icon-only" href="${P.github}" target="_blank" rel="noopener" aria-label="GitHub">${I.gh}</a>
        </div>
        <div class="orbit" aria-hidden="true"><i></i><i></i><i></i></div>
      </div>`;

    renderFooter();
    const tabIcons = [I.star, I.grid, I.pen, I.chat, I.file], tabHref = ["#featured", "#projects", "#writing", "#contact", `cv/?lang=${lang}`];
    $("#tabbar").innerHTML = x.tabs.map((n, i) => `<a href="${tabHref[i]}" data-tab="${tabHref[i]}">${tabIcons[i]}<span>${esc(n)}</span></a>`).join("");
    if ($("#printList").childElementCount) renderPrint();
  }

  function renderFooter() {
    const u = UI[lang], x = X[lang], lh = SITE.lighthouse && SITE.lighthouse.mobile;
    const score = lh ? `<a class="lh" href="https://pagespeed.web.dev/analysis?url=${encodeURIComponent("https://amine-belkacem.github.io/")}" target="_blank" rel="noopener" title="${esc(x.lighthouse)} (${esc(x.lhMobile)}), ${esc(SITE.lighthouse.date || "")}">
      ${[["perf", lh.performance], ["a11y", lh.accessibility], ["bp", lh["best-practices"]], ["seo", lh.seo]].map(([k, v]) => `<span class="lh-s" style="--v:${v}"><b>${v}</b><i>${k}</i></span>`).join("")}
      <em>${esc(x.lighthouse)} · ${esc(x.lhMobile)}</em></a>` : "";
    $("#footer").innerHTML = `
      <div class="f-l"><span>© ${new Date().getFullYear()} ${esc(P.name)}</span><span>${esc(u.cvNote)}</span>${SITE.updated ? `<span>${esc(x.updated)} ${esc(fmtDate(SITE.updated))}</span>` : ""}</div>
      ${score}
      <div class="f-r"><a href="blog/?lang=${lang}">${esc(x.articles)}</a><a href="cv/?lang=${lang}">${esc(x.cv)}</a><a href="#top">${esc(x.top)} ↑</a></div>`;
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

  /* ---------- featured: horizontal bar with its own sideways scroll ---------- */
  let featBound = false, dragMoved = false;
  const panelLeft = (v, p) => p.offsetLeft - v.querySelector(".panel").offsetLeft;
  function featIndex() {
    const v = $("#featView"), ps = $$(".panel", v);
    let best = 0, bd = Infinity;
    ps.forEach((p, i) => { const d = Math.abs(panelLeft(v, p) - v.scrollLeft); if (d < bd) { bd = d; best = i; } });
    if (v.scrollLeft + v.clientWidth >= v.scrollWidth - 2) best = ps.length - 1;
    return best;
  }
  function updateFeat() {
    const v = $("#featView"); if (!v) return;
    const ps = $$(".panel", v), i = featIndex(), max = v.scrollWidth - v.clientWidth;
    $$(".ft-item").forEach((b, k) => b.classList.toggle("on", k === i));
    ps.forEach((p, k) => p.classList.toggle("in", k === i));
    const bar = $("#ftBar"); if (bar) bar.style.transform = `scaleX(${max > 0 ? (v.scrollLeft / max) * (1 - 1 / ps.length) + 1 / ps.length : 1})`;
    const c = $("#ftCount"); if (c) c.textContent = `${pad(i + 1)} / ${pad(ps.length)}`;
    const on = $(".ft-item.on"), strip = $("#featTabs");
    if (on && strip.scrollWidth > strip.clientWidth) {
      const l = on.offsetLeft - strip.offsetLeft, r = l + on.offsetWidth;
      if (l < strip.scrollLeft) strip.scrollTo({ left: l - 8, behavior: "smooth" });
      else if (r > strip.scrollLeft + strip.clientWidth) strip.scrollTo({ left: r - strip.clientWidth + 8, behavior: "smooth" });
    }
  }
  function featGo(i) {
    const v = $("#featView"), ps = $$(".panel", v);
    i = Math.max(0, Math.min(ps.length - 1, i));
    v.scrollTo({ left: panelLeft(v, ps[i]), behavior: full ? "smooth" : "auto" });
  }
  function setupFeatured() {
    updateFeat();
    if (featBound) return; featBound = true;
    const v = $("#featView");
    let raf = 0;
    v.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(updateFeat); }, { passive: true });
    addEventListener("resize", updateFeat);
    v.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); featGo(featIndex() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); featGo(featIndex() - 1); }
    });
    let down = false, x0 = 0, s0 = 0;
    v.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; dragMoved = false; x0 = e.clientX; s0 = v.scrollLeft;
    });
    addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 6 && !dragMoved) { dragMoved = true; v.classList.add("dragging"); }
      if (dragMoved) v.scrollLeft = s0 - dx;
    });
    addEventListener("pointerup", () => {
      if (!down) return; down = false;
      if (dragMoved) { v.classList.remove("dragging"); featGo(featIndex()); setTimeout(() => (dragMoved = false), 0); }
    });
  }

  function matches(p) {
    if (state.domain !== "all" && !p.domains.includes(state.domain)) return false;
    if (state.status !== "all" && p.status !== state.status) return false;
    if (state.skill) return usesSkill(p, state.skill);
    if (!state.q) return true;
    const hay = [t(p.title), t(p.tagline), t(p.problem), p.stack.join(" "), p.domains.map(domName).join(" "), ...p.results.map(t), p.id].join(" ").toLowerCase();
    return state.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }
  function renderFilters() {
    const u = UI[lang];
    const n = (id) => PROJ.filter((p) => id === "all" || p.domains.includes(id)).length;
    $("#filters").innerHTML = [{ id: "all", en: u.allDomains, fr: u.allDomains }, ...DOM]
      .map((d) => `<button type="button" class="chip${d.id === state.domain ? " on" : ""}" data-d="${d.id}" aria-pressed="${d.id === state.domain}">${esc(t(d))}<small>${n(d.id)}</small></button>`).join("");
  }
  function cardHTML(p) {
    return `<article class="card spot tilt" data-id="${p.id}" data-open="${p.id}" data-cursor="${esc(X[lang].cursorOpen)}">
      <div class="card-top"><span class="pid">P-${pad(PROJ.indexOf(p) + 1)}</span><span class="go" aria-hidden="true">${I.arrow}</span></div>
      <div class="meta">${badge(p)}</div>
      <h3><a href="#p=${p.id}" class="open-link" data-open="${p.id}">${esc(t(p.title))}</a></h3>
      <p>${esc(t(p.tagline))}</p>
      <div class="card-foot"><div class="tags">${tags(p)}</div>${t(p.period) ? `<span class="year">${esc(t(p.period))}</span>` : ""}</div>
    </article>`;
  }
  function renderGrid(animate = true) {
    const grid = $("#grid");
    const order = { done: 0, wip: 1, early: 2 };
    const list = PROJ.filter(matches).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || order[a.status] - order[b.status]);
    const filtering = state.domain !== "all" || state.status !== "all" || state.q || state.skill;
    const collapsed = !filtering && !state.expanded;
    const shown = collapsed ? list.filter((p) => p.status === "done").slice(0, 6) : list;
    const flipState = animate && G && window.Flip ? Flip.getState($$(".card", grid)) : null;
    const existing = new Map($$(".card", grid).map((c) => [c.dataset.id, c]));
    const frag = document.createDocumentFragment();
    for (const p of shown) {
      let c = existing.get(p.id);
      if (!c) { const tmp = document.createElement("div"); tmp.innerHTML = cardHTML(p); c = tmp.firstElementChild; }
      frag.appendChild(c); existing.delete(p.id);
    }
    existing.forEach((c) => c.remove());
    grid.appendChild(frag);
    $("#count") && ($("#count").textContent = `${pad(list.length)} / ${PROJ.length}`);
    $("#empty").hidden = list.length > 0;
    const more = $("#showMore"), fr = lang === "fr";
    more.hidden = filtering || list.length <= 6;
    more.textContent = collapsed
      ? (fr ? `Voir plus (${list.length - shown.length})` : `Show more (${list.length - shown.length})`)
      : (fr ? "Voir moins" : "Show less");
    if (flipState) {
      Flip.from(flipState, { duration: full ? 0.6 : 0.3, ease: "power3.inOut", absolute: true, stagger: full ? 0.015 : 0,
        onEnter: (els) => G.fromTo(els, { opacity: 0, scale: full ? 0.9 : 1, y: full ? 20 : 0 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, stagger: 0.03 }),
        onLeave: (els) => G.to(els, { opacity: 0, scale: full ? 0.9 : 1, duration: 0.25 }) });
    }
    if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 650);
  }

  function detail(p, forPrint = false) {
    const u = UI[lang];
    const idx = PROJ.indexOf(p);
    return `
      ${forPrint ? "" : `<div class="m-nav"><button class="icon-btn" type="button" data-step="-1" aria-label="${esc(X[lang].prev)}">${I.left}</button><span class="pid">P-${pad(idx + 1)} / ${PROJ.length}</span><button class="icon-btn" type="button" data-step="1" aria-label="${esc(X[lang].next)}">${I.right}</button><button class="icon-btn" type="button" data-close aria-label="${esc(u.close)}">${I.close}</button></div>`}
      <div class="meta">${badge(p)}</div>
      <h2>${esc(t(p.title))}</h2>
      ${sheet(p)}
      <p class="lead">${esc(t(p.tagline))}</p>
      ${img(p) ? `<figure>${imgTag(p, t(p.title), !forPrint)}</figure>` : ""}
      <h3>${esc(u.results)}</h3>
      <ul class="results">${p.results.map((r) => `<li>${esc(t(r))}</li>`).join("")}</ul>
      ${p.note ? `<p class="note">${esc(t(p.note))}</p>` : ""}
      <div class="modal-foot">
        ${forPrint ? `<span class="repo-url">${p.repo ? p.repo.replace("https://", "") : esc(u.soon)}</span>` : repoLink(p, "btn primary")}
        ${forPrint ? "" : `<span class="kbd-hint" aria-hidden="true"><kbd>←</kbd><kbd>→</kbd> <kbd>Esc</kbd></span>`}
      </div>`;
  }
  /* the print/PDF copy of every project is only built when printing (keeps the page light) */
  function renderPrint() {
    const u = UI[lang];
    $("#printList").innerHTML = `<h2>${esc(u.all)}</h2>` + DOM.map((d) => {
      const ps = PROJ.filter((p) => p.domains[0] === d.id);
      return ps.length ? `<h3 class="print-dom">${esc(t(d))}</h3>` + ps.map((p) => `<article class="print-item">${detail(p, true)}</article>`).join("") : "";
    }).join("");
  }
  addEventListener("beforeprint", renderPrint);

  /* ================= motion (needs GSAP) ================= */
  let ctx = null;
  function animate() {
    if (ctx) ctx.revert();
    startRoles();
    if (!G) { $$(".rv").forEach((e) => (e.style.opacity = 1)); return; }
    ctx = G.context(() => {
      // reveal on scroll: rise + fade (full), fade only (calm)
      ScrollTrigger.batch(".rv", { start: "top 90%", onEnter: (els) => G.fromTo(els, { y: full ? 40 : 0, opacity: 0 }, { y: 0, opacity: 1, duration: full ? 0.9 : 0.6, ease: "power3.out", stagger: 0.08, overwrite: true }) });
      G.set(".rv", { opacity: 0 });
      if (full) $$(".scramble").forEach((h) => ScrollTrigger.create({ trigger: h, start: "top 85%", once: true, onEnter: () => scramble(h) }));
      const wire = $(".wire path");
      if (wire) G.fromTo(wire, { strokeDashoffset: 1000 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".method", start: "top 80%", end: "bottom 50%", scrub: true } });
      G.fromTo(".tl-line i", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 75%", end: "bottom 60%", scrub: true } });
      $$(".timeline li").forEach((li) => ScrollTrigger.create({ trigger: li, start: "top 70%", toggleClass: "lit" }));
      G.from(".contact-card .w > span", { yPercent: full ? 110 : 0, opacity: full ? 1 : 0, duration: 0.9, ease: "power4.out", stagger: 0.05, scrollTrigger: { trigger: ".contact-card", start: "top 80%" } });
      // marquees: slower in calm mode; in full mode their speed follows the scroll velocity
      const mq = [G.to("#mq1", { xPercent: -50, duration: full ? 70 : 140, ease: "none", repeat: -1 }), G.fromTo("#mq2", { xPercent: -50 }, { xPercent: 0, duration: full ? 90 : 180, ease: "none", repeat: -1 })];
      if (full) ScrollTrigger.create({ onUpdate: (s) => { const v = 1 + Math.min(6, Math.abs(s.getVelocity()) / 400); mq.forEach((m) => G.to(m, { timeScale: v, duration: 0.2, overwrite: true, onComplete: () => G.to(m, { timeScale: 1, duration: 1.2 }) })); } });
      // pause the marquees while they are off screen
      ScrollTrigger.create({ trigger: ".marquees", start: "top bottom", end: "bottom top", onToggle: (s) => mq.forEach((m) => (s.isActive ? m.play() : m.pause())) });
      G.from(".feat-tabs, .feat-view, .feat-foot", { y: full ? 60 : 0, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ".feat-wrap", start: "top 85%" } });
      if (full) G.to("#heroInner", { y: -120, opacity: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
    });
  }
  /* The hero text is already in the HTML (pre-rendered by tools/build.mjs), so nothing that paints first is hidden.
     The letters of the name rise with a CSS transition when the "intro" class is added (see .name .ch in style.css). */
  function introHero() {
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("intro")));
  }
  const GLYPHS = "01<>/\\[]{}#$%&*+=?ABCDEFGHJKLMNPQRSTUVWXYZ";
  function scramble(el) {
    const text = el.dataset.text || el.textContent;
    let f = 0; const total = 22;
    const run = () => {
      el.textContent = [...text].map((c, i) => (c === " " || i < (f / total) * text.length) ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join("");
      if (++f <= total) requestAnimationFrame(run); else el.textContent = text;
    };
    run();
  }
  function startRoles() {
    const el = $("#role"); if (!el || headless) return;
    const roles = X[lang].roles, gen = (startRoles.gen = (startRoles.gen || 0) + 1);
    let i = 0, c = roles[0].length, del = true;
    const tick = () => {
      if (gen !== startRoles.gen) return;
      const r = roles[i];
      let wait = del ? 22 : 55;
      if (!del) { el.textContent = r.slice(0, ++c); if (c === r.length) { del = true; wait = 1900; } }
      else { el.textContent = r.slice(0, --c); if (c === 0) { del = false; i = (i + 1) % roles.length; wait = 300; } }
      setTimeout(tick, wait);
    };
    setTimeout(tick, 2200);   // the first role is already written in the page; typing starts after a pause
  }
  let counters = [];
  function countUp() {
    counters.forEach((c) => c.kill()); counters = [];
    $$("[data-count]").forEach((el) => {
      const to = +el.dataset.count, fin = () => (el.textContent = pad(to));
      if (!G || headless || matchMedia("print").matches) return fin();
      const o = { v: 0 };
      counters.push(G.to(o, { v: to, duration: 1.6, delay: 0.4, ease: "power3.out", onUpdate: () => (el.textContent = pad(Math.round(o.v))), onComplete: fin }));
    });
  }
  addEventListener("beforeprint", () => { counters.forEach((c) => c.kill()); $$("[data-count]").forEach((el) => (el.textContent = pad(+el.dataset.count))); });

  /* ================= cursor, magnetic buttons, tilt (full motion + mouse only) ================= */
  function pointerFx() {
    const cur = $("#cursor"), dot = $("#cursorDot"), lab = $("#cursorLabel");
    addEventListener("pointermove", (e) => {
      const spot = e.target.closest && e.target.closest(".spot");
      if (spot) { const r = spot.getBoundingClientRect(); spot.style.setProperty("--mx", `${e.clientX - r.left}px`); spot.style.setProperty("--my", `${e.clientY - r.top}px`); }
    }, { passive: true });
    if (!fine || !full) { cur.remove(); dot.remove(); return; }
    document.body.classList.add("has-cursor");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, moving = false;
    addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      const tl = e.target.closest && e.target.closest(".tilt");
      if (tl) { const r = tl.getBoundingClientRect(); const ry = ((mx - r.left) / r.width - 0.5) * 10, rx = -((my - r.top) / r.height - 0.5) * 8; tl.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`; }
      const lbl = e.target.closest && e.target.closest("[data-cursor]");
      const act = e.target.closest && e.target.closest("a, button, [data-open], input, label");
      cur.classList.toggle("label", !!lbl); cur.classList.toggle("act", !!act && !lbl);
      if (lbl) lab.textContent = lbl.dataset.cursor;
      if (!moving) { moving = true; requestAnimationFrame(loop); }
    }, { passive: true });
    addEventListener("pointerout", (e) => { const tl = e.target.closest && e.target.closest(".tilt"); if (tl && !tl.contains(e.relatedTarget)) tl.style.transform = ""; });
    addEventListener("chiphover", (e) => { cur.classList.toggle("label", e.detail); lab.textContent = X[lang].cursorPing; document.body.classList.toggle("chip-hot", e.detail); });
    addEventListener("pointerdown", () => cur.classList.add("down")); addEventListener("pointerup", () => cur.classList.remove("down"));
    document.addEventListener("mouseleave", () => cur.classList.add("gone")); document.addEventListener("mouseenter", () => cur.classList.remove("gone"));
    // the ring follows the pointer; the loop stops by itself once it has caught up (no idle work)
    const loop = () => {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      cur.style.transform = `translate(${cx}px, ${cy}px)`;
      if (Math.abs(mx - cx) + Math.abs(my - cy) > 0.3) requestAnimationFrame(loop); else moving = false;
    };
    // magnetic buttons: only the closest one, by at most 6 x 4 px, so neighbours never overlap
    const PAD = 14, MAX_X = 6, MAX_Y = 4;
    document.addEventListener("pointermove", (e) => {
      let best = null, bestD = Infinity;
      const all = $$(".magnetic");
      all.forEach((m) => {
        const r = m.getBoundingClientRect();
        const ox = Math.max(r.left - e.clientX, 0, e.clientX - r.right), oy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
        const d = Math.hypot(ox, oy);
        if (d < PAD && d < bestD) { bestD = d; best = { m, r }; }
      });
      all.forEach((m) => {
        if (!best || m !== best.m) { if (m.style.transform) m.style.transform = ""; return; }
        const { r } = best;
        const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2 + PAD)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2 + PAD)));
        m.style.transform = `translate(${(nx * MAX_X).toFixed(1)}px, ${(ny * MAX_Y).toFixed(1)}px)`;
      });
    }, { passive: true });
  }

  /* ================= 3D hero: loaded last ================= */
  let sceneLoading = false;
  function wantsLite() {
    const c = navigator.connection || {};
    return innerWidth < 820 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || c.saveData || /2g/.test(c.effectiveType || "");
  }
  function webglOK() {
    try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
  }
  function loadScene() {
    if (sceneLoading) return; sceneLoading = true;
    if (!webglOK()) { $("#stage").classList.add("no-webgl"); return; }
    import("./scene.min.js?v=3.0")
      .then((m) => m.start({ lite: wantsLite(), motion }))
      .catch(() => $("#stage").classList.add("no-webgl"));
  }
  function scheduleScene() {
    if (params.has("poster")) return;   // tools/make_poster.mjs starts it itself
    const kick = () => { ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"].forEach((ev) => removeEventListener(ev, kick)); loadScene(); };
    ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"].forEach((ev) => addEventListener(ev, kick, { passive: true, once: true }));
    // nobody touched anything: start anyway once the page is idle
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1));
    const later = () => setTimeout(() => idle(kick, { timeout: 2000 }), 3500);
    if (document.readyState === "complete") later(); else addEventListener("load", later, { once: true });
  }
  window.__loadScene = loadScene;

  /* ================= modal ================= */
  const modal = $("#modal");
  let current = null;
  function openProject(id, from) {
    const p = PROJ.find((q) => q.id === id); if (!p) return;
    current = id;
    $("#modalBody").innerHTML = detail(p);
    if (!modal.open) {
      modal.showModal();
      if (G) {
        const r = from && from.getBoundingClientRect && full ? from.getBoundingClientRect() : null, m = modal.getBoundingClientRect();
        const vars = r ? { x: r.left + r.width / 2 - (m.left + m.width / 2), y: r.top + r.height / 2 - (m.top + m.height / 2), scale: 0.4 } : { y: full ? 30 : 0, scale: full ? 0.96 : 1 };
        G.fromTo(modal, { ...vars, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: full ? 0.55 : 0.3, ease: "expo.out" });
      }
    } else if (G) {
      G.fromTo("#modalBody > *", { opacity: 0, y: full ? 12 : 0 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.02 });
    }
    modal.scrollTop = 0;
    history.replaceState(null, "", `#p=${id}`);
    track(`/project/${id}`, t(p.title));
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
    const x = X[lang];
    const secs = [["method", 0], ["featured", 1], ["projects", 2], ["writing", 3], ["skills", 4], ["path", 5], ["pubs", 6], ["contact", 7]];
    return [
      ...secs.map(([id, i]) => ({ g: x.palSec, icon: I.hash, label: x.sec[i], run: () => document.getElementById(id).scrollIntoView({ behavior: full ? "smooth" : "auto" }) })),
      ...PROJ.map((p) => ({ g: x.palProj, icon: I.arrow, label: t(p.title), sub: t(ST[p.status]), key: p.stack.join(" ") + " " + p.id, run: () => openProject(p.id) })),
      ...POSTS.map((b) => ({ g: x.palPost, icon: I.pen, label: t(b.title), sub: x.articles, run: () => (location.href = `blog/${b.slug}.html?lang=${lang}`) })),
      ...DEMOS.map((d) => ({ g: x.palPost, icon: I.play, label: t(d.title), sub: x.demos, run: () => (location.href = `demo/${d.slug}.html?lang=${lang}`) })),
      { g: x.palAct, icon: I.cal, label: x.book, run: () => (location.href = bookingHref()) },
      { g: x.palAct, icon: I.doc, label: x.cvTitle, run: () => (location.href = `cv/?lang=${lang}`) },
      { g: x.palAct, icon: I.bolt, label: x.actLang, run: toggleLang },
      { g: x.palAct, icon: I.pdf, label: x.actPdf, run: () => (location.href = `portfolio-${lang}.pdf`) },
      { g: x.palAct, icon: I.copy, label: x.actMail, run: copyMail },
      { g: x.palAct, icon: I.gh, label: "GitHub", run: () => open(P.github, "_blank", "noopener") },
      { g: x.palAct, icon: I.in, label: "LinkedIn", run: () => open(P.linkedin, "_blank", "noopener") },
    ];
  }
  function palRender() {
    const q = palIn.value.trim().toLowerCase();
    palItems = palData().filter((it) => !q || (it.label + " " + (it.key || "") + " " + (it.sub || "")).toLowerCase().includes(q)).slice(0, 40);
    palSel = Math.min(palSel, Math.max(0, palItems.length - 1));
    let g = "";
    palList.innerHTML = palItems.map((it, i) => {
      const head = it.g !== g ? `<li class="pal-g" role="presentation">${esc((g = it.g))}</li>` : "";
      return `${head}<li class="pal-it${i === palSel ? " sel" : ""}" data-i="${i}" role="option" aria-selected="${i === palSel}">${it.icon}<span>${esc(it.label)}</span>${it.sub ? `<em>${esc(it.sub)}</em>` : ""}</li>`;
    }).join("") || `<li class="pal-g" role="presentation">${esc(X[lang].empty)}</li>`;
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

  /* ================= analytics (GoatCounter, only if a code is set in data.js; no cookies) ================= */
  function setupAnalytics() {
    if (!P.goatcounter || headless || location.hostname === "localhost") return;
    const s = document.createElement("script");
    s.async = true; s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${P.goatcounter}.goatcounter.com/count`;
    document.head.appendChild(s);
  }
  function track(path, title) {
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path, title, event: true });
  }

  /* ================= misc actions ================= */
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 1800); }
  async function copyMail() { try { await navigator.clipboard.writeText(P.email); toast(X[lang].copied); track("/copy-email", "copy e-mail"); } catch { location.href = `mailto:${P.email}`; } }
  function toggleLang() {
    lang = lang === "en" ? "fr" : "en"; store.set("pf.lang", lang);
    const open = current; if (modal.open) modal.close();
    render(); animate(); if (window.ScrollTrigger) ScrollTrigger.refresh();
    if (open) openProject(open);
  }

  document.addEventListener("click", (e) => {
    if (dragMoved && e.target.closest("#featView")) { e.preventDefault(); return; }
    const ev = e.target.closest("[data-ev]"); if (ev) track(`/click/${ev.dataset.ev}`, ev.dataset.ev);
    const go = e.target.closest("[data-goto]");
    if (go) return featGo(+go.dataset.goto);
    const fs = e.target.closest("[data-fstep]");
    if (fs) return featGo(featIndex() + +fs.dataset.fstep);
    const chip = e.target.closest(".chip");
    if (chip) { state.domain = chip.dataset.d; renderFilters(); renderGrid(); return; }
    const seg = e.target.closest("#statusSeg button");
    if (seg) { state.status = seg.dataset.s; $$("#statusSeg button").forEach((b) => { b.classList.toggle("on", b === seg); b.setAttribute("aria-pressed", b === seg); }); renderGrid(); return; }
    const sk = e.target.closest(".sk");
    if (sk) {
      state.skill = sk.dataset.skill; state.q = ""; state.domain = "all"; state.status = "all";
      $("#search").value = state.skill; $(".search").classList.add("skill-on"); renderFilters(); $$("#statusSeg button").forEach((b) => b.classList.toggle("on", b.dataset.s === "all"));
      document.getElementById("projects").scrollIntoView({ behavior: full ? "smooth" : "auto" });
      setTimeout(() => renderGrid(), 450); return;
    }
    if (e.target.closest("#copyMail")) return copyMail();
    const opener = e.target.closest("[data-open]");
    if (opener && (opener.tagName !== "A" || opener.classList.contains("open-link"))) { e.preventDefault(); openProject(opener.dataset.open, opener.closest(".card, .panel") || opener); return; }
  });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.open ? pal.close() : palOpen(); return; }
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName) && !pal.open) { e.preventDefault(); palOpen(); return; }
    if (modal.open && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { step(e.key === "ArrowRight" ? 1 : -1); }
  });
  let st; $("#search").addEventListener("input", (e) => {
    if (state.skill) { state.skill = null; $(".search").classList.remove("skill-on"); }
    clearTimeout(st); st = setTimeout(() => { state.q = e.target.value.trim(); renderGrid(); }, 140);
  });
  $("#searchClear").addEventListener("click", () => { $("#search").value = ""; state.q = ""; state.skill = null; $(".search").classList.remove("skill-on"); renderGrid(); });
  $("#showMore").addEventListener("click", () => {
    state.expanded = !state.expanded;
    renderGrid();
    if (!state.expanded) document.getElementById("projects").scrollIntoView({ behavior: full ? "smooth" : "auto" });
  });
  $("#langBtn").addEventListener("click", toggleLang);
  $("#motionBtn").addEventListener("click", () => { store.set("pf.motion", full ? "calm" : "full"); location.reload(); });

  const bar = $("#topbar"), prog = $("#progress");
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      bar.classList.toggle("scrolled", scrollY > 20);
      const h = document.documentElement.scrollHeight - innerHeight;
      prog.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    });
  }, { passive: true });

  /* phone tab bar: highlight the section on screen */
  function tabSpy() {
    const links = $$("#tabbar a[data-tab^='#']");
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return;
      $$("#tabbar a").forEach((a) => a.classList.toggle("on", a.dataset.tab === `#${en.target.id}`));
    }), { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((a) => { const s = document.querySelector(a.dataset.tab); s && io.observe(s); });
  }

  /* ================= start ================= */
  render();
  if (params.has("prerender")) return;   // tools/build.mjs only needs the rendered hero text
  pointerFx();
  tabSpy();
  if (headless && params.has("print")) renderPrint();
  if (location.hash.startsWith("#p=")) openProject(location.hash.slice(3));
  introHero();
  const startMotion = () => {
    G = window.gsap || null;
    if (G) G.registerPlugin(ScrollTrigger, Flip);
    if (G) G.from(".hero-hint, .scroll-cue", { opacity: 0, duration: 1, delay: 0.8 });
    animate();
    scheduleScene();
    setupAnalytics();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startMotion, { once: true }); else startMotion();
})();
