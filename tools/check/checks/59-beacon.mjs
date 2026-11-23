// U13, the analytics beacon: every page carries exactly one cross-origin script, Cloudflare's beacon, deferred, with
// its token as the [CF_BEACON_TOKEN] placeholder (or a build-time token); nothing else cross-origin is loaded; and in
// a browser with the real headers, a stand-in beacon (the real one cannot be fetched here) may report to
// cloudflareinsights.com, while the same script reaching any other host is refused by the CSP.
import { read, dom } from '../lib/dist.mjs';
import { themedContext } from './50-browser.mjs';

const SRC = 'https://static.cloudflareinsights.com/beacon.min.js';
const LOADS = ['script[src]', 'link[rel="stylesheet"][href]', 'link[rel="modulepreload"][href]', 'link[rel="preload"][href]', 'img[src]', 'iframe[src]', 'video[src]', 'audio[src]', 'source[src]'];

export default {
  id: 'beacon',
  title: 'Analytics beacon: one cross-origin script, the placeholder token, two hosts only',
  async run(ctx) {
    const r = { markup: [], hosts: [] };
    for (const p of ctx.pages) {
      const d = dom(read(p.file));
      const beacons = [...d.querySelectorAll('script[src]')].filter((s) => s.getAttribute('src') === SRC);
      if (beacons.length !== 1) { r.markup.push(`${p.url}: ${beacons.length} beacon scripts`); continue; }
      const b = beacons[0];
      if (!b.hasAttribute('defer')) r.markup.push(`${p.url}: the beacon is not deferred`);
      let cfg = null;
      try { cfg = JSON.parse(b.getAttribute('data-cf-beacon')); } catch { r.markup.push(`${p.url}: data-cf-beacon is not JSON`); }
      if (cfg && !(cfg.token === '[CF_BEACON_TOKEN]' || /^[0-9a-f]{32}$/.test(cfg.token))) r.markup.push(`${p.url}: token "${cfg.token}"`);
      for (const sel of LOADS) for (const e of d.querySelectorAll(sel)) {
        const u = e.getAttribute('src') || e.getAttribute('href');
        if (/^(https?:)?\/\//.test(u) && u !== SRC) r.markup.push(`${p.url}: loads ${u}`);
      }
    }
    const { origin } = await ctx.server();
    const browser = await ctx.browser();
    const context = await themedContext(browser, 'paper');
    const seen = [];
    await context.route('**/*', (route) => {
      const q = route.request(), u = new URL(q.url());
      if (u.origin === origin) return route.continue();
      seen.push(`${u.hostname} ${q.resourceType()}`);
      if (u.hostname === 'static.cloudflareinsights.com') return route.fulfill({ status: 200, contentType: 'text/javascript',
        body: "navigator.sendBeacon('https://cloudflareinsights.com/cdn-cgi/rum', '{}'); try { fetch('https://example.com/elsewhere'); } catch (e) {}" });
      return route.fulfill({ status: 204, body: '' });
    });
    const page = await context.newPage();
    await page.goto(origin + '/home/', { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const csp = await page.evaluate(() => window.__csp || []);
    if (!seen.some((s) => s.startsWith('static.cloudflareinsights.com script'))) r.hosts.push('the beacon script was not requested');
    if (!seen.some((s) => s.startsWith('cloudflareinsights.com '))) r.hosts.push('the report to cloudflareinsights.com did not go out (connect-src?)');
    if (seen.some((s) => s.startsWith('example.com'))) r.hosts.push('a request to another host got through');
    if (!csp.some((v) => /connect-src blocked https:\/\/example\.com/.test(v))) r.hosts.push(`the CSP did not refuse another host (violations: ${csp.join(' | ') || 'none'})`);
    if (csp.some((v) => /cloudflareinsights/.test(v))) r.hosts.push(`the CSP refused the beacon: ${csp.join(' | ')}`);
    await context.close();
    return Object.entries(r).map(([k, problems]) => ({ id: `beacon.${k}`, ok: problems.length === 0, problems }));
  },
};
