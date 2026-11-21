# MAZO puzzle spec

**Version:** v0.4, draft for review (2026-11-21)

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
| Shape | Pedestal. Upright M stays verified as the alternate, one switch away in the preview. |
| Finale | The sweep turns the letters white, and the light becomes the O's missing block. The name then falls into a solid line, MAZO is revealed in a plain font, and the line rises like a curtain on the site (see Finale). |
| Sound | Yes, from P1 on. |
| Testing | Three to five testers, on a public test page on the domain. Behind the curtain is the current site, so they see real content. |

## The letters

Each letter is a 5 by 5 block glyph, one voxel thick, and every letter is a single solid piece (no corner-only joins). Rows run from top to bottom.

| M | A | Z | O (stencil) |
| --- | --- | --- | --- |
| `XX.XX` | `.XXX.` | `XXXXX` | `XXXXX` |
| `XXXXX` | `XX.XX` | `...XX` | `X...X` |
| `X.X.X` | `XXXXX` | `..XX.` | `X...X` |
| `X...X` | `X...X` | `.XX..` | `X...X` |
| `X...X` | `X...X` | `XXXXX` | `X.XXX` |

The O's gap is in its bottom bar, second cell from the left. (v0 of this spec showed it in the middle; both shapes use this one.)

**Why the O is a stencil O.** A closed ring traps anything threaded through it. In the searches, no layout with a closed O came apart in order. That covers all 964,558 collision-free layouts of four upright letters crossing like a `#`, and every layout the open search tried with a closed O (12 letter combinations, in boxes of 6 and 7 voxels). With one gap in the bottom bar, the way stencil fonts cut their O, 89,430 layouts came apart in exactly the order M, A, Z, O, with the other letters held still. The gap does real work: close it again and the checker fails, because A and Z can no longer get out.

## The shortlist

Both designs pass `tools/burr/check.py`. Coordinates are in `docs/puzzle/mazo-burr.json`.

| | Pedestal (chosen) | Upright M (alternate) |
| --- | --- | --- |
| How it sits | M is a flat base, A is a flat layer, Z stands up through the O, and the O stands upright | M stands behind the O and reads as M from the back |
| Size in voxels | 7 by 6 by 7 | 7 by 6 by 6 |
| M comes out | down 2 | sideways 4 |
| A comes out | down 3 | down 3 |
| Z comes out | 2 to the left, then 3 toward the viewer, out through the O's gap | the same |
| O | free | free |
| Leaks (M, A) | 0, 1 | 13, 1 |

**What a leak is.** A leak is a spot where a letter is pulled part-way out and left there, still tangled, and another letter can then escape out of order. The page never leaves a letter part-way: a pull either completes or springs back home. So leaks can't happen on the page. They matter only for physical honesty, for example if the puzzle is ever 3D-printed.

**Chosen: Pedestal.** It is the honest one: no partial pull of M frees anything, and its first move, dropping the base out from underneath, is a small surprise. Upright M reads better as letters before it is taken apart, and it stays available as the alternate.

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

During the puzzle, the pieces keep their own colours. From the sweep on, everything is one solid colour.

1. **Sweep.** The scene dims. The core leaves the O's ring, moves to the left of the M, and sweeps across the name in 1.7 s. Each letter turns white and glows as the light passes.
2. **Click-in.** The core turns into a white block and clicks into the gap in the O's bottom bar (0.95 s, then a short pulse). Every letter now has 16 blocks, 64 in all.
3. **Dim back.** The white dims slightly, on the letters and the new block alike, over 0.85 s. At the same time, a soft warm glow starts as a point behind the centre of the word and spreads outward over 2.8 s with a gentle ease in and out, so the letters stand out against it. It stays smaller than the word's surroundings and faint (peak opacity 0.32).
4. **Hold.** 2 s, while the glow finishes spreading. A tap, click, scroll or key ends the hold at once.
5. **Fall.** The rows let go from the bottom up, 160 ms apart. Each block drops in 0.9 s, with a downward pull that speeds up like a real fall. On the way, it shrinks into its place in one solid-coloured row of all 64 blocks. The row spans 96% of the screen's width and sits 12 px above the bottom edge.
6. **Word.** As each row lets go, MAZO in a plain bold font is uncovered behind it, from the bottom up. It is set in capitals, at the same height and in the same places as the block letters. The font is a stand-in until the looks are chosen.
7. **Curtain.** After 0.65 s the line rises like a curtain. The whole scene lifts with it, the line as its hem, over 1.4 s. Underneath is the site. It was loaded behind the puzzle after the first letter came out, so it is ready. The curtain is a still picture of the finished scene moved by a CSS transition, which phones run smoothly. While the site shows, the 3D scene stops drawing. "Replay intro" brings the curtain back down on a fresh puzzle. The private preview has no site to reveal, so it ends on a card instead.

Skip jumps straight to step 7 from anywhere. The full intro plays for everyone, Reduce Motion included: the owner's choice, with Skip as the way out. The reduced-motion version (quicker moves, instant sweep and fall, 1.5 s hold) and a 0.45 s curtain fade stay in the code, each behind one setting.

## Sound

The sounds are synthesized in the page, with no audio files. They stay silent until the visitor's first tap or key, and the Sound button turns them off; the choice is remembered on that device. There are eight sounds:
- a tick when a pull turns a corner;
- a dull knock on a locked letter;
- a slide when a letter comes free;
- a wooden note as each letter lands in the title, rising M, A, Z, O;
- a chime as the sweep lights each letter;
- a click and a ring as the light seats in the O;
- a soft rumble for each row that lets go;
- light pips as blocks land in the line.

Their character gets matched to the chosen material in P2.

## The test page

Testers use a public page on the site's domain, published with GitHub Pages. Behind the curtain is the current site, built from its own source under `site/`; the resume link now follows the base path, so it works there:
- A workflow builds `prototype/p0` from the `v2` branch with `python3 build.py --site _site` and deploys it. It first runs `tools/burr/check.py`, so a broken puzzle can't be published.
- The workflow pins its actions to exact commits, not tags.
- Every build carries `<meta name="robots" content="noindex, nofollow">`. That asks search engines not to list the page; it does not hide it from anyone who has the link.
- The public copy also carries a strict Content-Security-Policy. It allows only the page's own files and its three inline blocks, each matched by hash, frames from itself, and no network requests. A tampered copy was blocked, so the policy is enforced.
- The site under `site/` gets its own noindex tag and policy: its own files only, no inline code, and its contact form may post only to Formspree.

## Next

- **P1, feel.** Tune the numbers above with three to five testers on the test page, without tracking on the site. A per-run summary card for testers comes later. The target is unlocking in 20 to 45 seconds for a first-time visitor, with 9 in 10 under 90 seconds.
- **Next iteration.** Skip plays the solve at speed (every pull in order, then the finale) instead of jumping to the end; Skip pressed again, or reduced motion, still jumps straight there. A loading indicator, and on the public page the no-3D fallback opens the site. Then the sound rework, including the Z stutter after a wrong-direction pull.
- **P2, looks.** Two or three materials side by side, then one is chosen.
- **P3, finish.** The handoff into the site, once the fonts are set: after the blocks fall, the MAZO word shrinks into the centre of the new site's header as a logo. The curtain rises past it, and as it passes the logo it reveals the name beside it. The falling blocks may later morph into one solid line; not before the other transitions are settled. Also the recruiter link, remembering that a visitor already unlocked it, and performance on mid-range phones.
- **Themes.** Light and dark mode first, and what each colourway holds. To be discussed before the looks are built.
- **Stack.** P0 is plain three.js. The v2 site is planned as React with react-three-fiber. Decide this before P1.

## Files

| Path | What it holds |
| --- | --- |
| `docs/puzzle/mazo-burr.json` | The two designs: glyphs, rotations, offsets, paths and core position. This file is the source of truth. |
| `tools/burr/burrlib.py` | Glyphs, placement and the solver. |
| `tools/burr/search.py` | The search that found the designs. |
| `tools/burr/check.py` | Verifies the JSON. |
| `prototype/p0/` | The preview. `build.py` embeds the JSON; `build.py --site DIR` makes the public copy with its policy. `test.mjs` plays through every phase in headless Chrome. |
| `.github/workflows/test-page.yml` | Builds and deploys the public test page from `v2`. |

## Version history

- **v0.4 (2026-11-21):** The curtain moves a still picture and rises and the full intro plays for everyone, Reduce Motion included, with the reduced version and a fade kept as a one-setting fallback. On iPhone the sound starts on a tap, not a drag, and the sound button says so.
- **v0.3 (2026-11-21):** The glow is smaller and fainter, and spreads from the centre of the word over 2.8 s. The logo handoff is written up under P3.
- **v0.2 (2026-11-21):** The sweep turns the letters white, the white dims with the glow, and the line is one solid colour. The hold is 2 s. The line rises as a curtain on the current site.
- **v0.1 (2026-11-21):** Pedestal chosen, with Upright M kept as the alternate. Finale v2, sound and the public test page added. The O glyph in the letters table corrected: its gap is second from the left, not in the middle.
- **v0 (2026-11-21):** first draft. Form, order, title, light and difficulty decided. Two shapes shortlisted and verified. P0 preview built and tested.
