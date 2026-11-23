// The headless-browser pass (§6 U1): every page × theme, served with dist/_headers applied, recording CSP
// violations (Trusted Types included), every network request (only same-origin, plus the beacon's two hosts),
// script errors, and whether the requested theme applied. Then every page once with JavaScript off.
import { THEMES, THEME_KEY, BEACON_HOSTS, ENTRANCE } from '../config.mjs';

export async function themedContext(browser, theme, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block',
    colorScheme: theme === 'terminal' ? 'dark' : 'light', ...options });
  await context.addInitScript(([key, value]) => {
    try { localStorage.setItem(key, value); } catch {}
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(
      `${e.effectiveDirective || e.violatedDirective} blocked ${e.blockedURI || '(inline)'}${e.sample ? ': ' + e.sample.slice(0, 60) : ''}`), true);
  }, [THEME_KEY, theme]);
  return context;
}

export async function routeExternal(context, origin, log) {
  await context.route('**/*', (route) => {
    const req = route.request(), u = new URL(req.url());
    if (u.origin === origin || !/^https?:$/.test(u.protocol)) return route.continue();
    log.push({ host: u.hostname, type: req.resourceType(), url: u.origin + u.pathname });
    if (u.hostname in BEACON_HOSTS) return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    return route.abort('blockedbyclient');
  });
}

export default {
  id: 'browser',
  title: 'Headless pass per page × theme: CSP, network, errors, theme; and without JS',
  async run(ctx) {
    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    const r = { csp: [], network: [], errors: [], themes: [], nojs: [] };
    await Promise.all(THEMES.map(async (theme) => {
      const context = await themedContext(browser, theme);
      const external = [];
      await routeExternal(context, origin, external);
      for (const p of ctx.pages) {
        const page = await context.newPage();
        const errs = [];
        page.on('pageerror', (e) => errs.push(`uncaught: ${e.message}`));
        page.on('console', (m) => { if (m.type() === 'error' && !/Content Security Policy|Trusted Type/i.test(m.text())) errs.push(`console: ${m.text().slice(0, 160)}`); });
        page.on('requestfailed', (q) => { if (new URL(q.url()).origin === origin) errs.push(`failed request ${q.url()}`); });
        const seen = external.length;
        const resp = await page.goto(origin + p.url, { waitUntil: 'load' });
        await page.waitForTimeout(p.url === ENTRANCE ? 1500 : 200);
        if (p.url !== '/404.html' && resp.status() !== 200) errs.push(`HTTP ${resp.status()}`);
        const st = await page.evaluate(() => ({ csp: window.__csp || [], theme: document.documentElement.dataset.theme || null }));
        st.csp.forEach((v) => r.csp.push(`${p.url} [${theme}] ${v}`));
        errs.forEach((e) => r.errors.push(`${p.url} [${theme}] ${e}`));
        for (const x of external.slice(seen)) {
          const ok = (BEACON_HOSTS[x.host] || []).includes(x.type);
          if (!ok) r.network.push(`${p.url} [${theme}] requested ${x.url} (${x.type})`);
        }
        if (st.theme !== theme) r.themes.push(`${p.url}: asked for ${theme}, got ${st.theme ?? 'no data-theme'}`);
        await page.close();
      }
      await context.close();
    }));
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    for (const p of ctx.pages) {
      const page = await nojs.newPage();
      await page.goto(origin + p.url, { waitUntil: 'load' });
      const s = await page.evaluate(() => {
        const main = document.querySelector('main');
        const box = main?.getBoundingClientRect();
        const home = [...document.querySelectorAll('a[href]')].find((a) => new URL(a.href).pathname === '/home/' && a.getClientRects().length);
        return { main: !!main, visible: !!box && box.height > 0 && getComputedStyle(main).visibility !== 'hidden',
          text: (main?.innerText || '').trim().length, homeLink: !!home };
      });
      if (!s.main || !s.visible) r.nojs.push(`${p.url}: <main> is not visible without JS`);
      else if (p.url === ENTRANCE ? !s.homeLink : s.text < 80) r.nojs.push(p.url === ENTRANCE ? `${p.url}: no visible way in (a link to /home/) without JS` : `${p.url}: ${s.text} characters visible without JS`);
      await page.close();
    }
    await nojs.close();
    return Object.entries(r).map(([k, problems]) => ({ id: `browser.${k}`, ok: problems.length === 0, problems }));
  },
};
