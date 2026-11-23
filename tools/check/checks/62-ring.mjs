// The ring (v4 BRIEF.md §3; U6). `links`: Home, and only Home, has the ring: a nav whose orbs are the five rooms as real
// links. `motion`, in both masks on a desktop: the orbs move; they hold still while the pointer is over the ring, while
// an orb has focus, and while Pause motion is on; every animation in the ring moves only transform and opacity.
// `phone`: on a phone the ring is a picture: its links are hidden (out of the tab order and the accessibility tree)
// and their dots still orbit.
import { read, dom } from '../lib/dist.mjs';
import { THEMES } from '../config.mjs';
import { themedContext } from './50-browser.mjs';

const ROOMS = [['About', '/about/'], ['Projects', '/projects/'], ['Lab notes', '/notes/'], ['Now', '/now/'], ['For recruiters', '/recruiters/']];

export default {
  id: 'ring',
  title: 'The ring: Home only, five rooms as links, moves, holds still when pointed at or focused or paused, a picture on a phone',
  async run(ctx) {
    const r = { links: [], motion: [], phone: [] };
    for (const p of ctx.pages) {
      const rings = dom(read(p.file)).querySelectorAll('nav.ring');
      if (p.url !== '/home/') { if (rings.length) r.links.push(`${p.url} has a ring (Home only)`); continue; }
      if (rings.length !== 1) { r.links.push(`/home/ has ${rings.length} rings`); continue; }
      const links = [...rings[0].querySelectorAll('a.orb-link')].map((a) => [a.textContent.trim(), a.getAttribute('href')]);
      if (JSON.stringify(links) !== JSON.stringify(ROOMS)) r.links.push(`the ring's links are ${JSON.stringify(links)}`);
      if (!rings[0].getAttribute('aria-label')) r.links.push('the ring has no name');
    }
    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    const where = (page) => page.evaluate(() => [...document.querySelectorAll('.orb-dot')].map((d) => { const b = d.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; }));
    const moved = (a, b) => Math.max(...a.map((q, i) => Math.hypot(q[0] - b[i][0], q[1] - b[i][1])));
    for (const t of THEMES) {
      const c = await themedContext(browser, t, { viewport: { width: 1440, height: 900 } });
      const page = await c.newPage();
      await page.goto(origin + '/home/', { waitUntil: 'load' });
      const say = (m) => r.motion.push(`[${t}] ${m}`);
      const a11y = await page.evaluate(() => [...document.querySelectorAll('.ring a.orb-link')].map((a) => ({ name: a.textContent.trim(), visible: getComputedStyle(a).visibility === 'visible' && a.getClientRects().length > 0 })));
      if (a11y.length !== 5 || a11y.some((x) => !x.visible)) say(`the orbs are not five visible links: ${JSON.stringify(a11y)}`);
      const props = await page.evaluate(() => {
        const out = new Set();
        for (const an of document.getAnimations()) {
          if (!(an instanceof CSSAnimation) || !an.effect?.target?.closest?.('.ring')) continue;
          for (const k of an.effect.getKeyframes()) for (const prop of Object.keys(k)) if (!['offset', 'computedOffset', 'easing', 'composite'].includes(prop)) out.add(prop);
        }
        return [...out];
      });
      const bad = props.filter((x) => !['transform', 'opacity'].includes(x));
      if (!props.length) say('the ring has no animations');
      if (bad.length) say(`the ring animates ${bad.join(', ')} (transform and opacity only)`);
      await page.mouse.move(5, 5);
      let a = await where(page); await page.waitForTimeout(1200); let b = await where(page);
      if (moved(a, b) < 3) say(`the orbs did not move in 1.2 s (${moved(a, b).toFixed(1)} px)`);
      await page.hover('.ring-sphere'); await page.waitForTimeout(150);
      a = await where(page); await page.waitForTimeout(1000); b = await where(page);
      if (moved(a, b) > 0.5) say(`with the pointer over it the ring moved ${moved(a, b).toFixed(1)} px`);
      await page.mouse.move(5, 5); await page.focus('.orb-link'); await page.waitForTimeout(150);
      a = await where(page); await page.waitForTimeout(1000); b = await where(page);
      if (moved(a, b) > 0.5) say(`with an orb focused the ring moved ${moved(a, b).toFixed(1)} px`);
      await page.evaluate(() => document.activeElement.blur()); await page.click('[data-pause]'); await page.mouse.move(5, 5); await page.waitForTimeout(150);
      a = await where(page); await page.waitForTimeout(1000); b = await where(page);
      if (moved(a, b) > 0.5) say(`with Pause motion on the ring moved ${moved(a, b).toFixed(1)} px`);
      await page.click('[data-pause]'); await page.mouse.move(5, 5); await page.waitForTimeout(150);
      a = await where(page); await page.waitForTimeout(1000); b = await where(page);
      if (moved(a, b) < 3) say('the ring did not move again after Pause motion was pressed again');
      await c.close();

      const m = await themedContext(browser, t, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const ph = await m.newPage();
      await ph.goto(origin + '/home/', { waitUntil: 'load' });
      const s = await ph.evaluate(() => ({
        links: [...document.querySelectorAll('.ring a.orb-link')].map((a) => getComputedStyle(a).visibility),
        dots: [...document.querySelectorAll('.ring .orb-dot')].map((d) => getComputedStyle(d).visibility),
      }));
      if (s.links.some((v) => v !== 'hidden')) r.phone.push(`[${t}] the ring's links show on a phone (${s.links.join(', ')})`);
      if (s.dots.length !== 5 || s.dots.some((v) => v !== 'visible')) r.phone.push(`[${t}] the ring's dots do not show on a phone`);
      const a1 = await where(ph); await ph.waitForTimeout(1200); const b1 = await where(ph);
      if (moved(a1, b1) < 2) r.phone.push(`[${t}] the dots do not orbit on a phone`);
      const exposed = await ph.getByRole('navigation', { name: 'Rooms, in orbit' }).getByRole('link').count();
      if (exposed) r.phone.push(`[${t}] ${exposed} of the ring's links are exposed to assistive tech on a phone`);
      const tabbed = [];
      for (let i = 0; i < 30; i++) { await ph.keyboard.press('Tab'); tabbed.push(await ph.evaluate(() => document.activeElement?.className || '')); }
      if (tabbed.some((x) => /orb-link/.test(x))) r.phone.push(`[${t}] Tab reaches an orb on a phone`);
      await m.close();
    }
    return Object.entries(r).map(([k, problems]) => ({ id: `ring.${k}`, ok: problems.length === 0, problems }));
  },
};
