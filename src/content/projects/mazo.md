---
title: "MAZO: making the entrance"
description: "The site's front door is a 3D puzzle made of the letters M, A, Z and O, locked together like a wooden burr puzzle."
order: 1
status: published
date: 2026-11-21
voice: "[DRAFT: Jon to voice] Plain, factual prose drawn only from the puzzle's spec (docs/puzzle-spec.md, v0.4). It waits for Jon's voice."
---

## The idea

The site's front door is a 3D puzzle made of the letters M, A, Z and O, locked together like a wooden burr puzzle. Visitors turn it and pull the letters out one at a time. Each letter flies into a title that spells MAZO, a light sweeps across the name, and the site opens. A skip control and a direct link to the recruiter page are always there.

## Four letters, sixty-four blocks

Each letter is a 5 by 5 block glyph, one block thick, and every letter is a single solid piece, with no corner-only joins. They come out in the spelling order: M, then A, then Z, then O.

```glyphs M, A, Z and the stencil O, each a 5 by 5 block glyph. The O's gap is in its bottom bar, second cell from the left.
M       A       Z       O
XX.XX   .XXX.   XXXXX   XXXXX
XXXXX   XX.XX   ...XX   X...X
X.X.X   XXXXX   ..XX.   X...X
X...X   X...X   .XX..   X...X
X...X   X...X   XXXXX   X.XXX
```

## Why the O is a stencil O

A closed ring traps anything threaded through it. In the searches, no layout with a closed O came apart in order: none of the 964,558 collision-free layouts of four upright letters crossing like a `#`, and none of the layouts the open search tried with a closed O (12 letter combinations, in boxes of 6 and 7 blocks). With one gap in the bottom bar, the way stencil fonts cut their O, 89,430 layouts came apart in exactly the order M, A, Z, O, with the other letters held still. The gap does real work: close it again and the checker fails, because A and Z can no longer get out.

## Built backwards

A search builds the puzzle backwards from the end of the solve, trying all 24 orientations of each flat letter. First, Z must escape the O. Then A must escape while Z and O stay locked. Then M must escape while A, Z and O stay locked. An escape may take up to three straight legs, and "locked" means no escape by any path while the other letters are held still. The first searches tried upright letters crossing like a `#`, level and at stepped heights, and found nothing; the open search, with any orientation, found solutions only once the O had a gap.

A separate checker rebuilds each design from its data file. It proves there is no overlap, that each letter escapes along exactly the recorded path, that no other letter can escape early, and that the leak counts are as recorded. It was tested against three broken copies of the data, a wrong path, a closed O and a letter moved one step, and it caught all three. It runs before the test page is built, so a broken puzzle can't be published.

## Two shapes, one chosen

|  | Pedestal (chosen) | Upright M (alternate) |
| --- | --- | --- |
| How it sits | M is a flat base, A is a flat layer, Z stands up through the O, and the O stands upright | M stands behind the O and reads as M from the back |
| Size in blocks | 7 by 6 by 7 | 7 by 6 by 6 |
| M comes out | down 2 | sideways 4 |
| A comes out | down 3 | down 3 |
| Z comes out | 2 to the left, then 3 toward the viewer, out through the O's gap | the same |
| Leaks (M, A) | 0, 1 | 13, 1 |

A leak is a spot where a letter is pulled part-way out and left there, still tangled, and another letter can then escape out of order. The page never leaves a letter part-way: a pull either completes or springs back home. Leaks matter only for physical honesty, for example if the puzzle is ever 3D-printed. Pedestal is the honest one: no partial pull of M frees anything, and its first move, dropping the base out from underneath, is a small surprise.

## How it plays

A drag anywhere turns the puzzle. Tilt is limited to between −0.55 and 0.85 radians, so letters never flip over. A drag that starts on the free letter and moves within 38° of its slide direction pulls the letter; the first 9 px decide whether a drag turns or pulls, so a phone screen full of puzzle never traps the visitor. A letter completes past 45% of its last leg, on a flick faster than 4.5 steps a second, or within 0.3 of a step of the end; otherwise it springs home. A locked letter shakes, and the first two times a message says it is held by the others. Each freed letter flies to its place in the title in about 0.95 s.

Hints arrive on a clock. The puzzle spins slowly until the first touch. After 8 seconds without progress, the free letter glows and nudges along its slide direction; after 20, an arrow shows the direction and the hint names the letter; after 40, a "Show me" button pulls it out. Skip is always visible. The arrow keys turn the puzzle, Enter or Space pulls the free letter, and progress is announced for screen readers.

## The finale

1. **Sweep.** The scene dims, and the glowing core leaves the O's ring and sweeps across the name in 1.7 s. Each letter turns white and glows as the light passes.
2. **Click-in.** The core turns into a white block and clicks into the gap in the O's bottom bar. Every letter now has 16 blocks, 64 in all.
3. **Dim back.** The white dims slightly over 0.85 s, while a faint warm glow spreads from behind the centre of the word over 2.8 s.
4. **Hold.** 2 s. A tap, click, scroll or key ends the hold at once.
5. **Fall.** The rows let go from the bottom up, 160 ms apart. Each block drops in 0.9 s and shrinks into its place in one solid line of all 64 blocks along the bottom of the screen.
6. **Word.** As each row lets go, MAZO in a plain bold font is uncovered behind it.
7. **Curtain.** The line rises like a curtain, the whole scene lifting with it, and the site is underneath.

## Sound

The sounds are synthesized in the page, with no audio files, and stay silent until the visitor's first tap or key: a tick when a pull turns a corner, a dull knock on a locked letter, a slide when a letter comes free, a wooden note as each letter lands in the title (rising M, A, Z, O), a chime as the sweep lights each letter, a click and a ring as the light seats in the O, a soft rumble for each row that lets go, and light pips as blocks land in the line.

## Testing it

Testers use a public test page. Every build carries a robots noindex tag and a strict Content-Security-Policy that allows only the page's own files and makes no network requests. Opening the page with `#debug` shows a short event log on screen, for phones without developer tools. It was checked on desktop and on an iPhone: every phase plays, the curtain rises, and sound starts after a tap. The target for the next round of tuning is unlocking in 20 to 45 seconds for a first-time visitor, with 9 in 10 under 90 seconds.

## What's next

Three to five testers tune the numbers above. Then two or three materials side by side, and one is chosen. Then the finish: after the blocks fall, the MAZO word shrinks into the site's header as its mark.
