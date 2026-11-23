// The spine: every page of §3 exists, is a complete semantic document that reads without JavaScript,
// and every page is reachable from every other in at most two clicks of plain links.
import { read, dom, DIST } from '../lib/dist.mjs';
import { resolvePath } from '../lib/server.mjs';
import { ROUTES, ENTRANCE, NOT_DOCUMENTS, SHELLS } from '../config.mjs';

export default {
  id: 'pages',
  title: 'Every page of §3 exists, reads without JS, and is two clicks from every other',
  async run({ pages }) {
    const byUrl = new Map(pages.map((p) => [p.url, p]));
    const missing = ROUTES.filter((r) => !byUrl.has(r)).map((r) => `missing page ${r}`);
    const semantic = [];
    const graph = new Map();
    for (const p of pages) {
      const d = dom(read(p.file));
      const html = d.documentElement;
      if (!html.getAttribute('lang')) semantic.push(`${p.url}: <html> has no lang`);
      if (!d.querySelector('title')?.textContent.trim()) semantic.push(`${p.url}: no <title>`);
      if (!d.querySelector('meta[name="description"]')?.getAttribute('content')) semantic.push(`${p.url}: no meta description`);
      const main = d.querySelectorAll('main');
      if (main.length !== 1) semantic.push(`${p.url}: ${main.length} <main> elements (want 1)`);
      if (d.querySelectorAll('h1').length !== 1) semantic.push(`${p.url}: ${d.querySelectorAll('h1').length} <h1> (want 1)`);
      const text = (main[0]?.textContent || '').replace(/\s+/g, ' ').trim();
      if (p.url !== ENTRANCE && !NOT_DOCUMENTS.includes(p.url) && !SHELLS.includes(p.url) && text.length < 80) semantic.push(`${p.url}: <main> has ${text.length} characters of static text`);
      if (!d.querySelector('nav')) semantic.push(`${p.url}: no <nav>`);
      // plain links only (what works without JS)
      const out = new Set();
      for (const a of d.querySelectorAll('a[href]')) {
        let u; try { u = new URL(a.getAttribute('href'), 'https://internal.test' + p.url); } catch { continue; }
        if (u.origin !== 'https://internal.test') continue;
        const { file } = resolvePath(DIST, u.pathname);
        if (file && file.endsWith('.html')) { const t = pages.find((q) => q.file === file); if (t) out.add(t.url); }
      }
      graph.set(p.url, out);
    }
    const reach = [];
    for (const from of graph.keys()) {
      if (from === '/404.html') continue;
      const one = graph.get(from), two = new Set(one);
      for (const u of one) for (const v of graph.get(u) || []) two.add(v);
      const far = [...graph.keys()].filter((u) => u !== from && u !== '/404.html' && !two.has(u));
      if (far.length) reach.push(`${from}: more than two clicks to ${far.join(', ')}`);
    }
    const nf = byUrl.get('/404.html');
    if (nf && !graph.get('/404.html')?.size) reach.push('/404.html links nowhere');
    return [
      { id: 'pages.exist', ok: missing.length === 0, problems: missing },
      { id: 'pages.semantic', ok: semantic.length === 0, problems: semantic },
      { id: 'pages.reach', ok: reach.length === 0, problems: reach },
    ];
  },
};
