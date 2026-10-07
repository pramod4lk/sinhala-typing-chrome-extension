const { transliterate, VOWELS, CONSONANTS, MODIFIERS } = globalThis.SinhalaTransliterator;

const toggle = document.getElementById('enabled');
chrome.storage.sync.get({ enabled: true }, (items) => {
  toggle.checked = items.enabled;
});
toggle.addEventListener('change', () => {
  chrome.storage.sync.set({ enabled: toggle.checked });
});

const tryInput = document.getElementById('try');
const tryOut = document.getElementById('try-out');
tryInput.addEventListener('input', () => {
  tryOut.textContent = transliterate(tryInput.value);
});

function fillGrid(id, entries) {
  const grid = document.getElementById(id);
  for (const [key, sinhala] of entries) {
    const cell = document.createElement('div');
    cell.className = 'cell';
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
fillGrid('consonants', Object.entries(CONSONANTS));
fillGrid('modifiers', Object.entries(MODIFIERS));
