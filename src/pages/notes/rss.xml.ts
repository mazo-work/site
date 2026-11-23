// The Lab notes feed (RSS 2.0), linked from every page's <head>.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_NAME, DESCRIPTIONS } from '../../data/site';

const xml = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string);

export const GET: APIRoute = async ({ site }) => {
  const base = site!.href.replace(/\/$/, '');
  const notes = (await getCollection('notes')).sort((a, b) => +b.data.date - +a.data.date);
  const items = notes.map((n) => {
    const link = `${base}/notes/${n.id}/`;
    return `<item><title>${xml(n.data.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid>` +
      `<pubDate>${n.data.date.toUTCString()}</pubDate><description>${xml(n.data.description)}</description></item>`;
  }).join('\n    ');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Lab notes · ${xml(SITE_NAME)}</title>
    <link>${base}/notes/</link>
    <atom:link href="${base}/notes/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${xml(DESCRIPTIONS.notes)}</description>
    <language>en</language>
    ${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
