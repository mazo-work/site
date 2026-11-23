// Entering an orb (v4 BRIEF.md §3; U7), in a browser with cross-document view transitions, in both masks: clicking an
// orb on Home opens its room with a view transition during which the page is marked `data-entry="orb"`, knows where
// the orb was, and names its main `orb-entry` (the name the clicked dot took); when the transition ends the mark is
// gone. A room reached by the menu band is never marked (each mask's v3 transition plays). Where the browser has no
// cross-document view transitions, the boot script leaves the page unmarked: a normal page change.
import { chromium } from 'playwright';
import { THEMES, THEME_KEY } from '../config.mjs';

const RECORD = () => {
  addEventListener('pagereveal', (e) => {
    const d = document.documentElement, main = document.querySelector('main');
    window.__reveal = { vt: !!e.viewTransition, entry: d.dataset.entry || null, x: d.style.getPropertyValue('--entry-x'),
      main: main ? getComputedStyle(main).viewTransitionName : null, veil: getComputedStyle(document.querySelector('.entry-veil') || d).display };
    // read a task later: this listener was added before the boot script's, so its callbacks run first
    if (e.viewTransition) e.viewTransition.finished.then(() => setTimeout(() => { window.__reveal.after = d.dataset.entry || null; }), () => { window.__reveal.after = 'skipped'; });
    else window.__reveal.after = d.dataset.entry || null;
  });
};

export default {
  id: 'entry',
  title: 'Entering an orb: a view transition marked for the orb, then unmarked; the menu band and old browsers unchanged',
  async run(ctx) {
    const r = { orb: [], band: [], fallback: [] };
    const { origin } = await ctx.server();
    // no request interception here: Playwright's routing makes Chrome drop cross-document view transitions
    const browser = await chromium.launch({ args: ['--host-resolver-rules=MAP static.cloudflareinsights.com ~NOTFOUND, MAP cloudflareinsights.com ~NOTFOUND'] });
    const open = async (t, extra) => {
      const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: t === 'night' ? 'dark' : 'light' });
      await c.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch {} }, [THEME_KEY, t]);
      await c.addInitScript(RECORD);
      if (extra) await c.addInitScript(extra);
      const page = await c.newPage();
      await page.goto(origin + '/home/', { waitUntil: 'load' });
      return { c, page };
    };
    const clickOrb = async (page, href) => {
      await page.hover('.ring-sphere');                          // the ring holds still under the pointer
      await page.click(`.ring .orb-link[href="${href}"]`);
      await page.waitForURL(origin + href, { timeout: 15000 });
      await page.waitForFunction(() => window.__reveal && 'after' in window.__reveal, null, { timeout: 15000 });
      return page.evaluate(() => window.__reveal);
    };
    for (const t of THEMES) {
      const { c, page } = await open(t);
      const s = await clickOrb(page, '/about/');
      if (!s.vt) r.orb.push(`[${t}] no view transition ran entering the About orb`);
      if (s.entry !== 'orb' || !s.x || s.main !== 'orb-entry' || s.veil !== 'block') r.orb.push(`[${t}] during the transition: ${JSON.stringify(s)}`);
      if (s.after !== null) r.orb.push(`[${t}] after the transition the page is still marked (${s.after})`);
      const left = await page.evaluate(() => ({ entry: document.documentElement.dataset.entry || null, veil: getComputedStyle(document.querySelector('.entry-veil')).display }));
      if (left.entry || left.veil !== 'none') r.orb.push(`[${t}] the veils stayed: ${JSON.stringify(left)}`);
      await page.click('.menu a[href="/now/"]');
      await page.waitForURL(origin + '/now/');
      await page.waitForFunction(() => window.__reveal && 'after' in window.__reveal, null, { timeout: 15000 });
      const b = await page.evaluate(() => window.__reveal);
      if (b.entry || b.main === 'orb-entry') r.band.push(`[${t}] a room reached by the menu band was marked as entered from an orb: ${JSON.stringify(b)}`);
      if (!b.vt) r.band.push(`[${t}] the menu band's page change ran no view transition (v3's should play)`);
      await c.close();
      const f = await open(t, () => { try { delete Window.prototype.onpagereveal; delete window.onpagereveal; } catch {} });
      const has = await f.page.evaluate(() => 'onpagereveal' in window);
      if (has) { r.fallback.push(`[${t}] could not hide cross-document view transitions to test the fallback`); await f.c.close(); continue; }
      await f.page.hover('.ring-sphere');
      await f.page.click('.ring .orb-link[href="/projects/"]');
      await f.page.waitForURL(origin + '/projects/');
      const n = await f.page.evaluate(() => ({ entry: document.documentElement.dataset.entry || null, veil: getComputedStyle(document.querySelector('.entry-veil')).display, h1: !!document.querySelector('h1') }));
      if (n.entry || n.veil !== 'none' || !n.h1) r.fallback.push(`[${t}] without cross-document view transitions: ${JSON.stringify(n)}`);
      await f.c.close();
    }
    await browser.close();
    return Object.entries(r).map(([k, problems]) => ({ id: `entry.${k}`, ok: problems.length === 0, problems }));
  },
};
