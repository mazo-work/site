// A small HTML-to-Markdown converter for this site's own markup (headings, paragraphs, lists, definition lists,
// quotes, code, tables, figures, links, emphasis). Used at build time for the Markdown twins. Skips what is not text:
// svg, scripts, styles, form controls, [hidden], [data-twin="skip"], and aria-hidden elements (except a <pre>, which
// carries the text of a drawing). Links become absolute URLs on the site's origin, so a twin can be cited on its own.
const SKIP = new Set(['SVG', 'SCRIPT', 'STYLE', 'TEMPLATE', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'FIELDSET', 'NOSCRIPT', 'CANVAS']);
const BLOCK = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'DL', 'BLOCKQUOTE', 'PRE', 'TABLE', 'FIGURE', 'HR',
  'SECTION', 'ARTICLE', 'DIV', 'HEADER', 'FOOTER', 'ASIDE', 'MAIN', 'NAV', 'FIGCAPTION']);

const esc = (s) => s.replace(/([*_`\\])/g, '\\$1');
const squash = (s) => s.replace(/\s+/g, ' ');

export function htmlToMarkdown(root, base) {
  const abs = (href) => { try { return new URL(href, base).href; } catch { return href; } };
  const skip = (el) => SKIP.has(el.tagName) || el.hasAttribute('hidden') || el.getAttribute('data-twin') === 'skip' ||
    (el.getAttribute('aria-hidden') === 'true' && el.tagName !== 'PRE');

  function inline(node) {
    let out = '';
    for (const n of node.childNodes) {
      if (n.nodeType === 3) { out += esc(squash(n.textContent)); continue; }
      if (n.nodeType !== 1 || skip(n)) continue;
      const t = n.tagName, inner = () => inline(n).trim();
      if (t === 'A') { const text = inner(); out += text ? `[${text}](${abs(n.getAttribute('href') || '')})` : ''; }
      else if (t === 'STRONG' || t === 'B') out += `**${inner()}**`;
      else if (t === 'EM' || t === 'I') out += `*${inner()}*`;
      else if (t === 'CODE') out += '`' + n.textContent + '`';
      else if (t === 'BR') out += '  \n';
      else if (t === 'IMG') { const alt = n.getAttribute('alt'); if (alt) out += `![${alt}](${abs(n.getAttribute('src'))})`; }
      else if (BLOCK.has(t)) out += ' ' + inner() + ' ';
      else out += inline(n);
    }
    return out;
  }

  function list(el, depth) {
    const ordered = el.tagName === 'OL';
    let k = Number(el.getAttribute('start') || 1);
    const items = [...el.children].filter((c) => c.tagName === 'LI' && !skip(c));
    if (ordered && el.hasAttribute('reversed')) k = items.length;
    return items.map((li) => {
      const marker = ordered ? `${el.hasAttribute('reversed') ? k-- : k++}.` : '-';
      const pad = '  '.repeat(depth);
      const nested = [...li.children].filter((c) => c.tagName === 'UL' || c.tagName === 'OL');
      const own = li.cloneNode(true);
      [...own.children].filter((c) => c.tagName === 'UL' || c.tagName === 'OL').forEach((c) => c.remove());
      const text = [...own.childNodes].some((c) => c.nodeType === 1 && BLOCK.has(c.tagName))
        ? blocks(own).join(' ').replace(/\n+/g, ' ') : inline(own).trim();
      return `${pad}${marker} ${text.trim()}` + nested.map((n) => '\n' + list(n, depth + 1)).join('');
    }).join('\n');
  }

  function table(el) {
    const rows = [...el.querySelectorAll('tr')].map((tr) => [...tr.children].map((c) => inline(c).trim().replace(/\|/g, '\\|')));
    if (!rows.length) return '';
    const width = Math.max(...rows.map((r) => r.length));
    const line = (r) => '| ' + Array.from({ length: width }, (_, i) => r[i] || '').join(' | ') + ' |';
    return [line(rows[0]), '| ' + Array(width).fill('---').join(' | ') + ' |', ...rows.slice(1).map(line)].join('\n');
  }

  function blocks(node) {
    const out = [];
    let run = '';
    const flush = () => { if (run.trim()) out.push(run.trim()); run = ''; };
    for (const n of node.childNodes) {
      if (n.nodeType === 3) { run += esc(squash(n.textContent)); continue; }
      if (n.nodeType !== 1 || skip(n)) continue;
      const t = n.tagName;
      if (!BLOCK.has(t) && t !== 'DT' && t !== 'DD') { run += inline({ childNodes: [n] }); continue; }
      flush();
      if (/^H[1-6]$/.test(t)) out.push('#'.repeat(Number(t[1])) + ' ' + inline(n).trim());
      else if (t === 'P' || t === 'FIGCAPTION') { const s = inline(n).trim(); if (s) out.push(t === 'FIGCAPTION' ? `*${s}*` : s); }
      else if (t === 'UL' || t === 'OL') { const s = list(n, 0); if (s) out.push(s); }
      else if (t === 'DL') {
        const items = [];
        let term = null;
        for (const c of n.querySelectorAll('dt, dd')) {
          if (c.tagName === 'DT') term = inline(c).trim();
          else { items.push(`- **${term}**: ${inline(c).trim()}`); }
        }
        if (items.length) out.push(items.join('\n'));
      }
      else if (t === 'BLOCKQUOTE') out.push(blocks(n).map((b) => b.split('\n').map((l) => '> ' + l).join('\n')).join('\n>\n'));
      else if (t === 'PRE') out.push('```\n' + n.textContent.replace(/\n$/, '') + '\n```');
      else if (t === 'TABLE') out.push(table(n));
      else if (t === 'HR') out.push('---');
      else out.push(...blocks(n));
    }
    flush();
    return out.filter(Boolean);
  }

  return blocks(root).join('\n\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
