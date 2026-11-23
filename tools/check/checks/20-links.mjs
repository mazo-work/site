// Internal links: every same-origin href/src in every page resolves to a built file, and every #fragment to an id.
import fs from 'node:fs';
import { read, dom, DIST } from '../lib/dist.mjs';
import { resolvePath } from '../lib/server.mjs';
import { SITE } from '../../../src/data/origin.mjs';

const ATTRS = [['a', 'href'], ['link', 'href'], ['script', 'src'], ['img', 'src'], ['source', 'src'],
  ['img', 'srcset'], ['source', 'srcset'], ['video', 'src'], ['audio', 'src'], ['iframe', 'src'], ['use', 'href'],
  ['form', 'action'], ['object', 'data'], ['embed', 'src']];

export function targetsOf(document) {
  const out = [];
  for (const [tag, attr] of ATTRS) for (const el of document.querySelectorAll(`${tag}[${attr}]`)) {
    const v = el.getAttribute(attr);
    if (attr === 'srcset') v.split(',').forEach((c) => { const u = c.trim().split(/\s+/)[0]; if (u) out.push({ tag, attr, url: u }); });
    else out.push({ tag, attr, url: v });
  }
  return out;
}

const idCache = new Map();
function idsOf(file) {
  if (!idCache.has(file)) {
    const d = dom(read(file));
    idCache.set(file, new Set([...d.querySelectorAll('[id]')].map((e) => e.id).concat([...d.querySelectorAll('a[name]')].map((e) => e.getAttribute('name')))));
  }
  return idCache.get(file);
}

export default {
  id: 'links',
  title: 'Internal links and fragments resolve',
  async run({ pages }) {
    const problems = [], external = new Set();
    for (const p of pages) {
      const d = dom(read(p.file));
      for (const t of targetsOf(d)) {
        if (/^(mailto|tel|sms):/i.test(t.url)) { problems.push(`${p.url}: <${t.tag} ${t.attr}="${t.url}"> (no email or phone on the site, §3)`); continue; }
        if (/^(data|javascript|blob):/i.test(t.url)) {
          if (/^javascript:/i.test(t.url)) problems.push(`${p.url}: javascript: URL in <${t.tag}>`);
          continue;
        }
        let u;
        try { u = new URL(t.url, 'https://internal.test' + p.url); } catch { problems.push(`${p.url}: unparsable ${t.attr}="${t.url}"`); continue; }
        const internal = u.origin === 'https://internal.test' || u.origin === SITE;
        if (!internal) { external.add(u.origin); continue; }
        const { file, redirect } = resolvePath(DIST, u.pathname);
        if (redirect) { problems.push(`${p.url}: ${t.url} lacks its trailing slash (a redirect to ${redirect})`); continue; }
        if (!file) { problems.push(`${p.url}: ${t.url} -> nothing at ${u.pathname}`); continue; }
        if (u.hash && u.hash.length > 1 && file.endsWith('.html')) {
          const id = decodeURIComponent(u.hash.slice(1));
          if (!idsOf(file).has(id)) problems.push(`${p.url}: ${t.url} -> no #${id} in ${u.pathname}`);
        }
      }
    }
    const results = [{ id: 'links', ok: problems.length === 0, problems }];
    results.notes = external.size ? [`external origins linked: ${[...external].join(', ')}`] : [];
    return results;
  },
};
