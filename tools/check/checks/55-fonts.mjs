// Fonts (v4 BRIEF.md §3, Type; U3). `files`: every font file is in tools/fonts/fonts.json, and every listed face is
// built. `licences`: each family has its OFL beside its files. `families`: each mask has exactly the brief's families
// (Paper: Atkinson Hyperlegible Next, IM FELL English, IM FELL English SC; Night: Atkinson Hyperlegible Next, Doto,
// Martian Mono); sizes are reported, not limited (v4: no size budget). `loads`: in the browser each mask downloads only
// its own faces, and a parked family (Profile's) is declared nowhere. `rfn`: a family whose licence reserves its name
// is served renamed: the names its files show (name IDs 1, 4, 6, 16) and the CSS family carry the new name, never the
// reserved one, and the copyright notice (ID 0) is kept. `roles`: body text is Atkinson Hyperlegible Next in both
// masks; Paper's headings and name are IM FELL (as "Mazo Paper"), its menu band IM FELL SC; Night's headings and name
// are Doto, its menu band Martian Mono.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { ROOT, DIST, walk, read } from '../lib/dist.mjs';
import { THEMES } from '../config.mjs';
import { themedContext } from './50-browser.mjs';

const WANT = {
  paper: ['Atkinson Hyperlegible Next', 'IM FELL English', 'IM FELL English SC'],
  night: ['Atkinson Hyperlegible Next', 'Doto', 'Martian Mono'],
};

/** The name table of a WOFF2 file, as [{ id, platform, text }]. The name table is never transformed in WOFF2. */
export function woff2Names(buf) {
  if (buf.toString('latin1', 0, 4) !== 'wOF2') throw new Error('not WOFF2');
  const numTables = buf.readUInt16BE(12);
  let o = 48;
  const base128 = () => { let v = 0; for (let i = 0; i < 5; i++) { const b = buf[o++]; v = v * 128 + (b & 127); if (!(b & 128)) return v; } throw new Error('bad UIntBase128'); };
  const KNOWN = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill'];
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const flags = buf[o++];
    let tag = KNOWN[flags & 63];
    if ((flags & 63) === 63) { tag = buf.toString('latin1', o, o + 4); o += 4; }
    const version = flags >> 6;
    const orig = base128();
    const transformed = (tag === 'glyf' || tag === 'loca') ? version === 0 : version !== 0;
    const length = transformed ? base128() : orig;
    tables.push({ tag, length });
  }
  const data = zlib.brotliDecompressSync(buf.subarray(o, o + buf.readUInt32BE(20)));
  let at = 0;
  for (const t of tables) { t.at = at; at += t.length; }
  const nt = tables.find((t) => t.tag === 'name');
  const n = data.subarray(nt.at, nt.at + nt.length);
  const count = n.readUInt16BE(2), strings = n.readUInt16BE(4), out = [];
  for (let i = 0; i < count; i++) {
    const r = 6 + i * 12, platform = n.readUInt16BE(r), id = n.readUInt16BE(r + 6), len = n.readUInt16BE(r + 8), off = n.readUInt16BE(r + 10);
    const raw = n.subarray(strings + off, strings + off + len);
    const text = platform === 3 || platform === 0 ? Buffer.from(raw).swap16().toString('utf16le') : raw.toString('latin1');
    out.push({ id, platform, text });
  }
  return out;
}

export default {
  id: 'fonts',
  title: 'Fonts: manifest, licences, families per mask, each mask loads its own, reserved names, roles',
  async run(ctx) {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/fonts/fonts.json'), 'utf8'));
    const files = new Map();
    for (const f of manifest.families) for (const [w, s] of f.faces) {
      const url = `/fonts/${f.id}/${f.id}-${w}-${s}.woff2`;
      files.set(url, { fam: f, themes: f.parked ? [] : f.themes, file: path.join(DIST, url) });
    }
    const r = { files: [], licences: [], families: [], loads: [], rfn: [], roles: [] }, notes = [];
    for (const f of walk(path.join(DIST, 'fonts')).filter((f) => /\.(woff2?|ttf|otf)$/.test(f))) {
      const url = '/' + path.relative(DIST, f).split(path.sep).join('/');
      if (!files.has(url)) r.files.push(`${url} is not in tools/fonts/fonts.json`);
    }
    for (const [url, v] of files) if (!fs.existsSync(v.file)) r.files.push(`${url} is in the manifest but not built`);
    for (const fam of manifest.families) {
      const l = path.join(DIST, 'fonts', fam.id, 'OFL.txt');
      if (!fs.existsSync(l) || !/SIL Open Font License/.test(fs.readFileSync(l, 'utf8'))) r.licences.push(`${fam.family}: no OFL.txt beside its files`);
      else if (fam.served && !fam.notice.every((x) => fs.readFileSync(l, 'utf8').includes(x))) r.licences.push(`${fam.family}: its OFL.txt lacks the font's own notice`);
    }
    for (const t of THEMES) {
      const fams = manifest.families.filter((f) => !f.parked && f.themes.includes(t)).map((f) => f.family).sort();
      if (JSON.stringify(fams) !== JSON.stringify([...WANT[t]].sort())) r.families.push(`${t}: ${fams.join(', ')} (want ${WANT[t].join(', ')})`);
      const bytes = [...files.values()].filter((v) => v.themes.includes(t) && fs.existsSync(v.file)).reduce((a, v) => a + fs.statSync(v.file).size, 0);
      notes.push(`${t}: ${fams.join(' + ')}, ${(bytes / 1024).toFixed(1)} KB (reported; v4 sets no size budget)`);
    }
    const css = walk(DIST).filter((f) => f.endsWith('.css')).map(read).join('\n');
    const declared = new Set([...css.matchAll(/@font-face\s*{[^}]*?font-family:\s*"?([^";]+)"?/g)].map((m) => m[1].trim()));
    for (const fam of manifest.families) {
      const name = fam.served || fam.family;
      if (fam.parked && declared.has(name)) r.loads.push(`${name} is parked but declared in the CSS`);
      if (!fam.parked && !declared.has(name)) r.loads.push(`${name} is not declared in the CSS`);
      if (!fam.served) continue;
      if (declared.has(fam.family) || [...declared].some((d) => /IM\s*FELL/i.test(d))) r.rfn.push(`the CSS declares a reserved name for ${fam.family}`);
      for (const [w, s] of fam.faces) {
        const f = path.join(DIST, 'fonts', fam.id, `${fam.id}-${w}-${s}.woff2`);
        if (!fs.existsSync(f)) continue;
        const names = woff2Names(fs.readFileSync(f));
        const shown = names.filter((x) => [1, 4, 6, 16].includes(x.id));
        if (shown.some((x) => fam.rfn.some((rfn) => x.text.toUpperCase().includes(rfn.toUpperCase())) || /IM.?FELL/i.test(x.text))) r.rfn.push(`${path.basename(f)} still shows a reserved name: ${shown.map((x) => x.text).join(' / ')}`);
        if (!names.some((x) => x.id === 1 && x.text === fam.served)) r.rfn.push(`${path.basename(f)}: its family name is not ${fam.served}`);
        if (!names.some((x) => x.id === 0 && /Igino Marini/.test(x.text))) r.rfn.push(`${path.basename(f)}: the copyright notice is gone`);
      }
    }
    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    const first = (ff) => ff.split(',')[0].trim().replace(/^"|"$/g, '');
    const ROLES = {
      paper: { 'main p': 'Atkinson Hyperlegible Next', 'main h1': 'Mazo Paper', '.masthead-name': 'Mazo Paper', '.menu a': 'Mazo Paper SC', '.site-footer': 'Mazo Paper SC' },
      night: { 'main p': 'Atkinson Hyperlegible Next', 'main h1': 'Doto', '.masthead-name': 'Doto', '.menu a': 'Martian Mono', '.site-footer': 'Martian Mono' },
    };
    await Promise.all(THEMES.map(async (t) => {
      const context = await themedContext(browser, t);
      const seen = new Set();
      context.on('request', (q) => { const u = new URL(q.url()); if (/\.(woff2?|ttf|otf)$/.test(u.pathname)) seen.add(u.pathname); });
      for (const p of ctx.pages) {
        const page = await context.newPage();
        await page.goto(origin + p.url, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready.then(() => true));
        if (p.url === '/about/') {
          const got = await page.evaluate((sel) => Object.fromEntries(Object.keys(sel).map((s) => [s, getComputedStyle(document.querySelector(s)).fontFamily])), ROLES[t]);
          for (const [s, want] of Object.entries(ROLES[t])) if (first(got[s]) !== want) r.roles.push(`[${t}] ${s} is set in ${got[s]} (want ${want})`);
          const used = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')));
          for (const want of new Set(Object.values(ROLES[t]))) if (!used.includes(want)) r.roles.push(`[${t}] ${want} did not load on /about/`);
        }
        await page.close();
      }
      await context.close();
      for (const u of seen) {
        const v = files.get(u);
        if (!v || !v.themes.includes(t)) r.loads.push(`${t} downloads ${u}${v ? ` (a ${v.fam.parked ? 'parked' : v.themes.join('/')} font)` : ''}`);
      }
    }));
    const results = Object.entries(r).map(([k, problems]) => ({ id: `fonts.${k}`, ok: problems.length === 0, problems }));
    results.notes = notes;
    return results;
  },
};
