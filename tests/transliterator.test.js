const test = require('node:test');
const assert = require('node:assert/strict');
const { transliterate } = require('../src/transliterator.js');

const cases = {
  'basic words': [
    ['mama', 'මම'],
    ['gedhara', 'ගෙදර'],
    ['yanavaa', 'යනවා'],
    ['amma', 'අම්ම'],
    ['thaththaa', 'තත්තා'],
  ],
  'consonant + vowel signs': [
    ['k', 'ක්'],
    ['ka', 'ක'],
    ['ki', 'කි'],
    ['kaa', 'කා'],
    ['kAma', 'කැම'],
    ['kAa', 'කෑ'],
    ['kee', 'කේ'],
    ['koo', 'කෝ'],
    ['kai', 'කෛ'],
    ['kR', 'කෘ'],
  ],
  'independent vowels': [
    ['a', 'අ'],
    ['aa', 'ආ'],
    ['A', 'ඇ'],
    ['ii', 'ඊ'],
    ['eLu', 'එළු'],
    ['oya', 'ඔය'],
  ],
  'case-sensitive consonants': [
    ['baLa', 'බළ'],
    ['kaNa', 'කණ'],
    ['tha', 'ත'],
    ['ta', 'ට'],
    ['dha', 'ද'],
    ['da', 'ඩ'],
    ['Sha', 'ෂ'],
    ['sha', 'ශ'],
  ],
  'unmapped capitals fall back to lowercase': [
    ['Mama', 'මම'],
    ['Kiyanna', 'කියන්න'],
  ],
  'yansaya and rakaransaya': [
    ['vidhyaava', 'විද්‍යාව'],
    ['shrii', 'ශ්‍රී'],
    ['kra', 'ක්‍ර'],
    ['kaaryaya', 'කාර්‍යය'],
    ['rra', 'ර්ර'],
  ],
  'prenasalized and modifiers': [
    ['zdhu', 'ඳු'],
    ['kazda', 'කඬ'],
    ['zba', 'ඹ'],
    ['sixhala', 'සිංහල'],
    ['laxkaava', 'ලංකාව'],
    ['kx', 'කං'],
    ['dhuHkha', 'දුඃඛ'],
  ],
  'non-letters pass through': [
    ['', ''],
    ['ma 1!', 'ම 1!'],
    ['mama gedhara yanavaa.', 'මම ගෙදර යනවා.'],
  ],
};

for (const [group, pairs] of Object.entries(cases)) {
  test(group, () => {
    for (const [input, expected] of pairs) {
      assert.equal(transliterate(input), expected, `transliterate(${JSON.stringify(input)})`);
    }
  });
}
