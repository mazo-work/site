# STATE: v4 progress (the source of truth; read BRIEF.md §0 first)

Resume rule: start at the first unticked unit. Never redo a ticked unit.

| Unit | Done | Commit | Turns | Files | Notes |
|---|---|---|---|---|---|
| U0 baseline | [x] | a15ed3d | 17 | 1 | `npm run check` as inherited: 55 checks, 55 passed, 0 pending, 0 failed (73 s). 15 of the 17 turns were the one-time read of §0's inputs and the install. |
| U1 skeleton | [x] | 9d92285 | 46 | 29 | One header on every page (utility row: Replay, Pause motion, mask toggle Paper · Night; masthead: the mark, large on Home, small elsewhere, and the name; menu band: five rooms), footer (name · [JON: region], Colophon), Ask. Masks are `paper` and `night`; Profile parked. New check `skeleton.*` (4); `switcher.*` rewritten. 59 pass. 7 of the 46 turns were the one-time read of the mocks. |
| U2 rooms | [x] | dc6c73c | 7 | 10 | Uses is a section of Now (`/now/#uses`); `public/_redirects` 301s `/uses`, `/uses/` and `/uses.md`; the local test server applies `_redirects`; the Colophon is linked from the footer only; llms.txt lists Uses as a section of Now, the sitemap drops /uses/. New check `rooms.*` (2). 61 pass. |
| U3 type | [x] | 7978e7c | 18 | 24 | Atkinson Hyperlegible Next for body text in both masks; Paper: IM FELL English and SC, served renamed "Mazo Paper" and "Mazo Paper SC" (their licence reserves the name; `tools/fonts/rename.py`); Night: Doto and Martian Mono. Profile's faces parked (files kept, declared nowhere). Paper 208.7 KB, Night 52.0 KB, reported. `fonts.*` rewritten (6). 63 pass. |
| U4 Paper | [ ] | | 19 | 19 | Paper to the mocks on every page: off-register display type, IM FELL titles and small-capital labels, Atkinson text; Home (headline, Jon's lines, latest project and note), About (the mocks' frame, portrait in a side column), For recruiters (side column), one 660 px measure for reading. Shared page geometry in `pages.css`; `Teaser` component. Design-log entry. 63 pass. |
| U5 Night | [ ] | | | | |
| U5b the puzzle in both masks | [ ] | | | | |
| U6 the ring | [ ] | | | | |
| U7 entering an orb | [ ] | | | | |
| U8 the parakeet | [ ] | | | | |
| U9 the portrait | [ ] | | | | |
| U10 pause motion | [ ] | | | | |
| U11 measure and screenshots | [ ] | | | | |
| U12 HANDOFF.md | [ ] | | | | |

## Budget

- Units done: 4 of 14 · turns so far: 88 · average turns per unit: 22 (12.5 over U2 and U3) · estimated turns left: 10 units × about 18 = 180
- Wall clock: session started 2026-11-23 08:05 UTC; U0 done 08:11; U1 08:24; U2 08:27; U3 08:35.
- Last updated: 2026-11-23 08:47 UTC, during U4.

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
