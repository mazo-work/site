#!/usr/bin/env node
// Paper's sphere for the ring (v4, U6): a halftone print of a sphere lit from the top left. Dots on a 45° screen,
// each dot's area following the shadow (dots, not shading), inside a 240-unit circle. Writes
// public/ring/halftone-sphere.svg; Paper uses it as a mask, so the dots take the ink colour. Run after editing.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const C = 120, R = 116, S = 7.2;                                   // centre, radius, screen pitch
const L = (() => { const v = [-0.52, -0.62, 0.59]; const n = Math.hypot(...v); return v.map((x) => x / n); })();
const dots = [];
for (let i = -24; i <= 24; i++) for (let j = -24; j <= 24; j++) {
  const x = C + (i - j) * S * Math.SQRT1_2, y = C + (i + j) * S * Math.SQRT1_2;
  const nx = (x - C) / R, ny = (y - C) / R, q = nx * nx + ny * ny;
  if (q > 1) continue;
  const nz = Math.sqrt(1 - q), lit = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
  const r = 0.5 * S * 0.96 * Math.sqrt(1 - 0.92 * lit);              // the shadow sets each dot's area
  if (r < 0.45) continue;
  dots.push(`M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(2 * r).toFixed(2)} 0a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-2 * r).toFixed(2)} 0`);
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><path d="${dots.join('')}"/></svg>\n`;
fs.writeFileSync(path.join(ROOT, 'public', 'ring', 'halftone-sphere.svg'), svg);
console.log(`${dots.length} dots, ${(svg.length / 1024).toFixed(1)} KB`);
