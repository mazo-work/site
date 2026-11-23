// Every package installed to build and check the site, with its licence, from package-lock.json (BRIEF.md §5.5).
import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const GET: APIRoute = () => {
  const lock = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package-lock.json'), 'utf8'));
  const rows = Object.entries(lock.packages as Record<string, any>)
    .filter(([k]) => k.startsWith('node_modules/'))
    .map(([k, p]) => `${k.replace(/^.*node_modules\//, '')}@${p.version}\t${p.license ?? 'not stated'}\t${p.dev ? 'checks' : p.optional ? 'build (optional)' : 'build'}`)
    .sort();
  const body = ['# Every package installed to build and check this site, with its licence (from package-lock.json).',
    '# Columns: package@version, licence, role. Only three.js is sent to visitors, and only on the entrance.', '', ...rows, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
