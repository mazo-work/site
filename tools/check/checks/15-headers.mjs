// U2: public/_headers says exactly what BRIEF.md §3 asks, reaches every response, and matches the pages:
// each inline script's sha256 is in script-src (and no stale hash is), and no page relies on inline style or
// inline event handlers. Also /.well-known/security.txt (RFC 9116).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { read, dom, ROOT, DIST } from '../lib/dist.mjs';
import { parseHeaders, headersFor, parseCsp } from '../lib/headers.mjs';

const BEACON_SCRIPT = 'https://static.cloudflareinsights.com', BEACON_CONNECT = 'https://cloudflareinsights.com';
// directive -> [required sources, sources also allowed]
const CSP = {
  'default-src': [["'none'"], []],
  'script-src': [["'self'"], [BEACON_SCRIPT]],          // plus one sha256 per inline script, checked below
  'style-src': [["'self'"], []],
  'img-src': [["'self'", 'data:'], []],
  'font-src': [["'self'"], []],
  'connect-src': [["'self'"], [BEACON_CONNECT]],
  'media-src': [["'self'"], []],
  'frame-ancestors': [["'none'"], []],
  'base-uri': [["'none'"], []],
  'form-action': [["'none'"], []],
  'object-src': [["'none'"], []],
  'upgrade-insecure-requests': [[], []],
  'require-trusted-types-for': [["'script'"], []],
};
const EXACT = {
  'strict-transport-security': 'max-age=63072000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin',
  'x-frame-options': 'DENY',
};
const MUST_DENY = ['camera', 'microphone', 'geolocation', 'payment', 'usb', 'serial', 'hid', 'bluetooth', 'midi',
  'display-capture', 'browsing-topics', 'clipboard-read', 'local-fonts', 'publickey-credentials-get', 'idle-detection', 'xr-spatial-tracking'];
const EXECUTABLE = (s) => { const t = (s.getAttribute('type') || '').trim().toLowerCase(); return !t || t === 'module' || t === 'text/javascript' || t === 'importmap'; };
const sha = (text) => "'sha256-" + crypto.createHash('sha256').update(text, 'utf8').digest('base64') + "'";

export default {
  id: 'headers',
  title: '_headers asserts §3; inline scripts hashed; security.txt',
  async run({ pages }) {
    const r = { csp: [], other: [], inline: [], securitytxt: [] };
    const src = path.join(ROOT, 'public', '_headers'), built = path.join(DIST, '_headers');
    if (!fs.existsSync(src)) return [{ id: 'headers', ok: false, problems: ['no public/_headers'] }];
    if (!fs.existsSync(built) || read(built) !== read(src)) r.other.push('dist/_headers is missing or differs from public/_headers');
    const rules = parseHeaders(read(src));
    const samples = ['/', '/home/', '/about/', '/404.html', '/no-such-page/', '/_astro/x.js', '/about.md', '/.well-known/security.txt'];
    let cspText = null;
    for (const s of samples) {
      const h = headersFor(rules, s);
      for (const [k, v] of Object.entries(EXACT)) if (h.get(k)?.value !== v) r.other.push(`${s}: ${k} is "${h.get(k)?.value ?? 'missing'}", want "${v}"`);
      if (/preload/i.test(h.get('strict-transport-security')?.value || '')) r.other.push(`${s}: HSTS must not preload`);
      const pp = h.get('permissions-policy')?.value;
      if (!pp) r.other.push(`${s}: no Permissions-Policy`);
      else {
        const feats = new Map(pp.split(',').map((x) => x.trim().split('=')).map(([k, v]) => [k, v]));
        for (const f of MUST_DENY) if (feats.get(f) !== '()') r.other.push(`${s}: Permissions-Policy does not deny ${f}`);
        for (const [f, v] of feats) if (v !== '()') r.other.push(`${s}: Permissions-Policy allows ${f}=${v} (deny everything; leave a used feature out instead)`);
      }
      const c = h.get('content-security-policy')?.value;
      if (!c) { r.csp.push(`${s}: no Content-Security-Policy`); continue; }
      if (cspText && c !== cspText) r.csp.push(`${s}: a different CSP than /`);
      cspText ??= c;
    }
    const hashes = new Set();
    if (cspText) {
      const csp = parseCsp(cspText);
      for (const [d, [need, may]] of Object.entries(CSP)) {
        const got = csp.get(d);
        if (!got) { r.csp.push(`missing ${d}`); continue; }
        for (const x of need) if (!got.includes(x)) r.csp.push(`${d} lacks ${x}`);
        for (const x of got) {
          if (need.includes(x) || may.includes(x)) continue;
          if (d === 'script-src' && /^'sha256-[A-Za-z0-9+/]+=*'$/.test(x)) { hashes.add(x); continue; }
          r.csp.push(`${d} has ${x}, which §3 does not allow`);
        }
      }
      for (const d of csp.keys()) {
        if (d in CSP) continue;
        if (d === 'trusted-types') { if (csp.get(d).some((x) => /unsafe|allow-duplicates|\*/.test(x))) r.csp.push(`trusted-types ${csp.get(d).join(' ')} is too loose`); continue; }
        r.csp.push(`directive ${d} is not in §3`);
      }
      const sBeacon = csp.get('script-src')?.includes(BEACON_SCRIPT), cBeacon = csp.get('connect-src')?.includes(BEACON_CONNECT);
      if (sBeacon !== cBeacon) r.csp.push('the beacon exception is half there: it adds one host to script-src and one to connect-src, together');
    }
    const used = new Set();
    for (const p of pages) {
      const d = dom(read(p.file));
      for (const s of d.querySelectorAll('script:not([src])')) {
        if (!EXECUTABLE(s)) continue;
        const h = sha(s.textContent);
        used.add(h);
        if (!hashes.has(h)) r.inline.push(`${p.url}: an inline script whose hash ${h} is not in script-src`);
      }
      if (d.querySelector('style')) r.inline.push(`${p.url}: a <style> element (style-src is 'self' only)`);
      for (const e of d.querySelectorAll('[style]')) r.inline.push(`${p.url}: a style attribute on <${e.tagName.toLowerCase()}>`);
      for (const e of d.querySelectorAll('*')) for (const a of e.getAttributeNames()) if (/^on/i.test(a)) r.inline.push(`${p.url}: an inline ${a} handler`);
    }
    for (const h of hashes) if (!used.has(h)) r.inline.push(`script-src lists ${h}, which no page uses (stale)`);
    const st = path.join(DIST, '.well-known', 'security.txt');
    if (!fs.existsSync(st)) r.securitytxt.push('no /.well-known/security.txt');
    else {
      const t = read(st);
      if (!/^Contact: \S+/m.test(t)) r.securitytxt.push('security.txt has no Contact');
      const e = t.match(/^Expires: (\S+)$/m), when = e && new Date(e[1]);
      if (!when || isNaN(when)) r.securitytxt.push('security.txt has no valid Expires');
      else if (when < new Date()) r.securitytxt.push(`security.txt expired on ${e[1]}`);
      else if (when - new Date() > 366 * 864e5) r.securitytxt.push('security.txt Expires is more than a year ahead (RFC 9116)');
    }
    return Object.entries(r).map(([k, problems]) => ({ id: `headers.${k}`, ok: problems.length === 0, problems }));
  },
};
