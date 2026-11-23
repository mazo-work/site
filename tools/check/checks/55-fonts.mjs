// Fonts (BRIEF.md §3, Type, U4): every font file is in tools/fonts/fonts.json and has its OFL licence beside it;
// each theme has at most two families and about 60-80 KB; and in the browser each theme downloads only its own faces.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, DIST, walk } from '../lib/dist.mjs';
import { THEMES } from '../config.mjs';
import { themedContext } from './50-browser.mjs';

export default {
  id: 'fonts',
  title: 'Fonts: manifest, licences, budget, and each theme loads only its own',
  async run(ctx) {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/fonts/fonts.json'), 'utf8'));
    const files = new Map();
    for (const f of manifest.families) for (const [w, s] of f.faces) {
      const url = `/fonts/${f.id}/${f.id}-${w}-${s}.woff2`;
      files.set(url, { themes: f.themes, file: path.join(DIST, url) });
    }
    const r = { files: [], licences: [], budget: [], loads: [] }, notes = [];
    for (const f of walk(path.join(DIST, 'fonts')).filter((f) => /\.(woff2?|ttf|otf)$/.test(f))) {
      const url = '/' + path.relative(DIST, f).split(path.sep).join('/');
      if (!files.has(url)) r.files.push(`${url} is not in tools/fonts/fonts.json`);
    }
    for (const [url, v] of files) if (!fs.existsSync(v.file)) r.files.push(`${url} is in the manifest but not built`);
    for (const fam of manifest.families) {
      const l = path.join(DIST, 'fonts', fam.id, 'OFL.txt');
      if (!fs.existsSync(l) || !/SIL Open Font License/.test(fs.readFileSync(l, 'utf8'))) r.licences.push(`${fam.family}: no OFL.txt beside its files`);
    }
    for (const t of THEMES) {
      const fams = manifest.families.filter((f) => f.themes.includes(t));
      const bytes = [...files.values()].filter((v) => v.themes.includes(t) && fs.existsSync(v.file)).reduce((a, v) => a + fs.statSync(v.file).size, 0);
      if (fams.length > 2) r.budget.push(`${t}: ${fams.length} families (at most two)`);
      if (bytes > 80 * 1024) r.budget.push(`${t}: ${(bytes / 1024).toFixed(1)} KB of fonts (about 60-80 KB)`);
      notes.push(`${t}: ${fams.map((f) => f.family).join(' + ') || 'system fonts'}, ${(bytes / 1024).toFixed(1)} KB`);
    }
    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    await Promise.all(THEMES.map(async (t) => {
      const context = await themedContext(browser, t);
      const seen = new Set();
      context.on('request', (q) => { const u = new URL(q.url()); if (/\.(woff2?|ttf|otf)$/.test(u.pathname)) seen.add(u.pathname); });
      for (const p of ctx.pages) {
        const page = await context.newPage();
        await page.goto(origin + p.url, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready.then(() => true));
        await page.close();
      }
      await context.close();
      for (const u of seen) {
        const v = files.get(u);
        if (!v || !v.themes.includes(t)) r.loads.push(`${t} downloads ${u}${v ? ` (a ${v.themes.join('/')} font)` : ''}`);
      }
    }));
    const results = Object.entries(r).map(([k, problems]) => ({ id: `fonts.${k}`, ok: problems.length === 0, problems }));
    results.notes = notes;
    return results;
  },
};
