// U5, the entrance: (1) the 3D code (three.js, in the puzzle chunk) is statically reachable from no page, and is
// referenced only by the entrance's loader (a dynamic import after first paint); (2) the puzzle data still verifies
// (tools/burr/check.py); (3) it plays in a headless browser with WebGL: Show me pulls the four letters in order, the
// finale runs, the hold ends, and the curtain opens Home with data-curtain set; Skip intro opens Home too. No script
// errors or CSP violations on the way. v4 (U5b): all of it in both masks, the puzzle wearing the mask in force (its
// letters in that mask's colours), and the word's ink and the light landing in Home's mark in the same colours.
// S109 (U1), `lifecycle`, in both masks: the light's halo wears the mask's opacity (C4); a Replay during the fall
// leaves no timer of the old run pending (P2); ten Skips each followed by a Replay or a shape switch leave the
// renderer's geometries and textures, and the live WebGL buffers and textures, flat after the first, every letter
// drawn as at the start, the shared block geometry never disposed (C1, C2, C3), and no WebGL or script error; Skip
// while the curtain is lifting changes nothing, and the curtain still opens Home (C10).
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
const HALO = { night: 0.22, paper: 0.16 };   // PALETTES[mask].haloOpacity
// s109: counts live WebGL buffers and textures, and the puzzle's pending timers (by the chunk that set them)
const PROBE = () => {
  window.__gl = { buffers: 0, textures: 0, errors: 0 };
  for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!C) continue;
    const P = C.prototype, wrap = (n, f) => { const o = P[n]; P[n] = function (...a) { const r = o.apply(this, a); f(r); return r; }; };
    wrap('createBuffer', (r) => { if (r) window.__gl.buffers++; }); wrap('deleteBuffer', () => { window.__gl.buffers--; });
    wrap('createTexture', (r) => { if (r) window.__gl.textures++; }); wrap('deleteTexture', () => { window.__gl.textures--; });
  }
  const pending = new Map(), st = window.setTimeout, ct = window.clearTimeout;
  window.setTimeout = function (fn, ms, ...a) {
    const stack = new Error().stack || '';
    const id = st.call(window, (...b) => { pending.delete(id); return typeof fn === 'function' ? fn(...b) : undefined; }, ms, ...a);
    if (/\/_astro\/puzzle\./.test(stack)) pending.set(id, ms | 0);
    return id;
  };
  window.clearTimeout = function (id) { pending.delete(id); return ct.call(window, id); };
  window.__timers = () => [...pending.values()];
};
const frames = (page, n = 3) => page.evaluate((k) => new Promise((res) => { const f = () => (--k ? requestAnimationFrame(f) : res()); requestAnimationFrame(f); }), n);
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
    const r = { isolation: [], data: [], play: [], lifecycle: [] };
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
      await lifecycle(browser, origin, mask, r.lifecycle);
    }
    await browser.close();
    return Object.entries(r).map(([k, problems]) => ({ id: `entrance.${k}`, ok: problems.length === 0, problems }));
  },
};

async function lifecycle(browser, origin, mask, out) {
  const say = (m) => out.push(`[${mask}] ${m}`);
  const watch = (page) => {
    page.on('pageerror', (e) => say(`uncaught: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error' && !/AudioContext was not allowed/.test(m.text()) && !/cloudflareinsights\.com/.test(m.location()?.url || '')) say(`console: ${m.text().slice(0, 160)}`); });
  };
  const ready = (page) => page.waitForFunction(() => window.__mazo && window.__mazo.state().stage === 0, null, { timeout: 30000 });
  let context = await themedContext(browser, mask);
  await context.addInitScript(PROBE);
  let page = await context.newPage();
  watch(page);
  try {
    await page.goto(origin + ENTRANCE, { waitUntil: 'load' });
    await ready(page);
    const halo = (await page.evaluate(() => window.__mazo.state())).halo;
    if (halo !== HALO[mask]) say(`the light's halo is ${halo}, the mask's is ${HALO[mask]} (C4)`);
    // P2: the solve, then a Replay the moment the rows start to fall: no timer of the old run may stay pending
    for (let i = 1; i <= 4; i++) {
      await page.evaluate(() => window.__mazo.showMe());
      await page.waitForFunction((n) => window.__mazo.state().stage === n, i, { timeout: 15000 });
    }
    const left = await page.evaluate(() => new Promise((res) => {
      const t0 = performance.now();
      const f = () => {
        if (window.__mazo.state().phase === 'fall') { document.getElementById('replay').click(); return res(window.__timers().filter((ms) => ms !== 30)); }
        if (performance.now() - t0 > 20000) return res(null);
        requestAnimationFrame(f);
      };
      f();
    }));
    if (left === null) say('the solve never reached the fall');
    else if (left.length) say(`a Replay during the fall left ${left.length} timer(s) of the old run pending (${left.join(', ')} ms) (P2)`);
    const halo2 = (await page.evaluate(() => window.__mazo.state())).halo;
    if (halo2 !== HALO[mask]) say(`after a Replay the light's halo is ${halo2}, the mask's is ${HALO[mask]} (C4)`);
    // ten Skips, each followed by a Replay or a shape switch; the same view each time so the same letters are drawn
    const take = async () => {
      await page.evaluate(() => window.__mazo.setView(-0.62, 0.3));
      await frames(page, 4);
      return page.evaluate(() => ({ ...window.__mazo.gpu(), gl: { ...window.__gl }, shape: window.__mazo.state().design }));
    };
    const first = {}, seen = [];
    const start = await take(); first[start.shape] = start;
    for (let i = 0; i < 10; i++) {
      // in the page, one frame apart: the frame draws the finished scene (so its objects reach the GPU), and the
      // Replay or switch comes long before the curtain's 650 ms wait, however slow the machine
      await page.evaluate((k) => new Promise((res) => {
        document.getElementById('skip').click();
        requestAnimationFrame(() => { document.getElementById(k % 2 ? 'design' : 'replay').click(); res(); });
      }), i);
      const m = await take();
      seen.push(m);
      if (!first[m.shape]) { first[m.shape] = m; continue; }
      const f = first[m.shape];
      if (m.calls !== f.calls || m.triangles !== f.triangles) say(`after round ${i + 1} (${m.shape}) ${m.calls} draws, ${m.triangles} triangles; the start drew ${f.calls}, ${f.triangles}`);
    }
    // flat after the first round of each shape: the renderer's counts, and the live WebGL objects (the renderer does
    // not count an InstancedMesh's own buffers, which is where letters leaked)
    const firstRound = {};
    for (const [k, m] of seen.entries()) {
      const b = firstRound[m.shape] ??= m;
      if (b === m) continue;
      for (const key of ['geometries', 'textures']) if (m[key] !== b[key]) say(`round ${k + 1} (${m.shape}): renderer ${key} ${m[key]}, after its first round ${b[key]}`);
      for (const key of ['buffers', 'textures']) if (m.gl[key] !== b.gl[key]) say(`round ${k + 1} (${m.shape}): live WebGL ${key} ${m.gl[key]}, after its first round ${b.gl[key]}`);
    }
    const last = seen[seen.length - 1];
    if (last.voxDisposed) say(`the shared block geometry was disposed ${last.voxDisposed} time(s) while in use (C1)`);
    // C3: the environment's generator and room are freed: the only textures left at the start are the puzzle's
    if (start.textures !== 1) say(`at the start the renderer holds ${start.textures} textures (the environment map only is expected) (C3)`);
  } catch (e) { say(e.message.split('\n')[0]); }
  await context.close();
  // C10: Skip while the curtain is lifting changes nothing. Home's warm-up fetch is held, so the lift waits 3 s.
  context = await themedContext(browser, mask);
  // held in the page, not by Playwright's routing, which would turn the cross-document view transition off
  await context.addInitScript(() => { const f = window.fetch; window.fetch = (u, o) => (String(u).endsWith('/home/') ? new Promise((res) => setTimeout(() => res(f(u, o)), 20000)) : f(u, o)); });
  page = await context.newPage();
  watch(page);
  try {
    await page.goto(origin + ENTRANCE, { waitUntil: 'load' });
    await ready(page);
    await page.evaluate(() => document.getElementById('skip').click());
    await page.waitForFunction(() => window.__mazo.state().phase === 'lift', null, { timeout: 10000 });
    const [before, now, soon] = await page.evaluate(() => new Promise((res) => {
      const b = window.__mazo.state();
      document.getElementById('skip').click();
      const n = window.__mazo.state();
      setTimeout(() => res([b, n, window.__mazo.state()]), 200);
    }));
    const key = (s) => `${s.phase} ${s.stage} ${s.blocks}/${s.landed} ${s.reveal}`;
    if (key(now) !== key(before) || key(soon) !== key(before)) say(`Skip during the lift changed the state: ${key(before)} to ${key(now)}, then ${key(soon)} (C10)`);
    await page.waitForURL(origin + '/home/', { timeout: 15000 });
  } catch (e) { say(`Skip during the lift: ${e.message.split('\n')[0]}`); }
  await context.close();
}
