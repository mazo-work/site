// A static server for dist/ that behaves like Cloudflare Pages where it matters to the checks:
// directory URLs, a 308 to the trailing slash, 404.html with status 404, and the headers from dist/_headers.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { loadHeaders, headersFor } from './headers.mjs';

export const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
  '.webmanifest': 'application/manifest+json', '.wasm': 'application/wasm',
};

/** dist-relative file for a URL path, or null. Also tells whether a slash redirect applies. */
export function resolvePath(dist, urlPath) {
  let p;
  try { p = decodeURIComponent(urlPath); } catch { return { file: null }; }
  if (p.includes('\0')) return { file: null };
  const abs = path.join(dist, p);
  if (!abs.startsWith(dist)) return { file: null };
  if (p.endsWith('/')) {
    const f = path.join(abs, 'index.html');
    return { file: fs.existsSync(f) ? f : null };
  }
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return { file: abs };
  if (fs.existsSync(path.join(abs, 'index.html'))) return { file: null, redirect: p + '/' };
  return { file: null };
}

export function startServer(dist) {
  dist = path.resolve(dist);
  const rules = loadHeaders(path.join(dist, '_headers')) || [];
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    const { file, redirect } = resolvePath(dist, url.pathname);
    const apply = (p) => { for (const { name, value } of headersFor(rules, p).values()) res.setHeader(name, value); };
    if (redirect) { apply(url.pathname); res.writeHead(308, { Location: redirect + url.search }); return res.end(); }
    let status = 200, f = file;
    if (!f) { status = 404; f = path.join(dist, '404.html'); if (!fs.existsSync(f)) { res.writeHead(404); return res.end('not found'); } }
    apply(url.pathname);
    res.setHeader('Content-Type', TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream');
    res.writeHead(status);
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    resolve({ origin: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) });
  }));
}
