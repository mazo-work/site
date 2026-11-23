// Reads STATE.md's "Checks not yet expected to pass": lines of the form "- `check.id` ... (lands in Un)".
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './dist.mjs';

export function pendingIds() {
  const text = fs.readFileSync(path.join(ROOT, 'STATE.md'), 'utf8');
  const sec = text.split(/^## /m).find((s) => s.startsWith('Checks not yet expected to pass'));
  if (!sec) return new Map();
  const out = new Map();
  for (const m of sec.matchAll(/^- `([\w.-]+)`\s*(.*)$/gm)) out.set(m[1], m[2].trim());
  return out;
}

/** A result id is pending when it, or one of its dotted parents, is listed. */
export function pendingFor(id, pending) {
  const parts = id.split('.');
  for (let k = parts.length; k > 0; k--) {
    const p = parts.slice(0, k).join('.');
    if (pending.has(p)) return p;
  }
  return null;
}
