// After the build (U10): measures every page as a first-time visitor downloads it (HTML, stylesheets, scripts reached
// statically, images; raw, gzip and brotli) and writes the table into the colophon in place of its placeholder.
// Fonts are listed per theme from tools/fonts/fonts.json (WOFF2 is already compressed). Runs before agent-files, so
// the colophon's Markdown twin carries the same numbers.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const kb = (n) => (n / 1024).toFixed(1);
const STATIC = /(?:import|export)\s*(?:[^'"`;()]*?from\s*)?["'`]([^"'`]+\.js)["'`]/g;

export function sizesOf(buf) {
  return { raw: buf.length, gzip: zlib.gzipSync(buf, { level: 9 }).length,
    br: zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length };
}

export function measurePage(dist, file) {
  const html = fs.readFileSync(file);
  const { document } = parseHTML(html.toString());
  const parts = { html: [file], css: [], js: [], img: [] };
  const local = (u) => (u && u.startsWith('/') && !u.startsWith('//') ? path.join(dist, u.split(/[?#]/)[0]) : null);
  for (const l of document.querySelectorAll('link[rel="stylesheet"][href]')) { const f = local(l.getAttribute('href')); if (f) parts.css.push(f); }
  for (const i of document.querySelectorAll('img[src]')) { const f = local(i.getAttribute('src')); if (f && !parts.img.includes(f)) parts.img.push(f); }
  const stack = [...document.querySelectorAll('script[src]')].map((s) => local(s.getAttribute('src'))).filter(Boolean);
  while (stack.length) {
    const f = stack.pop();
    if (parts.js.includes(f) || !fs.existsSync(f)) continue;
    parts.js.push(f);
    const code = fs.readFileSync(f, 'utf8').replace(/import\(\s*["'`][^"'`]+["'`]\s*\)/g, '');
    for (const m of code.matchAll(STATIC)) stack.push(m[1].startsWith('/') ? path.join(dist, m[1]) : path.resolve(path.dirname(f), m[1]));
  }
  const out = {};
  for (const [k, files] of Object.entries(parts)) {
    out[k] = files.filter((f) => fs.existsSync(f)).map((f) => sizesOf(fs.readFileSync(f))).reduce((a, s) => ({ raw: a.raw + s.raw, gzip: a.gzip + s.gzip, br: a.br + s.br }), { raw: 0, gzip: 0, br: 0 });
  }
  out.total = ['html', 'css', 'js', 'img'].reduce((a, k) => ({ raw: a.raw + out[k].raw, gzip: a.gzip + out[k].gzip, br: a.br + out[k].br }), { raw: 0, gzip: 0, br: 0 });
  return out;
}

export default function measure({ fontsManifest }) {
  return {
    name: 'measure',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const rows = [];
        for (const file of walk(dist).filter((f) => f.endsWith('.html')).sort()) {
          const rel = '/' + path.relative(dist, file).split(path.sep).join('/');
          const url = rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
          rows.push({ url, ...measurePage(dist, file) });
        }
        const lazy = walk(path.join(dist, '_astro')).filter((f) => f.endsWith('.js') && /THREE\.WebGLRenderer/.test(fs.readFileSync(f, 'utf8')))
          .map((f) => sizesOf(fs.readFileSync(f)));
        const manifest = JSON.parse(fs.readFileSync(fontsManifest, 'utf8'));
        const themes = {};
        for (const fam of manifest.families) for (const t of fam.themes) for (const [w, s] of fam.faces) {
          const f = path.join(dist, 'fonts', fam.id, `${fam.id}-${w}-${s}.woff2`);
          themes[t] = (themes[t] || 0) + (fs.existsSync(f) ? fs.statSync(f).size : 0);
        }
        const td = (s) => `<td>${kb(s.br)}</td>`;
        const table = `<p>In KB, as a first visit downloads each page, compressed with brotli (gzip in the last column), before fonts:</p><div class="table-scroll"><table class="sizes"><caption>Every page as a first visit downloads it, in KB, compressed with brotli (gzip in the last column), before fonts.</caption>` +
          `<thead><tr><th scope="col">Page</th><th scope="col">HTML</th><th scope="col">CSS</th><th scope="col">JS</th><th scope="col">Images</th><th scope="col">Total</th><th scope="col">Total, gzip</th></tr></thead><tbody>` +
          rows.map((r) => `<tr><th scope="row">${r.url}</th>${td(r.html)}${td(r.css)}${td(r.js)}${td(r.img)}${td(r.total)}<td>${kb(r.total.gzip)}</td></tr>`).join('') +
          `</tbody></table></div>` +
          `<p>Fonts, per theme (WOFF2, loaded only by the theme that uses them): ${Object.entries(themes).map(([t, b]) => `${t} ${kb(b)} KB`).join(', ')}. ` +
          `The entrance loads the puzzle after first paint: ${lazy.map((s) => `${kb(s.br)} KB brotli (${kb(s.raw)} KB raw)`).join(', ')}, three.js included. ` +
          `The colophon's own row is measured before this table was added to it.</p>`;
        const colophon = path.join(dist, 'colophon', 'index.html');
        const page = fs.readFileSync(colophon, 'utf8');
        const marker = '<p data-measured>MEASURED</p>';
        if (!page.includes(marker)) throw new Error('measure: the colophon has no placeholder');
        fs.writeFileSync(colophon, page.replace(marker, table));
        logger.info(`measured ${rows.length} pages; largest non-entrance total ${kb(Math.max(...rows.filter((r) => r.url !== '/').map((r) => r.total.br)))} KB brotli`);
      },
    },
  };
}
