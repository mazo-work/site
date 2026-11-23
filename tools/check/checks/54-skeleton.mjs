// v4's skeleton (BRIEF.md §3; U1): one structure on every page in every mask. `markup`: every page but the entrance
// has one header (the utility row: Replay the intro, Pause motion, the mask toggle; the masthead: the mark, linking
// Home, and Jon's name, large on Home and small elsewhere; the menu band with exactly the five rooms), a footer with
// "Jonathan Mazo · [JON: region]" and the Colophon, and the Ask button. `profile`: Profile is parked, so no built
// stylesheet carries its rules and no page offers it. `still`: the masks differ in type, colour, texture and motion
// only, so the utility row, the toggle, the mark, the menu band, the page and the Ask button sit in the same place in
// both masks (desktop and phone). `pause`: Pause motion pauses every running CSS animation, says so (aria-pressed),
// is remembered on the next page (localStorage, no cookie), and lets go when pressed again.
import { read, dom, walk, DIST } from '../lib/dist.mjs';
import { THEMES, THEME_KEY, ENTRANCE } from '../config.mjs';
import { themedContext } from './50-browser.mjs';

const ROOMS = [['About', '/about/'], ['Projects', '/projects/'], ['Lab notes', '/notes/'], ['Now', '/now/'], ['For recruiters', '/recruiters/']];
const text = (e) => (e?.textContent || '').replace(/\s+/g, ' ').trim();

export default {
  id: 'skeleton',
  title: 'The skeleton: the same structure on every page, still across masks; Profile parked; Pause motion',
  async run(ctx) {
    const r = { markup: [], profile: [], still: [], pause: [] };
    for (const p of ctx.pages) {
      if (p.url === ENTRANCE) continue;
      const d = dom(read(p.file));
      const say = (m) => r.markup.push(`${p.url}: ${m}`);
      const headers = d.querySelectorAll('header.site-header');
      if (headers.length !== 1) { say(`${headers.length} site headers (want 1)`); continue; }
      const h = headers[0];
      if (h.getAttribute('data-size') !== (p.url === '/home/' ? 'large' : 'small')) say(`masthead size ${h.getAttribute('data-size')}`);
      const parts = [...h.children].filter((e) => e.tagName !== 'SCRIPT' && !/^entry-/.test(e.getAttribute('class') || '')).map((e) => e.getAttribute('class'));
      if (parts.join() !== 'utility,masthead,menu') say(`the header holds ${parts.join(', ')} (want utility, masthead, menu)`);
      const replay = h.querySelector('.utility a.replay'), pause = h.querySelector('.utility button.pause'), masks = h.querySelector('.utility [data-theme-switch]');
      if (replay?.getAttribute('href') !== '/' || text(replay) !== 'Replay the intro') say('no "Replay the intro" link to the entrance in the utility row');
      if (!pause || text(pause) !== 'Pause motion' || pause.getAttribute('type') !== 'button' || !pause.hasAttribute('aria-pressed')) say('no "Pause motion" toggle button in the utility row');
      if (!masks) say('no mask toggle in the utility row');
      const mark = h.querySelector('.masthead a.masthead-mark');
      if (mark?.getAttribute('href') !== '/home/' || !mark.querySelector('svg.mark .mark-body') || !mark.querySelector('svg.mark .mark-light')) say('the masthead mark is not a link to Home with the mark in it');
      if (text(h.querySelector('.masthead .masthead-name')) !== 'Jonathan Mazo') say('no name under the mark');
      const menu = h.querySelector('nav.menu[aria-label="Main"]');
      const rooms = menu ? [...menu.querySelectorAll('a')].map((a) => [text(a), a.getAttribute('href')]) : [];
      if (JSON.stringify(rooms) !== JSON.stringify(ROOMS)) say(`the menu band holds ${rooms.map((x) => x[0]).join(' · ') || 'nothing'}`);
      const foot = d.querySelectorAll('footer.site-footer');
      if (foot.length !== 1) say(`${foot.length} site footers`);
      else {
        if (!text(foot[0]).startsWith('Jonathan Mazo · [JON: region]')) say(`the footer reads "${text(foot[0]).slice(0, 60)}"`);
        const links = [...foot[0].querySelectorAll('a')].map((a) => [text(a), a.getAttribute('href')]);
        if (JSON.stringify(links) !== JSON.stringify([['Colophon', '/colophon/']])) say(`the footer links ${links.map((x) => x[0]).join(', ')}`);
      }
      const ask = d.querySelectorAll('button.chat-launcher[data-chat]');
      if (ask.length !== 1 || !text(ask[0]).startsWith('Ask')) say('no Ask button');
      const frame = d.querySelector('.frame');
      if (!frame || [...frame.children].map((e) => e.tagName).join() !== 'HEADER,MAIN,FOOTER') say('the frame is not header, main, footer');
      if (/value="profile"|>Profile</.test(read(p.file))) r.profile.push(`${p.url} offers Profile`);
    }
    for (const f of walk(DIST).filter((f) => f.endsWith('.css'))) {
      if (/data-theme=["']?profile|\.mask-profile/.test(read(f))) r.profile.push(`${f.slice(DIST.length)} carries Profile's rules`);
    }

    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    const SEL = { utility: '.utility', toggle: '[data-theme-switch]', mark: '.masthead-mark', menu: '.menu', main: 'main', ask: '[data-chat]' };
    for (const [size, viewport] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
      for (const url of ['/home/', '/about/']) {
        const boxes = {};
        for (const t of THEMES) {
          const c = await themedContext(browser, t, { viewport });
          const page = await c.newPage();
          await page.goto(origin + url, { waitUntil: 'load' });
          await page.evaluate(() => document.fonts.ready.then(() => true));
          boxes[t] = await page.evaluate((sel) => Object.fromEntries(Object.entries(sel).map(([k, s]) => {
            const b = document.querySelector(s)?.getBoundingClientRect();
            return [k, b ? [b.left, b.top, b.width, b.height].map((v) => Math.round(v)) : null];
          })), SEL);
          await c.close();
        }
        const [a, b] = THEMES;
        for (const k of Object.keys(SEL)) {
          const x = boxes[a][k], y = boxes[b][k];
          if (!x || !y) { r.still.push(`${size} ${url}: ${k} missing`); continue; }
          const [dx, dy, dw, dh] = x.map((v, i) => Math.abs(v - y[i]));
          // the toggle's width follows its words (its right edge and its row must not move); the page's height
          // follows its type (where it starts, and how wide it is, must not move)
          const moved = k === 'toggle' ? Math.abs(x[0] + x[2] - y[0] - y[2]) > 1 || dy > 1 || dh > 1
            : k === 'main' ? Math.max(dx, dy, dw) > 1 : Math.max(dx, dy, dw, dh) > 1;
          if (moved) r.still.push(`${size} ${url}: ${k} is at ${x.join(',')} in ${a} and ${y.join(',')} in ${b}`);
        }
      }
    }
    for (const t of THEMES) {
      const c = await themedContext(browser, t);
      const page = await c.newPage();
      await page.goto(origin + '/about/', { waitUntil: 'load' });
      const state = () => page.evaluate(() => {
        const anims = document.getAnimations().filter((a) => a instanceof CSSAnimation);
        return { motion: document.documentElement.dataset.motion || null, pressed: document.querySelector('[data-pause]')?.getAttribute('aria-pressed'),
          stored: localStorage.getItem('mazo-motion'), anims: anims.length, running: anims.filter((a) => a.playState === 'running').length };
      });
      const s0 = await state();
      if (!s0.anims || s0.running !== s0.anims || s0.pressed !== 'false') r.pause.push(`[${t}] before: ${JSON.stringify(s0)}`);
      await page.click('[data-pause]');
      const s1 = await state();
      if (s1.motion !== 'paused' || s1.pressed !== 'true' || s1.stored !== 'paused' || s1.running) r.pause.push(`[${t}] pressed: ${JSON.stringify(s1)}`);
      await page.goto(origin + '/now/', { waitUntil: 'load' });
      const s2 = await state();
      if (s2.motion !== 'paused' || s2.pressed !== 'true' || s2.running) r.pause.push(`[${t}] next page: ${JSON.stringify(s2)}`);
      await page.click('[data-pause]');
      const s3 = await state();
      if (s3.motion || s3.pressed !== 'false' || s3.stored || s3.running !== s3.anims) r.pause.push(`[${t}] pressed again: ${JSON.stringify(s3)}`);
      if ((await c.cookies()).length) r.pause.push(`[${t}] a cookie was set`);
      await c.close();
    }
    return Object.entries(r).map(([k, problems]) => ({ id: `skeleton.${k}`, ok: problems.length === 0, problems }));
  },
};
