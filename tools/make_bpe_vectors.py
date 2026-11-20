"""Reference token ids for the browser BPE demo, computed by the original Python package.

Run with the french-bpe-tokenizer virtual environment, from this repository root:
    <path-to>/french-bpe-tokenizer/.venv/Scripts/python tools/make_bpe_vectors.py <path-to>/french-bpe-tokenizer
Writes demo/bpe-vectors.json, then `node tools/check_bpe.mjs` compares the JavaScript port with it.
"""
import json
import random
import sys
from pathlib import Path

repo = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(repo / "src"))
from frbpe.bpe import BPETokenizer  # noqa: E402

tok = BPETokenizer.load(repo / "models" / "fr_32k.bpe")
hand = [
    "L'école d'été est fermée aujourd'hui.",
    "Aujourd’hui, jusqu’à présent, lorsqu'il pleut, qu'en penses-tu ?",
    "Il dit 'non' puis s'en va.",
    "Le prix est de 1 234,56 € et 12 %… vraiment ?!",
    "TOUT EN MAJUSCULES : L'ÉTÉ À PARIS",
    "Ligne 1\nLigne 2\r\n\n   indentation\tet tabulation   ",
    "Émojis 😀 et symboles ©®™ — tirets – et « guillemets ».",
    "C'est l'heure : 08h30, le 14/07/1789.",
    "Quelqu'un, presqu'île, puisqu'on, quoiqu'il, lorsqu'elle.",
    "   espaces au début et à la fin   ",
    "",
    "x",
]
docs = []
rng = random.Random(42)
for name in ("test_wiki.jsonl", "test_gutenberg.jsonl"):
    lines = (repo / "data" / "processed" / name).read_text(encoding="utf-8").splitlines()
    for line in rng.sample(lines, min(40, len(lines))):
        text = json.loads(line)["text"]
        docs.append(text[:3000])
cases = [{"text": t, "ids": tok.encode(t)} for t in hand + docs]
out = Path(__file__).resolve().parents[1] / "demo" / "bpe-vectors.json"
out.write_text(json.dumps(cases, ensure_ascii=False), encoding="utf-8")
print(f"{len(cases)} cases, {sum(len(c['ids']) for c in cases)} tokens -> {out}")
