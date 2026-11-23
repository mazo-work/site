#!/usr/bin/env node
// After a deploy: fetch the live site and compare every response header with public/_headers (the same parser the
// checks use), on pages, a 404, a twin, an asset and security.txt; report X-Robots-Tag; check the well-known files.
//   node tools/verify-live.mjs https://test.example.com
import fs from 'node:fs';
import path from 'node:path';
import { parseHeaders, headersFor } from './check/lib/headers.mjs';
import { ROOT } from './check/lib/dist.mjs';

const origin = (process.argv[2] || '').replace(/\/$/, '');
if (!/^https:\/\//.test(origin) && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) { console.error('usage: node tools/verify-live.mjs https://your-host'); process.exit(2); }
const rules = parseHeaders(fs.readFileSync(path.join(ROOT, 'public', '_headers'), 'utf8'));
const asset = fs.readdirSync(path.join(ROOT, 'dist', '_astro')).find((f) => f.endsWith('.css'));
const paths = ['/', '/home/', '/about/', '/projects/mazo/', '/no-such-page/', '/about.md', '/.well-known/security.txt', '/robots.txt', '/llms.txt', '/sitemap.xml', '/notes/rss.xml', ...(asset ? [`/_astro/${asset}`] : [])];
let bad = 0;
for (const p of paths) {
  const res = await fetch(origin + p, { redirect: 'manual' });
  const want = headersFor(rules, p);
  const problems = [];
  if (p === '/no-such-page/' ? res.status !== 404 : res.status !== 200) problems.push(`status ${res.status}`);
  for (const [k, { value }] of want) {
    const got = res.headers.get(k);
    if (got !== value) problems.push(`${k}: ${got === null ? 'missing' : `"${got.slice(0, 90)}${got.length > 90 ? '…' : ''}"`}`);
  }
  const robots = res.headers.get('x-robots-tag');
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${p}  ${res.status}  ${res.headers.get('content-type') || ''}${robots ? `  x-robots-tag: ${robots}` : ''}`);
  problems.forEach((x) => console.log(`       ${x}`));
  bad += problems.length ? 1 : 0;
}
console.log(bad ? `${bad} path(s) differ from public/_headers` : 'every header matches public/_headers');
process.exit(bad ? 1 : 0);
