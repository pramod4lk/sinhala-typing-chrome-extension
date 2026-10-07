// Singlish (romanized Sinhala) -> Sinhala Unicode transliteration engine.
// Pure functions only: no DOM or chrome.* APIs, so it runs in content scripts,
// the popup, and Node tests alike.

(function (root) {
  'use strict';

  const HAL = '්'; // ් al-lakuna (virama)
  const ZWJ = '‍'; // joins ් with ය / ර into yansaya / rakaransaya

  // key -> [independent letter, dependent sign]. 'a' has no sign (inherent vowel).
  const VOWELS = {
    a: ['අ', ''],
    aa: ['ආ', 'ා'],
    A: ['ඇ', 'ැ'],
    Aa: ['ඈ', 'ෑ'],
    i: ['ඉ', 'ි'],
    ii: ['ඊ', 'ී'],
    u: ['උ', 'ු'],
    uu: ['ඌ', 'ූ'],
    e: ['එ', 'ෙ'],
    ee: ['ඒ', 'ේ'],
    ai: ['ඓ', 'ෛ'],
    o: ['ඔ', 'ො'],
    oo: ['ඕ', 'ෝ'],
    au: ['ඖ', 'ෞ'],
    R: ['ඍ', 'ෘ'],
    RR: ['ඎ', 'ෲ'],
  };

  const CONSONANTS = {
    k: 'ක', kh: 'ඛ', g: 'ග', gh: 'ඝ', ng: 'ඞ',
    c: 'ච', ch: 'ඡ', j: 'ජ', jh: 'ඣ', ny: 'ඤ', kn: 'ඥ',
    t: 'ට', T: 'ඨ', d: 'ඩ', D: 'ඪ', N: 'ණ',
    th: 'ත', Th: 'ථ', dh: 'ද', Dh: 'ධ', n: 'න',
    p: 'ප', ph: 'ඵ', b: 'බ', bh: 'භ', m: 'ම',
    y: 'ය', r: 'ර', l: 'ල', L: 'ළ', v: 'ව', w: 'ව',
    sh: 'ශ', Sh: 'ෂ', s: 'ස', h: 'හ', f: 'ෆ',
    zg: 'ඟ', zj: 'ඦ', zd: 'ඬ', zdh: 'ඳ', zb: 'ඹ',
  };

  // Signs that attach to a consonant without killing its inherent vowel.
  const MODIFIERS = {
    x: 'ං', // anusvaraya
    H: 'ඃ', // visargaya
  };

  const TABLE = {};
  for (const k in VOWELS) TABLE[k] = { type: 'V', key: k };
  for (const k in CONSONANTS) TABLE[k] = { type: 'C', ch: CONSONANTS[k] };
  for (const k in MODIFIERS) TABLE[k] = { type: 'M', ch: MODIFIERS[k] };
  const MAX_KEY = Math.max(...Object.keys(TABLE).map((k) => k.length));

  // Greedy longest match. Capitalised keys that aren't mapped (e.g. "Mama")
  // fall back to their lowercase form so sentence-initial caps still work.
  function matchAt(s, i) {
    for (let len = MAX_KEY; len >= 1; len--) {
      const chunk = s.substr(i, len);
      if (chunk.length < len) continue;
      if (TABLE[chunk]) return { len, tok: TABLE[chunk] };
      const lowered = chunk[0].toLowerCase() + chunk.slice(1);
      if (lowered !== chunk && TABLE[lowered]) return { len, tok: TABLE[lowered] };
    }
    return null;
  }

  function tokenize(s) {
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      const m = matchAt(s, i);
      if (m) {
        tokens.push(m.tok);
        i += m.len;
      } else {
        tokens.push({ type: 'O', ch: s[i] });
        i += 1;
      }
    }
    return tokens;
  }

  function transliterate(roman) {
    const tokens = tokenize(roman);
    let out = '';
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const next = tokens[i + 1];
      if (t.type === 'C') {
        out += t.ch;
        if (next && next.type === 'V') {
          out += VOWELS[next.key][1];
          i++;
        } else if (next && next.type === 'M') {
          // inherent 'a' kept: "kx" -> කං
        } else {
          out += HAL;
          if (next && next.type === 'C' &&
              (next.ch === 'ය' || (next.ch === 'ර' && t.ch !== 'ර'))) {
            out += ZWJ;
          }
        }
      } else if (t.type === 'V') {
        out += VOWELS[t.key][0];
      } else {
        out += t.ch;
      }
    }
    return out;
  }

  const SinhalaTransliterator = { transliterate, VOWELS, CONSONANTS, MODIFIERS };

  root.SinhalaTransliterator = SinhalaTransliterator;
  if (typeof module !== 'undefined') module.exports = SinhalaTransliterator;
})(globalThis);
