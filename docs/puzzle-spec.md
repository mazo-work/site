# MAZO puzzle spec

**Version:** v0, draft for review (2026-11-21)

The site's front door is a 3D puzzle made of the letters M, A, Z and O, locked together like a wooden burr puzzle. Visitors turn it and pull the letters out one at a time. Each letter flies into a title that spells MAZO, a light sweeps across the name, and the site opens. A skip control and a direct link to the recruiter section are always available.

## Decisions so far

| Question | Decision |
| --- | --- |
| Form | Four solid letters hooked through each other, like a wooden burr puzzle. Letters may be reshaped to fit. |
| Order | M, then A, then Z, then O: the spelling order. |
| Title | Nothing shows at first. The title fills in as each letter arrives. |
| Light | A glowing core sits inside the O. At the end it is released and becomes the spotlight that sweeps the name. |
| Difficulty | A light puzzle. Order and direction matter, and hints appear for anyone stuck. |
| Look | Decided later, from two or three prototypes. P0 uses plain pieces. |

## The letters

Each letter is a 5 by 5 block glyph, one voxel thick, and every letter is a single solid piece (no corner-only joins). Rows run from top to bottom.

| M | A | Z | O (stencil) |
| --- | --- | --- | --- |
| `XX.XX` | `.XXX.` | `XXXXX` | `XXXXX` |
| `XXXXX` | `XX.XX` | `...XX` | `X...X` |
| `X.X.X` | `XXXXX` | `..XX.` | `X...X` |
| `X...X` | `X...X` | `.XX..` | `X...X` |
| `X...X` | `X...X` | `XXXXX` | `XX.XX` |

**Why the O is a stencil O.** A closed ring traps anything threaded through it. In the searches, no layout with a closed O came apart in order. That covers all 964,558 collision-free layouts of four upright letters crossing like a `#`, and every layout the open search tried with a closed O (12 letter combinations, in boxes of 6 and 7 voxels). With one gap in the bottom bar, the way stencil fonts cut their O, 89,430 layouts came apart in exactly the order M, A, Z, O, with the other letters held still. The gap does real work: close it again and the checker fails, because A and Z can no longer get out.

## The shortlist

Both designs pass `tools/burr/check.py`. Coordinates are in `docs/puzzle/mazo-burr.json`.

| | Pedestal (recommended) | Upright M |
| --- | --- | --- |
| How it sits | M is a flat base, A is a flat layer, Z stands up through the O, and the O stands upright | M stands behind the O and reads as M from the back |
| Size in voxels | 7 by 6 by 7 | 7 by 6 by 6 |
| M comes out | down 2 | sideways 4 |
| A comes out | down 3 | down 3 |
| Z comes out | 2 to the left, then 3 toward the viewer, out through the O's gap | the same |
| O | free | free |
| Leaks (M, A) | 0, 1 | 13, 1 |

**What a leak is.** A leak is a spot where a letter is pulled part-way out and left there, still tangled, and another letter can then escape out of order. The page never leaves a letter part-way: a pull either completes or springs back home. So leaks can't happen on the page. They matter only for physical honesty, for example if the puzzle is ever 3D-printed.

**Recommendation: Pedestal**, 65% confidence. It is the honest one: no partial pull of M frees anything. Its first move, dropping the base out from underneath, is also a small surprise. Upright M reads better as letters before it is taken apart. The choice is made by playing both in the preview.

## How the solution was found

`tools/burr/search.py` builds the puzzle backwards from the end of the solve, trying all 24 orientations of each flat letter:

1. Z must escape the O.
2. A must escape, while Z and O stay locked.
3. M must escape, while A, Z and O stay locked.

An escape may take up to three straight legs. "Locked" means no escape by any path while the other letters are held still. The first searches tried upright letters crossing like a `#`, level and at stepped heights, and found no solution. The open search, with any orientation, found solutions only once the O had a gap.

`tools/burr/check.py` rebuilds each design from the JSON. It proves there is no overlap, that each letter escapes along exactly the recorded path, that no other letter can escape early, and that the leak counts are as recorded. It exits non-zero on any failure. It was tested against three broken copies of the data, and it caught all three: a wrong path, a closed O, and a letter moved one step.

Run `python3 tools/burr/check.py` after any change to the puzzle data. It must exit 0.

## Interaction (values in P0)

| Part | Behaviour |
| --- | --- |
| Turning | A drag anywhere turns the puzzle. Left and right turn freely. Tilt is limited to between −0.55 and 0.85 radians so letters never flip over. A drag that is let go keeps a little momentum. |
| Pulling | A drag that starts on the free letter and moves within 38° of its slide direction on screen pulls the letter. The first 9 px decide whether a drag turns or pulls. Any other drag turns the puzzle, so a phone screen full of puzzle never traps the visitor. |
| Edge-on | If the slide direction shows on screen as less than 10 px per step, the drag turns the puzzle instead. |
| Two-leg pulls | The letter stops at the corner, with a tick on phones that can vibrate. Continue in the new direction to finish. |
| Letting go | The letter completes past 45% of its last leg, on a flick faster than 4.5 steps a second, or when within 0.3 of a step of the end. Otherwise it springs home. |
| Locked letter | It shakes along the axis nearest the drag. The first two times, a message says it is held by the others. |
| The O | Free once it is the last letter: a 44 px drag in any direction, or a tap. |
| Flight | Each letter flies to its place in the title in about 0.95 s and lands upright, facing the viewer. Places are fixed, so the word grows from the left. |

## Hints, skip and access

- The puzzle spins slowly until the first touch.
- After 8 seconds without progress, the free letter glows and nudges along its slide direction.
- After 20 seconds, an arrow shows the direction and the hint names the letter.
- After 40 seconds, a "Show me" button appears and pulls the letter out.
- Skip is always visible and jumps straight to the finale.
- Keyboard: the arrow keys turn the puzzle, and Enter or Space pulls the free letter. Progress is announced for screen readers.
- Reduced motion turns off the idle spin and shortens every animation. Without WebGL, a fallback card offers the site.

## Finale

The scene dims. The core leaves the O's ring and moves to the left of the M, then sweeps across the name in 1.7 s, lighting each letter as it passes. The lights come back up and the site opens. In P0, a card stands in for the site.

## Next

- **P1, feel.** Tune the numbers above with three to five testers, without tracking on the site. The target is unlocking in 20 to 45 seconds for a first-time visitor, with 9 in 10 under 90 seconds.
- **P2, looks.** Two or three materials side by side, then one is chosen.
- **P3, finish.** The handoff into the site: the MAZO title shrinks into the header logo, and the header shows the full name. Also the recruiter link, remembering that a visitor already unlocked it, and performance on mid-range phones.
- **Stack.** P0 is plain three.js. The v2 site is planned as React with react-three-fiber. Decide this before P1.

## Files

| Path | What it holds |
| --- | --- |
| `docs/puzzle/mazo-burr.json` | The two designs: glyphs, rotations, offsets, paths and core position. This file is the source of truth. |
| `tools/burr/burrlib.py` | Glyphs, placement and the solver. |
| `tools/burr/search.py` | The search that found the designs. |
| `tools/burr/check.py` | Verifies the JSON. |
| `prototype/p0/` | The preview. `build.py` embeds the JSON, and `test.mjs` plays through it in headless Chrome. |

## Version history

- **v0 (2026-11-21):** first draft. Form, order, title, light and difficulty decided. Two shapes shortlisted and verified. P0 preview built and tested.
