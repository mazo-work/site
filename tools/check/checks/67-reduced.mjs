// S109 (U3): the reduced-motion design the operator adopted at S108, in both masks. Run with Playwright's
// `reducedMotion: 'reduce'` (the device's setting) unless said otherwise.
// `entrance` (item 11): the puzzle does not spin on its own, and a turn let go does not drift on.
// `curtain` (item 12): Skip intro opens Home with Paper's fade (data-curtain="fade": the scene fades out in 0.45 s) or
// Night's banded reveal (data-curtain="scan": Home revealed top to bottom by clip-path in six steps, 650 to 800 ms,
// while the scene fades); in both, no transition animates a transform, and the word does not fly into the mark (no
// transition group moves). Without cross-document view transitions the stage fades in 0.45 s and does not move.
// `pages` (item 13): under the device's setting, and separately under Pause motion, a menu-band page change and an
// orb's entry (which also carries the parakeet from the mark to the portrait) animate opacity only, each animation at
// most 300 ms. `head` (item 13): the parakeet's head returns to rest when Pause motion is pressed.
import { chromium } from 'playwright';
import { ENTRANCE, THEMES, THEME_KEY } from '../config.mjs';

const RECORD = () => addEventListener('pagereveal', (e) => {
  window.__vt = null;
  const v = e.viewTransition;
  if (!v) { window.__vt = 'none'; return; }
  v.ready.then(() => {
    window.__vt = document.getAnimations().filter((a) => (a.effect?.pseudoElement || '').startsWith('::view-transition')).map((a) => {
      const k = a.effect.getKeyframes();
      return { el: a.effect.pseudoElement, ms: a.effect.getTiming().duration, easing: k[0]?.easing || '',
        props: [...new Set(k.flatMap((f) => Object.keys(f)).filter((p) => !['offset', 'computedOffset', 'easing', 'composite'].includes(p)))] };
    });
  }, () => { window.__vt = 'skipped'; });
});
const MAX_MS = 300;   // a page change under reduced motion or Pause motion: opacity only, each animation at most this

export default {
  id: 'reduced',
  title: 'Reduced motion (S108): the puzzle holds still, the curtain fades or reveals in bands, page changes cross-fade, the head rests',
  async run(ctx) {
    const r = { entrance: [], curtain: [], pages: [], head: [] };
    const { origin } = await ctx.server();
    // no request interception: Playwright's routing makes Chrome drop cross-document view transitions
    const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist', '--host-resolver-rules=MAP static.cloudflareinsights.com ~NOTFOUND, MAP cloudflareinsights.com ~NOTFOUND'] });
    const open = async (t, { reduce = true, paused = false, viewport = { width: 1280, height: 800 }, extra } = {}) => {
      const c = await browser.newContext({ viewport, colorScheme: t === 'night' ? 'dark' : 'light', reducedMotion: reduce ? 'reduce' : 'no-preference' });
      await c.addInitScript(([k, v, p]) => { try { localStorage.setItem(k, v); if (p) localStorage.setItem('mazo-motion', 'paused'); else localStorage.removeItem('mazo-motion'); } catch {} }, [THEME_KEY, t, paused]);
      await c.addInitScript(RECORD);
      if (extra) await c.addInitScript(extra);
      return c;
    };
    const ready = (p) => p.waitForFunction(() => window.__mazo && window.__mazo.state().stage === 0, null, { timeout: 30000 });
    const vt = (p) => p.waitForFunction(() => window.__vt !== null && window.__vt !== undefined, null, { timeout: 10000 }).then(() => p.evaluate(() => window.__vt)).catch(() => 'unread');
    const moves = (list) => list.filter((a) => a.props.some((x) => x !== 'opacity' && x !== 'clipPath'));

    for (const t of THEMES) {
      // item 11: no idle spin, no momentum drift
      let c = await open(t), p = await c.newPage();
      try {
        await p.goto(origin + ENTRANCE, { waitUntil: 'load' });
        await ready(p);
        const y0 = (await p.evaluate(() => window.__mazo.state())).yaw;
        await p.waitForTimeout(1200);
        const y1 = (await p.evaluate(() => window.__mazo.state())).yaw;
        if (Math.abs(y1 - y0) > 1e-3) r.entrance.push(`[${t}] untouched, the puzzle turned ${(y1 - y0).toFixed(3)} rad in 1.2 s`);
        await p.mouse.move(120, 620); await p.mouse.down();
        for (let i = 1; i <= 6; i++) await p.mouse.move(120 + i * 40, 620, { steps: 1 });
        await p.mouse.up();
        const a = (await p.evaluate(() => window.__mazo.state())).yaw;
        await p.waitForTimeout(800);
        const b = (await p.evaluate(() => window.__mazo.state())).yaw;
        if (a === y1) r.entrance.push(`[${t}] the drag did not turn the puzzle`);
        if (Math.abs(b - a) > 1e-3) r.entrance.push(`[${t}] after a fast turn was let go, the puzzle drifted ${(b - a).toFixed(3)} rad`);
      } catch (e) { r.entrance.push(`[${t}] ${e.message.split('\n')[0]}`); }
      // item 12: the curtain, by mask
      try {
        await p.click('#skip');
        await p.waitForURL(origin + '/home/', { timeout: 20000 });
        const mode = await p.evaluate(() => document.documentElement.dataset.curtain);
        const want = t === 'night' ? 'scan' : 'fade';
        if (mode !== want) r.curtain.push(`[${t}] Home opened with data-curtain=${mode} (${want} expected)`);
        const list = await vt(p);
        if (!Array.isArray(list)) r.curtain.push(`[${t}] the curtain ran no view transition (${list})`);
        else {
          moves(list).forEach((m) => r.curtain.push(`[${t}] ${m.el} animates ${m.props.join(', ')}: the curtain moves nothing`));
          const old = list.find((m) => m.el === '::view-transition-old(root)');
          if (!old || old.props.join() !== 'opacity') r.curtain.push(`[${t}] the scene does not fade (${JSON.stringify(old)})`);
          if (t === 'paper' && old && old.ms !== 450) r.curtain.push(`[paper] the fade takes ${old.ms} ms (450)`);
          if (t === 'night') {
            const scan = list.find((m) => m.el === '::view-transition-new(root)');
            if (!scan || scan.props.join() !== 'clipPath' || !/^steps\(6(, end)?\)$/.test(scan.easing) || scan.ms < 650 || scan.ms > 800) r.curtain.push(`[night] Home is not revealed in six bands in 650 to 800 ms (${JSON.stringify(scan)})`);
          }
          const flying = list.filter((m) => /group\(mark\)/.test(m.el));
          if (flying.length) r.curtain.push(`[${t}] the word flies into the mark (${flying.map((m) => m.props.join(', ')).join('; ')})`);
        }
      } catch (e) { r.curtain.push(`[${t}] ${e.message.split('\n')[0]}`); }
      await c.close();
      // item 12, without cross-document view transitions: the stage fades where it is
      c = await open(t, { extra: () => { delete window.onpagereveal; } });
      p = await c.newPage();
      try {
        await p.goto(origin + ENTRANCE, { waitUntil: 'load' });
        await ready(p);
        const seen = p.evaluate(() => new Promise((res) => {
          const s = document.getElementById('stage');
          const f = () => (s.style.transition ? res({ transition: s.style.transition, transform: s.style.transform, opacity: s.style.opacity }) : requestAnimationFrame(f));
          f();
        }));
        await p.click('#skip');
        const st = await Promise.race([seen, new Promise((res) => setTimeout(() => res(null), 10000))]);
        if (!st) r.curtain.push(`[${t}] without view transitions the stage never moved`);
        else if (st.transform || st.opacity !== '0' || !/opacity 450ms/.test(st.transition)) r.curtain.push(`[${t}] without view transitions the stage goes to transform "${st.transform}", opacity ${st.opacity} (${st.transition})`);
        await p.waitForURL(origin + '/home/', { timeout: 20000 });
      } catch (e) { r.curtain.push(`[${t}] without view transitions: ${e.message.split('\n')[0]}`); }
      await c.close();
      // item 13: page changes under the device's setting, and under Pause motion
      for (const [how, opts] of [['reduce motion', { reduce: true }], ['Pause motion', { reduce: false, paused: true }]]) {
        c = await open(t, { ...opts, viewport: { width: 1440, height: 900 } });
        p = await c.newPage();
        const look = (label, list) => {
          if (!Array.isArray(list) || !list.length) { r.pages.push(`[${t}] ${how}, ${label}: no transition ran (${JSON.stringify(list)})`); return; }
          list.filter((m) => m.props.some((x) => x !== 'opacity')).forEach((m) => r.pages.push(`[${t}] ${how}, ${label}: ${m.el} animates ${m.props.join(', ')}`));
          list.filter((m) => m.ms > MAX_MS).forEach((m) => r.pages.push(`[${t}] ${how}, ${label}: ${m.el} takes ${m.ms} ms (at most ${MAX_MS})`));
        };
        try {
          await p.goto(origin + '/now/', { waitUntil: 'load' });
          await p.click('.menu a[href="/projects/"]');
          await p.waitForURL(origin + '/projects/');
          look('the menu band', await vt(p));
          await p.goto(origin + '/home/', { waitUntil: 'load' });
          await p.hover('.ring-sphere');
          await p.click('.ring .orb-link[href="/about/"]');
          await p.waitForURL(origin + '/about/');
          look('an orb (and the bird)', await vt(p));
        } catch (e) { r.pages.push(`[${t}] ${how}: ${e.message.split('\n')[0]}`); }
        await c.close();
      }
      // item 13: the head rests when motion is paused (pressed from the keyboard, so the pointer does not move)
      c = await open(t, { reduce: false });
      p = await c.newPage();
      try {
        await p.goto(origin + '/about/', { waitUntil: 'load' });
        const b = await p.locator('.parakeet .bird-sprite').boundingBox();
        await p.mouse.move(b.x - 300, b.y - 200); await p.waitForTimeout(100);
        const turned = await p.evaluate(() => document.querySelector('.bird-head').style.transform);
        if (!turned) r.head.push(`[${t}] the head did not follow the pointer`);
        await p.focus('[data-pause]'); await p.keyboard.press('Space'); await p.waitForTimeout(100);
        const rest = await p.evaluate(() => document.querySelector('.bird-head').style.transform);
        if (rest) r.head.push(`[${t}] with Pause motion pressed the head stays turned (${rest})`);
      } catch (e) { r.head.push(`[${t}] ${e.message.split('\n')[0]}`); }
      await c.close();
    }
    await browser.close();
    return Object.entries(r).map(([k, problems]) => ({ id: `reduced.${k}`, ok: problems.length === 0, problems }));
  },
};
