// After the build (U9): a Markdown twin of every page from its <main> (/about/ -> /about.md), /llms.txt mapping the
// site to the twins, and /sitemap.xml of every indexable page. Built from the finished HTML, so a twin can never
// drift from its page. Pages that are not documents (the 404) get none of these; noindex pages stay out of the sitemap.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { htmlToMarkdown } from '../lib/html-to-md.mjs';

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const twinOf = (url) => (url === '/' ? '/index.md' : url.replace(/\/$/, '') + '.md');
const xml = (s) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

export default function agentFiles({ site, siteName, summary, extras = [] }) {
  return {
    name: 'agent-files',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const pages = [];
        for (const file of walk(dist).filter((f) => f.endsWith('.html'))) {
          const rel = '/' + path.relative(dist, file).split(path.sep).join('/');
          const url = rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
          if (url === '/404.html') continue;
          const { document } = parseHTML(fs.readFileSync(file, 'utf8'));
          const main = document.querySelector('main');
          const h1 = document.querySelector('h1')?.textContent.trim() || '';
          const title = (document.querySelector('title')?.textContent || h1).replace(new RegExp(` · ${siteName}$`), '').trim();
          const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
          const noindex = /noindex/.test(document.querySelector('meta[name="robots"]')?.getAttribute('content') || '');
          main.querySelector('h1')?.remove();
          const body = htmlToMarkdown(main, site + url);
          const md = `# ${h1 || title}\n\n> ${description}\n\nURL: ${site}${url}\n\n${body}`;
          fs.writeFileSync(path.join(dist, twinOf(url)), md);
          pages.push({ url, title, description, noindex });
        }
        const order = (u) => ['/home/', '/about/', '/projects/', '/notes/', '/now/', '/uses/', '/recruiters/', '/colophon/', '/'].indexOf(u);
        const main = pages.filter((p) => order(p.url) >= 0).sort((a, b) => order(a.url) - order(b.url));
        const group = (prefix) => pages.filter((p) => p.url.startsWith(prefix) && p.url !== prefix).sort((a, b) => a.url.localeCompare(b.url));
        const item = (p) => `- [${p.title}](${site}${twinOf(p.url)})${p.description ? `: ${p.description}` : ''}${p.noindex ? ' (not yet published)' : ''}`;
        const llms = [`# ${siteName}`, '', `> ${summary}`, '',
          'Every page of this site has a Markdown twin at the same path ending in .md (/about/ is /about.md). This file lists them.', '',
          '## Pages', '', ...main.map(item), '',
          '## Projects', '', ...group('/projects/').map(item), '',
          '## Lab notes', '', ...group('/notes/').map(item), '',
          '## Optional', '', ...extras.map((e) => `- [${e.title}](${site}${e.href})${e.note ? `: ${e.note}` : ''}`), ''].join('\n');
        fs.writeFileSync(path.join(dist, 'llms.txt'), llms);
        const urls = pages.filter((p) => !p.noindex).map((p) => `  <url><loc>${xml(site + p.url)}</loc></url>`).sort();
        fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
        logger.info(`${pages.length} Markdown twins, llms.txt, sitemap.xml (${urls.length} URLs)`);
      },
    },
  };
}
