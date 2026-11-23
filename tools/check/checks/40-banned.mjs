// BRIEF.md §4, the generic-AI-look ban, as far as a grep can see it. The rest is the written self-review in
// handoff/design-log.md. A deliberate exception is annotated on the same or the previous source line with
// `/* <rule>-ok: <reason> */` (gradient-ok, shadow-ok, radius-ok, observer-ok), so each one is visible in review.
import fs from 'node:fs';
import path from 'node:path';
import { walk, read, dom, isText, ROOT, DIST } from '../lib/dist.mjs';
import { ENTRANCE } from '../config.mjs';

const CODE = /\.(astro|css|ts|js|mjs|tsx|jsx|svelte|vue|json|html|svg|txt|xml)$/;
const BANNED_FONTS = /\b(Inter|Poppins|Roboto|Montserrat|Open[ _-]?Sans)\b/;
const FONT_HOSTS = /\b(fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit\.net|fonts\.bunny\.net|fontawesome)\b/i;
const ICON_PKGS = /(lucide|heroicons|feather-icons|phosphor-icons|@phosphor|tabler-icons|@tabler|@iconify|fontawesome|react-icons|ionicons)/i;
const PHRASES = [
  /passionate about/i, /\bcrafting\b/i, /let[’']s build something amazing/i,
  /\bI[’']m an? [^.!?\n]{0,80}?\bwho\b/i,
];

function sourceFiles() {
  return ['src', 'public'].flatMap((d) => walk(path.join(ROOT, d))).filter((f) => CODE.test(f) && isText(f));
}
const allowed = (lines, i, rule) => new RegExp(`${rule}-ok:`).test(lines[i]) || (i > 0 && new RegExp(`${rule}-ok:`).test(lines[i - 1]));

export default {
  id: 'banned',
  title: 'Banned patterns (§4) that a grep can find',
  async run({ pages }) {
    const r = { fonts: [], gradients: [], 'gradient-text': [], glass: [], cards: [], icons: [], 'emoji-headings': [],
      'skill-bars': [], 'scroll-fade': [], phrases: [] };
    const src = sourceFiles();
    const distText = walk(DIST).filter((f) => /\.(css|js|html|svg)$/.test(f));
    for (const f of [...src, ...distText]) {
      const rel = path.relative(ROOT, f), text = read(f), lines = text.split('\n');
      const isSource = !f.startsWith(DIST);
      lines.forEach((line, i) => {
        const at = `${rel}:${i + 1}`;
        if (BANNED_FONTS.test(line) && /font|@font-face|family/i.test(line)) r.fonts.push(`${at}: ${line.trim().slice(0, 120)}`);
        if (FONT_HOSTS.test(line)) r.fonts.push(`${at}: third-party font host`);
        if (/background-clip\s*:\s*text|text-fill-color\s*:\s*transparent/i.test(line)) r['gradient-text'].push(at);
        if (/backdrop-filter/i.test(line)) r.glass.push(at);
        if (/\brounded-(2xl|3xl)\b/.test(line)) r.cards.push(`${at}: rounded-2xl`);
        if (/\bwhileInView\b|data-aos|animation-timeline\s*:\s*view|scroll-timeline/.test(line)) r['scroll-fade'].push(at);
        if (isSource) {
          if (/(linear|radial|conic)-gradient\(/.test(line) && !allowed(lines, i, 'gradient')) r.gradients.push(`${at}: a gradient without a gradient-ok note`);
          const sh = line.match(/box-shadow\s*:\s*([^;]+)/);
          if (sh && !allowed(lines, i, 'shadow')) {
            for (const layer of sh[1].split(/,(?![^(]*\))/)) {
              const len = layer.match(/-?[\d.]+(px|rem|em)?/g) || [];
              const blur = len[2] ? parseFloat(len[2]) * (/(r?em)$/.test(len[2]) ? 16 : 1) : 0;
              if (blur >= 10) r.cards.push(`${at}: a soft shadow (blur ${len[2]}) without a shadow-ok note`);
            }
          }
          const rad = line.match(/border-radius\s*:\s*([^;]+)/);
          if (rad && !allowed(lines, i, 'radius')) {
            for (const v of rad[1].match(/[\d.]+(px|rem|em)/g) || []) {
              const px = parseFloat(v) * (/(r?em)$/.test(v) ? 16 : 1);
              if (px >= 16) r.cards.push(`${at}: border-radius ${v} without a radius-ok note`);
            }
          }
          if (/IntersectionObserver/.test(line) && !allowed(lines, i, 'observer')) r['scroll-fade'].push(`${at}: IntersectionObserver without an observer-ok note`);
          if (/^import .*from ['"]/.test(line.trim()) && ICON_PKGS.test(line)) r.icons.push(`${at}: icon library import`);
        }
      });
    }
    const pkg = JSON.parse(read(path.join(ROOT, 'package.json')));
    for (const dep of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) if (ICON_PKGS.test(dep)) r.icons.push(`package.json: ${dep}`);
    if (fs.existsSync(path.join(ROOT, 'public', 'fonts'))) {
      for (const f of walk(path.join(ROOT, 'public', 'fonts'))) if (BANNED_FONTS.test(path.basename(f))) r.fonts.push(`font file ${path.relative(ROOT, f)}`);
    }
    for (const p of pages) {
      const d = dom(read(p.file));
      for (const h of d.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
        if (/\p{Extended_Pictographic}/u.test(h.textContent)) r['emoji-headings'].push(`${p.url}: <${h.tagName.toLowerCase()}> ${h.textContent.trim().slice(0, 60)}`);
      }
      if (p.url !== ENTRANCE && d.querySelector('progress, meter, [role="progressbar"]')) r['skill-bars'].push(`${p.url}: a progress bar or meter`);
      if (d.querySelector('[class*="skill-bar"], [class*="skillbar"], [class*="progress-bar"]')) r['skill-bars'].push(`${p.url}: a skill-bar class`);
      d.querySelectorAll('script, style, template').forEach((e) => e.remove());
      const text = [d.title, d.querySelector('meta[name="description"]')?.getAttribute('content') || '', d.body?.textContent || ''].join('\n');
      for (const re of PHRASES) { const m = text.match(re); if (m) r.phrases.push(`${p.url}: "${m[0]}"`); }
    }
    for (const f of walk(DIST).filter((f) => /\.(md|txt|xml)$/.test(f))) {
      const text = read(f);
      for (const re of PHRASES) { const m = text.match(re); if (m) r.phrases.push(`${path.relative(DIST, f)}: "${m[0]}"`); }
    }
    return Object.entries(r).map(([k, problems]) => ({ id: `banned.${k}`, ok: problems.length === 0, problems }));
  },
};
