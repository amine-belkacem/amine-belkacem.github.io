/* Visual effects: PCB hero canvas with signal pulses, oscilloscope strip,
   cursor glow, card spotlight, scroll reveal, count-up. No library. */
window.FX = (() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LIME = "198,244,50", VIOLET = "180,140,255", MINT = "62,240,168";

  /* deterministic PRNG so the board looks the same on every visit */
  function rng(seed) {
    return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  /* ---------------- PCB ---------------- */
  function pcb(canvas) {
    const ctx = canvas.getContext("2d");
    const board = document.createElement("canvas");
    const bctx = board.getContext("2d");
    let W = 0, H = 0, dpr = 1, traces = [], pulses = [], chip = null, flash = 0, running = true, last = 0;
    const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

    function build() {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [canvas, board]) { c.width = W * dpr; c.height = H * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = W < 760;
      const g = mobile ? 22 : 26;
      const n = 7;                          // pins per side
      const size = (n + 1) * g;
      const cx = Math.round((mobile ? W * 0.5 : W * 0.72) / g) * g;
      const cy = Math.round((mobile ? 96 + size / 2 : H * 0.46) / g) * g;
      chip = { x: cx - size / 2, y: cy - size / 2, s: size, g };
      const rand = rng(26);
      traces = [];

      const sides = [
        { d: 6, pin: (i) => [chip.x + (i + 1) * g, chip.y] },
        { d: 0, pin: (i) => [chip.x + size, chip.y + (i + 1) * g] },
        { d: 2, pin: (i) => [chip.x + (i + 1) * g, chip.y + size] },
        { d: 4, pin: (i) => [chip.x, chip.y + (i + 1) * g] },
      ];
      for (const side of sides) {
        for (let i = 0; i < n; i++) {
          const [px, py] = side.pin(i);
          const pts = [[px, py]];
          let x = px, y = py, d = side.d, len = 0;
          const maxLen = 8 + Math.floor(rand() * 34);
          let run = 2 + Math.floor(rand() * 2);
          while (len < maxLen) {
            x += DIRS[d][0] * g; y += DIRS[d][1] * g; len++;
            if (x < -g || y < -g || x > W + g || y > H + g) break;
            if (--run <= 0) {
              const turn = rand() < 0.5 ? -1 : 1;
              const nd = (d + turn + 8) % 8;
              // never turn back toward the chip
              if (Math.abs(((nd - side.d + 12) % 8) - 4) >= 2) d = nd;
              else d = side.d;
              pts.push([x, y]);
              run = 1 + Math.floor(rand() * 3);
            }
          }
          pts.push([x, y]);
          let total = 0; const cum = [0];
          for (let k = 1; k < pts.length; k++) { total += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); cum.push(total); }
          traces.push({ pts, cum, total, end: pts[pts.length - 1] });
        }
      }
      drawBoard();
    }

    function drawBoard() {
      const b = bctx, { x, y, s, g } = chip;
      b.clearRect(0, 0, W, H);
      // dot grid
      b.fillStyle = "rgba(255,255,255,.05)";
      for (let gx = (x % g); gx < W; gx += g) for (let gy = (y % g); gy < H; gy += g) b.fillRect(gx - .5, gy - .5, 1, 1);
      // traces
      b.lineCap = "round"; b.lineJoin = "round";
      for (const t of traces) {
        b.strokeStyle = `rgba(${LIME},.13)`; b.lineWidth = 1.6;
        b.beginPath(); t.pts.forEach(([px, py], i) => (i ? b.lineTo(px, py) : b.moveTo(px, py))); b.stroke();
        b.strokeStyle = `rgba(${LIME},.28)`; b.lineWidth = 1.2;
        b.beginPath(); b.arc(t.end[0], t.end[1], 3.2, 0, Math.PI * 2); b.stroke();
      }
      // chip body
      b.save();
      b.shadowColor = `rgba(${LIME},.25)`; b.shadowBlur = 40;
      b.fillStyle = "#0c110f"; roundRect(b, x, y, s, s, 10); b.fill();
      b.restore();
      b.strokeStyle = `rgba(${LIME},.45)`; b.lineWidth = 1.2; roundRect(b, x, y, s, s, 10); b.stroke();
      // pins
      b.fillStyle = `rgba(${LIME},.55)`;
      for (let i = 1; i <= 7; i++) {
        b.fillRect(x + i * g - 2.5, y - 6, 5, 6); b.fillRect(x + i * g - 2.5, y + s, 5, 6);
        b.fillRect(x - 6, y + i * g - 2.5, 6, 5); b.fillRect(x + s, y + i * g - 2.5, 6, 5);
      }
      // die
      const m = g * 1.6, d = s - 2 * m;
      b.fillStyle = "#111a16"; roundRect(b, x + m, y + m, d, d, 5); b.fill();
      b.strokeStyle = `rgba(${LIME},.18)`; b.lineWidth = 1;
      for (let k = 1; k < 8; k++) {
        b.beginPath(); b.moveTo(x + m + (d * k) / 8, y + m + 4); b.lineTo(x + m + (d * k) / 8, y + m + d - 4); b.stroke();
        b.beginPath(); b.moveTo(x + m + 4, y + m + (d * k) / 8); b.lineTo(x + m + d - 4, y + m + (d * k) / 8); b.stroke();
      }
      b.fillStyle = `rgba(${LIME},.9)`; b.font = `700 ${Math.round(g * 0.62)}px "JetBrains Mono", monospace`;
      b.textAlign = "center"; b.fillText("MAB-26", x + s / 2, y + s / 2 + g * 0.2);
      b.fillStyle = "rgba(255,255,255,.35)"; b.font = `500 ${Math.round(g * 0.34)}px "JetBrains Mono", monospace`;
      b.fillText("FPGA · EMBEDDED · AI", x + s / 2, y + s / 2 + g * 0.85);
      b.beginPath(); b.arc(x + 14, y + 14, 3, 0, Math.PI * 2); b.fillStyle = "rgba(255,255,255,.25)"; b.fill();
    }

    function roundRect(c, x, y, w, h, r) {
      c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    }

    function at(t, dist) {
      const { pts, cum } = t;
      let k = 1; while (k < cum.length - 1 && cum[k] < dist) k++;
      const seg = cum[k] - cum[k - 1] || 1, f = Math.max(0, Math.min(1, (dist - cum[k - 1]) / seg));
      return [pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * f, pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * f];
    }

    function spawn(inward = Math.random() < 0.78) {
      const t = traces[Math.floor(Math.random() * traces.length)];
      pulses.push({ t, d: inward ? t.total : 0, v: (inward ? -1 : 1) * (90 + Math.random() * 120), inward, tail: 46 + Math.random() * 40 });
    }

    function drawPulse(p) {
      const head = p.d, tail = p.inward ? Math.min(p.t.total, head + p.tail) : Math.max(0, head - p.tail);
      const col = p.inward ? LIME : VIOLET;
      const steps = 10;
      for (let i = 0; i < steps; i++) {
        const a = at(p.t, tail + ((head - tail) * i) / steps), b = at(p.t, tail + ((head - tail) * (i + 1)) / steps);
        ctx.strokeStyle = `rgba(${col},${(0.9 * (i + 1)) / steps})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      const h = at(p.t, head);
      ctx.save(); ctx.shadowColor = `rgba(${col},1)`; ctx.shadowBlur = 14;
      ctx.fillStyle = `rgba(${col},1)`; ctx.beginPath(); ctx.arc(h[0], h[1], 2.6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }

    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(board, 0, 0, W, H);
      if (pulses.length < 18 && Math.random() < 0.18) spawn();
      for (const p of pulses) p.d += p.v * dt;
      pulses = pulses.filter((p) => {
        if (p.inward && p.d <= 0) { flash = 1; return false; }
        return p.inward ? true : p.d < p.t.total;
      });
      pulses.forEach(drawPulse);
      if (flash > 0.01) {
        ctx.strokeStyle = `rgba(${LIME},${0.6 * flash})`; ctx.lineWidth = 2;
        ctx.save(); ctx.shadowColor = `rgba(${LIME},1)`; ctx.shadowBlur = 30 * flash;
        roundRect(ctx, chip.x, chip.y, chip.s, chip.s, 10); ctx.stroke(); ctx.restore();
        flash *= 0.9;
      }
      requestAnimationFrame(frame);
    }

    build();
    if (reduce) {
      ctx.drawImage(board, 0, 0, W, H);
      for (let i = 0; i < 10; i++) { spawn(); pulses[i].d = pulses[i].t.total * Math.random(); }
      pulses.forEach(drawPulse);
    } else {
      for (let i = 0; i < 8; i++) { spawn(); pulses[i].d *= Math.random(); }
      requestAnimationFrame(frame);
      new IntersectionObserver(([e]) => {
        const was = running; running = e.isIntersecting;
        if (running && !was) { last = performance.now(); requestAnimationFrame(frame); }
      }).observe(canvas);
    }
    let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (reduce) ctx.drawImage(board, 0, 0, W, H); }, 150); });
    document.fonts && document.fonts.ready.then(() => drawBoard());
  }

  /* ---------------- oscilloscope ---------------- */
  function scope(canvas) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, off = 0, running = true, last = 0;
    const bits = Array.from({ length: 400 }, (_, i) => (Math.sin(i * 12.9898) * 43758.5453) % 1 > 0 ? 1 : 0);
    function size() {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
      off += dt * 60;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,.06)"; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0, H / 2 + .5); ctx.lineTo(W, H / 2 + .5); ctx.stroke();
      // CH1: digital frame
      const bw = 14, hi = H * 0.22, lo = H * 0.42;
      ctx.strokeStyle = `rgba(${LIME},.9)`; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let x = -bw; x < W + bw; x += 1) {
        const i = Math.floor((x + off) / bw), b = bits[((i % bits.length) + bits.length) % bits.length];
        const y = b ? hi : lo;
        x === -bw ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      // CH2: analog
      ctx.strokeStyle = `rgba(${VIOLET},.75)`; ctx.lineWidth = 1.3; ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const u = (x + off * 1.3) / 38;
        const y = H * 0.74 + Math.sin(u) * H * 0.11 + Math.sin(u * 3.1) * H * 0.03 + Math.sin(u * 0.37) * H * 0.04;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      if (running && !reduce) requestAnimationFrame(draw);
    }
    size(); requestAnimationFrame(draw);
    addEventListener("resize", size);
    if (!reduce) new IntersectionObserver(([e]) => {
      const was = running; running = e.isIntersecting;
      if (running && !was) { last = performance.now(); requestAnimationFrame(draw); }
    }).observe(canvas);
  }

  /* ---------------- cursor glow + card spotlight ---------------- */
  function pointer() {
    const glow = document.getElementById("glow");
    if (matchMedia("(hover: none)").matches) { glow.remove(); return; }
    addEventListener("pointermove", (e) => {
      glow.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
      const card = e.target.closest && e.target.closest(".spot");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    }, { passive: true });
  }

  /* ---------------- reveal + count-up ---------------- */
  const io = "IntersectionObserver" in window && !reduce
    ? new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }), { rootMargin: "0px 0px -8% 0px" })
    : null;
  function reveal(root = document) {
    root.querySelectorAll(".reveal:not(.in)").forEach((el, i) => {
      el.style.setProperty("--d", `${(i % 6) * 60}ms`);
      io ? io.observe(el) : el.classList.add("in");
    });
  }
  const final = () => document.querySelectorAll("[data-count]").forEach((el) => {
    el.textContent = el.dataset.count.padStart(2, "0"); el.dataset.done = "1";
  });
  addEventListener("beforeprint", final);
  matchMedia("print").addEventListener?.("change", (e) => e.matches && final());
  function countUp(root = document) {
    root.querySelectorAll("[data-count]").forEach((el) => {
      const to = +el.dataset.count;
      delete el.dataset.done;
      if (reduce || matchMedia("print").matches || navigator.webdriver) { el.textContent = String(to).padStart(2, "0"); return; }
      const t0 = performance.now(), dur = 1100;
      const step = (now) => {
        if (el.dataset.done) return;
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * e).toString().padStart(2, "0");
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  function init() {
    const c = document.getElementById("pcb"), s = document.getElementById("scopeCanvas");
    if (c) pcb(c);
    if (s) scope(s);
    pointer();
  }
  return { init, reveal, countUp, MINT };
})();
