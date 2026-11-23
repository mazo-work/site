// JSON-LD: every block parses, uses schema.org, and each page carries the @types §3 asks for (config.mjs).
import { read, dom } from '../lib/dist.mjs';
import { jsonldExpected } from '../config.mjs';

function typesOf(node, out = new Set()) {
  if (Array.isArray(node)) { node.forEach((n) => typesOf(n, out)); return out; }
  if (!node || typeof node !== 'object') return out;
  const t = node['@type'];
  if (t) (Array.isArray(t) ? t : [t]).forEach((x) => out.add(x));
  if (node['@graph']) typesOf(node['@graph'], out);
  return out;
}

export default {
  id: 'jsonld',
  title: 'JSON-LD parses and has the right @types',
  async run({ pages }) {
    const parse = [], types = [];
    for (const p of pages) {
      const want = jsonldExpected(p.url);
      const blocks = [...dom(read(p.file)).querySelectorAll('script[type="application/ld+json"]')];
      const found = new Set();
      for (const b of blocks) {
        let data;
        try { data = JSON.parse(b.textContent); } catch (e) { parse.push(`${p.url}: ${e.message}`); continue; }
        const ctx = JSON.stringify(data['@context'] ?? '');
        if (!/schema\.org/.test(ctx)) parse.push(`${p.url}: @context is not schema.org`);
        typesOf(data, found);
      }
      if (!want) continue;
      const lacking = want.filter((t) => !found.has(t));
      if (lacking.length) types.push(`${p.url}: lacks ${lacking.join(', ')}${found.size ? ` (has ${[...found].join(', ')})` : ' (no JSON-LD)'}`);
    }
    return [
      { id: 'jsonld.parse', ok: parse.length === 0, problems: parse },
      { id: 'jsonld.types', ok: types.length === 0, problems: types },
    ];
  },
};
