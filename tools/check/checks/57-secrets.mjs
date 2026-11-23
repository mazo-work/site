// U11, secrets in the walls: every page opens with the view-source note (the mark as text and a [JON] slot); two to
// four story fragments are hidden around the site, each a native <details> with a named summary that links back to
// a beat of the story on About (the links check proves the #beat ids exist).
import { read, dom } from '../lib/dist.mjs';

export default {
  id: 'secrets-in-walls',
  title: 'Secrets in the walls: the view-source note, two to four story fragments',
  async run({ pages }) {
    const note = [], fragments = [];
    let count = 0;
    for (const p of pages) {
      const html = read(p.file);
      const m = html.match(/^<!DOCTYPE html><!--([\s\S]*?)-->/i);
      if (!m || !/█/.test(m[1]) || !/\[JON:/.test(m[1])) note.push(`${p.url}: no view-source note after the doctype`);
      for (const f of dom(html).querySelectorAll('details.fragment')) {
        count++;
        if (!f.querySelector('summary')?.textContent.trim()) fragments.push(`${p.url}: a fragment whose summary has no name`);
        const a = f.querySelector('a[href^="/about/#beat-"]');
        if (!a) fragments.push(`${p.url}: a fragment that does not link back to About`);
      }
    }
    if (count < 2 || count > 4) fragments.push(`${count} story fragments (the brief asks for two to four)`);
    return [
      { id: 'secrets-in-walls.note', ok: note.length === 0, problems: note },
      { id: 'secrets-in-walls.fragments', ok: fragments.length === 0, problems: fragments },
    ];
  },
};
