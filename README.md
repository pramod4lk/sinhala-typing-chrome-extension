# sinhala-typing-chrome-extension
A Chrome extension for typing Sinhala easily and efficiently using English phonetic input.

Type Singlish in any text box and it turns into Sinhala as you type:
`mama gedhara yanavaa` → මම ගෙදර යනවා.

## Install (developer mode)

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select this folder.
3. Press **Alt+Shift+S** (or use the toolbar popup) to turn conversion on or off.

## Typing guide

| Type | Get | | Type | Get |
|---|---|---|---|---|
| `ka kaa ki kii` | ක කා කි කී | | `t / th` | ට / ත |
| `ku kuu ke kee` | කු කූ කෙ කේ | | `d / dh` | ඩ / ද |
| `ko koo kai kau` | කො කෝ කෛ කෞ | | `n / N` | න / ණ |
| `kA kAa kR` | කැ කෑ කෘ | | `l / L` | ල / ළ |
| `k` (no vowel) | ක් | | `sh / Sh` | ශ / ෂ |
| `kya / kra` | ක්‍ය / ක්‍ර | | `x / H` | ං / ඃ |
| `zg zd zdh zb` | ඟ ඬ ඳ ඹ | | `kn / ny` | ඥ / ඤ |

The popup shows the full table and has a box to try it out.

## Development

```bash
node --test
```

See [CLAUDE.md](CLAUDE.md) for the architecture.
