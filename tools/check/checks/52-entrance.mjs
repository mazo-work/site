// U5, the entrance: (1) the 3D code (three.js, in the puzzle chunk) is statically reachable from no page, and is
// referenced only by the entrance's loader (a dynamic import after first paint); (2) the puzzle data still verifies
// (tools/burr/check.py); (3) it plays in a headless browser with WebGL: Show me pulls the four letters in order, the
// finale runs, the hold ends, and the curtain opens Home with data-curtain set; Skip intro opens Home too. No script
// errors or CSP violations on the way. v4 (U5b): all of it in both masks, the puzzle wearing the mask in force (its
// letters in that mask's colours), and the word's ink and the light landing in Home's mark in the same colours.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, DIST, read, dom, walk } from '../lib/dist.mjs';
import { ENTRANCE, THEMES } from '../config.mjs';

// v4: what each mask's puzzle wears (src/entrance/puzzle.js, PALETTES), and the rule: its word and light are the mark's
const WEARS = {
  night: { letters: ['#ff6a2b', '#46d98a', '#8b5cff', '#dad6f0'], word: '#ece8ff', light: '#ff6a2b' },
  paper: { letters: ['#1b1816', '#e5484d', '#9c948a', '#f2a19c'], word: '#1b1816', light: '#e5484d' },
};
const hex = (rgb) => '#' + (rgb.match(/\d+/g) || []).slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
import { chromium } from 'playwright';
import { themedContext } from './50-browser.mjs';

const STATIC = /(?:import|export)\s*(?:[^'"`;()]*?from\s*)?["'`]([^"'`]+\.js)["'`]/g;
function reachable(entries) {
  const seen = new Set(), stack = [...entries];
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f) || !fs.existsSync(f)) continue;
    seen.add(f);
    const code = read(f).replace(/import\(\s*["'`][^"'`]+["'`]\s*\)/g, '');
    for (const m of code.matchAll(STATIC)) {
      const s = m[1];
      if (s.startsWith('/')) stack.push(path.join(DIST, s));
      else if (s.startsWith('.')) stack.push(path.resolve(path.dirname(f), s));
    }
  }
  return seen;
}

export default {
  id: 'entrance',
  title: 'Entrance: 3D code only there, after first paint; puzzle data; it plays and opens Home',
  async run(ctx) {
    const r = { isolation: [], data: [], play: [] };
    const js = walk(path.join(DIST, '_astro')).filter((f) => f.endsWith('.js'));
    const three = js.filter((f) => /THREE\.WebGLRenderer/.test(read(f)));
    if (!three.length) r.isolation.push('no chunk with three.js in dist/_astro (is the entrance built?)');
    for (const p of ctx.pages) {
      const d = dom(read(p.file));
      const entries = [...d.querySelectorAll('script[src], link[rel="modulepreload"][href]')]
        .map((e) => e.getAttribute('src') || e.getAttribute('href')).filter((u) => u.startsWith('/')).map((u) => path.join(DIST, u));
      const graph = reachable(entries);
      for (const t of three) if (graph.has(t)) r.isolation.push(`${p.url} loads ${path.basename(t)} (three.js) ${p.url === ENTRANCE ? 'before first paint (statically)' : ''}`);
      if (p.url === ENTRANCE) {
        const names = three.map((t) => path.basename(t));
        if (![...graph].some((f) => names.some((n) => read(f).includes(n)))) r.isolation.push('the entrance has no loader that imports the puzzle chunk');
      }
    }
    for (const f of js) {
      if (three.includes(f)) continue;
      const names = three.map((t) => path.basename(t));
      if (names.some((n) => read(f).includes(n))) {
        const users = ctx.pages.filter((p) => reachable([...dom(read(p.file)).querySelectorAll('script[src]')].map((e) => path.join(DIST, e.getAttribute('src')))).has(f));
        for (const u of users) if (u.url !== ENTRANCE) r.isolation.push(`${u.url} carries the puzzle loader ${path.basename(f)}`);
      }
    }
    try { execFileSync('python3', [path.join(ROOT, 'tools/burr/check.py')], { cwd: ROOT, stdio: 'pipe' }); }
    catch (e) { r.data.push(`tools/burr/check.py failed: ${(e.stdout || '').toString().trim().split('\n').slice(-3).join(' | ')}`); }

    const { origin } = await ctx.server();
    // Its own browser, with no request interception: Playwright's routing (even for one host) makes Chrome drop
    // cross-document view transitions, which is exactly what this checks. The beacon's hosts simply do not resolve,
    // so the run stays off the network; failed beacon loads are ignored below by their source.
    const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist', '--host-resolver-rules=MAP static.cloudflareinsights.com ~NOTFOUND, MAP cloudflareinsights.com ~NOTFOUND'] });
    const run = async (label, mask, drive) => {
      label = `${label} [${mask}]`;
      const context = await themedContext(browser, mask);
      const page = await context.newPage();
      const errs = [];
      page.on('pageerror', (e) => errs.push(`uncaught: ${e.message}`));
      page.on('console', (m) => { if (m.type() === 'error' && !/AudioContext was not allowed/.test(m.text()) && !/cloudflareinsights\.com/.test(m.location()?.url || '')) errs.push(`console: ${m.text().slice(0, 160)}`); });
      try {
        await page.goto(origin + ENTRANCE, { waitUntil: 'load' });
        await page.waitForFunction(() => window.__mazo && window.__mazo.state().stage === 0, null, { timeout: 30000 });
        const s0 = await page.evaluate(() => window.__mazo.state());
        if (s0.mask !== mask || JSON.stringify(s0.letters) !== JSON.stringify(WEARS[mask].letters)) r.play.push(`${label}: the puzzle wears ${s0.mask} ${s0.letters.join(' ')}`);
        const seen = await drive(page);
        await page.waitForURL(origin + '/home/', { timeout: 30000 });
        const curtain = await page.evaluate(() => document.documentElement.getAttribute('data-curtain'));
        if (curtain !== 'rise') r.play.push(`${label}: Home opened without the curtain (data-curtain=${curtain})`);
        if (await page.evaluate(() => document.querySelector('h1')?.textContent || '') === '') r.play.push(`${label}: Home has no h1`);
        if (seen) {   // the rule: the word and the light land in Home's mark without changing colour
          const mark = await page.evaluate((m) => {
            const fill = (sel) => getComputedStyle(document.querySelector(sel)).fill;
            return m === 'night' ? { ink: fill('#mark-led circle'), light: fill('#mark-led-light circle') }
              : { ink: fill('.masthead-mark .mark-body'), light: fill('.masthead-mark .mark-light') };
          }, mask);
          if (seen.word !== WEARS[mask].word || hex(mark.ink) !== seen.word) r.play.push(`${label}: the word is ${seen.word}, Home's mark is ${hex(mark.ink)}`);
          if (seen.light !== WEARS[mask].light || hex(mark.light) !== seen.light) r.play.push(`${label}: the light is ${seen.light}, Home's mark's is ${hex(mark.light)}`);
        }
      } catch (e) { r.play.push(`${label}: ${e.message.split('\n')[0]}`); }
      errs.forEach((e) => r.play.push(`${label}: ${e}`));
      await context.close();
    };
    for (const mask of THEMES) {
      await run('the solve', mask, async (page) => {
        for (let i = 1; i <= 4; i++) {
          await page.evaluate(() => window.__mazo.showMe());
          await page.waitForFunction((n) => window.__mazo.state().stage === n, i, { timeout: 15000 });
        }
        const s = await page.evaluate(() => window.__mazo.state());
        if (s.stage !== 4) r.play.push(`the solve [${mask}]: stage ${s.stage} after four pulls`);
        await page.waitForFunction(() => ['hold', 'fall'].includes(window.__mazo.state().phase), null, { timeout: 20000 });
        return page.evaluate(() => window.__mazo.state());
      });
      await run('Skip intro', mask, async (page) => { await page.click('#skip'); });
    }
    await browser.close();
    return Object.entries(r).map(([k, problems]) => ({ id: `entrance.${k}`, ok: problems.length === 0, problems }));
  },
};
