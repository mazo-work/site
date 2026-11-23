// U8, the theme switcher: no flash (the inline boot script runs before any stylesheet on every page); the device
// default (light: Editorial, dark: Terminal), followed live while no choice is stored; the choice made by keyboard
// (arrow keys in the radio group), stored in localStorage, kept across pages, and no cookie set; a named group of
// three named radios, the checked one matching the theme, in all three themes.
import { read, dom } from '../lib/dist.mjs';
import { THEMES, THEME_KEY, ENTRANCE } from '../config.mjs';

export default {
  id: 'switcher',
  title: 'Theme switcher: no flash, device default, keyboard, persistence, no cookie, names',
  async run(ctx) {
    const r = { noflash: [], default: [], keyboard: [], a11y: [] };
    for (const p of ctx.pages) {
      const head = dom(read(p.file)).querySelector('head');
      const els = [...head.children];
      const boot = els.findIndex((e) => e.tagName === 'SCRIPT' && !e.getAttribute('src') && /data-theme/.test(e.textContent));
      const firstStyle = els.findIndex((e) => e.tagName === 'LINK' && /stylesheet/.test(e.getAttribute('rel') || ''));
      const firstScript = els.findIndex((e) => e.tagName === 'SCRIPT');
      if (boot < 0) r.noflash.push(`${p.url}: no theme boot script in <head>`);
      else if (firstStyle >= 0 && firstStyle < boot) r.noflash.push(`${p.url}: a stylesheet comes before the theme boot`);
      else if (firstScript !== boot) r.noflash.push(`${p.url}: another script runs before the theme boot`);
      if (p.url !== ENTRANCE && p.url !== '/404.html' && !dom(read(p.file)).querySelector('[data-theme-switch]')) r.a11y.push(`${p.url}: no theme switcher`);
    }
    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    for (const [scheme, want] of [['light', 'editorial'], ['dark', 'terminal']]) {
      const c = await browser.newContext({ colorScheme: scheme });
      const page = await c.newPage();
      await page.goto(origin + '/home/');
      const got = await page.evaluate(() => document.documentElement.dataset.theme);
      if (got !== want) r.default.push(`a ${scheme} device with no choice gets ${got}, want ${want}`);
      const other = scheme === 'light' ? 'dark' : 'light';
      await page.emulateMedia({ colorScheme: other });
      await page.waitForTimeout(700);
      const live = await page.evaluate(() => document.documentElement.dataset.theme);
      if (live !== (other === 'dark' ? 'terminal' : 'editorial')) r.default.push(`switching the device to ${other} with no choice stored leaves ${live}`);
      await c.close();
    }
    {
      const c = await browser.newContext({ colorScheme: 'light' });
      const page = await c.newPage();
      await page.goto(origin + '/home/');
      await page.focus('[data-theme-switch] input[value="editorial"]');
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(700);
      const s = await page.evaluate((k) => ({ theme: document.documentElement.dataset.theme, stored: localStorage.getItem(k),
        checked: document.querySelector('[data-theme-switch] input:checked')?.value }), THEME_KEY);
      if (s.theme !== 'terminal' || s.stored !== 'terminal' || s.checked !== 'terminal') r.keyboard.push(`ArrowRight from Editorial gave ${JSON.stringify(s)}`);
      await page.goto(origin + '/about/');
      const kept = await page.evaluate(() => document.documentElement.dataset.theme);
      if (kept !== 'terminal') r.keyboard.push(`the choice did not survive a page change (got ${kept})`);
      await page.emulateMedia({ colorScheme: 'light' });
      await page.waitForTimeout(300);
      if (await page.evaluate(() => document.documentElement.dataset.theme) !== 'terminal') r.keyboard.push('a stored choice gave way to the device');
      const cookies = await c.cookies();
      if (cookies.length) r.keyboard.push(`cookies were set: ${cookies.map((x) => x.name).join(', ')}`);
      await c.close();
    }
    for (const t of THEMES) {
      const c = await browser.newContext();
      await c.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch {} }, [THEME_KEY, t]);
      const page = await c.newPage();
      await page.goto(origin + '/recruiters/');
      const group = page.getByRole('group', { name: 'Theme' });
      if (!(await group.isVisible())) r.a11y.push(`[${t}] no visible group named "Theme"`);
      for (const n of ['Editorial', 'Terminal', 'Profile']) {
        const radio = page.getByRole('radio', { name: n });
        if ((await radio.count()) !== 1) { r.a11y.push(`[${t}] no radio named ${n}`); continue; }
        if ((await radio.isChecked()) !== (n.toLowerCase() === t)) r.a11y.push(`[${t}] ${n} is ${await radio.isChecked() ? '' : 'not '}checked`);
      }
      await c.close();
    }
    return Object.entries(r).map(([k, problems]) => ({ id: `switcher.${k}`, ok: problems.length === 0, problems }));
  },
};
