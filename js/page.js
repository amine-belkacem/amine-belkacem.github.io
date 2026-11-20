/* Secondary pages: show the English or French block, keep the choice with the home page, optional GoatCounter. */
(() => {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };
  const q = new URLSearchParams(location.search);
  let lang = q.get("lang") || store.get("pf.lang") || ((navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en");
  if (lang !== "fr") lang = "en";
  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-l]").forEach((el) => el.classList.toggle("on", el.dataset.l === lang));
    document.querySelectorAll("[data-lang-btn]").forEach((b) => { b.textContent = lang === "fr" ? "EN" : "FR"; b.setAttribute("aria-label", lang === "fr" ? "Switch to English" : "Passer en français"); });
    // keep ?lang= on the internal links so the next page opens in the same language
    document.querySelectorAll("a[data-keep-lang]").forEach((a) => { const u = new URL(a.getAttribute("href"), location.href); u.searchParams.set("lang", lang); a.href = u.pathname + u.search + u.hash; });
    const t = document.querySelector(`title[data-${lang}]`) || document.querySelector("title");
    if (t && t.dataset[lang]) document.title = t.dataset[lang];
    document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-lang-btn]")) return;
    lang = lang === "fr" ? "en" : "fr"; store.set("pf.lang", lang); apply();
  });
  window.PAGE = { get lang() { return lang; } };
  apply();
  // analytics: same switch as the home page (code in js/data.js, PROFILE.goatcounter)
  const code = window.PROFILE && window.PROFILE.goatcounter;
  if (code && location.hostname !== "localhost") {
    const s = document.createElement("script");
    s.async = true; s.src = "https://gc.zgo.at/count.js"; s.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
    document.head.appendChild(s);
  }
})();
