// v4's rooms (BRIEF.md §3; U2). `uses`: Uses is a section of Now: no /uses/ page is built; /uses, /uses/ and the old
// twin /uses.md answer with a 301 (public/_redirects) to /now/#uses and /now.md; /now/ carries the section under a
// heading whose id is "uses", and its twin carries it too; no page or agent file still points at /uses/.
// `colophon`: the Colophon is reached from the footer only: every link to it sits in the site footer.
import fs from 'node:fs';
import path from 'node:path';
import { read, dom, walk, DIST } from '../lib/dist.mjs';
import { loadRedirects } from '../lib/server.mjs';

const WANT = [['/uses', '/now/#uses', 301], ['/uses/', '/now/#uses', 301], ['/uses.md', '/now.md', 301]];

export default {
  id: 'rooms',
  title: 'Rooms: Uses is a section of Now (301 from /uses/); the Colophon only from the footer',
  async run(ctx) {
    const r = { uses: [], colophon: [] };
    if (fs.existsSync(path.join(DIST, 'uses'))) r.uses.push('a /uses/ page is still built');
    const rules = loadRedirects(path.join(DIST, '_redirects'));
    for (const [from, to, status] of WANT) {
      const x = rules.find((q) => q.from === from);
      if (!x || x.to !== to || x.status !== status) r.uses.push(`_redirects lacks "${from} ${to} ${status}"`);
    }
    const { origin } = await ctx.server();
    for (const [from, to, status] of WANT) {
      const res = await fetch(origin + from, { redirect: 'manual' });
      if (res.status !== status || res.headers.get('location') !== to) r.uses.push(`GET ${from} gave ${res.status} → ${res.headers.get('location')}`);
    }
    const now = ctx.pages.find((p) => p.url === '/now/');
    const h = now && dom(read(now.file)).getElementById('uses');
    if (!h || !/^H[2-3]$/.test(h.tagName) || h.textContent.trim() !== 'Uses' || h.closest('main') == null) r.uses.push('/now/ has no "Uses" heading with the id "uses" in its main');
    const twin = path.join(DIST, 'now.md');
    if (!fs.existsSync(twin) || !/^## Uses$/m.test(read(twin))) r.uses.push('/now.md does not carry the Uses section');
    for (const f of walk(DIST).filter((f) => /\.(html|md|txt|xml|json)$/.test(f))) {
      const t = read(f);
      if (/(?:href=["']|\]\(|<loc>|"url":\s*")(?:https?:\/\/[^"')<]+)?\/uses(?:\/|\.md)?["')<#]/.test(t)) r.uses.push(`${f.slice(DIST.length)} still points at /uses/`);
    }
    for (const p of ctx.pages) {
      const d = dom(read(p.file));
      for (const a of d.querySelectorAll('a[href]')) {
        const href = a.getAttribute('href');
        if (href.startsWith('#')) continue;
        let u; try { u = new URL(href, 'https://internal.test' + p.url); } catch { continue; }
        if (u.origin === 'https://internal.test' && u.pathname === '/colophon/' && !a.closest('footer.site-footer')) r.colophon.push(`${p.url}: a link to the Colophon outside the footer ("${a.textContent.trim()}")`);
      }
    }
    return Object.entries(r).map(([k, problems]) => ({ id: `rooms.${k}`, ok: problems.length === 0, problems }));
  },
};
