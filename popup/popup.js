const { transliterate, VOWELS, CONSONANTS } = globalThis.SinhalaTransliterator;

const DRAFT_KEY = 'draft';
const src = document.getElementById('src');
const out = document.getElementById('out');
const copyBtn = document.getElementById('copy');
const copyLabel = document.getElementById('copy-label');
const clearBtn = document.getElementById('clear');

// Status line mirrors the page-typing toggle (changed with Alt+Shift+S).
function showStatus(enabled) {
  document.getElementById('status').classList.toggle('off', !enabled);
  document.getElementById('status-text').textContent = enabled ? 'Typing on pages' : 'Paused on pages';
}
chrome.storage.sync.get({ enabled: true }, (items) => showStatus(items.enabled));
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.enabled) showStatus(changes.enabled.newValue);
});

// Size the textarea to its content; CSS max-height caps it.
function autoGrow() {
  src.style.height = 'auto';
  src.style.height = `${src.scrollHeight + 2}px`; // + top/bottom border
}

function update() {
  const text = transliterate(src.value);
  out.textContent = text;
  copyBtn.disabled = !text.trim();
  autoGrow();
  // Once the output hits its max height, keep the end (what's being typed) in view.
  if (src.selectionEnd === src.value.length) out.scrollTop = out.scrollHeight;
  try { localStorage.setItem(DRAFT_KEY, src.value); } catch {}
}

async function copy() {
  if (copyBtn.disabled) return;
  try {
    await navigator.clipboard.writeText(out.textContent);
    copyLabel.textContent = 'Copied';
    copyBtn.classList.add('done');
  } catch {
    copyLabel.textContent = 'Failed';
  }
  setTimeout(() => {
    copyLabel.textContent = 'Copy';
    copyBtn.classList.remove('done');
  }, 1200);
}

src.addEventListener('input', update);
src.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    copy();
  }
});
copyBtn.addEventListener('click', copy);
clearBtn.addEventListener('click', () => {
  src.value = '';
  update();
  src.focus();
});

try { src.value = localStorage.getItem(DRAFT_KEY) || ''; } catch {}
update();
src.focus();
src.setSelectionRange(src.value.length, src.value.length);

function fillGrid(id, entries) {
  const grid = document.getElementById(id);
  for (const [key, sinhala] of entries) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.title = `${key} → ${sinhala}`;
    const si = document.createElement('span');
    si.className = 'si';
    si.lang = 'si';
    si.textContent = sinhala;
    const code = document.createElement('code');
    code.textContent = key;
    cell.append(si, code);
    grid.append(cell);
  }
}

fillGrid('vowels', Object.entries(VOWELS).map(([k, [independent]]) => [k, independent]));
// v and w both map to ව; list it once.
fillGrid('consonants', Object.entries(CONSONANTS).filter(([k]) => k !== 'w'));
