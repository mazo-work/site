// The puzzle data, slimmed exactly as prototype/p0/build.py's designs() does: names, glyphs, rotations, paths,
// and offsets and core position relative to the design's centre. docs/puzzle/mazo-burr.json is the source of truth
// (tools/burr/check.py verifies it).
import data from '../../docs/puzzle/mazo-burr.json';

export const DESIGNS = data.designs.map((d) => {
  const c = d.center;
  return {
    name: d.name, note: d.note, dims: d.dims,
    core: d.core.map((v, a) => v - c[a]),
    pieces: Object.fromEntries(Object.entries(d.pieces).map(([L, p]) => [L,
      { glyph: p.glyph, R: p.R, path: p.path, off: p.off.map((v, a) => v - c[a]) }])),
  };
});
