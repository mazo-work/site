// axe-core, WCAG 2.2 AA tags, on every page in every theme. CSP is bypassed for this pass only (axe is injected),
// which changes no colour, focus or semantics. On the entrance, elements marked [data-art] (the 3D stage) are
// excluded: the entrance is excepted as art (§3), and its skip-intro link is still checked.
import AxeBuilder from '@axe-core/playwright';
import { THEMES, AXE_TAGS, ENTRANCE } from '../config.mjs';
import { themedContext, routeExternal } from './50-browser.mjs';

export default {
  id: 'axe',
  title: 'axe-core WCAG 2.2 AA per page × theme',
  async run(ctx) {
    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    const problems = [];
    await Promise.all(THEMES.map(async (theme) => {
      const context = await themedContext(browser, theme, { bypassCSP: true });
      await routeExternal(context, origin, []);
      for (const p of ctx.pages) {
        const page = await context.newPage();
        await page.goto(origin + p.url, { waitUntil: 'load' });
        await page.waitForTimeout(p.url === ENTRANCE ? 1000 : 100);
        let builder = new AxeBuilder({ page }).withTags(AXE_TAGS);
        if (p.url === ENTRANCE) builder = builder.exclude('[data-art]');
        const res = await builder.analyze();
        for (const v of res.violations) {
          const nodes = v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ');
          problems.push(`${p.url} [${theme}] ${v.id} (${v.impact}): ${v.help}: ${v.nodes.length} node(s): ${nodes}`);
        }
        await page.close();
      }
      await context.close();
    }));
    return [{ id: 'axe', ok: problems.length === 0, problems }];
  },
};
