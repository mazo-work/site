// Layout (v4; U5): on every page in both masks, on a phone (390 px) and a desktop (1440 px), nothing scrolls sideways
// (the document is no wider than the window) and no display headline's words run past its own box (a long word in a
// wide face would spill out of its column).
import { THEMES, ENTRANCE } from '../config.mjs';
import { themedContext } from './50-browser.mjs';

export default {
  id: 'layout',
  title: 'Layout: no sideways scroll, no headline wider than its column, both masks, phone and desktop',
  async run(ctx) {
    const r = { fit: [] };
    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    await Promise.all(THEMES.map(async (t) => {
      for (const [size, viewport] of [['phone', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
        const c = await themedContext(browser, t, { viewport });
        for (const p of ctx.pages) {
          if (p.url === ENTRANCE) continue;
          const page = await c.newPage();
          await page.goto(origin + p.url, { waitUntil: 'load' });
          await page.evaluate(() => document.fonts.ready.then(() => true));
          const s = await page.evaluate(() => ({
            doc: document.documentElement.scrollWidth, win: innerWidth,
            // the words' own boxes (a Range), so Paper's off-register copy, a pseudo-element a few px to the right, is not counted
            over: [...document.querySelectorAll('.display')].map((h) => {
              const box = h.getBoundingClientRect(), range = document.createRange();
              range.selectNodeContents(h);
              const right = Math.max(...[...range.getClientRects()].map((q) => q.right));
              return right > box.right + 1 ? `${h.textContent.trim()} (its words end at ${Math.round(right)}, its box at ${Math.round(box.right)})` : null;
            }).filter(Boolean),
          }));
          if (s.doc > s.win) r.fit.push(`${p.url} [${t}, ${size}]: the page is ${s.doc} px wide in a ${s.win} px window`);
          s.over.forEach((o) => r.fit.push(`${p.url} [${t}, ${size}]: the headline "${o}" spills out of its box`));
          await page.close();
        }
        await c.close();
      }
    }));
    return [{ id: 'layout.fit', ok: r.fit.length === 0, problems: r.fit }];
  },
};
