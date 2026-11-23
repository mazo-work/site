#!/usr/bin/env node
// The entrance in each mask, at three moments, for the handoff (v4, U5b): the puzzle as it opens, the hold (the four
// letters settled with the light in the O's gap, the glow or its printed dots behind), and the word with the line of
// blocks under it, just before the curtain. Phone (390 × 844) and desktop (1440 × 900), at 2x, as WebP (quality 72),
// into --out (default handoff/screens). Run `npm run build` first. Needs Python 3 with Pillow for the WebP step.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { startServer } from './check/lib/server.mjs';
import { DIST, ROOT } from './check/lib/dist.mjs';
import { THEMES, THEME_KEY } from './check/config.mjs';

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=').slice(1).join('=') || d;
const out = path.resolve(ROOT, arg('out', 'handoff/screens'));
fs.mkdirSync(out, { recursive: true });
const server = await startServer(DIST);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
  '--host-resolver-rules=MAP static.cloudflareinsights.com ~NOTFOUND, MAP cloudflareinsights.com ~NOTFOUND'] });
const pngs = [];
for (const mask of THEMES) {
  for (const [size, width, height] of [['mobile', 390, 844], ['desktop', 1440, 900]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, colorScheme: mask === 'night' ? 'dark' : 'light',
      isMobile: size === 'mobile', hasTouch: size === 'mobile' });
    await context.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch {} }, [THEME_KEY, mask]);
    const page = await context.newPage();
    await page.route(server.origin + '/home/', () => {});   // Home never answers here, so the curtain cannot take the page away mid-shot
    await page.goto(server.origin + '/', { waitUntil: 'load' });
    await page.waitForFunction(() => window.__mazo && window.__mazo.state().stage === 0, null, { timeout: 30000 });
    await page.waitForTimeout(1200);
    const shot = async (moment) => { const f = path.join(out, `${mask}--entrance-${moment}--${size}.png`); await page.screenshot({ path: f, timeout: 120000 }); pngs.push(f); };
    await shot('puzzle');
    for (let i = 1; i <= 4; i++) {
      await page.evaluate(() => window.__mazo.showMe());
      await page.waitForFunction((n) => window.__mazo.state().stage === n, i, { timeout: 15000 });
    }
    await page.waitForFunction(() => window.__mazo.state().phase === 'hold', null, { timeout: 20000 });
    await page.waitForTimeout(1500);
    await shot('hold');
    await page.waitForFunction(() => { const s = window.__mazo.state(); return s.blocks > 0 && s.landed === s.blocks; }, null, { timeout: 20000 });
    await shot('word');
    await context.close();
  }
}
await browser.close();
await server.close();
execFileSync('python3', ['-I', '-c', `import sys
from PIL import Image
for f in sys.argv[1:]:
    Image.open(f).save(f[:-4] + '.webp', 'WEBP', quality=72)`, ...pngs]);
pngs.forEach((f) => fs.rmSync(f));
console.log(`${pngs.length} screenshots of the entrance in ${path.relative(ROOT, out)}`);
