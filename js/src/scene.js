/* Hero: a 3D circuit board rendered with three.js (source; bundled to js/scene.min.js by tools/build.mjs).
   Signals run along the traces into the MAB-26 chip; the board follows the mouse;
   clicking the chip fires a burst back out.

   start(opts) is called by app.js only after the page text is on screen:
     opts.lite    true on phones / weak machines: smaller textures, no bloom, fewer parts, 30 fps
     opts.motion  "full" | "calm"  (calm = slower, gentler; used when the OS asks for reduced motion)
     opts.poster  true only when tools/make_poster.mjs captures the still image                      */
import {
  WebGLRenderer, Scene, Color, Fog, PMREMGenerator, PerspectiveCamera, Vector3, Vector2, Group, Mesh,
  MeshStandardMaterial, CanvasTexture, SRGBColorSpace, ACESFilmicToneMapping, PlaneGeometry, BoxGeometry,
  InstancedMesh, Matrix4, Quaternion, LineBasicMaterial, LineSegments, EdgesGeometry, CylinderGeometry,
  TorusGeometry, HemisphereLight, DirectionalLight, PointLight, BufferGeometry, BufferAttribute,
  PointsMaterial, Points, AdditiveBlending, Raycaster, Clock,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const LIME = new Color("#c6f432"), MINT = new Color("#3ef0a8"), VIOLET = new Color("#b48cff");
const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

export function start({ lite = false, motion = "full", poster = false } = {}) {
  const stage = document.getElementById("stage");
  const hero = document.getElementById("hero");
  const calm = motion === "calm";
  let renderer;
  try {
    renderer = new WebGLRenderer({ antialias: !lite, powerPreference: lite ? "low-power" : "high-performance", preserveDrawingBuffer: poster, alpha: false });
  } catch (e) {
    stage.classList.add("no-webgl");
    return null;
  }
  const mobile = () => innerWidth < 820;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lite ? 1 : 1.5));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");
  stage.appendChild(renderer.domElement);

  const scene = new Scene();
  scene.background = new Color("#050706");
  scene.fog = new Fog("#050706", 38, 70);
  if (!lite) {
    const pmrem = new PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }

  const camera = new PerspectiveCamera(30, 1, 0.1, 200);
  const CAM = new Vector3(0, 26, 27);

  /* ---------- board geometry and trace network ---------- */
  const BW = 46, BD = 32, G = 0.75, HALF = 3;
  const rand = rng(2026);
  const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const traces = [];
  const sides = [
    { d: 6, pin: (o) => [o, -HALF - 0.3] }, { d: 0, pin: (o) => [HALF + 0.3, o] },
    { d: 2, pin: (o) => [o, HALF + 0.3] }, { d: 4, pin: (o) => [-HALF - 0.3, o] },
  ];
  for (const s of sides) {
    for (let i = 0; i < 7; i++) {
      const o = -2.25 + i * 0.75;
      let [x, z] = s.pin(o), d = s.d, run = 2 + Math.floor(rand() * 3), len = 0;
      const pts = [[x, z]];
      const max = 10 + Math.floor(rand() * 34);
      while (len++ < max) {
        x += DIRS[d][0] * G; z += DIRS[d][1] * G;
        if (Math.abs(x) > BW / 2 - 1 || Math.abs(z) > BD / 2 - 1) break;
        if (--run <= 0) {
          const nd = (d + (rand() < 0.5 ? -1 : 1) + 8) % 8;
          d = Math.abs(((nd - s.d + 12) % 8) - 4) >= 2 ? nd : s.d;
          pts.push([x, z]);
          run = 2 + Math.floor(rand() * 4);
        }
      }
      pts.push([x, z]);
      const cum = [0];
      for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      traces.push({ pts, cum, total: cum.at(-1) });
    }
  }

  /* ---------- board textures (drawn once on canvas; half size in lite mode) ---------- */
  const CW = lite ? 1024 : 2048, CH = Math.round(CW * BD / BW), S = CW / 2048;
  const px = (x, z) => [((x + BW / 2) / BW) * CW, ((z + BD / 2) / BD) * CH];
  function boardCanvas(emissive) {
    const c = document.createElement("canvas"); c.width = CW; c.height = CH;
    const g = c.getContext("2d");
    g.fillStyle = emissive ? "#000" : "#08100c"; g.fillRect(0, 0, CW, CH);
    if (!emissive) {
      g.fillStyle = "rgba(198,244,50,.06)";
      for (let x = 0; x < CW; x += CW / (BW / G)) for (let y = 0; y < CH; y += CH / (BD / G)) g.fillRect(x, y, 2 * S + 1, 2 * S + 1);
      g.strokeStyle = "rgba(255,255,255,.05)"; g.lineWidth = 3 * S; g.strokeRect(24 * S, 24 * S, CW - 48 * S, CH - 48 * S);
    }
    g.lineCap = "round"; g.lineJoin = "round";
    for (const t of traces) {
      g.strokeStyle = emissive ? "rgba(255,255,255,.55)" : "#1d2a10"; g.lineWidth = 7 * S;
      g.beginPath(); t.pts.forEach(([x, z], i) => { const [a, b] = px(x, z); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.stroke();
      const [ex, ey] = px(...t.pts.at(-1));
      g.lineWidth = 5 * S; g.strokeStyle = emissive ? "rgba(255,255,255,.8)" : "#2e3f18";
      g.beginPath(); g.arc(ex, ey, 11 * S, 0, Math.PI * 2); g.stroke();
    }
    g.fillStyle = emissive ? "rgba(255,255,255,.25)" : "rgba(230,240,230,.35)";
    g.font = `600 ${Math.round(30 * S)}px "JetBrains Mono", monospace`;
    g.fillText("MAB-26 · REV 3.0", 60 * S, CH - 60 * S);
    g.fillText("U1", CW / 2 - 150 * S, CH / 2 - 150 * S);
    g.fillText("M2 CSEC · UNIV. LORRAINE", CW - 520 * S, 80 * S);
    for (const [fx, fy] of [[70 * S, 70 * S], [CW - 70 * S, CH - 70 * S]]) { g.beginPath(); g.arc(fx, fy, 16 * S, 0, Math.PI * 2); g.fill(); }
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace; tex.anisotropy = lite ? 2 : 8;
    return tex;
  }

  const world = new Group();
  scene.add(world);
  const board = new Mesh(
    new RoundedBoxGeometry(BW, 0.6, BD, lite ? 1 : 3, 0.25),
    new MeshStandardMaterial({
      color: "#ffffff", map: boardCanvas(false), emissiveMap: boardCanvas(true), emissive: LIME, emissiveIntensity: lite ? 0.3 : 0.16,
      roughness: 0.62, metalness: lite ? 0.1 : 0.25,
    }),
  );
  board.position.y = -0.3;
  world.add(board);

  /* ---------- chip ---------- */
  const chip = new Group();
  world.add(chip);
  const body = new Mesh(
    new RoundedBoxGeometry(HALF * 2, 0.9, HALF * 2, lite ? 2 : 4, 0.22),
    new MeshStandardMaterial({ color: "#0e1311", roughness: 0.32, metalness: lite ? 0.2 : 0.55 }),
  );
  body.position.y = 0.45;
  chip.add(body);

  const topC = document.createElement("canvas"); topC.width = topC.height = 512;
  const tg = topC.getContext("2d");
  tg.fillStyle = "#000"; tg.fillRect(0, 0, 512, 512);
  tg.strokeStyle = "rgba(198,244,50,.35)"; tg.lineWidth = 2;
  for (let k = 1; k < 8; k++) {
    tg.beginPath(); tg.moveTo(96 + k * 40, 100); tg.lineTo(96 + k * 40, 412); tg.stroke();
    tg.beginPath(); tg.moveTo(100, 96 + k * 40); tg.lineTo(412, 96 + k * 40); tg.stroke();
  }
  tg.strokeStyle = "rgba(198,244,50,.8)"; tg.lineWidth = 4; tg.strokeRect(96, 96, 320, 320);
  tg.fillStyle = "#c6f432"; tg.font = '700 64px "JetBrains Mono", monospace'; tg.textAlign = "center";
  tg.fillText("MAB-26", 256, 270);
  tg.fillStyle = "rgba(255,255,255,.6)"; tg.font = '500 22px "JetBrains Mono", monospace';
  tg.fillText("FPGA · EMBEDDED · AI", 256, 316);
  tg.beginPath(); tg.arc(60, 60, 14, 0, Math.PI * 2); tg.fill();
  const topTex = new CanvasTexture(topC); topTex.colorSpace = SRGBColorSpace;
  const topMat = new MeshStandardMaterial({ color: "#0b0f0d", emissive: "#ffffff", emissiveMap: topTex, emissiveIntensity: 0.9, roughness: 0.4, metalness: 0.4 });
  const top = new Mesh(new PlaneGeometry(HALF * 2 - 0.5, HALF * 2 - 0.5), topMat);
  top.rotation.x = -Math.PI / 2; top.position.y = 0.905;
  chip.add(top);

  const pins = new InstancedMesh(new BoxGeometry(0.28, 0.16, 0.62), new MeshStandardMaterial({ color: "#8f978d", metalness: 0.9, roughness: 0.4, envMapIntensity: 0.6 }), 28);
  const m4 = new Matrix4(), q = new Quaternion(), sc = new Vector3(1, 1, 1), up = new Vector3(0, 1, 0);
  let pi = 0;
  for (let i = 0; i < 7; i++) {
    const o = -2.25 + i * 0.75;
    for (const [x, z, rot] of [[o, -HALF - 0.25, 0], [o, HALF + 0.25, 0], [-HALF - 0.25, o, 1], [HALF + 0.25, o, 1]]) {
      q.setFromAxisAngle(up, rot * Math.PI / 2);
      m4.compose(new Vector3(x, 0.1, z), q, sc); pins.setMatrixAt(pi++, m4);
    }
  }
  chip.add(pins);

  const edgeMat = new LineBasicMaterial({ color: LIME, transparent: true, opacity: 0.25 });
  const edges = new LineSegments(new EdgesGeometry(new BoxGeometry(HALF * 2 + 0.06, 0.92, HALF * 2 + 0.06)), edgeMat);
  edges.position.y = 0.45;
  chip.add(edges);

  /* ---------- passive components (fewer in lite mode, shared geometries) ---------- */
  const darkMat = new MeshStandardMaterial({ color: "#151b18", roughness: 0.5, metalness: 0.3 });
  const capMat = new MeshStandardMaterial({ color: "#20262a", roughness: 0.3, metalness: lite ? 0.3 : 0.7 });
  const silver = new MeshStandardMaterial({ color: "#a9aea6", roughness: 0.35, metalness: lite ? 0.4 : 0.9, envMapIntensity: 0.6 });
  const ledMat = new MeshStandardMaterial({ color: "#111", emissive: LIME, emissiveIntensity: 1.6 });
  const resGeo = new RoundedBoxGeometry(0.9, 0.32, 0.45, 1, 0.06), capEndGeo = new BoxGeometry(0.16, 0.34, 0.47);
  const crand = rng(77);
  const free = (x, z, r) => Math.abs(x) > HALF + r + 0.8 || Math.abs(z) > HALF + r + 0.8;
  for (let i = 0; i < (lite ? 12 : 26); i++) {
    const x = (crand() - 0.5) * (BW - 6), z = (crand() - 0.5) * (BD - 6);
    if (!free(x, z, 1)) continue;
    const r = new Group(); r.position.set(x, 0, z); r.rotation.y = crand() < 0.5 ? 0 : Math.PI / 2;
    const b = new Mesh(resGeo, darkMat); b.position.y = 0.16; r.add(b);
    for (const s of [-1, 1]) { const e = new Mesh(capEndGeo, silver); e.position.set(s * 0.45, 0.16, 0); r.add(e); }
    world.add(r);
  }
  const capGeo = new CylinderGeometry(0.55, 0.55, 1.4, lite ? 16 : 32), ringGeo = new TorusGeometry(0.42, 0.04, 8, lite ? 16 : 32);
  const ringMat = new MeshStandardMaterial({ color: "#111", emissive: LIME, emissiveIntensity: 0.6 });
  for (const [x, z] of [[-8, -6], [-9.5, -6], [8.5, 6.5], [10, 6.5], [-14, 8], [15, -8], [6.5, -9.5]]) {
    const c = new Mesh(capGeo, capMat); c.position.set(x, 0.7, z); world.add(c);
    const ring = new Mesh(ringGeo, ringMat); ring.rotation.x = Math.PI / 2; ring.position.set(x, 1.41, z); world.add(ring);
  }
  const xtal = new Mesh(new RoundedBoxGeometry(2.2, 0.55, 0.9, 2, 0.35), capMat); xtal.position.set(-6.5, 0.28, 7.5); world.add(xtal);
  if (!lite) {
    const header = new Group(); header.position.set(13, 0, 11);
    const hb = new BoxGeometry(0.5, 0.5, 0.5), hp = new BoxGeometry(0.12, 1.4, 0.12);
    for (let i = 0; i < 8; i++) {
      const h = new Mesh(hb, darkMat); h.position.set(i * 0.6, 0.25, 0); header.add(h);
      const p = new Mesh(hp, silver); p.position.set(i * 0.6, 0.7, 0); header.add(p);
    }
    world.add(header);
  }
  const leds = [];
  const ledGeo = new RoundedBoxGeometry(0.7, 0.3, 0.45, 1, 0.08);
  for (const [x, z] of [[-17, -11], [-15.8, -11], [-14.6, -11]]) {
    const l = new Mesh(ledGeo, ledMat.clone()); l.position.set(x, 0.15, z); world.add(l); leds.push(l);
  }

  /* ---------- lights ---------- */
  scene.add(new HemisphereLight("#e8f4ea", "#050706", lite ? 0.7 : 0.35));
  const key = new DirectionalLight("#ffffff", 1.4); key.position.set(-12, 22, 10); scene.add(key);
  const rim = new PointLight(VIOLET, 60, 40, 1.6); rim.position.set(16, 6, -12); scene.add(rim);
  const core = new PointLight(LIME, 30, 18, 1.8); core.position.set(0, 4, 0); scene.add(core);

  /* ---------- signal pulses (additive points) ---------- */
  const TAIL = lite ? 10 : 16, MAXP = lite ? 26 : 44;
  const spr = document.createElement("canvas"); spr.width = spr.height = 64;
  const sg = spr.getContext("2d"), grad = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)"); grad.addColorStop(0.35, "rgba(255,255,255,.6)"); grad.addColorStop(1, "rgba(255,255,255,0)");
  sg.fillStyle = grad; sg.fillRect(0, 0, 64, 64);
  const pGeo = new BufferGeometry();
  const pos = new Float32Array(MAXP * TAIL * 3), col = new Float32Array(MAXP * TAIL * 3);
  pGeo.setAttribute("position", new BufferAttribute(pos, 3));
  pGeo.setAttribute("color", new BufferAttribute(col, 3));
  // without bloom (lite) the points are drawn a bit bigger so they still read as glowing
  const pMat = new PointsMaterial({ size: lite ? 0.8 : 0.55, map: new CanvasTexture(spr), vertexColors: true, transparent: true, depthWrite: false, blending: AdditiveBlending });
  world.add(new Points(pGeo, pMat));
  let pulses = [];
  const speed = calm ? 0.45 : 1;
  function at(t, d) {
    const { pts, cum } = t; let k = 1;
    while (k < cum.length - 1 && cum[k] < d) k++;
    const f = Math.max(0, Math.min(1, (d - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1)));
    return [pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * f, pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * f];
  }
  function spawn(inward = true, color) {
    if (pulses.length >= MAXP) return;
    const t = traces[Math.floor(Math.random() * traces.length)];
    pulses.push({ t, d: inward ? t.total : 0, v: (inward ? -1 : 1) * (5 + Math.random() * 5) * speed, inward, color: color || (Math.random() < 0.82 ? LIME : MINT), tail: 1.6 + Math.random() * 1.4 });
  }
  let flash = 0;
  const chipJump = { t: 0 };
  function burst() {
    for (let i = 0; i < (lite ? 18 : 30); i++) setTimeout(() => spawn(false, i % 3 ? VIOLET : MINT), i * 18);
    flash = 1.6; chipJump.t = 1;
  }
  function updatePulses(dt) {
    if (Math.random() < 0.22 * speed) spawn(Math.random() < 0.85);
    pulses.forEach((p) => (p.d += p.v * dt));
    pulses = pulses.filter((p) => {
      if (p.inward && p.d <= 0) { flash = Math.min(1.6, flash + 0.45); return false; }
      return p.inward || p.d < p.t.total;
    });
    let n = 0;
    for (const p of pulses) {
      for (let k = 0; k < TAIL; k++) {
        const f = k / (TAIL - 1), dd = p.inward ? p.d + f * p.tail : p.d - f * p.tail;
        const [x, z] = at(p.t, Math.max(0, Math.min(p.t.total, dd)));
        pos[n * 3] = x; pos[n * 3 + 1] = 0.08; pos[n * 3 + 2] = z;
        const a = Math.pow(1 - f, 2.2) * (k === 0 ? 1.6 : 1);
        col[n * 3] = p.color.r * a; col[n * 3 + 1] = p.color.g * a; col[n * 3 + 2] = p.color.b * a;
        n++;
      }
    }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
    pGeo.setDrawRange(0, n);
  }

  /* ---------- rendering: bloom on capable machines, plain render in lite mode ---------- */
  let composer = null, bloom = null;
  if (!lite) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new Vector2(256, 256), 0.62, 0.5, 0.32);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }
  const draw = () => (composer ? composer.render() : renderer.render(scene, camera));

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    if (composer) { composer.setSize(w, h); bloom.resolution.set(w / 2, h / 2); }
    camera.aspect = w / h;
    if (mobile()) {
      // tall mobile hero: lift the chip to just above the text block
      const text = document.getElementById("heroInner");
      const textTop = text ? text.getBoundingClientRect().top - stage.getBoundingClientRect().top : h * 0.35;
      const target = Math.max(150, textTop - 120);
      camera.setViewOffset(w, h, 0, h / 2 - target, w, h); camera.fov = 40; CAM.set(0, 36, 31);
    } else {
      camera.setViewOffset(w, h, -w * 0.22, h * 0.03, w, h); camera.fov = 28; CAM.set(0, 31, 36);
    }
    camera.updateProjectionMatrix();
    camera.position.copy(CAM); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
    draw();
  }
  resize();
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(resize, 120); });

  /* ---------- interaction ---------- */
  const mouse = new Vector2(), target = { rx: 0, ry: 0 }, ray = new Raycaster();
  let hovering = false, scrollP = 0;
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = stage.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    target.ry = mouse.x * (calm ? 0.1 : 0.22); target.rx = -mouse.y * (calm ? 0.04 : 0.08);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects([body, top]).length > 0;
    if (hit !== hovering) { hovering = hit; dispatchEvent(new CustomEvent("chiphover", { detail: hit })); }
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { target.rx = target.ry = 0; if (hovering) { hovering = false; dispatchEvent(new CustomEvent("chiphover", { detail: false })); } });
  hero.addEventListener("click", (e) => {
    if (e.target.closest("a,button")) return;
    const r = stage.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    if (ray.intersectObjects([body, top]).length) burst();   // works for taps too
  });
  addEventListener("scroll", () => { scrollP = Math.min(1, scrollY / (hero.offsetHeight || 1)); }, { passive: true });

  /* ---------- loop: pauses when the hero is off screen or the tab is hidden; 30 fps in lite mode ---------- */
  const clock = new Clock();
  let visible = true, looping = false, acc = 0;
  const minFrame = lite ? 1 / 30 : 0;
  function frame(dt, t) {
    world.rotation.y += (target.ry - world.rotation.y) * 0.06;
    world.rotation.x += (target.rx + scrollP * 0.35 - world.rotation.x) * 0.06;
    if (chipJump.t > 0) { chipJump.t = Math.max(0, chipJump.t - dt * 3); chip.position.y = Math.sin(chipJump.t * Math.PI) * 0.5; }
    world.position.y = Math.sin(t * 0.8 * speed) * 0.15 - scrollP * 4;
    camera.position.set(CAM.x, CAM.y - scrollP * 6, CAM.z - scrollP * 8);
    camera.lookAt(0, 0, 0);
    updatePulses(dt);
    flash *= 0.92;
    edgeMat.opacity = 0.25 + Math.min(1, flash) * 0.75 + (hovering ? 0.4 : 0);
    topMat.emissiveIntensity = 0.9 + flash * 0.9;
    core.intensity = 18 + flash * 45 + (hovering ? 30 : 0);
    leds.forEach((l, i) => (l.material.emissiveIntensity = 0.6 + 1.2 * (0.5 + 0.5 * Math.sin(t * 3 * speed + i * 1.7))));
    draw();
  }
  function loop() {
    if (looping || poster) return; looping = true; clock.getDelta();
    const tick = () => {
      if (!visible || document.hidden) { looping = false; return; }
      const d = Math.min(0.05, clock.getDelta());
      acc += d;
      if (acc >= minFrame) { frame(acc, clock.elapsedTime); acc = 0; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }).observe(hero);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) loop(); });

  for (let i = 0; i < 16; i++) { spawn(); if (pulses[i]) pulses[i].d *= Math.random(); }
  frame(0.016, 0);
  if (!poster) loop();
  requestAnimationFrame(() => stage.classList.add("ready"));

  const api = {
    burst,
    /* where the chip lands on screen, in CSS px */
    chipScreen() { const v = new Vector3(); chip.getWorldPosition(v); v.project(camera); return [(v.x + 1) / 2 * stage.clientWidth, (1 - v.y) / 2 * stage.clientHeight]; },
    /* advance n frames and return the canvas as a WebP data URL (used to make the poster image) */
    snapshot(n = 90) { for (let i = 0; i < n; i++) frame(1 / 60, i / 60); return renderer.domElement.toDataURL("image/webp", 0.82); },
  };
  window.SCENE = api;
  return api;
}
