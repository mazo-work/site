#!/usr/bin/env node
// Every `[JON: …]` slot (and `[DRAFT: …]` note) on the built site, by page: the text Jon still has to write. Reads the
// visible text and the meta description of every page in dist/ (run `npm run build` first). Prints Markdown.
import { pages, read, dom } from './check/lib/dist.mjs';

const SLOT = /\[(?:JON|DRAFT): (?:[^\[\]]|\[[^\[\]]*\])*\]/g;
for (const p of pages()) {
  const d = dom(read(p.file));
  d.querySelectorAll('script, style, template').forEach((e) => e.remove());
  const text = [d.querySelector('meta[name="description"]')?.getAttribute('content') || '', d.body?.textContent || ''].join('\n');
  const found = [...new Set(text.match(SLOT) || [])];
  if (!found.length) continue;
  console.log(`**\`${p.url}\`**\n\n${found.map((x) => `- ${x}`).join('\n')}\n`);
}
