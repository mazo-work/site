// The assistant's whole vocabulary (U12): invented words and syllables in a cheerful, singsong style. Original to this
// site: none of them is a real word in any language we know of, a character's name, or anyone's catchphrase.
export const WORDS = [
  'bopple', 'kanoo', 'lumbo', 'papalo', 'bidoo', 'tatata', 'moolo', 'baboo', 'pikka', 'loopa', 'tuuti', 'bamboli',
  'gatoo', 'nimbo', 'poppa', 'kaloo', 'zimba', 'bonko', 'tiffa', 'malamoo', 'dabba', 'loobi', 'kippa', 'samboo',
  'wibba', 'yoopa', 'boloo', 'tikki', 'fanfa', 'mimbo', 'paroo', 'gubba', 'lalabo', 'chipa', 'dooli', 'bakka',
];
const SYLLABLES = ['ba', 'bo', 'pa', 'po', 'la', 'lu', 'ti', 'ka', 'koo', 'ma', 'mo', 'na', 'bi', 'do', 'tu', 'pi', 'loo', 'ga'];

const pick = (a, r) => a[Math.floor(r() * a.length)];
function word(r) {
  if (r() < 0.75) return pick(WORDS, r);
  const n = 2 + Math.floor(r() * 2);
  return Array.from({ length: n }, () => pick(SYLLABLES, r)).join('');
}

/** One to three sentences of 3 to 8 words, each capitalised and ended with ! ? or . */
export function reply(r = Math.random) {
  const sentences = 1 + Math.floor(r() * 3);
  return Array.from({ length: sentences }, () => {
    const n = 3 + Math.floor(r() * 6);
    const words = Array.from({ length: n }, () => word(r));
    if (r() < 0.2) words.splice(1 + Math.floor(r() * (n - 1)), 0, words[0]);
    const s = words.join(' ');
    return s[0].toUpperCase() + s.slice(1) + pick(['!', '!', '.', '?', '!!'], r);
  }).join(' ');
}
