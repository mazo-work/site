# tools/burr

The solver behind the MAZO puzzle (see `docs/puzzle-spec.md`).

- `check.py` verifies `docs/puzzle/mazo-burr.json`: no overlaps, each letter escapes along its recorded path, nothing escapes early, and the leak counts match. Run `python3 tools/burr/check.py`; it must exit 0.
- `search.py` is the search that found the designs. Example: `python3 tools/burr/search.py 7 M2,A3,Z1,OS1` (box size, then the glyph set). It takes a few minutes and writes `g3sol_box7.json`, which is not committed.
- `burrlib.py` holds the glyphs, placement and solver functions.

Plain Python 3, no dependencies.
