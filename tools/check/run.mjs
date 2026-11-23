#!/usr/bin/env node
// `npm run check`: builds the site, then runs every check in tools/check/checks/ in file-name order.
// A failing check fails the run unless STATE.md lists it under "Checks not yet expected to pass" (things not
// built yet); those print as PENDING. Options: --no-build (check the existing dist/), --only=id[,id].
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { pages as listPages, ROOT, DIST } from './lib/dist.mjs';
import { startServer } from './lib/server.mjs';
import { pendingIds, pendingFor } from './lib/pending.mjs';

const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const t0 = Date.now();
const results = [];

if (!args.includes('--no-build')) {
  const b = spawnSync('npx', ['astro', 'build'], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
  const out = (b.stdout || '') + (b.stderr || '');
  results.push({ id: 'build', ok: b.status === 0, problems: b.status === 0 ? [] : out.trim().split('\n').slice(-40) });
  if (b.status !== 0) { report(); process.exit(1); }
}

let server, browser;
const ctx = {
  pages: listPages(),
  server: async () => (server ??= await startServer(DIST)),
  browser: async () => (browser ??= await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })),
};
const notes = [];
const dir = path.join(ROOT, 'tools', 'check', 'checks');
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort()) {
  const mod = (await import(path.join(dir, f))).default;
  if (only.length && !only.includes(mod.id)) continue;
  const t = Date.now();
  try {
    const rs = await mod.run(ctx);
    results.push(...rs);
    if (rs.notes) notes.push(...rs.notes.map((n) => `${mod.id}: ${n}`));
  } catch (e) {
    results.push({ id: mod.id, ok: false, problems: [`the check itself failed: ${e.stack || e}`] });
  }
  notes.push(`${mod.id}: ${((Date.now() - t) / 1000).toFixed(1)} s`);
}
await browser?.close();
await server?.close();
const failed = report();
process.exit(failed ? 1 : 0);

function report() {
  const pending = pendingIds();
  let failed = 0, pend = 0;
  const lines = [];
  for (const r of results) {
    const p = !r.ok && pendingFor(r.id, pending);
    if (r.ok) { lines.push(`pass     ${r.id}`); continue; }
    if (p) { pend++; lines.push(`PENDING  ${r.id}  (${pending.get(p) || 'listed in STATE.md'}; ${r.problems.length} problem(s), first: ${r.problems[0] || '-'})`); continue; }
    failed++;
    lines.push(`FAIL     ${r.id}  (${r.problems.length} problem(s))`);
    r.problems.slice(0, 25).forEach((x) => lines.push(`           ${x}`));
    if (r.problems.length > 25) lines.push(`           … and ${r.problems.length - 25} more`);
  }
  for (const [id] of pending) {
    const mine = results.filter((r) => r.id === id || r.id.startsWith(id + '.'));
    if (mine.length && mine.every((r) => r.ok)) lines.push(`note     ${id} passes now: remove its line from STATE.md`);
  }
  console.log(lines.join('\n'));
  if (notes.length) console.log('\n' + notes.map((n) => `         ${n}`).join('\n'));
  console.log(`\n${results.length} checks: ${results.length - failed - pend} passed, ${pend} pending, ${failed} failed (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  fs.mkdirSync(path.join(ROOT, '.check'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, '.check', 'report.json'), JSON.stringify({ when: new Date().toISOString(), results }, null, 2));
  return failed;
}
