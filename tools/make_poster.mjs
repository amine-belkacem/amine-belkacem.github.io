// Captures the 3D hero as two still images (desktop + phone) shown while the real 3D loads.
//   1. serve the site:  python -m http.server 8797
//   2. npm run poster   (or: node tools/make_poster.mjs http://localhost:8797)
// Needs Google Chrome. Writes assets/hero-desktop.webp and assets/hero-mobile.webp.
import puppeteer from "puppeteer-core";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] || "http://localhost:8797";
const chrome = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const shots = [
  { file: "hero-desktop.webp", width: 1600, height: 1000, dpr: 1, lite: false },
  { file: "hero-mobile.webp", width: 430, height: 1100, dpr: 2, lite: true },
];

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const s of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: s.dpr });
  await page.goto(`${base}/?poster=1&lang=en`, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const url = await page.evaluate(async (lite) => {
    const m = await import("./js/scene.min.js");
    const api = m.start({ lite, motion: "full", poster: true });
    return api.snapshot(150);
  }, s.lite);
  writeFileSync(join(root, "assets", s.file), Buffer.from(url.split(",")[1], "base64"));
  console.log(`assets/${s.file}  ${Math.round(url.length * 0.75 / 1024)} KB`);
  await page.close();
}
await browser.close();
