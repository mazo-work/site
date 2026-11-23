// Helpers over the built site in dist/.
import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
export const DIST = process.env.CHECK_DIST ? path.resolve(process.env.CHECK_DIST) : path.join(ROOT, 'dist');

export function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

/** Every HTML page in dist as { file, url }: dist/about/index.html -> /about/, dist/404.html -> /404.html. */
export function pages() {
  return walk(DIST).filter((f) => f.endsWith('.html')).map((file) => {
    const rel = '/' + path.relative(DIST, file).split(path.sep).join('/');
    const url = rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
    return { file, url };
  }).sort((a, b) => a.url.localeCompare(b.url));
}

export function read(file) { return fs.readFileSync(file, 'utf8'); }

export function dom(html) { return parseHTML(html).document; }

/** The Markdown twin of a page URL: / -> /index.md, /about/ -> /about.md, /projects/mazo/ -> /projects/mazo.md */
export function twinOf(url) { return url === '/' ? '/index.md' : url.replace(/\/$/, '') + '.md'; }

export function isText(file) {
  const buf = fs.readFileSync(file);
  return !buf.subarray(0, 8000).includes(0);
}
