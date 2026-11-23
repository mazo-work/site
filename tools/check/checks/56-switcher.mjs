// The mask toggle (v3's U8; v4's U1): no flash (the inline boot script runs before any stylesheet on every page); the
// device default (light: Paper, dark: Night), followed live while no choice is stored; the choice made by keyboard
// (arrow keys in the radio group), stored in localStorage, kept across pages, and no cookie set; a group named "Mask"
// of exactly two named radios, Paper and Night (Profile is not offered), the checked one matching the mask.
import { read, dom } from '../lib/dist.mjs';
import { THEMES, THEME_KEY, ENTRANCE } from '../config.mjs';

const NAMES = { paper: 'Paper', night: 'Night' };

export default {
  id: 'switcher',
  title: 'Mask toggle: no flash, device default, keyboard, persistence, no cookie, names',
  async run(ctx) {
    const r = { noflash: [], default: [], keyboard: [], a11y: [] };
    for (const p of ctx.pages) {
      const d = dom(read(p.file));
      const head = d.querySelector('head');
      const els = [...head.children];
      const boot = els.findIndex((e) => e.tagName === 'SCRIPT' && !e.getAttribute('src') && /data-theme/.test(e.textContent));
      const firstStyle = els.findIndex((e) => e.tagName === 'LINK' && /stylesheet/.test(e.getAttribute('rel') || ''));
      const firstScript = els.findIndex((e) => e.tagName === 'SCRIPT');
      if (boot < 0) r.noflash.push(`${p.url}: no theme boot script in <head>`);
      else if (firstStyle >= 0 && firstStyle < boot) r.noflash.push(`${p.url}: a stylesheet comes before the theme boot`);
      else if (firstScript !== boot) r.noflash.push(`${p.url}: another script runs before the theme boot`);
      if (p.url === ENTRANCE) continue;
      const sw = d.querySelector('[data-theme-switch]');
      if (!sw) { r.a11y.push(`${p.url}: no mask toggle`); continue; }
      const values = [...sw.querySelectorAll('input[name="theme"]')].map((i) => i.getAttribute('value'));
      if (values.join() !== THEMES.join()) r.a11y.push(`${p.url}: the toggle offers ${values.join(', ')} (want ${THEMES.join(', ')})`);
    }
    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    for (const [scheme, want] of [['light', 'paper'], ['dark', 'night']]) {
      const c = await browser.newContext({ colorScheme: scheme });
      const page = await c.newPage();
      await page.goto(origin + '/home/');
      const got = await page.evaluate(() => document.documentElement.dataset.theme);
      if (got !== want) r.default.push(`a ${scheme} device with no choice gets ${got}, want ${want}`);
      const other = scheme === 'light' ? 'dark' : 'light';
      await page.emulateMedia({ colorScheme: other });
      await page.waitForTimeout(700);
      const live = await page.evaluate(() => document.documentElement.dataset.theme);
      if (live !== (other === 'dark' ? 'night' : 'paper')) r.default.push(`switching the device to ${other} with no choice stored leaves ${live}`);
      await c.close();
    }
    {
      // a v3 visitor who chose Profile (or any old name) gets the device's mask, not a broken page
      const c = await browser.newContext({ colorScheme: 'dark' });
      await c.addInitScript((k) => { try { localStorage.setItem(k, 'profile'); } catch {} }, THEME_KEY);
      const page = await c.newPage();
      await page.goto(origin + '/home/');
      const got = await page.evaluate(() => document.documentElement.dataset.theme);
      if (got !== 'night') r.default.push(`a stored "profile" gives ${got}, want the device's (night)`);
      await c.close();
    }
    {
      const c = await browser.newContext({ colorScheme: 'light' });
      const page = await c.newPage();
      await page.goto(origin + '/home/');
      await page.focus('[data-theme-switch] input[value="paper"]');
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(700);
      const s = await page.evaluate((k) => ({ theme: document.documentElement.dataset.theme, stored: localStorage.getItem(k),
        checked: document.querySelector('[data-theme-switch] input:checked')?.value }), THEME_KEY);
      if (s.theme !== 'night' || s.stored !== 'night' || s.checked !== 'night') r.keyboard.push(`ArrowRight from Paper gave ${JSON.stringify(s)}`);
      await page.goto(origin + '/about/');
      const kept = await page.evaluate(() => document.documentElement.dataset.theme);
      if (kept !== 'night') r.keyboard.push(`the choice did not survive a page change (got ${kept})`);
      await page.emulateMedia({ colorScheme: 'light' });
      await page.waitForTimeout(300);
      if (await page.evaluate(() => document.documentElement.dataset.theme) !== 'night') r.keyboard.push('a stored choice gave way to the device');
      const cookies = await c.cookies();
      if (cookies.length) r.keyboard.push(`cookies were set: ${cookies.map((x) => x.name).join(', ')}`);
      await c.close();
    }
    for (const t of THEMES) {
      const c = await browser.newContext();
      await c.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch {} }, [THEME_KEY, t]);
      const page = await c.newPage();
      await page.goto(origin + '/recruiters/');
      const group = page.getByRole('group', { name: 'Mask' });
      if (!(await group.isVisible())) r.a11y.push(`[${t}] no visible group named "Mask"`);
      if (await page.getByRole('radio').count() !== THEMES.length) r.a11y.push(`[${t}] ${await page.getByRole('radio').count()} radios (want ${THEMES.length})`);
      if (await page.getByRole('radio', { name: 'Profile' }).count()) r.a11y.push(`[${t}] Profile is offered`);
      for (const [v, n] of Object.entries(NAMES)) {
        const radio = page.getByRole('radio', { name: n, exact: true });
        if ((await radio.count()) !== 1) { r.a11y.push(`[${t}] no radio named ${n}`); continue; }
        if ((await radio.isChecked()) !== (v === t)) r.a11y.push(`[${t}] ${n} is ${await radio.isChecked() ? '' : 'not '}checked`);
      }
      await c.close();
    }
    return Object.entries(r).map(([k, problems]) => ({ id: `switcher.${k}`, ok: problems.length === 0, problems }));
  },
};
