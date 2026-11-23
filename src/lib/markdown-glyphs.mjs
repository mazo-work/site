// A Sätteri mdast plugin (Astro 7's default Markdown processor). A ```glyphs code block (a header line of letters, then rows of X and .) becomes a drawing of the blocks: one SVG per
// letter, with the original text kept in the HTML for agents and the Markdown twin, and a caption for screen readers.
// The stencil O's missing ring cell is drawn as an outline: the gap the light fills in the finale.
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function draw(letter, rows) {
  let cells = '';
  rows.forEach((row, r) => [...row].forEach((ch, c) => {
    const ring = r === 0 || r === rows.length - 1 || c === 0 || c === row.length - 1;
    if (ch === 'X') cells += `<rect x="${c * 2 + 0.1}" y="${r * 2 + 0.1}" width="1.8" height="1.8"/>`;
    else if (letter === 'O' && ring) cells += `<rect class="gap" x="${c * 2 + 0.35}" y="${r * 2 + 0.35}" width="1.3" height="1.3"/>`;
  }));
  return `<div class="glyph"><svg viewBox="0 0 10 10" aria-hidden="true" focusable="false">${cells}</svg><span aria-hidden="true">${esc(letter)}</span></div>`;
}

function render(node) {
  const [head, ...lines] = node.value.trim().split('\n');
  const letters = head.trim().split(/\s+/);
  const rows = lines.map((l) => l.trim().split(/\s+/));
  const caption = node.meta ? esc(node.meta) : '';
  return `<figure class="glyphs"><div class="glyph-row">${letters.map((L, k) => draw(L, rows.map((r) => r[k]))).join('')}</div>` +
    `<pre class="vh" aria-hidden="true">${esc(node.value.trim())}</pre>${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
}

export const glyphs = {
  name: 'glyphs',
  code(node) {
    if (node.lang !== 'glyphs') return undefined;
    return { type: 'html', value: render(node) };
  },
};
