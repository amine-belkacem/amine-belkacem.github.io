/* Byte-level BPE encoder, JavaScript port of frbpe (github.com/amine-belkacem/french-bpe-tokenizer).
   Same algorithm as BPETokenizer.encode in Python: split with the "fr" pre-tokenization pattern,
   then in each chunk repeatedly apply the lowest-rank merge present. Checked against the Python ids
   by tools/check_bpe.mjs. Works in the browser (window.FRBPE) and in Node (module.exports).        */
(function (root) {
  // case-insensitive literal, written out because JS has no inline (?i:...) everywhere yet
  const ci = (w) => [...w].map((c) => (/[a-z]/i.test(c) ? `[${c.toLowerCase()}${c.toUpperCase()}]` : c)).join("");
  const APOS = "['’]", SP = "[   ]";
  // Python's regex \b is Unicode-aware; JS \b is not, so the boundary after "aujourd'hui" is written as a lookahead
  const WORD_END = "(?![\\p{L}\\p{N}\\p{M}_])";
  const FR_ELISION =
    `[^\\r\\n\\p{L}\\p{N}]?${ci("aujourd")}${APOS}${ci("hui")}${WORD_END}` +
    `|[^\\r\\n\\p{L}\\p{N}]?(?:${["jusqu", "lorsqu", "puisqu", "quoiqu", "presqu", "quelqu", "qu"].map(ci).join("|")}|[cdjlmnstCDJLMNST])${APOS}(?=\\p{L})`;
  // possessive quantifiers of the Python pattern (?+ ++ {1,3}+) are written greedy: with these classes they match the same text
  const GPT4_WORD = "[^\\r\\n\\p{L}\\p{N}]?\\p{L}+";
  const FR_NUMBER = `${SP}?\\p{N}{1,3}`;
  const FR_PUNCTUATION = `${SP}?[^\\s\\p{L}\\p{N}]+[\\r\\n]*`;
  const GPT4_WHITESPACE = "\\s+$|\\s*[\\r\\n]|\\s+(?!\\S)|\\s";
  const PATTERN = [FR_ELISION, GPT4_WORD, FR_NUMBER, FR_PUNCTUATION, GPT4_WHITESPACE].join("|");

  function load(text) {
    const lines = text.split(/\r?\n/);
    if (lines[0] !== "frbpe v1") throw new Error("not a frbpe v1 model");
    const n = parseInt(lines[2].replace("merges ", ""), 10);
    const ranks = new Map(), vocab = [];
    for (let i = 0; i < 256; i++) vocab.push(Uint8Array.of(i));
    for (let r = 0; r < n; r++) {
      const [a, b] = lines[3 + r].split(" ").map(Number);
      ranks.set(a * 65536 + b, r);
      const va = vocab[a], vb = vocab[b], v = new Uint8Array(va.length + vb.length);
      v.set(va); v.set(vb, va.length); vocab.push(v);
    }
    const re = new RegExp(PATTERN, "gu"), enc = new TextEncoder(), cache = new Map();
    function encodeChunk(bytes) {
      let ids = Array.from(bytes);
      while (ids.length >= 2) {
        let best = Infinity, pa = 0, pb = 0;
        for (let i = 0; i + 1 < ids.length; i++) {
          const r = ranks.get(ids[i] * 65536 + ids[i + 1]);
          if (r !== undefined && r < best) { best = r; pa = ids[i]; pb = ids[i + 1]; }
        }
        if (best === Infinity) break;
        const out = [], nid = 256 + best;
        for (let i = 0; i < ids.length; i++) {
          if (i + 1 < ids.length && ids[i] === pa && ids[i + 1] === pb) { out.push(nid); i++; } else out.push(ids[i]);
        }
        ids = out;
      }
      return ids;
    }
    return {
      size: 256 + n,
      split: (text) => Array.from(text.matchAll(re), (m) => m[0]),
      encode(text) {
        const ids = [];
        for (const m of text.matchAll(re)) {
          const chunk = m[0];
          let c = cache.get(chunk);
          if (!c) { c = encodeChunk(enc.encode(chunk)); if (cache.size < 20000) cache.set(chunk, c); }
          for (const id of c) ids.push(id);
        }
        return ids;
      },
      bytes: (id) => vocab[id],
    };
  }
  const api = { load, PATTERN };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.FRBPE = api;
})(typeof window !== "undefined" ? window : globalThis);
