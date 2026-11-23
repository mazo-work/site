// robots.txt, generated from src/data/crawlers.ts so the colophon and this file can never disagree.
import type { APIRoute } from 'astro';
import { CRAWLERS, CHECKED, type Kind } from '../data/crawlers';

const GROUPS: [Kind, string, 'Allow' | 'Disallow'][] = [
  ['search', 'Search and answer engines', 'Allow'],
  ['user', 'A person asked for the page', 'Allow'],
  ['training', 'Training only', 'Disallow'],
  ['mixed', 'Training as well as search or answers (disallowed: no crawler that trains, whatever else it does)', 'Disallow'],
];

export const GET: APIRoute = ({ site }) => {
  const base = site!.href.replace(/\/$/, '');
  const lines = [
    '# The policy: search and answer engines, and fetches a person asks for, are allowed; crawlers that gather AI',
    `# training data, alone or alongside search, are not. Names and purposes from each vendor's documentation, checked ${CHECKED}; sources in`,
    `# the colophon: ${base}/colophon/`,
    '',
  ];
  for (const [kind, label, rule] of GROUPS) {
    lines.push(`# ${label}`, ...CRAWLERS.filter((c) => c.kind === kind).map((c) => `User-agent: ${c.token}`), `${rule}: /`, '');
  }
  lines.push('# Everyone else', 'User-agent: *', 'Allow: /', '', `Sitemap: ${base}/sitemap.xml`, '');
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
