# STATE: v4 progress (the source of truth; read BRIEF.md §0 first)

Resume rule: start at the first unticked unit. Never redo a ticked unit.

| Unit | Done | Commit | Turns | Files | Notes |
|---|---|---|---|---|---|
| U0 baseline | [x] | a15ed3d | 17 | 1 | `npm run check` as inherited: 55 checks, 55 passed, 0 pending, 0 failed (73 s). 15 of the 17 turns were the one-time read of §0's inputs and the install. |
| U1 skeleton | [x] | 9d92285 | 46 | 29 | One header on every page (utility row: Replay, Pause motion, mask toggle Paper · Night; masthead: the mark, large on Home, small elsewhere, and the name; menu band: five rooms), footer (name · [JON: region], Colophon), Ask. Masks are `paper` and `night`; Profile parked. New check `skeleton.*` (4); `switcher.*` rewritten. 59 pass. 7 of the 46 turns were the one-time read of the mocks. |
| U2 rooms | [ ] | | 7 | 10 | Uses is a section of Now (`/now/#uses`); `public/_redirects` 301s `/uses`, `/uses/` and `/uses.md`; the local test server applies `_redirects`; the Colophon is linked from the footer only; llms.txt lists Uses as a section of Now, the sitemap drops /uses/. New check `rooms.*` (2). 61 pass. |
| U3 type | [ ] | | | | |
| U4 Paper | [ ] | | | | |
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

- Units done: 2 of 14 · turns so far: 63 · average turns per unit: 31.5 (U0 and U1 carried the one-time reading) · estimated turns left: 12 units × about 20 = 240
- Wall clock: session started 2026-11-23 08:05 UTC; U0 done 08:11; U1 08:24.
- Last updated: 2026-11-23 08:27 UTC, during U2.

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
