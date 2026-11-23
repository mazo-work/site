#!/usr/bin/env node
// Screenshots of the built site, for the §4 design loop and U15: every page (or --pages=/a/,/b/) in each theme
// (or --themes=editorial) at mobile (390 × 844) and desktop (1440 × 900), full page, into --out (default
// handoff/screens). --scale=1 for working shots, 2 (default) for the ones a person will look at.
// Run `npm run build` first. Usage: node tools/screens.mjs [--themes=…] [--pages=…] [--out=…] [--scale=…] [--only=mobile|desktop]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startServer } from './check/lib/server.mjs';
import { pages as listPages, DIST, ROOT } from './check/lib/dist.mjs';
import { THEMES, THEME_KEY } from './check/config.mjs';

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=').slice(1).join('=') || d;
const themes = arg('themes', THEMES.join(',')).split(',');
const urls = arg('pages', '') ? arg('pages').split(',') : listPages().map((p) => p.url);
const out = path.resolve(ROOT, arg('out', 'handoff/screens'));
const scale = Number(arg('scale', '2'));
const only = arg('only', '');
const sizes = [['mobile', 390, 844], ['desktop', 1440, 900]].filter(([n]) => !only || n === only);
const wait = Number(arg('wait', '400'));

fs.mkdirSync(out, { recursive: true });
const server = await startServer(DIST);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const slug = (u) => (u === '/' ? 'entrance' : u.replace(/^\/|\/$/g, '').replace(/[/.]/g, '-'));
const written = [];
for (const theme of themes) {
  for (const [size, width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale,
      colorScheme: theme === 'terminal' ? 'dark' : 'light', isMobile: size === 'mobile', hasTouch: size === 'mobile' });
    await context.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch {} }, [THEME_KEY, theme]);
    for (const u of urls) {
      const page = await context.newPage();
      await page.goto(server.origin + u, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts && document.fonts.ready);
      await page.waitForTimeout(u === '/' ? Math.max(wait, 1500) : wait);
      const file = path.join(out, `${theme}--${slug(u)}--${size}.png`);
      await page.screenshot({ path: file, fullPage: u !== '/' });
      written.push(path.relative(ROOT, file));
      await page.close();
    }
    await context.close();
  }
}
await browser.close();
await server.close();
console.log(`${written.length} screenshots in ${path.relative(ROOT, out) || out}`);
