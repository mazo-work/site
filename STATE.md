# STATE: v4 progress (the source of truth; read BRIEF.md §0 first)

Resume rule: start at the first unticked unit. Never redo a ticked unit.

| Unit | Done | Commit | Turns | Files | Notes |
|---|---|---|---|---|---|
| U0 baseline | [x] | a15ed3d | 17 | 1 | `npm run check` as inherited: 55 checks, 55 passed, 0 pending, 0 failed (73 s). 15 of the 17 turns were the one-time read of §0's inputs and the install. |
| U1 skeleton | [x] | 9d92285 | 46 | 29 | One header on every page (utility row: Replay, Pause motion, mask toggle Paper · Night; masthead: the mark, large on Home, small elsewhere, and the name; menu band: five rooms), footer (name · [JON: region], Colophon), Ask. Masks are `paper` and `night`; Profile parked. New check `skeleton.*` (4); `switcher.*` rewritten. 59 pass. 7 of the 46 turns were the one-time read of the mocks. |
| U2 rooms | [x] | dc6c73c | 7 | 10 | Uses is a section of Now (`/now/#uses`); `public/_redirects` 301s `/uses`, `/uses/` and `/uses.md`; the local test server applies `_redirects`; the Colophon is linked from the footer only; llms.txt lists Uses as a section of Now, the sitemap drops /uses/. New check `rooms.*` (2). 61 pass. |
| U3 type | [x] | 7978e7c | 18 | 24 | Atkinson Hyperlegible Next for body text in both masks; Paper: IM FELL English and SC, served renamed "Mazo Paper" and "Mazo Paper SC" (their licence reserves the name; `tools/fonts/rename.py`); Night: Doto and Martian Mono. Profile's faces parked (files kept, declared nowhere). Paper 208.7 KB, Night 52.0 KB, reported. `fonts.*` rewritten (6). 63 pass. |
| U4 Paper | [x] | 3ec576c | 19 | 19 | Paper to the mocks on every page: off-register display type, IM FELL titles and small-capital labels, Atkinson text; Home (headline, Jon's lines, latest project and note), About (the mocks' frame, portrait in a side column), For recruiters (side column), one 660 px measure for reading. Shared page geometry in `pages.css`; `Teaser` component. Design-log entry. 63 pass. |
| U5 Night | [x] | 2d8b318 | 15 | 12 | Night to the mocks on every page: Doto display headlines, Atkinson 600 titles, Martian Mono capitals for labels; purple rules and underlines, green hover and focus; Home in three columns; the portrait as an X-ray in a round window with a ring and a scanning line. New check `layout.fit` (every page, both masks, phone and desktop: no sideways scroll, no headline spilling). Design-log entry. 64 pass. |
| U5b the puzzle in both masks | [x] | bef1afd | 13 | 18 | The puzzle wears the mask in force when it starts, colours only (one `PALETTES` table in `puzzle.js`, 20 edits marked v4; per-mask stage variables in `entrance.css`). Night: P0 recoloured, light effects in orange. Paper: a transparent canvas over the paper and grain, ink and red with tints, glows printed as red halftone dots. The entrance check solves and skips in both masks and checks that the word and the light land in Home's mark in the same colours. 12 entrance screenshots (`tools/entrance-screens.mjs`). 64 pass. |
| U6 the ring | [x] | 8f102a6 | 12 | 12 | `Ring.astro` (a nav of the five rooms) under the band on Home; transforms and opacity only (squashed plane, turning arm, counter-turn); one turn in 90 s (60 s on a phone); depth on the dots; holds still under the pointer, with focus inside, and with Pause motion. Night: the mock's wireframe; Paper: printed (ink orbit, ink dots turning red, a halftone sphere). A picture on a phone. New check `ring.*` (3); `layout.fit` adds 1024 px. 67 pass. |
| U7 entering an orb | [ ] | | 13 | 35 | A cross-document view transition: the clicked dot and the room's main share `orb-entry`; a veil floods out from the orb as a growing circle (Paper ink; Night dark with a purple rim), the main opens out of the orb as a window of the mask's ground, the flood clears. The boot script marks the page only where cross-document view transitions exist, and unmarks it when the transition ends; the menu band keeps v3's transitions. New check `entry.*` (3). Frames in `handoff/orb-entry/` (`tools/entry-frames.mjs`). 70 pass. |
| U8 the parakeet | [ ] | | | | |
| U9 the portrait | [ ] | | | | |
| U10 pause motion | [ ] | | | | |
| U11 measure and screenshots | [ ] | | | | |
| U12 HANDOFF.md | [ ] | | | | |

## Budget

- Units done: 8 of 14 · turns so far: 147 · average turns per unit: 18.4 (14.2 over U2 to U6) · estimated turns left: 6 units × about 15 = 90
- Wall clock (read from `date`): session started 2026-11-23 08:05 UTC; U0 done 08:11; U1 about 08:23; U2 about 08:26; U3 about 08:33; U4 08:41; U5 08:49; U5b 09:00; U6 09:12; U7 09:22.
- Last updated: 2026-11-23 09:22 UTC, during U7.

## Checks not yet expected to pass

(`npm run check` reads the lines below, as in v3: a failing check listed here as "- `check.id` why (lands in Un)"
prints as PENDING instead of failing the run; each line is removed when its unit lands.)

(none)

## Log

(one line per event: a resume, a failing check fixed in a ticked unit, a unit split, a stop for budget, a decision
where the brief is silent)

- 2026-11-23 08:05 UTC · session start (fresh, not a resume). Working branch is `v4`, as the brief says; following
  v3's precedent, the cloud session's default branch (`claude/…`) is not used. Nothing is pushed anywhere but `v4`.
- U0 · baseline: Node 22.23.5, npm 10.9.9, `npm ci` from the lockfile (347 packages, 0 vulnerabilities reported);
  `npm run check`: 55 checks, 55 passed, 0 pending, 0 failed, 73 s. The inherited branch is v3's tip plus the brief,
  the mocks and the photo; nothing in `src/` has changed since v3, so the baseline is v3's.
- U0 · decision: `STATE.md` keeps v3's "Checks not yet expected to pass" section (empty), because `npm run check`
  reads it; a check written ahead of its feature can be listed there with the unit it lands in.
- U0 · decision: a "turn" is one of my tool-calling responses, counted per unit, as v3 counted them.
- U1 · decision: the masks are named in code as the brief names them: `data-theme="paper"` and `"night"` (v3's
  `editorial` and `terminal`), in `themes/paper.css` and `themes/night.css` (git renames). A stored v3 name, or
  `profile`, falls back to the device's mask (checked). Profile's `profile.css` is kept and not imported; its font
  tokens left `fonts.css`; its faces stay declared, unused (U3 decides their place).
- U1 · decision: without JavaScript every page wears Paper, whatever the device (v3 gave a dark device a half-dark
  Paper; the masks need the boot script to be chosen).
- U1 · decision: the mask toggle stays a native radio group (v3's, accessible as it was), its legend "Mask" visible as
  in the mocks. On a phone both masks show ("Mask: Paper Night"); the phone mocks' one-word "Mask: Paper ▾" control is
  not built: two options fit, and a radio group needs no menu.
- U1 · decision: on a phone the utility row shows "Replay" and "Pause"; the rest of each name ("the intro",
  "motion") is visually hidden, not removed, so screen readers and voice control get the full names. One line at
  320 px.
- U1 · decision: Pause motion is built with the skeleton, at its basic level: a button with `aria-pressed`, the choice
  in localStorage (`mazo-motion`, no cookie; the brief says "local storage", so "for the visit" is read as across
  pages), restored before first paint by the boot script (new hash in `_headers`), and one CSS rule that pauses every
  animation (`animation-play-state`), which leaves the view transitions' pseudo-elements alone. U10 checks every loop.
- U1 · decision: the Ask button shows "Ask" and is named "Ask the assistant" (the rest visually hidden), so its name
  starts with what it shows; 68 px on a desktop, 60 px on a phone, the same place in both masks (the mocks).
- U1 · decision: the mark links to Home on every page, Home included (there it carries `aria-current="page"`).
- U1 · found: the mocks' LED pattern cuts the dots of A and O in half (those letters start on odd units); the mark now
  draws A and O as their own path with a pattern shifted one unit, so every block is one whole dot.
- U1 · decision: the band and the toggle never move: the skeleton's heights are fixed (utility row 54 px, band 60 px;
  on a phone 48 px and two rows of 44 px), so type changes between masks cannot shift them. The new check
  `skeleton.still` measures the utility row, the toggle's right edge, the mark, the band, the page's top and the Ask
  button in both masks on /home/ and /about/, desktop and phone (within 1 px).
- U1 · decision: Night's v3 chromatic fringe on headings and its glowing link hover went now, not in U5: v4 bans both.
- U1 · decision: until U2 moves Uses into Now, Home keeps a link to /uses/ so every page stays two clicks away.
- U2 · decision: Uses sits at the end of Now under `## Uses` (its heading's id, `uses`, is the redirect's target),
  its old sections one level down; v3's "This site" line, which linked the Colophon, is dropped (the Colophon is reached
  from the footer only). The old Markdown twin `/uses.md` also 301s, to `/now.md`.
- U2 · unverified: that Cloudflare Pages keeps the `#uses` fragment of a `_redirects` destination in its `Location`
  header (the local server does); the handoff's runbook step checks it with `curl -sI`.
- U2 · decision: llms.txt lists "Uses" as its own line pointing at `/now.md#uses`, under Now, so agents that look for
  Uses by name find it. JSON-LD needed no change (no page carried /uses/).
- U3 · found: IM FELL's reserved names are in each font's own copyright notice (name ID 0: "With Reserved Font Name IM
  FELL English Roman", "… Italic", "… SC"); Fontsource's licence file only says "Google Inc.". Doto, Atkinson
  Hyperlegible Next and Martian Mono declare no reserved name, so they keep their names, as in v3.
- U3 · decision: IM FELL is served as Fontsource's Latin subset (a Modified Version), renamed "Mazo Paper" and "Mazo
  Paper SC" (no part of the reserved names) by `tools/fonts/rename.py` (fontTools 4.60.1, brotli 1.1.0, called by
  `tools/fonts/fetch.mjs`): only the shown names change (IDs 1, 3, 4, 6, 16, 17, 21, 22); the copyright notice, the
  licence and the glyphs are the originals; ID 10 says what was done. Each renamed family's `OFL.txt` starts with the
  font's own notices; the colophon names both names. The check `fonts.rfn` reads the served files' name tables (a
  small WOFF2 reader, Node's brotli) and fails on a reserved name; tested against the unrenamed file.
- U3 · decision: faces: Atkinson 400, 400 italic, 600 (the mocks' bold is 600; v3's 700 dropped); IM FELL English 400
  and 400 italic; IM FELL English SC 400; Doto 800 (the mocks' weight); Martian Mono 400 (v3's 700 dropped).
  `font-synthesis: none`, so no face is faked bold or italic.
- U3 · decision: three families per mask is the brief's own choice, so v3's "at most two families, about 60-80 KB"
  check becomes "exactly the brief's families"; sizes are reported (v4: no size budget). Paper's IM FELL faces weigh
  about 58 KB each (detailed outlines), so Paper's fonts are 208.7 KB against Night's 52.0 KB: for U11's report and
  the performance session.
- U3 · decision: Literata and Libre Franklin (v3's Editorial) are retired. Profile's Bungee Shade and Nunito are
  `parked` in fonts.json: their files and licences stay in public/fonts/, no @font-face declares them (checked), and
  the colophon lists only the active families.
- U3 · decision: Night sets h1 and h2 in Doto 800 (the brief: Doto for headings) and h3 in Atkinson 600, so small
  titles stay legible; Paper's labels are its small capitals as drawn, with no forced uppercase.
- U4 · decision: Home is the mocks' Home: the headline "A child of the internet.", a `[JON: …]` slot for Jon's lines,
  and teasers for the latest project and the latest note. The headline is the one line in the mocks that is not a
  slot and not v2's ("Hi, I'm Jonathan Mazo" left with the masthead now carrying the name); it is kept as the mocks
  set it, in `src/data/site.ts`, and listed for Jon to confirm or replace. v3's lists of rooms, projects and notes left
  Home: the menu band (and U6's ring) carry the rooms.
- U4 · decision: About takes the mocks' frame: four beats whose notes follow the mocks (beat 2 "out of reach", 3
  "self-taught", 4 "advertising"), a pulled line between the second and the third, and a closing line ("the tools
  caught up", v3's beat 4); the lede drops "region" (the footer carries it). The beats keep their ids, so the story
  fragments still land.
- U4 · decision: teasers (Home, Projects, Lab notes) are a label, a heading with the link, and a line; the link's
  `::after` makes the whole block the target, so screen readers hear a short name and find the title by heading.
- U4 · decision: the off-register print is the words a second time in `data-text`, drawn by Paper's `::before` in
  riso red (`content: attr(data-text) / ""`, so screen readers skip it, and the Markdown twins never see it).
- U4 · decision: v3 Editorial's margin column for headings is gone: the mocks stack headings over one measure (660 px).
- U4 · check changed: `pages.reach` measured two clicks from every page, the entrance included, which rested on v3's
  Home listing everything. v4's Home is the mocks' (the latest project and note), so from the entrance, whose way in
  is Skip intro, the check now asks for Home in one click; every other page still reaches every page in two (the
  menu band, then a room's list). Listed for the handoff.
- U4 · note: between U4 and U5, Night's page styles are v3 Terminal's on v4's markup: readable, not designed. U5
  rewrites them.
- U5 · decision: Night's section titles (h2, h3) are Atkinson Hyperlegible Next 600, as the mocks set them; Doto is
  for the display headlines and the name (this refines U3's Doto h2: Doto at 24-30 px reads poorly).
- U5 · decision: one job per accent, as the brief assigns them: the mocks' green and orange teaser labels are the
  label grey here; links turn green on hover (the brief: green for hover), the band keeps its purple underline for here
  and hover (the brief's one treatment per mask).
- U5 · decision: no glow on text or lines: the mock's purple glow behind About's headline and the glow under the
  portrait's scan line were not built (v4 bans glow blobs and halos). The LED mark keeps its 2 px halo.
- U5 · decision: v3 Terminal's winks (`##` before headings, `./` before rooms, `~/path`, `[01]`) are gone: the mocks
  show none, and `[01]` is numbering.
- U5 · decision: the portrait's ring, ticks and scan line are decorative markup in `Portrait.astro`, shown by Night
  and hidden by Paper; the scan is a 7 s loop, so Pause motion stops it. The X-ray's colour waits for U9.
- U5 · decision: a display title with a word of nine letters or more takes a smaller size in Night (Doto is wide and
  monospaced), so "recruiters" fits its column while short titles keep the mocks' 140 px. New check `layout.fit`.
- U5 · fix: a Night rule that coloured every h2 near-white also hit the assistant panel's title (light on light;
  axe caught it in `chatbot.a11y`); heading colour is scoped to the page's main.
- U5b · decision: the puzzle reads the mask from `<html data-theme>` once, when it starts (the boot script has set
  it before first paint), and takes one palette from `PALETTES` in `puzzle.js`; P0's colour names (BASE, COLORS,
  WHITE, DIM_WHITE, GLOW_WHITE) stay and take the palette's values, so the logic reads as P0's. 54 lines added, 22
  removed, every edit marked v4.
- U5b · decision: Paper's letters: M ink `#1B1816`, A riso red `#E5484D`, Z an ink tint `#9C948A`, O a red tint
  `#F2A19C`: two inks, each full and tinted, so the four differ in lightness as well as hue (for colour-blind eyes).
  Night's: M orange, A green, Z purple, O the text colour `#DAD6F0`, as the brief says.
- U5b · decision (the brief's "your call"): Paper prints its glows. The glow that rises behind the word is drawn as
  riso-red halftone dots that shrink away from the centre (normal blending, so it prints on cream); the light's halo
  is a flat red wash; the letters' emissive glows are off (their emissive colour is black), so the sweep prints each
  letter red as the light passes and they settle in ink. The hint pulse stays a faint red, so "the one that glows"
  is still true in Paper.
- U5b · decision: the canvas is transparent in Paper (`alpha`, clear colour at 0 alpha, no scene background) so the
  paper and its grain show behind the puzzle; the curtain's still picture is then the page with its paper.
- U5b · decision: the light block settles in the light's colour (Paper red, Night orange) where P0 dimmed it with the
  letters, so the light, like the word's ink, lands in Home's mark unchanged (the brief's rule). A colour, not a step:
  the timings and the sequence are P0's.
- U5b · decision: the stage's text, buttons, pressed state, card and focus ring are per-mask CSS variables (Night
  `#DAD6F0` / green focus; Paper ink / `#B0301B` focus), all at 4.5:1 or more (axe runs on the entrance's controls in
  both masks); the hint arrow now strokes `currentColor`, the focus colour. In Night the still mark shown while the
  puzzle loads is the LED panel. The test hook `window.__mazo.state()` also reports the mask, the letters' colours,
  the word's ink and the light's colour (read-only).
- U5b · decision: `tools/entrance-screens.mjs` captures the puzzle, the hold and the word in each mask, phone and
  desktop at 2x, as WebP; it holds Home's response so the curtain cannot take the page away mid-shot.
- U6 · decision: the orbit is transforms only: each orb's plane is squashed to the ellipse (scaleY 0.32), an arm turns
  in it, the orb sits at the arm's end and turns back and unsquashes, so it stays round and upright (no motion path,
  which would animate `offset-distance`). Sizes are container units, so the drawing scales with its column. The orbs
  never cross the sphere (the orbit's half-height is larger than the sphere's radius), so no stacking is needed.
- U6 · decision: a room's name is centred under its dot, not to its right as in the mocks: on the right, "For
  recruiters" reaches about 150 px past its orb and would leave the frame on any desktop narrower than about 1400 px
  (found by reasoning, then guarded: `layout.fit` now also runs at 1024 px).
- U6 · decision: depth (the mocks: scale 1.1 to 0.74, opacity 1 to 0.45, front to back) moves the dots only; the
  names keep their size and dim to 0.68 at most, so they stay above 4.5:1 in both masks.
- U6 · decision: on a phone the links are hidden (`visibility`, so out of the tab order and the accessibility tree)
  and their names removed from layout; the dots orbit, one turn in 60 s (the phone mock). The band is the navigation.
- U6 · decision: Night's sphere is the mock's wireframe on a flat dark disc, without the mock's radial gradient and
  without the glow on the core (the brief: no glowing gradient orbs); its meridians turn (10 s, transform only).
  Paper's sphere is a halftone print: 805 dots on a 45° screen, their area following the shade of a sphere lit from
  the top left (`tools/ring/halftone-sphere.mjs` writes `public/ring/halftone-sphere.svg`, 45.8 KB, 8.4 KB gzip),
  used as a mask so the dots take Paper's ink. The core is the mark's light and blinks in step with it.
- U6 · decision: the orbit and its outer ring are rounded boxes (`border-radius: 50%`, annotated), the outer one
  dotted (CSS cannot draw the mock's 2-and-10 dashes). The ring's landmark is named "Rooms, in orbit" (a functional
  label, listed for Jon). The ring is part of Home's main, so Home's Markdown twin lists the five rooms.
- U7 · decision: how the destination knows it was entered from an orb: the ring's click handler leaves a note in
  sessionStorage (the room, where the orb was on screen, and when) and names the clicked dot `orb-entry`; the boot
  script reads the note before first paint and, only if it is for this page, under 10 s old, and the browser has
  cross-document view transitions (`onpagereveal`), sets `data-entry="orb"` and `--entry-x`/`--entry-y` (CSSOM, which
  the CSP allows), then removes the mark when the transition finishes or at once if none runs. New boot hash.
- U7 · decision: the flood is two empty, fixed veils at the end of the header (so they paint over the old page and
  under the main), shown only while the page is marked and named `entry-rim` and `entry-veil`; their circles grow from
  the orb with `clip-path` (the brief's reveal), then fade. Paper: ink, no rim. Night: a dark veil `#0B0A12` with a
  purple band 9 px ahead of it. While marked, the main carries its mask's ground, so it opens out of the orb as a
  window of paper or night (a snapshot is transparent where nothing is painted: ink text over an ink flood was
  invisible in the first take). The old page, masthead and mark hide under the flood; the new ones show as it clears.
- U7 · found: in the first take the flood cleared before the main had come out, so one recorded frame showed the
  header over empty paper; a probe of every painted frame placed it mid-transition (not a rendering glitch), and the
  retiming (flood full from 40 % to 72 %, main out from 20 % to 75 %) closed the gap.
- U7 · decision: the recording is Chrome's screencast (every painted frame) of a click on the About orb in each mask,
  ten frames kept per mask with a contact sheet (`handoff/orb-entry/`). Software rendering here paints Paper's flood
  at about 13 frames a second, so its sheet shows fewer in-between states than a real screen would.
