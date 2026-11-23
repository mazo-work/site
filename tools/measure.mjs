#!/usr/bin/env node
// U15: measure the built site. Run `npm run build` first.
//   node tools/measure.mjs --lighthouse   Lighthouse 13 on every page, mobile (its default: simulated slow 4G, 4x CPU)
//                                         and desktop, plus each page's download size; writes handoff/measure.json and .md
//   node tools/measure.mjs --screens      every page x theme x (mobile 390x844, desktop 1440x900), full page, at 2x,
//                                         as WebP (quality 72) in handoff/screens/
// The beacon is blocked during Lighthouse runs (it cannot load here, and it is the one file not on this origin).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import sharp from 'sharp';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as chromeLauncher from 'chrome-launcher';
import { startServer } from './check/lib/server.mjs';
import { pages as listPages, DIST, ROOT } from './check/lib/dist.mjs';
import { measurePage } from '../src/integrations/measure.mjs';

const OUT = path.join(ROOT, 'handoff');
const kb = (n) => Math.round(n / 102.4) / 10;

async function runLighthouse() {
  const server = await startServer(DIST);
  const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const rows = [];
  for (const p of listPages()) {
    const size = measurePage(DIST, p.file);
    const row = { url: p.url, bytes: { html: size.html.br, css: size.css.br, js: size.js.br, img: size.img.br, total: size.total.br, totalGzip: size.total.gzip } };
    for (const [name, config] of [['mobile', undefined], ['desktop', desktopConfig]]) {
      const r = await lighthouse(server.origin + p.url, { port: chrome.port, output: 'json', logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], blockedUrlPatterns: ['*cloudflareinsights.com*'] }, config);
      const a = r.lhr.audits, c = r.lhr.categories;
      row[name] = {
        performance: Math.round(c.performance.score * 100), accessibility: Math.round(c.accessibility.score * 100),
        bestPractices: Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100),
        fcp: Math.round(a['first-contentful-paint'].numericValue), lcp: Math.round(a['largest-contentful-paint'].numericValue),
        cls: Math.round(a['cumulative-layout-shift'].numericValue * 1000) / 1000, tbt: Math.round(a['total-blocking-time'].numericValue),
        si: Math.round(a['speed-index'].numericValue), weight: a['total-byte-weight'].numericValue,
        failing: Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode === 'binary').map((x) => x.id),
      };
      console.log(`${p.url} ${name}: perf ${row[name].performance}, LCP ${row[name].lcp} ms, CLS ${row[name].cls}, TBT ${row[name].tbt} ms, a11y ${row[name].accessibility}`);
    }
    rows.push(row);
  }
  await chrome.kill();
  await server.close();
  const meta = { when: new Date().toISOString(), lighthouse: JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/lighthouse/package.json'), 'utf8')).version,
    chrome: chromium.executablePath().match(/chromium-(\d+)/)?.[1], cpus: os.cpus().length, command: 'npm run build && node tools/measure.mjs --lighthouse' };
  fs.writeFileSync(path.join(OUT, 'measure.json'), JSON.stringify({ meta, rows }, null, 2) + '\n');
  const t = (k) => rows.map((r) => `| ${r.url} | ${r[k].performance} | ${r[k].lcp} | ${r[k].fcp} | ${r[k].cls} | ${r[k].tbt} | ${r[k].si} | ${kb(r[k].weight)} | ${r[k].accessibility} | ${r[k].bestPractices} | ${r[k].seo} |`).join('\n');
  const head = '| Page | Perf | LCP ms | FCP ms | CLS | TBT ms | Speed index ms | Weight KB | A11y | Best practices | SEO |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |';
  const md = [`# Measurements (U15)`, '', `Lighthouse ${meta.lighthouse} on Chromium build ${meta.chrome}, ${meta.when.slice(0, 16)} UTC, this sandbox (${meta.cpus} CPUs), against the`,
    'built site served locally with its `_headers` applied. The analytics beacon is blocked (it cannot load here). Reproduce:', '', '```bash', meta.command, '```', '',
    '## Mobile (Lighthouse default: Moto G Power, simulated slow 4G, 4x CPU slowdown)', '', head, t('mobile'), '',
    '## Desktop (Lighthouse desktop preset)', '', head, t('desktop'), '',
    '## Download size per page (first visit, brotli, before fonts)', '', '| Page | HTML | CSS | JS | Images | Total KB | Total KB, gzip |', '| --- | --- | --- | --- | --- | --- | --- |',
    rows.map((r) => `| ${r.url} | ${kb(r.bytes.html)} | ${kb(r.bytes.css)} | ${kb(r.bytes.js)} | ${kb(r.bytes.img)} | ${kb(r.bytes.total)} | ${kb(r.bytes.totalGzip)} |`).join('\n'), ''].join('\n');
  fs.writeFileSync(path.join(OUT, 'measure.md'), md);
  console.log('wrote handoff/measure.json and handoff/measure.md');
}

async function runScreens() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'screens-'));
  execFileSync('node', [path.join(ROOT, 'tools/screens.mjs'), `--out=${tmp}`, '--scale=2'], { stdio: 'inherit' });
  const dest = path.join(OUT, 'screens');
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  let total = 0;
  for (const f of fs.readdirSync(tmp).filter((f) => f.endsWith('.png'))) {
    const out = path.join(dest, f.replace(/\.png$/, '.webp'));
    const img = sharp(path.join(tmp, f), { limitInputPixels: false });
    const { height } = await img.metadata();
    // WebP's limit is 16383 px a side: the longest pages, at 2x on a phone, are scaled to fit.
    await (height > 16383 ? img.resize({ height: 16383 }) : img).webp({ quality: 72, effort: 5 }).toFile(out);
    total += fs.statSync(out).size;
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`${fs.readdirSync(dest).length} screenshots, ${(total / 1048576).toFixed(1)} MB, in handoff/screens/`);
}

if (process.argv.includes('--lighthouse')) await runLighthouse();
if (process.argv.includes('--screens')) await runScreens();
