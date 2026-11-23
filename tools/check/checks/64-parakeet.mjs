// The parakeet (v4 BRIEF.md §3; U8). `place`: one bird on every page but the entrance, inline and decorative (no src,
// href or style; aria-hidden), on the masthead's mark, except on About and For recruiters where it sits on the
// portrait; the sprite file keeps its contract (a `bird-head` group; no style, script or link). `motion`, in both
// masks: the bird carries the view-transition name `parakeet` and flies in a page change from the mark to the portrait;
// it hops (and paces on the mark) with transform and opacity only; after the entrance's curtain it appears. `head`: on
// a portrait page its head turns toward a mouse (left and right), keeps still for touch and with Pause motion on, and
// nothing is requested or stored while it watches.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { read, dom, ROOT } from '../lib/dist.mjs';
import { THEMES, THEME_KEY, ENTRANCE } from '../config.mjs';
import { themedContext } from './50-browser.mjs';

const PORTRAIT = ['/about/', '/recruiters/'];

export default {
  id: 'parakeet',
  title: 'The parakeet: on the mark or the portrait, inline, flies between pages, hops, watches a mouse, sends and keeps nothing',
  async run(ctx) {
    const r = { place: [], motion: [], head: [] };
    const sprite = fs.readFileSync(path.join(ROOT, 'src/assets/parakeet.svg'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    if (!/class="bird-head"/.test(sprite) || !/viewBox=/.test(sprite)) r.place.push('the sprite has no viewBox or no bird-head group');
    if (/style=|<style|<script|href=/i.test(sprite)) r.place.push('the sprite carries a style, a script or a link');
    for (const p of ctx.pages) {
      if (p.url === ENTRANCE) continue;
      const d = dom(read(p.file));
      const birds = d.querySelectorAll('.parakeet');
      if (birds.length !== 1) { r.place.push(`${p.url}: ${birds.length} birds`); continue; }
      const b = birds[0];
      const want = PORTRAIT.includes(p.url) ? 'portrait' : 'perch';
      if (b.getAttribute('data-place') !== want) r.place.push(`${p.url}: the bird is at ${b.getAttribute('data-place')} (want ${want})`);
      if (want === 'portrait' ? !b.closest('figure.portrait') : !b.closest('.masthead-mark')) r.place.push(`${p.url}: the bird is not ${want === 'portrait' ? 'on the portrait' : 'on the mark'}`);
      if (b.getAttribute('aria-hidden') !== 'true') r.place.push(`${p.url}: the bird is not hidden from screen readers`);
      if (!b.querySelector('svg.bird-sprite .bird-head')) r.place.push(`${p.url}: the bird has no inline sprite with a head`);
      for (const e of [b, ...b.querySelectorAll('*')]) for (const a of ['src', 'href', 'xlink:href', 'style', 'srcset']) if (e.hasAttribute(a)) r.place.push(`${p.url}: the bird has ${a}`);
    }
    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    for (const t of THEMES) {
      const c = await themedContext(browser, t, { viewport: { width: 1440, height: 900 } });
      const page = await c.newPage();
      await page.goto(origin + '/now/', { waitUntil: 'load' });
      const s = await page.evaluate(() => {
        const b = document.querySelector('.parakeet');
        const anims = document.getAnimations().filter((a) => a instanceof CSSAnimation && b.contains(a.effect.target));
        const props = new Set();
        for (const a of anims) for (const k of a.effect.getKeyframes()) for (const p of Object.keys(k)) if (!['offset', 'computedOffset', 'easing', 'composite'].includes(p)) props.add(p);
        return { name: getComputedStyle(b).viewTransitionName, anims: anims.map((a) => a.animationName), props: [...props] };
      });
      if (s.name !== 'parakeet') r.motion.push(`[${t}] the bird's view-transition name is ${s.name}`);
      if (!s.anims.includes('bird-hop') || !s.anims.includes('bird-pace')) r.motion.push(`[${t}] on the mark the bird does not hop and pace (${s.anims.join(', ')})`);
      if (s.props.some((x) => !['transform', 'opacity'].includes(x))) r.motion.push(`[${t}] the bird animates ${s.props.join(', ')}`);
      // the head, on a portrait page
      await page.goto(origin + '/about/', { waitUntil: 'load' });
      const requests = [];
      page.on('request', (q) => requests.push(q.url()));
      const before = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
      const box = await page.evaluate(() => { const b = document.querySelector('.parakeet svg').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
      const head = () => page.evaluate(() => document.querySelector('.parakeet .bird-head').style.transform);
      await page.mouse.move(Math.max(box.x - 300, 4), Math.max(box.y - 200, 4)); await page.waitForTimeout(120);
      const left = await head();
      await page.mouse.move(Math.min(box.x + 300, 1440 - 4), box.y + 200); await page.waitForTimeout(120);   // inside the window
      const right = await head();
      if (!/rotate/.test(left) || !/scaleX\(-1\)/.test(left)) r.head.push(`[${t}] with the pointer up and left the head is "${left}"`);
      if (!/rotate\((?!-)/.test(right) || /scaleX/.test(right)) r.head.push(`[${t}] with the pointer down and right the head is "${right}"`);
      await page.click('[data-pause]'); await page.mouse.move(box.x - 250, box.y - 150); await page.waitForTimeout(120);
      if (await head()) r.head.push(`[${t}] with Pause motion on the head still turns`);
      await page.click('[data-pause]');
      const after = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
      const own = requests.filter((u) => !/cloudflareinsights/.test(u));
      if (own.length) r.head.push(`[${t}] watching the pointer made requests: ${own.join(', ')}`);
      if (after !== before) r.head.push(`[${t}] watching the pointer stored something (${before} → ${after})`);
      await c.close();
      // touch: no pointer to follow
      const m = await themedContext(browser, t, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const ph = await m.newPage();
      await ph.goto(origin + '/about/', { waitUntil: 'load' });
      await ph.touchscreen.tap(30, 600); await ph.waitForTimeout(120);
      if (await ph.evaluate(() => document.querySelector('.parakeet .bird-head').style.transform)) r.head.push(`[${t}] a touch turned the head`);
      await m.close();
      // after the entrance's curtain, it appears
      const a = await themedContext(browser, t);
      await a.addInitScript(() => { try { sessionStorage.setItem('mazo-curtain', 'rise'); } catch {} });
      const ap = await a.newPage();
      await ap.goto(origin + '/home/', { waitUntil: 'load' });
      const appear = await ap.evaluate(() => document.getAnimations().some((x) => x.animationName === 'bird-appear'));
      if (!appear) r.motion.push(`[${t}] after the curtain the bird does not appear`);
      await a.close();
    }
    // it flies: a page change from Home (the mark) to About (the portrait) carries a parakeet group; no interception
    const plain = await chromium.launch({ args: ['--host-resolver-rules=MAP static.cloudflareinsights.com ~NOTFOUND, MAP cloudflareinsights.com ~NOTFOUND'] });
    for (const t of THEMES) {
      const c = await plain.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: t === 'night' ? 'dark' : 'light' });
      await c.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch {} }, [THEME_KEY, t]);
      await c.addInitScript(() => addEventListener('pagereveal', (e) => {
        window.__fly = 'no view transition';
        e.viewTransition?.ready.then(() => { window.__fly = document.getAnimations().filter((x) => /parakeet/.test(x.effect?.pseudoElement || '')).map((x) => x.effect.pseudoElement).join(' ') || 'none'; }, () => { window.__fly = 'skipped'; });
      }));
      const p = await c.newPage();
      await p.goto(origin + '/home/', { waitUntil: 'load' });
      await p.click('.menu a[href="/about/"]');
      await p.waitForURL(origin + '/about/');
      await p.waitForFunction(() => window.__fly && window.__fly !== 'no view transition', null, { timeout: 10000 }).catch(() => {});
      const fly = await p.evaluate(() => window.__fly);
      if (!/::view-transition-group\(parakeet\)/.test(fly || '') || !/image-pair\(parakeet\)/.test(fly || '')) r.motion.push(`[${t}] Home to About: the bird does not fly (${fly})`);
      await c.close();
    }
    await plain.close();
    return Object.entries(r).map(([k, problems]) => ({ id: `parakeet.${k}`, ok: problems.length === 0, problems }));
  },
};
