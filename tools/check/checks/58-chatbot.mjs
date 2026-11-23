// U12, the gag chatbot: nothing of the widget loads before the launcher is pressed; when used, it makes no network
// request and stores nothing; it greets, shows a typing indicator, and answers only with the invented vocabulary;
// replies land in a role=log region; Escape closes it and returns focus; the panel passes axe in every theme; and the
// brand the style comes from is named nowhere on the site.
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { walk, read, isText, ROOT, DIST } from '../lib/dist.mjs';
import { THEMES, AXE_TAGS } from '../config.mjs';
import { themedContext } from './50-browser.mjs';
import { WORDS } from '../../../src/scripts/gibberish.js';

const SYLLABLES = /^(ba|bo|pa|po|la|lu|ti|ka|koo|ma|mo|na|bi|do|tu|pi|loo|ga)+$/;

export default {
  id: 'chatbot',
  title: 'The assistant: loads on open, no network, nothing stored, gibberish only, keyboard and screen reader',
  async run(ctx) {
    const r = { brand: [], lazy: [], use: [], a11y: [] };
    for (const f of [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'public')), ...walk(DIST)]) {
      if (isText(f) && /minion/i.test(read(f))) r.brand.push(`${path.relative(ROOT, f)} names the brand`);
    }
    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    for (const theme of THEMES) {
      const context = await themedContext(browser, theme);
      const page = await context.newPage();
      const requests = [];
      page.on('request', (q) => requests.push(q.url()));
      await page.goto(origin + '/home/', { waitUntil: 'load' });
      await page.waitForTimeout(200);
      if (requests.some((u) => /chat-widget|chat\.css/.test(u))) r.lazy.push(`[${theme}] the widget loaded before it was opened`);
      await page.focus('[data-chat]');
      await page.keyboard.press('Enter');
      await page.waitForSelector('.chat-panel:not([hidden])', { timeout: 5000 });
      await page.waitForTimeout(300);
      const before = requests.length;
      const opened = await page.evaluate(() => ({
        focus: document.activeElement?.classList.contains('chat-input'),
        title: document.getElementById('chat-title')?.textContent,
        log: document.querySelector('.chat-log')?.getAttribute('role'),
        welcome: document.querySelectorAll('.chat-log .chat-bot').length,
        expanded: document.querySelector('[data-chat]')?.getAttribute('aria-expanded'),
      }));
      if (!opened.focus) r.a11y.push(`[${theme}] focus did not move to the message field`);
      if (opened.title !== 'Assistant · Online') r.use.push(`[${theme}] header reads "${opened.title}"`);
      if (opened.log !== 'log') r.a11y.push(`[${theme}] the transcript is not role=log`);
      if (opened.welcome !== 1) r.use.push(`[${theme}] no welcome line`);
      if (opened.expanded !== 'true') r.a11y.push(`[${theme}] the launcher does not say it is expanded`);
      const secret = 'a question nobody else will read';
      await page.keyboard.type(secret);
      await page.keyboard.press('Enter');
      const typing = await page.waitForSelector('.chat-typing', { timeout: 1000 }).then(() => true, () => false);
      if (!typing) r.use.push(`[${theme}] no typing indicator`);
      await page.waitForFunction(() => document.querySelectorAll('.chat-log .chat-bot').length === 2 && !document.querySelector('.chat-typing'), null, { timeout: 5000 });
      const after = await page.evaluate((s) => ({
        reply: [...document.querySelectorAll('.chat-log .chat-bot')].pop().textContent.replace(/^Assistant: /, ''),
        stored: JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }),
        csp: window.__csp || [],
      }), secret);
      if (requests.length !== before) r.use.push(`[${theme}] using it made ${requests.length - before} network request(s): ${requests.slice(before).join(', ')}`);
      if (after.stored.includes(secret)) r.use.push(`[${theme}] what was typed was stored`);
      after.csp.forEach((v) => r.use.push(`[${theme}] CSP: ${v}`));
      const words = after.reply.toLowerCase().match(/[a-z]+/g) || [];
      const strange = words.filter((w) => !WORDS.includes(w) && !SYLLABLES.test(w));
      if (!words.length || strange.length) r.use.push(`[${theme}] reply "${after.reply}" has words outside the vocabulary: ${strange.join(', ')}`);
      const axe = await new AxeBuilder({ page }).include('.chat-panel').include('[data-chat]').withTags(AXE_TAGS).analyze();
      for (const v of axe.violations) r.a11y.push(`[${theme}] axe ${v.id} (${v.impact}): ${v.help}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
      await page.keyboard.press('Escape');
      const closed = await page.evaluate(() => ({ hidden: document.querySelector('.chat-panel')?.hidden, focus: document.activeElement?.hasAttribute('data-chat') }));
      if (!closed.hidden || !closed.focus) r.a11y.push(`[${theme}] Escape left ${JSON.stringify(closed)}`);
      await context.close();
    }
    return Object.entries(r).map(([k, problems]) => ({ id: `chatbot.${k}`, ok: problems.length === 0, problems }));
  },
};
