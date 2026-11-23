#!/usr/bin/env node
// Entering an orb (v4, U7), recorded: Chrome's screencast (every frame it paints) while the About orb on Home is
// clicked, in each mask at 1440 × 900. Ten frames spread over the transition are kept as WebP in
// handoff/orb-entry/<mask>-NN.webp, with a contact sheet <mask>-sheet.webp. Run `npm run build` first; needs Python 3
// with Pillow. No request interception (it would stop the cross-document view transition).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { startServer } from './check/lib/server.mjs';
import { DIST, ROOT } from './check/lib/dist.mjs';
import { THEMES, THEME_KEY } from './check/config.mjs';

const out = path.join(ROOT, 'handoff', 'orb-entry');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const tmp = fs.mkdtempSync(path.join(out, '.frames-'));
const server = await startServer(DIST);
const browser = await chromium.launch({ args: ['--host-resolver-rules=MAP static.cloudflareinsights.com ~NOTFOUND, MAP cloudflareinsights.com ~NOTFOUND'] });
const kept = [];
for (const mask of THEMES) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: mask === 'night' ? 'dark' : 'light' });
  await c.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch {} }, [THEME_KEY, mask]);
  const page = await c.newPage();
  await page.goto(server.origin + '/home/', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.hover('.ring-sphere');
  const cdp = await c.newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => { frames.push({ t: metadata.timestamp, data }); cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 85, everyNthFrame: 1 });
  await page.waitForTimeout(300);
  const t0 = Date.now() / 1000;
  await page.click('.ring .orb-link[href="/about/"]');
  await page.waitForTimeout(2600);
  await cdp.send('Page.stopScreencast');
  const during = frames.filter((f) => f.t >= t0 - 0.05);
  const pick = Array.from({ length: 10 }, (_, i) => during[Math.min(during.length - 1, Math.round(i * (during.length - 1) / 9))]);
  pick.forEach((f, i) => { const file = path.join(tmp, `${mask}-${String(i + 1).padStart(2, '0')}.jpg`); fs.writeFileSync(file, Buffer.from(f.data, 'base64')); kept.push(file); });
  console.log(`${mask}: ${frames.length} frames painted, ${during.length} from the click on, 10 kept`);
  await c.close();
}
await browser.close();
await server.close();
execFileSync('python3', ['-I', '-c', `import sys, os
from PIL import Image
out = sys.argv[1]; files = sys.argv[2:]
by = {}
for f in files:
    m = os.path.basename(f).split('-')[0]
    im = Image.open(f).convert('RGB'); im.save(os.path.join(out, os.path.basename(f)[:-4] + '.webp'), 'WEBP', quality=72)
    by.setdefault(m, []).append(im)
for m, ims in by.items():
    w, h = 360, 225
    sheet = Image.new('RGB', (w * 5, h * 2), 'white')
    for i, im in enumerate(ims): sheet.paste(im.resize((w, h)), ((i % 5) * w, (i // 5) * h))
    sheet.save(os.path.join(out, m + '-sheet.webp'), 'WEBP', quality=80)`, out, ...kept]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`frames in ${path.relative(ROOT, out)}`);
