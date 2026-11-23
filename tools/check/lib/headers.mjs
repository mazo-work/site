// Cloudflare Pages `_headers`: parse the file and work out which headers a path gets.
// Format (developers.cloudflare.com/pages/configuration/headers/): a URL pattern on its own line, then indented
// `Name: value` lines; `#` starts a comment; `! Name` removes a header a broader rule set; `*` is a splat and
// `:name` a placeholder, both usable in values; a header set by several matching rules is joined with ", ".
import fs from 'node:fs';

export function parseHeaders(text) {
  const rules = [];
  let current = null;
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) return;
    if (!/^\s/.test(line)) {
      current = { pattern: line.trim(), line: i + 1, set: [], detach: [] };
      rules.push(current);
      return;
    }
    if (!current) throw new Error(`_headers line ${i + 1}: a header before any URL pattern`);
    const t = line.trim();
    if (t.startsWith('!')) { current.detach.push(t.slice(1).trim().toLowerCase()); return; }
    const k = t.indexOf(':');
    if (k < 1) throw new Error(`_headers line ${i + 1}: not "Name: value": ${t}`);
    current.set.push({ name: t.slice(0, k).trim(), value: t.slice(k + 1).trim() });
  });
  return rules;
}

function matcher(pattern) {
  const names = [];
  let re = '';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '*') { names.push('splat'); re += '(.*)'; continue; }
    if (c === ':' && /[A-Za-z]/.test(pattern[i + 1] || '')) {
      let j = i + 1; while (j < pattern.length && /\w/.test(pattern[j])) j++;
      names.push(pattern.slice(i + 1, j)); re += '([^/]+)'; i = j - 1; continue;
    }
    re += c.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  }
  return { re: new RegExp('^' + re + '$'), names };
}

/** The headers for `path` (no query), as a Map of lower-case name -> { name, value }. */
export function headersFor(rules, path) {
  const out = new Map();
  for (const r of rules) {
    if (/^https?:\/\//.test(r.pattern)) continue;   // absolute-URL rules are not used by this site
    const { re, names } = matcher(r.pattern);
    const m = path.match(re);
    if (!m) continue;
    const vars = Object.fromEntries(names.map((n, k) => [n, m[k + 1]]));
    for (const d of r.detach) out.delete(d);
    for (const { name, value } of r.set) {
      const v = value.replace(/:(\w+)/g, (all, n) => (n in vars ? vars[n] : all));
      const key = name.toLowerCase();
      out.set(key, out.has(key) ? { name, value: out.get(key).value + ', ' + v } : { name, value: v });
    }
  }
  return out;
}

export function loadHeaders(file) {
  return fs.existsSync(file) ? parseHeaders(fs.readFileSync(file, 'utf8')) : null;
}

/** A CSP string as a Map of directive -> array of sources. */
export function parseCsp(csp) {
  const out = new Map();
  for (const part of csp.split(';')) {
    const [name, ...sources] = part.trim().split(/\s+/);
    if (name) out.set(name.toLowerCase(), sources);
  }
  return out;
}
