// S109 (U2), the UI races, in both masks. `sound` (P1): on the entrance, the first press on "Click for sound" (a
// mouse click, then Enter on a fresh page) leaves the sound on: it starts it, and does not turn it off. `phone-dots`
// (C7): on a phone, a tap on every dot of the ring (a picture there) leaves Home where it is. `entry-name` (C8): two
// orbs clicked in turn, the first page change cancelled, leave exactly one element named `orb-entry`, the second
// orb's dot. `theme-toggle` (C9): three quick mask toggles keep `theme-switching` on the root until the last
// transition has finished, and then take it off.
import { ENTRANCE, THEMES } from '../config.mjs';
import { themedContext } from './50-browser.mjs';

export default {
  id: 'races',
  title: 'UI races: the first sound press, phone ring dots, one orb-entry name, quick mask toggles',
  async run(ctx) {
    const r = { sound: [], 'phone-dots': [], 'entry-name': [], 'theme-toggle': [] };
    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    for (const t of THEMES) {
      // P1: the first press on the sound button
      for (const how of ['click', 'Enter']) {
        const c = await themedContext(browser, t);
        await c.addInitScript(() => { try { localStorage.removeItem('mazo-sound'); } catch {} });
        const p = await c.newPage();
        try {
          await p.goto(origin + ENTRANCE, { waitUntil: 'load' });
          await p.waitForFunction(() => window.__mazo && window.__mazo.state().stage === 0, null, { timeout: 30000 });
          const before = await p.textContent('#sound');
          if (how === 'click') await p.click('#sound'); else { await p.focus('#sound'); await p.keyboard.press('Enter'); }
          await p.waitForTimeout(400);
          const s = await p.evaluate(() => ({ text: document.getElementById('sound').textContent, pressed: document.getElementById('sound').getAttribute('aria-pressed'),
            stored: localStorage.getItem('mazo-sound'), audio: window.__mazo.state().sound }));
          if (s.pressed !== 'true' || s.stored === 'off' || s.audio !== 'running') r.sound.push(`[${t}] the first ${how} on "${before}" left: ${s.text}, aria-pressed ${s.pressed}, stored ${s.stored}, audio ${s.audio}`);
        } catch (e) { r.sound.push(`[${t}] ${how}: ${e.message.split('\n')[0]}`); }
        await c.close();
      }
      // C7: a phone's taps on the ring's dots
      {
        const c = await themedContext(browser, t, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
        const p = await c.newPage();
        await p.goto(origin + '/home/', { waitUntil: 'load' });
        await p.click('[data-pause]');   // the dots hold still, so each tap lands on its dot
        await p.waitForTimeout(100);
        const dots = await p.evaluate(() => [...document.querySelectorAll('.ring .orb-dot')].map((d) => { const b = d.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; }));
        if (dots.length !== 5) r['phone-dots'].push(`[${t}] ${dots.length} dots on a phone`);
        for (const [x, y] of dots) {
          await p.touchscreen.tap(x, y);
          await p.waitForTimeout(400);
          if (new URL(p.url()).pathname !== '/home/') { r['phone-dots'].push(`[${t}] a tap on the dot at ${x.toFixed(0)}, ${y.toFixed(0)} opened ${new URL(p.url()).pathname}`); await p.goto(origin + '/home/', { waitUntil: 'load' }); }
        }
        await c.close();
      }
      // C8: two orbs, the first page change cancelled (both are cancelled here, so the names can be read after)
      {
        const c = await themedContext(browser, t, { viewport: { width: 1440, height: 900 } });
        const p = await c.newPage();
        await p.goto(origin + '/home/', { waitUntil: 'load' });
        await p.evaluate(() => addEventListener('click', (e) => { if (e.target.closest?.('.orb-link')) e.preventDefault(); }));
        await p.click('[data-pause]');
        await p.click('.ring .orb-link[href="/about/"] .orb-dot');
        await p.click('.ring .orb-link[href="/now/"] .orb-dot');
        const named = await p.evaluate(() => [...document.querySelectorAll('*')].filter((e) => e.style.viewTransitionName === 'orb-entry').map((e) => e.closest('a')?.getAttribute('href') || e.tagName));
        if (named.length !== 1 || named[0] !== '/now/') r['entry-name'].push(`[${t}] after two orbs, orb-entry names ${named.length} element(s): ${named.join(', ') || 'none'} (the second orb, /now/, only)`);
        await c.close();
      }
      // C9: three quick toggles, each while the last one's transition still runs
      {
        const c = await themedContext(browser, t, { viewport: { width: 1280, height: 800 } });
        const p = await c.newPage();
        await p.goto(origin + '/about/', { waitUntil: 'load' });
        await p.evaluate(() => {
          const log = window.__tt = { vts: [], early: 0, removed: 0 };
          const start = document.startViewTransition.bind(document);
          document.startViewTransition = (cb) => { const vt = start(cb); const rec = { done: false }; log.vts.push(rec); vt.finished.finally(() => { rec.done = true; }); return vt; };
          let had = document.documentElement.classList.contains('theme-switching');
          new MutationObserver(() => {
            const has = document.documentElement.classList.contains('theme-switching');
            if (had && !has) { log.removed++; if (log.vts.length && !log.vts[log.vts.length - 1].done) log.early++; }
            had = has;
          }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        });
        const order = t === 'paper' ? ['night', 'paper', 'night'] : ['paper', 'night', 'paper'];
        for (const m of order) { await p.evaluate((v) => document.querySelector(`[data-theme-switch] input[value="${v}"]`).click(), m); await p.waitForTimeout(90); }
        await p.waitForTimeout(1500);
        const s = await p.evaluate(() => ({ ...window.__tt, vts: window.__tt.vts.length, on: document.documentElement.classList.contains('theme-switching'), theme: document.documentElement.dataset.theme }));
        if (s.vts !== 3) r['theme-toggle'].push(`[${t}] three toggles started ${s.vts} transitions`);
        if (s.early) r['theme-toggle'].push(`[${t}] theme-switching was taken off ${s.early} time(s) while the last transition still ran`);
        if (s.on) r['theme-toggle'].push(`[${t}] theme-switching is still on after the last transition`);
        if (s.theme !== order[2]) r['theme-toggle'].push(`[${t}] the mask is ${s.theme}, not the last chosen (${order[2]})`);
        await c.close();
      }
    }
    return Object.entries(r).map(([k, problems]) => ({ id: `races.${k}`, ok: problems.length === 0, problems }));
  },
};
