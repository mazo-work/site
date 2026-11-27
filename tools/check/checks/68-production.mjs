// S109 (U4, C5): the production build carries no test surface. `surfaces`: built the way `npm run build` builds
// (no PUBLIC_MAZO_TEST), into its own folder, the site holds no `__mazo` (the puzzle's test hook) in any file and no
// debug HUD (`#debug` or its button) on the entrance, while the check's own build (dist/, PUBLIC_MAZO_TEST=1) still
// has both, so the gate is what removes them. `scripts`: package.json's scripts set no environment variable the POSIX
// way (`NAME=value cmd`), which native Windows shells cannot run.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, DIST, walk, read } from '../lib/dist.mjs';

export default {
  id: 'production',
  title: 'Production build: no test hook, no debug HUD; scripts run in any shell',
  async run() {
    const r = { surfaces: [], scripts: [] };
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'mazo-prod-'));
    const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' };
    delete env.PUBLIC_MAZO_TEST;
    const b = spawnSync('npx', ['astro', 'build', '--outDir', out], { cwd: ROOT, encoding: 'utf8', env });
    if (b.status !== 0) r.surfaces.push(`the production build failed: ${((b.stdout || '') + (b.stderr || '')).trim().split('\n').slice(-3).join(' | ')}`);
    else {
      const files = walk(out).filter((f) => /\.(js|html|css|txt|md|json|xml)$/.test(f));
      for (const f of files) if (read(f).includes('__mazo')) r.surfaces.push(`production ${path.relative(out, f)} holds __mazo`);
      const entrance = read(path.join(out, 'index.html'));
      if (/id="debug"|id="dbg"/.test(entrance)) r.surfaces.push('the production entrance holds the debug HUD (#debug or #dbg)');
      if (!files.some((f) => /puzzle\.[^/]+\.js$/.test(f))) r.surfaces.push('the production build has no puzzle chunk (nothing was checked)');
    }
    fs.rmSync(out, { recursive: true, force: true });
    // the gate, not the code, removes them: the check's build still has both
    if (!walk(path.join(DIST, '_astro')).some((f) => f.endsWith('.js') && read(f).includes('__mazo'))) r.surfaces.push("the check's build (dist/) has no __mazo: is PUBLIC_MAZO_TEST set by tools/check/run.mjs?");
    if (!/id="debug"/.test(read(path.join(DIST, 'index.html')))) r.surfaces.push("the check's build (dist/) has no debug HUD");
    const pkg = JSON.parse(read(path.join(ROOT, 'package.json')));
    for (const [k, v] of Object.entries(pkg.scripts || {})) if (/(^|&&|\|\||;)\s*[A-Z_][A-Z0-9_]*=\S*\s/.test(v)) r.scripts.push(`script "${k}" sets a variable the POSIX way: ${v}`);
    return Object.entries(r).map(([k, problems]) => ({ id: `production.${k}`, ok: problems.length === 0, problems }));
  },
};
