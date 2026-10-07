# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Chrome extension (Manifest V3) that converts **Singlish** (romanized/phonetic Sinhala typed on an English keyboard) into Sinhala Unicode in real time, in any text field on any web page. Example: typing `mama gedhara yanavaa` produces `මම ගෙදර යනවා`.

> Status: the repo was scaffolded with only README/LICENSE. This file describes the intended architecture; when implementing, follow it, and update this file if a decision changes.

## Constraints

- **No build step, no npm dependencies.** Plain JavaScript loaded directly by Chrome. The extension root is the repo root (where `manifest.json` lives).
- Manifest V3 only. The background script is a service worker, so keep no state in globals there; persist in `chrome.storage`.
- Permissions: only `storage` (plus `activeTab`/`contextMenus` if those features are added). Content scripts use `"matches": ["<all_urls>"]`, `"all_frames": true`.

## Layout

```
manifest.json
src/transliterator.js   # pure Singlish -> Sinhala engine, no DOM/chrome APIs
src/content.js          # hooks text fields on pages, uses the engine
src/background.js       # service worker: keyboard shortcut toggle, badge text
popup/popup.html|js|css # on/off toggle and a mapping cheat sheet
icons/                  # 16/32/48/128 px PNGs
tests/                  # node:test unit tests for the engine
```

`manifest.json` lists content scripts in order: `src/transliterator.js` then `src/content.js`. They share the page's isolated world, so the engine exposes itself on `globalThis.SinhalaTransliterator`. Content scripts can't be ES modules, so don't use `import`/`export` in them. To make the engine loadable in Node tests, end `transliterator.js` with:

```js
if (typeof module !== 'undefined') module.exports = SinhalaTransliterator;
```

## Transliteration engine (`src/transliterator.js`)

`transliterate(roman: string): string` is a pure function. All Sinhala knowledge lives in mapping tables in this one file, with nothing hard-coded elsewhere.

Algorithm: scan left-to-right using a **greedy longest match** against the tables (try 3-char keys, then 2, then 1). **Case matters** (`a`≠`A`, `l`≠`L`, `n`≠`N`).

- **Consonant + `a`** → the bare consonant (inherent vowel), e.g. `ka` → ක.
- **Consonant + another vowel** → consonant + dependent vowel sign (pilla), e.g. `ki` → කි, `kaa` → කා.
- **Consonant with no following vowel** → consonant + al-lakuna `්` (U+0DCA), e.g. `k` → ක්.
- **Vowel at word start or after another vowel** → independent vowel letter, e.g. `amma` → අම්ම.
- **Conjuncts:** `y` and `r` directly after a consonant render as yansaya/rakaransaya using ZWJ (U+200D): `kya` → ක්‍ය, `kra` → ක්‍ර.
- Characters with no mapping (digits, punctuation, spaces) pass through unchanged.

Mapping conventions:

| Vowel | Independent | Sign | | Vowel | Independent | Sign |
|---|---|---|---|---|---|---|
| a | අ | (none) | | u | උ | ු |
| aa | ආ | ා | | uu | ඌ | ූ |
| A | ඇ | ැ | | e | එ | ෙ |
| Aa | ඈ | ෑ | | ee | ඒ | ේ |
| i | ඉ | ි | | ai | ඓ | ෛ |
| ii | ඊ | ී | | o / oo | ඔ / ඕ | ො / ෝ |
| ru | ඍ | ෘ | | au | ඖ | ෞ |

Consonants: `k` ක, `kh` ඛ, `g` ග, `gh` ඝ, `ng` ඞ, `c` ච, `ch` ඡ, `j` ජ, `jh` ඣ, `ny` ඤ, `kn` ඥ, `t` ට, `T` ඨ, `th` ත, `Th` ථ, `d` ඩ, `D` ඪ, `dh` ද, `Dh` ධ, `N` ණ, `n` න, `p` ප, `ph` ඵ, `b` බ, `bh` භ, `m` ම, `y` ය, `r` ර, `l` ල, `L` ළ, `v`/`w` ව, `sh` ශ, `Sh` ෂ, `s` ස, `h` හ, `f` ෆ.
Prenasalized (sanyaka): `zg` ඟ, `zj` ඦ, `zd` ඬ, `zdh` ඳ, `zb` ඹ.
Others: `x` ං (anusvaraya), `H` ඃ (visargaya).

When changing the tables, check that greedy matching still splits ambiguous sequences correctly (`th`, `dh`, `zdh`, `kn`), and add tests for them.

## Content script (`src/content.js`)

It converts **as you type**, word by word.

- Applies to `<textarea>`, `<input>` of type `text`/`search`/no type, and `contenteditable` elements. It never touches `password`, `email`, `url`, `number` or similar fields.
- Keeps a per-element **roman buffer** for the word being typed, plus how many Sinhala characters were last inserted for it. On a `keydown` of an ASCII letter: `preventDefault()`, append to the buffer, re-run `transliterate(buffer)`, then replace the previously inserted text with the new output. Re-rendering the whole word on each keystroke is what lets `k` → ක් turn into `ki` → කි.
- **Backspace** while the buffer is non-empty pops one roman char and re-renders. Once the buffer is empty, the browser handles it normally.
- **Commit (clear buffer)** on space, Enter, punctuation, arrow/Home/End keys, mouse click, focus change, or any modifier combo (Ctrl/Alt/Meta). Let those events through untouched.
- Insert text with `document.execCommand('insertText', …)` after selecting the chars to replace. It keeps native undo working and fires the `input` events React/Vue/etc. depend on. Fall back to `setRangeText` + a dispatched `InputEvent` only if `execCommand` returns false.
- Skip events where `e.isComposing` is true (another IME is active).
- Reads `enabled` from `chrome.storage.sync` on load and reacts to `chrome.storage.onChanged`, so toggling takes effect without reloading the page.

## Toggle and settings

- State lives in `chrome.storage.sync` as `{ enabled: boolean }` (default `true`). This is the single source of truth. The popup and background write it, and content scripts only read it.
- `background.js` registers a `commands` entry (suggested `Alt+Shift+S`) that flips `enabled` and sets the badge text (`සිං` when on, empty when off).

## Commands

Run engine tests (Node 18+, built-in test runner, no install needed):

```bash
node --test tests/
```

Run a single test by name:

```bash
node --test --test-name-pattern="yansaya" tests/
```

Try it in Chrome: open `chrome://extensions`, enable Developer mode, click **Load unpacked**, and pick the repo root. After editing, click the reload icon on the extension card and refresh the test page, because content scripts don't hot-reload. Service worker logs are under "Inspect views: service worker" on the card. Content script logs show in the page's DevTools console.

Package for the Chrome Web Store: zip the extension files only (`manifest.json`, `src/`, `popup/`, `icons/`), not `tests/` or `.git`.

## Notes

- `.gitignore` is GitHub's Visual Studio template. Add `*.zip` / `*.crx` / `*.pem` if packaging locally, because the `.pem` is the extension's signing key.
