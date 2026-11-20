// Checks that the browser BPE port (demo/bpe-core.js) gives exactly the Python ids stored in demo/bpe-vectors.json.
//   node tools/check_bpe.mjs        exit code 0 = identical on every case
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
await import(pathToFileURL(join(root, "demo", "bpe-core.js")).href);   // registers globalThis.FRBPE, as in the browser
const FRBPE = globalThis.FRBPE;
const tok = FRBPE.load(readFileSync(join(root, "demo", "fr_32k.bpe"), "utf8"));
const cases = JSON.parse(readFileSync(join(root, "demo", "bpe-vectors.json"), "utf8"));

let bad = 0, tokens = 0;
for (const [i, c] of cases.entries()) {
  const got = tok.encode(c.text);
  tokens += c.ids.length;
  const same = got.length === c.ids.length && got.every((v, k) => v === c.ids[k]);
  if (!same) {
    bad++;
    const k = got.findIndex((v, j) => v !== c.ids[j]);
    console.log(`ECHEC case ${i}: first difference at token ${k}: obtenu=${got[k]} attendu=${c.ids[k]}  text=${JSON.stringify(c.text.slice(0, 80))}`);
  }
}
console.log(`${cases.length - bad}/${cases.length} cases identical, ${tokens} reference tokens`);
process.exit(bad ? 1 : 0);
