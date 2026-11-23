// The agent layer (§3): a Markdown twin of every page, /llms.txt mapping the site to them, sitemap.xml,
// an RSS feed for Lab notes linked from every page, and robots.txt.
import fs from 'node:fs';
import path from 'node:path';
import { read, dom, twinOf, DIST } from '../lib/dist.mjs';
import { resolvePath } from '../lib/server.mjs';
import { NOT_DOCUMENTS, SHELLS } from '../config.mjs';
import { SITE } from '../../../src/data/origin.mjs';

const file = (u) => path.join(DIST, u);

export default {
  id: 'agents',
  title: 'Twins, llms.txt, sitemap, RSS, robots.txt',
  async run({ pages }) {
    const docs = pages.filter((p) => !NOT_DOCUMENTS.includes(p.url));
    const twins = [];
    for (const p of docs) {
      const t = twinOf(p.url);
      if (!fs.existsSync(file(t))) { twins.push(`${p.url}: no twin at ${t}`); continue; }
      const md = read(file(t));
      if (!/^# \S/m.test(md.split('\n').slice(0, 12).join('\n'))) twins.push(`${t}: no "# " title near the top`);
      if (md.trim().length < 40) twins.push(`${t}: nearly empty`);
    }
    const llms = [];
    if (!fs.existsSync(file('/llms.txt'))) llms.push('no /llms.txt');
    else {
      const t = read(file('/llms.txt'));
      if (!/^# \S/.test(t)) llms.push('/llms.txt does not start with "# "');
      if (!/^> \S/m.test(t)) llms.push('/llms.txt has no "> " summary line');
      for (const p of docs) {
        const tw = twinOf(p.url);
        if (!t.includes(`(${tw})`) && !t.includes(`(${SITE}${tw})`)) llms.push(`/llms.txt does not link ${tw}`);
      }
    }
    const sitemap = [];
    if (!fs.existsSync(file('/sitemap.xml'))) sitemap.push('no /sitemap.xml');
    else {
      const x = read(file('/sitemap.xml'));
      const locs = new Set([...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()));
      for (const p of docs) {
        const want = SITE + p.url;
        if (SHELLS.includes(p.url)) { if (locs.has(want)) sitemap.push(`${p.url} is a shell; keep it out of the sitemap`); }
        else if (!locs.has(want)) sitemap.push(`sitemap lacks ${want}`);
      }
    }
    for (const s of SHELLS) {
      const pg = pages.find((p) => p.url === s);
      if (pg && !/noindex/.test(dom(read(pg.file)).querySelector('meta[name="robots"]')?.getAttribute('content') || '')) sitemap.push(`${s} is a shell without a robots noindex`);
    }
    const rss = [];
    const feeds = new Set();
    for (const p of docs) {
      const l = dom(read(p.file)).querySelector('link[rel="alternate"][type="application/rss+xml"]');
      if (!l) { rss.push(`${p.url}: no <link rel="alternate" type="application/rss+xml">`); continue; }
      feeds.add(new URL(l.getAttribute('href'), SITE + p.url).pathname);
    }
    for (const f of feeds) {
      const { file: ff } = resolvePath(DIST, f);
      if (!ff) { rss.push(`feed ${f} is not built`); continue; }
      const x = read(ff);
      if (!/<rss[\s>]/.test(x) || !/<channel>/.test(x)) rss.push(`${f} is not RSS 2.0`);
      const notes = docs.filter((p) => /^\/notes\/[^/]+\/$/.test(p.url));
      for (const n of notes) if (!x.includes(SITE + n.url)) rss.push(`${f} lacks ${n.url}`);
    }
    const robots = [];
    if (!fs.existsSync(file('/robots.txt'))) robots.push('no /robots.txt');
    else {
      const t = read(file('/robots.txt'));
      if (!new RegExp(`^Sitemap: ${SITE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sitemap\\.xml$`, 'm').test(t)) robots.push('robots.txt has no Sitemap line for this origin');
      const groups = t.split(/\n(?=User-agent:)/i).filter((g) => /^User-agent:/im.test(g));
      if (!groups.some((g) => /^Disallow:\s*\/\s*$/m.test(g))) robots.push('robots.txt disallows no crawler (training crawlers, §3)');
      const star = groups.find((g) => /^User-agent:\s*\*\s*$/im.test(g));
      if (!star || /^Disallow:\s*\/\s*$/m.test(star)) robots.push('robots.txt does not allow search crawlers (User-agent: *)');
    }
    return [
      { id: 'agents.twins', ok: twins.length === 0, problems: twins },
      { id: 'agents.llms', ok: llms.length === 0, problems: llms },
      { id: 'agents.sitemap', ok: sitemap.length === 0, problems: sitemap },
      { id: 'agents.rss', ok: rss.length === 0, problems: rss },
      { id: 'agents.robots', ok: robots.length === 0, problems: robots },
    ];
  },
};
