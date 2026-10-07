# Sinhala Typing (Singlish) — Chrome extension

Type Sinhala anywhere on the web using English phonetic input (Singlish). Words convert as you type:

`mama gedhara yanavaa` → **මම ගෙදර යනවා**

## Features

- **Works in any text box**: inputs, text areas and rich-text editors (Gmail, Facebook, etc.), including inside iframes. Password, email, URL and number fields are left alone.
- **Converts live, word by word.** `k` shows ක්, then `ki` becomes කි. Backspace edits the romanized word you're typing, and Ctrl+Z undo works as normal.
- **Alt+Shift+S** turns typing on pages on or off. The toolbar icon turns grey while paused.
- **Popup converter**: click the toolbar icon, type Singlish, and copy the Sinhala with one click (or Ctrl+Enter). A collapsible **Keys** section lists every mapping.
- No account, no network access, no tracking. The only permission requested is `storage`, which saves the on/off setting.

## Install

1. Download `sinhala-typing-v<version>.zip` from the [latest release](https://github.com/pramod4lk/sinhala-typing-chrome-extension/releases/latest) and unzip it.
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the unzipped folder.
4. Optional: pin the extension from the puzzle-piece menu so the icon stays on the toolbar.

To change the shortcut, go to `chrome://extensions/shortcuts`.

## Typing guide

Keys are **case-sensitive**: capitals give different letters.

**Vowels.** Typed alone they give the full letter; after a consonant they give the vowel sign.

| Type | Alone | After `k` | | Type | Alone | After `k` |
|---|---|---|---|---|---|---|
| `a` | අ | ක | | `u` | උ | කු |
| `aa` | ආ | කා | | `uu` | ඌ | කූ |
| `A` | ඇ | කැ | | `e` | එ | කෙ |
| `Aa` | ඈ | කෑ | | `ee` | ඒ | කේ |
| `i` | ඉ | කි | | `ai` | ඓ | කෛ |
| `ii` | ඊ | කී | | `o` | ඔ | කො |
| `R` | ඍ | කෘ | | `oo` | ඕ | කෝ |
| `RR` | ඎ | කෲ | | `au` | ඖ | කෞ |

A consonant with no vowel after it gets al-lakuna: `k` → ක්.

**Consonants**

| | | | | |
|---|---|---|---|---|
| `k` ක | `kh` ඛ | `g` ග | `gh` ඝ | `ng` ඞ |
| `c` ච | `ch` ඡ | `j` ජ | `jh` ඣ | `ny` ඤ |
| `t` ට | `T` ඨ | `d` ඩ | `D` ඪ | `N` ණ |
| `th` ත | `Th` ථ | `dh` ද | `Dh` ධ | `n` න |
| `p` ප | `ph` ඵ | `b` බ | `bh` භ | `m` ම |
| `y` ය | `r` ර | `l` ල | `L` ළ | `v` / `w` ව |
| `sh` ශ | `Sh` ෂ | `s` ස | `h` හ | `f` ෆ |
| `kn` ඥ | | | | |

**Special combinations**

| Type | Get | |
|---|---|---|
| `zg` `zj` `zd` `zdh` `zb` | ඟ ඦ ඬ ඳ ඹ | prenasalized (sanyaka) |
| `kya` | ක්‍ය | yansaya |
| `kra` | ක්‍ර | rakaransaya |
| `x` | ං | anusvaraya, e.g. `laxkaava` → ලංකාව |
| `H` | ඃ | visargaya |

Capitals that don't have their own meaning work like lowercase, so `Mama` → මම.

**Examples:** `amma` අම්ම · `thaththaa` තත්තා · `vidhyaava` විද්‍යාව · `shrii laxkaava` ශ්‍රී ලංකාව · `sixhala` සිංහල

## Known limitations

- Doesn't work in Google Docs or other editors that draw text on a canvas.
- Caps Lock changes the letters you type, because keys are case-sensitive.

## Development

Plain JavaScript (Manifest V3) with no build step and no npm dependencies. Load the repo folder itself with **Load unpacked** and click the extension's reload icon after making changes.

```bash
node --test
```

Runs the transliteration engine's tests (Node 18+).

```bash
python tools/package.py
```

Builds `dist/sinhala-typing-v<version>.zip` for a release.

See [CLAUDE.md](CLAUDE.md) for the architecture, the test harness, icon generation and the release process.

## License

[MIT](LICENSE)
