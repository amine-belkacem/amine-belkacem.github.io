/* CPA on one AES-128 key byte, first round, Hamming-weight leakage + Gaussian noise. Pure JS, no library. */
(() => {
  // AES S-box (FIPS-197)
  const S = Uint8Array.from([
    0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
  ]);
  const HW = Uint8Array.from({ length: 256 }, (_, i) => { let c = 0, x = i; while (x) { c += x & 1; x >>= 1; } return c; });
  // HS[g][p] = HW(S[p ^ g]) precomputed
  const HS = Array.from({ length: 256 }, (_, g) => Uint8Array.from({ length: 256 }, (_, p) => HW[S[p ^ g]]));

  const $ = (id) => document.getElementById(id);
  const nFromSlider = (v) => Math.round(10 * Math.pow(10, (v / 100) * 3));   // 10 … 10,000, log scale
  let key = Math.floor(Math.random() * 256);
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const L = () => (window.PAGE ? PAGE.lang : "en");
  const T = {
    en: { rank: (r) => `rank of the right key: ${r}`, found: "key byte recovered", fail: "not recovered: more traces or less noise", best: (b, c) => `best guess 0x${b} (ρ = ${c})`, secret: (k) => `secret key byte 0x${k}`, n: "traces" },
    fr: { rank: (r) => `rang de la bonne clé : ${r}`, found: "octet de clé retrouvé", fail: "pas retrouvé : plus de traces ou moins de bruit", best: (b, c) => `meilleure hypothèse 0x${b} (ρ = ${c})`, secret: (k) => `octet de clé secret 0x${k}`, n: "traces" },
  };
  const hex = (x) => x.toString(16).padStart(2, "0");

  function attack() {
    const N = nFromSlider(+$("n").value), sigma = +$("sig").value;
    // running sums for every guess, with checkpoints for the convergence curve
    const sh = new Float64Array(256), shh = new Float64Array(256), shl = new Float64Array(256);
    let sl = 0, sll = 0;
    const cps = [], marks = new Set(Array.from({ length: 40 }, (_, i) => Math.max(5, Math.round(N * Math.pow((i + 1) / 40, 2)))));
    const corr = (n) => { const r = new Float64Array(256); const vl = n * sll - sl * sl;
      for (let g = 0; g < 256; g++) { const vh = n * shh[g] - sh[g] * sh[g]; const d = Math.sqrt(vh * vl); r[g] = d > 0 ? (n * shl[g] - sh[g] * sl) / d : 0; } return r; };
    for (let i = 1; i <= N; i++) {
      const p = (Math.random() * 256) | 0;
      const l = HW[S[p ^ key]] + sigma * gauss();
      sl += l; sll += l * l;
      for (let g = 0; g < 256; g++) { const h = HS[g][p]; sh[g] += h; shh[g] += h * h; shl[g] += h * l; }
      if (marks.has(i)) { const r = corr(i); let bw = 0; for (let g = 0; g < 256; g++) if (g !== key) bw = Math.max(bw, Math.abs(r[g])); cps.push([i, Math.abs(r[key]), bw]); }
    }
    const r = corr(N);
    drawBars(r); drawCurve(cps, N);
    const order = Array.from(r.keys()).sort((a, b) => Math.abs(r[b]) - Math.abs(r[a]));
    const rank = order.indexOf(key) + 1, t = T[L()];
    $("readout").innerHTML = `<span class="${rank === 1 ? "ok" : "ko"}">${rank === 1 ? t.found : t.fail}</span><span>${t.rank(rank)}</span><span>${t.best(hex(order[0]), Math.abs(r[order[0]]).toFixed(3))}</span><span>${t.secret(hex(key))}</span>`;
  }

  function ctx(id) {
    const c = $(id), dpr = Math.min(devicePixelRatio || 1, 2), w = c.clientWidth, h = c.clientHeight;
    if (c.width !== w * dpr) { c.width = w * dpr; c.height = h * dpr; }
    const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    return [g, w, h];
  }
  function drawBars(r) {
    const [g, w, h] = ctx("bars"); const pad = 28, bw = (w - 2 * pad) / 256;
    let max = 0; r.forEach((v) => (max = Math.max(max, Math.abs(v)))); max = Math.max(max, 0.05);
    g.strokeStyle = "rgba(255,255,255,.08)"; g.beginPath(); g.moveTo(pad, h - pad); g.lineTo(w - pad, h - pad); g.stroke();
    for (let k = 0; k < 256; k++) {
      const v = Math.abs(r[k]) / max, bh = v * (h - 2 * pad);
      g.fillStyle = k === key ? "#c6f432" : "rgba(180,140,255,.45)";
      if (k === key) { g.shadowColor = "#c6f432"; g.shadowBlur = 12; }
      g.fillRect(pad + k * bw, h - pad - bh, Math.max(1, bw - 0.6), bh);
      g.shadowBlur = 0;
    }
    g.fillStyle = "#7d8983"; g.font = "11px JetBrains Mono, monospace";
    g.fillText("0x00", pad, h - 8); g.fillText("0xff", w - pad - 30, h - 8); g.fillText("|ρ|", 4, pad);
  }
  function drawCurve(cps, N) {
    const [g, w, h] = ctx("curve"); const pad = 30;
    const X = (n) => pad + (Math.log10(n) / Math.log10(Math.max(N, 10))) * (w - 2 * pad), Y = (v) => h - pad - v * (h - 2 * pad);
    g.strokeStyle = "rgba(255,255,255,.08)"; for (const v of [0, 0.25, 0.5, 0.75, 1]) { g.beginPath(); g.moveTo(pad, Y(v)); g.lineTo(w - pad, Y(v)); g.stroke(); }
    for (const [i, col] of [[1, "#c6f432"], [2, "#b48cff"]]) {
      g.strokeStyle = col; g.lineWidth = 2; g.beginPath();
      cps.forEach((c, j) => (j ? g.lineTo(X(c[0]), Y(c[i])) : g.moveTo(X(c[0]), Y(c[i])))); g.stroke();
    }
    g.fillStyle = "#7d8983"; g.font = "11px JetBrains Mono, monospace"; g.fillText("|ρ|", 4, pad); g.fillText(`${N} ${T[L()].n} (log)`, w - pad - 120, h - 8);
  }

  function sync() { $("sigOut").textContent = $("sig").value; $("nOut").textContent = nFromSlider(+$("n").value).toLocaleString(); }
  let timer;
  const live = () => { sync(); clearTimeout(timer); timer = setTimeout(attack, 120); };
  $("sig").addEventListener("input", live); $("n").addEventListener("input", live);
  $("run").addEventListener("click", attack);
  $("newkey").addEventListener("click", () => { key = Math.floor(Math.random() * 256); attack(); });
  document.addEventListener("langchange", () => $("readout").childElementCount && attack());
  addEventListener("resize", () => { clearTimeout(timer); timer = setTimeout(attack, 200); });
  sync(); attack();
})();
