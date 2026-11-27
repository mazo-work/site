// Pause motion (v4 BRIEF.md §3, Motion; U10). `loops`: on Home (the light, the ring, the bird), About (the bird on
// the portrait, Night's scan) and Now, in both masks, every infinite animation runs, and every one stops when Pause
// motion is pressed, stays stopped on the next page (remembered), and runs again when it is pressed again. `transitions`:
// with motion paused, a page change still plays its view transition; since S109 (the reduced-motion design adopted at
// S108) that transition animates opacity only, each animation at most 300 ms (src/styles/reduced.css: 250 ms). `nojs`: without JavaScript (no data-js), there
// is no button, so no animation runs. `a11y`: the button is named "Pause motion", says its state (aria-pressed),
// works with the keyboard, and passes axe pressed and unpressed, in both masks. `properties`: every @keyframes in the
// built CSS animates only transform (or translate, scale, rotate), opacity, or the reveal's clip-path, and every
// transition only those.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { read, walk, DIST } from '../lib/dist.mjs';
import { THEMES, THEME_KEY, AXE_TAGS } from '../config.mjs';
import { themedContext } from './50-browser.mjs';

const OK = new Set(['transform', 'translate', 'scale', 'rotate', 'opacity', 'clip-path']);
const loops = (page) => page.evaluate(() => document.getAnimations().filter((a) => a instanceof CSSAnimation && a.effect.getTiming().iterations === Infinity)
  .map((a) => ({ name: a.animationName, state: a.playState })));

export default {
  id: 'motion',
  title: 'Pause motion: every loop stops and is remembered, transitions still play, nothing loops without JavaScript, accessible; transform and opacity only',
  async run(ctx) {
    const r = { loops: [], transitions: [], nojs: [], a11y: [], properties: [] };
    for (const f of walk(DIST).filter((f) => f.endsWith('.css'))) {
      const css = read(f);
      for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*{((?:[^{}]*{[^{}]*})*)[^{}]*}/g)) {
        for (const d of m[2].matchAll(/([a-z-]+)\s*:/g)) if (!OK.has(d[1])) r.properties.push(`@keyframes ${m[1]} animates ${d[1]} (${f.slice(DIST.length)})`);
      }
      for (const m of css.matchAll(/transition(?:-property)?\s*:\s*([^;}]+)/g)) {
        for (const part of m[1].split(',')) {
          const prop = part.trim().split(/\s+/)[0];
          if (prop && !/^(none|all|\d|initial|inherit)/.test(prop) && !OK.has(prop)) r.properties.push(`a transition of ${prop} (${f.slice(DIST.length)})`);
        }
      }
    }
    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    for (const t of THEMES) {
      const c = await themedContext(browser, t, { viewport: { width: 1440, height: 900 } });
      const page = await c.newPage();
      for (const url of ['/home/', '/about/', '/now/']) {
        await page.goto(origin + url, { waitUntil: 'load' });
        const s0 = await loops(page);
        const want = url === '/home/' ? ['mark-blink', 'ring-arm', 'bird-hop'] : url === '/about/' ? ['mark-blink', 'bird-settle'].concat(t === 'night' ? ['night-scan'] : []) : ['mark-blink', 'bird-hop'];
        for (const w of want) if (!s0.some((a) => a.name === w && a.state === 'running')) r.loops.push(`[${t}] ${url}: ${w} is not running before the button is pressed`);
        await page.click('[data-pause]');
        const s1 = await loops(page);
        if (s1.some((a) => a.state !== 'paused')) r.loops.push(`[${t}] ${url}: still running after Pause motion: ${[...new Set(s1.filter((a) => a.state !== 'paused').map((a) => a.name))].join(', ')}`);
        await page.reload({ waitUntil: 'load' });
        const s2 = await loops(page);
        if (s2.some((a) => a.state !== 'paused')) r.loops.push(`[${t}] ${url}: running again after a reload, though motion is paused`);
        await page.click('[data-pause]');
        const s3 = await loops(page);
        if (!s3.length || s3.some((a) => a.state !== 'running')) r.loops.push(`[${t}] ${url}: not all loops run again after the second press`);
      }
      // without JavaScript's mark, nothing loops
      await page.goto(origin + '/home/', { waitUntil: 'load' });
      await page.evaluate(() => document.documentElement.removeAttribute('data-js'));
      const nj = await loops(page);
      if (nj.some((a) => a.state === 'running')) r.nojs.push(`[${t}] without data-js these still run: ${[...new Set(nj.filter((a) => a.state === 'running').map((a) => a.name))].join(', ')}`);
      const hidden = await page.evaluate(() => getComputedStyle(document.querySelector('[data-pause]')).display);
      if (hidden !== 'none') r.nojs.push(`[${t}] without data-js the Pause button shows (display ${hidden})`);
      // the button, by keyboard and for assistive tech, in both states
      await page.goto(origin + '/about/', { waitUntil: 'load' });
      const btn = page.getByRole('button', { name: 'Pause motion' });
      if (await btn.count() !== 1) r.a11y.push(`[${t}] no button named "Pause motion"`);
      else {
        await btn.focus(); await page.keyboard.press('Space');
        if (await btn.getAttribute('aria-pressed') !== 'true') r.a11y.push(`[${t}] Space did not press it`);
        const axe1 = await new AxeBuilder({ page }).include('.utility').withTags(AXE_TAGS).analyze();
        axe1.violations.forEach((v) => r.a11y.push(`[${t}] pressed: axe ${v.id}: ${v.help}`));
        await page.keyboard.press('Enter');
        if (await btn.getAttribute('aria-pressed') !== 'false') r.a11y.push(`[${t}] Enter did not release it`);
        const axe0 = await new AxeBuilder({ page }).include('.utility').withTags(AXE_TAGS).analyze();
        axe0.violations.forEach((v) => r.a11y.push(`[${t}] released: axe ${v.id}: ${v.help}`));
      }
      await c.close();
    }
    // page transitions still play with motion paused (their own browser: interception would stop them)
    const plain = await chromium.launch({ args: ['--host-resolver-rules=MAP static.cloudflareinsights.com ~NOTFOUND, MAP cloudflareinsights.com ~NOTFOUND'] });
    for (const t of THEMES) {
      const c = await plain.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: t === 'night' ? 'dark' : 'light' });
      await c.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); localStorage.setItem('mazo-motion', 'paused'); } catch {} }, [THEME_KEY, t]);
      await c.addInitScript(() => addEventListener('pagereveal', (e) => {
        window.__vt = 'none';
        e.viewTransition?.ready.then(() => {
          const run = document.getAnimations().filter((a) => (a.effect?.pseudoElement || '').startsWith('::view-transition') && a.playState === 'running');
          window.__vt = run.length;
          window.__vtMoves = run.flatMap((a) => {   // s109: opacity only, at most 300 ms
            const props = [...new Set(a.effect.getKeyframes().flatMap((k) => Object.keys(k)).filter((p) => !['offset', 'computedOffset', 'easing', 'composite'].includes(p)))];
            const ms = a.effect.getTiming().duration;
            return props.some((p) => p !== 'opacity') || ms > 300 ? [`${a.effect.pseudoElement} animates ${props.join(', ')} for ${ms} ms`] : [];
          });
        }, () => { window.__vt = 'skipped'; });
      }));
      const p = await c.newPage();
      await p.goto(origin + '/now/', { waitUntil: 'load' });
      await p.click('.menu a[href="/projects/"]');
      await p.waitForURL(origin + '/projects/');
      await p.waitForFunction(() => window.__vt !== undefined && window.__vt !== 'none', null, { timeout: 10000 }).catch(() => {});
      const vt = await p.evaluate(() => [window.__vt, document.documentElement.dataset.motion, window.__vtMoves || []]);
      if (!(vt[0] > 0) || vt[1] !== 'paused') r.transitions.push(`[${t}] with motion paused, the page change ran ${vt[0]} transition animations (motion: ${vt[1]})`);
      vt[2].forEach((m) => r.transitions.push(`[${t}] with motion paused, ${m} (opacity only, at most 300 ms)`));
      await c.close();
    }
    await plain.close();
    return Object.entries(r).map(([k, problems]) => ({ id: `motion.${k}`, ok: problems.length === 0, problems }));
  },
};
