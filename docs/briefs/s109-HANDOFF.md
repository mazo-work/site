# S109 HANDOFF: v4's verified fixes and the reduced-motion design

Written at the end of one Claude Code cloud session (2026-11-27, from 04:04 UTC; its worker restarted once, before
any work was written, with nothing lost) that worked through `docs/briefs/s109-BRIEF.md` unit by unit on
`s109-fixes`. `docs/briefs/s109-STATE.md` holds the unit table, the turns, every decision and every planted control as
it was made; this file summarises them in the brief's seven sections. Nothing was merged, no pull request was opened,
and nothing was pushed anywhere but `s109-fixes`.

## 1. SCOPE

**Asked:** the 18 items of the brief's §3, in units U1 to U4, then this handoff and the manifest (U5); no content or
copy change, no dependency, nothing from carry-register 11.158, 11.159 or 11.162.

**Done:** all 18 items, in five units.

| Unit | Commits | What changed |
|---|---|---|
| U1 WebGL lifecycle (1–6) | 725202f, c11e449, 77c804b | `src/entrance/puzzle.js`: the shared block geometry is never disposed (C1); a Replay disposes each letter's material and `InstancedMesh` (C2); the `RoomEnvironment` and `PMREMGenerator` are freed once the map exists (C3); the halo takes the mask's opacity, so Paper's is 0.16 (C4); Skip does nothing once the curtain is lifting (C10); the four timers that act on puzzle state go through `later()` and are cleared by `load()` and `jumpToEnd()` (P2). c11e449 and 77c804b fixed the new check's timing for slower CI runners. |
| U2 UI races (7–10) | f8e1e1d | P1 reproduced, then fixed: the sound button reads whether the sound was running when the press began. Phone ring dots take no pointer events (C7). One `orb-entry` name at a time (C8). Only the latest mask transition removes `theme-switching` (C9). |
| U3 reduced motion (11–14) | 8ee6184 | `HONOR_RM = true`; the curtain is `rise`, or under reduce motion `fade` (Paper) or `scan` (Night: six bands, 720 ms); without cross-document view transitions both fade the stage (0.45 s). New `src/styles/reduced.css`: under reduce motion and under Pause motion, a page change is one 250 ms opacity cross-fade. The head rests when motion is paused. Root `BRIEF.md`'s motion rule, `docs/puzzle-spec.md` (v0.5) and the code comments say what changed and that the operator adopted it at S108. |
| U4 build and dead weight (15–18) | 14ab860 | `package.json`'s three Astro scripts set the variable from Node, not the shell (C6). The test hook and the debug HUD exist only when `PUBLIC_MAZO_TEST=1`, set only by `tools/check/run.mjs` (C5). `night.css`: the `th` weight 600 and the first `a:hover` removed (C11, C12). |
| U5 handoff | this commit and the next | This file; `MANIFEST.sha256` at the tip. |

New checks: `entrance.lifecycle`, `races.sound`, `races.phone-dots`, `races.entry-name`, `races.theme-toggle`,
`reduced.entrance`, `reduced.curtain`, `reduced.pages`, `reduced.head`, `production.surfaces`, `production.scripts`
(11). One check changed: `motion.transitions` (§3 below).

## 2. CROSSING

- **Branch:** `s109-fixes`, from `v4` at `d7a9e5b` plus the brief (`fed5844`). The session's default `claude/…` branch
  was not used: the operator named `s109-fixes`.
- **To verify:** check out the tip, `npm ci --ignore-scripts`, `python3 tools/burr/check.py`, `npm run check`
  (89 checks). The manifest: `git ls-files | grep -vx MANIFEST.sha256 | xargs -d '\n' sha256sum | diff - MANIFEST.sha256 && echo identical`.
- **CI:** `check.yml` runs on pushes to `v3` and `v4` only, so each unit was run by `workflow_dispatch` on
  `s109-fixes` (through the GitHub connector: the `gh` CLI is limited to search in this environment). Run ids are in
  STATE's table and in §3.
- **Merging is the main seat's.** A merge into `v4` deploys. Nothing here changes `.github/`, `src/content/`, page
  text, any `[JON: …]` slot, `prototype/` or `handoff/`.
- **The production build is now different from the check's build.** `npm run build` (what a deploy runs) has no test
  hook and no debug HUD; `npm run check` builds with `PUBLIC_MAZO_TEST=1`, so `dist/` after a check run carries both
  and must not be deployed by hand. `tools/entrance-screens.mjs` reads the hook, so it now needs the check's build.

## 3. MEASURED

**Checks.** v4's baseline here: 78 checks, 78 passed (133 s). After each unit: U1 79 of 79; U2 83 of 83; U3 87 of 87;
U4 89 of 89; at the handoff 89 of 89 (stated in STATE as each unit was ticked). `python3 tools/burr/check.py`: both
designs PASS every time. Every change to the count is a new check named in §1; none was removed or weakened.

**The changed check.** `motion.transitions` asserted that, with motion paused, a page change still runs its view
transition. Item 14 changes that behaviour, so it now also asserts that every running view-transition animation
animates opacity alone and lasts at most 300 ms (the site uses 250 ms). On the U2 tree it fails with 30 problems
(Paper's slide, Night's collapse, the mark's and the bird's flight); on the U3 tree it passes.

**CI** (`check.yml` by `workflow_dispatch` on `s109-fixes`):

| Unit | Run | Head | Result |
|---|---|---|---|
| U1 | 45940620136 | 725202f | failure: `entrance.lifecycle`, the new check's own timing (fixed in c11e449) |
| U1 | 45941681583 | c11e449 | success |
| U2 | 45942679694 | 5ebd8c5 (carries f8e1e1d) | success |
| U3 | 45943362330 | b1181e9 (carries 8ee6184) | success |
| U4 | 45944241521 | 6bce06a (carries 14ab860) | failure: `entrance.lifecycle` in Night, the check's timing again; every U4 check passed (fixed in 77c804b) |
| U4, U5 | dispatched on the manifest commit | tip | reported in the closing message (recording it here would change the manifested tree) |

**Planted controls** (each new assertion run against the code it guards, unfixed):
- `entrance.lifecycle` on `d7a9e5b`'s `puzzle.js` plus only the hook's additions: 26 problems: Paper's halo 0.22;
  five row timers left pending by a Replay in both masks; live WebGL buffers growing by 4 a round; the shared
  geometry disposed 11 times; 2 textures at the start; Skip during the lift taking the phase from `lift` to `done`. A
  second control (a letter hidden and an error thrown on a shape switch) fails "every letter drawn" and the error
  capture.
- `races.*` on U1's tree: all four fail (the first press mutes; all five phone dots open their rooms; two `orb-entry`
  names; `theme-switching` removed twice while the last transition ran).
- `reduced.*` and `motion.transitions` on U2's `src/`: `motion.transitions` 30, `reduced.curtain` 22, `reduced.pages`
  and `reduced.head` fail; `reduced.entrance`, with the U3 file and `HONOR_RM = false`: the spin (about 0.11 rad in
  1.2 s) and the drift (about 0.45 rad).
- `production.*` on U3's `src/` and `package.json`: `__mazo` in the production puzzle chunk, the HUD on the entrance,
  and the three POSIX-style scripts.

**P1, the sound race,** reproduced before the fix: on a fresh entrance a mouse click on "Click for sound", and Enter
on the focused button, each ended "Sound off" with `mazo-sound=off`; a slow press (150 ms down to up) did not.

**What the brief's measure missed.** `renderer.info.memory` geometries and textures stay flat on `d7a9e5b` too: the
renderer counts `BufferGeometry` objects, and the letters leaked their `InstancedMesh` buffers. The check also counts
live WebGL buffers and textures (in the check's browser only), which is where the leak shows.

**Sizes** (production builds, `d7a9e5b` against the tip; bytes, then gzip -9):

| File | `d7a9e5b` | tip |
|---|---|---|
| puzzle chunk | 512,757 / 130,962 | 511,601 / 130,471 (the hook is gone) |
| `Base.css` | 38,164 / 8,362 | 40,388 / 8,623 (`reduced.css` and the scan) |
| the entrance's HTML | 6,373 / 2,391 | 6,262 / 2,369 (the HUD is gone) |
| Home's HTML | 10,907 / 3,322 | 10,907 / 3,323 |
| the whole `dist/` | 1,246,523 | 1,247,798 |

**Pictures** (`docs/briefs/s109-screens/`): both reduced curtains (the puzzle before Skip, then four frames of each,
sampled by pausing the transition and stepping its time); Night's tables and links before and after U4. Measured
there: `th` weight 600 before, 400 after (Martian Mono ships 400 only, so it rendered at 400 both times); `a:hover`
green before and after. Links at rest and hovered, and MAZO's table, are byte-identical. The Colophon's table differs
only inside its size columns, which print the build's own page weights; this run made the CSS and the entrance
smaller, so a few rows moved by 0.1 kB.

**Secrets.** gitleaks is not installed here, and fetching it would break the brief's network rule, so the gitleaks
pass is **[UNVERIFIED]**. In its place: the repository's own `secrets.*` and `secrets-in-walls.*` checks pass; a
scan with gitleaks-style patterns over the tree and every added line of the history (108 commits reachable locally)
found only five false positives, the crawler table's `token:` user-agent names in `src/data/crawlers.ts`.

## 4. CLAIMS

Each claim says how it was established.
- **Measured here** (Playwright with the container's Chromium, and the planted controls above): every item's
  acceptance in the brief's §4, in both masks, except the two below.
- **[UNVERIFIED] Windows shells.** The scripts were run under bash only: `npm run build` exits 0, `npm run preview`
  serves Home, and the same Node program shows the child gets `ASTRO_TELEMETRY_DISABLED=1`, the script's arguments and
  its exit code. That `cmd.exe` and PowerShell pass the program unchanged is reasoned from their quoting (double
  quotes outside, single inside, no `$ % ! ^ & | < >`), not run.
- **[UNVERIFIED] gitleaks**, as in §3.
- **Real devices.** Everything was measured in headless Chromium with software WebGL. P1's fix follows the order of
  events in the spec (capture listeners run before the button's own); iOS Safari's audio start was not tested here.
- **WCAG 2.3.1** for Night's scan is reasoned, not measured: each band changes once (hidden to shown) while the scene
  fades evenly, so no area flashes.

## 5. MISSES

- **The first CI run of U1 failed** on the new check, not the site: the check waited three frames between Skip and
  Replay, which on the slower runner outlasted the curtain's 650 ms wait, so the page navigated. Fixed in c11e449
  (both one frame apart, inside the page); both controls re-run and still fail as before. U4's run then failed the same
  way in Night (one frame was still too long once), though every U4 check passed; 77c804b does Skip and Replay in one task
  and reports, instead of dying on, any navigation to Home; the control re-run gives the same 26 problems.
- **Screenshots outside the write list.** U3's acceptance asks for screenshots of both curtains and U4's for Night's
  tables and links, but the brief's write list has no place for pictures and `handoff/` must not change. They are in
  `docs/briefs/s109-screens/` (22 files, 968 KB), beside STATE and this file. The two scripts that made them stayed in
  the session's scratch space (`tools/` beyond `tools/check/` is outside the write list).
- **The spec described a hold the code never gives.** P0's reduced version, now live under reduce motion, has no hold:
  `finale()` runs `clickIn(true)`, whose `startHold(true)` waits 0 ms, so the 1.5 s `RM` hold is never reached, and
  the fall then plays at its usual pace. The spec now describes the code; the code is P0's and was not changed.
- **Two dev buttons left in place.** The item names `#debug`; the Shape and Letter colors buttons are not named and
  stay in the markup, but they only showed through `#debug:target`, so in production they can no longer be shown.
- **The bird's appearance** after a reduced curtain is opacity only (it grew from 0.4 before), read as part of item
  12's "zero transform movement". With the curtain rising it grows as before.
- **The boot script** was left byte-stable: it already copies any `mazo-curtain` value into `data-curtain`, and the CSS
  reads `rise`, `fade` and `scan`.

## 6. ATTACHED

- `docs/briefs/s109-STATE.md`: the units, turns, decisions, controls, CI runs.
- `docs/briefs/s109-screens/`: `curtain-paper-*.jpg`, `curtain-night-*.jpg` (the reduced curtains);
  `night-table-*-{before,after}.png`, `night-link-*-{rest,hover}-{before,after}.png` (U4, half size).
- New checks: `tools/check/checks/66-races.mjs`, `67-reduced.mjs`, `68-production.mjs`; `entrance.lifecycle` in
  `52-entrance.mjs`; `motion.transitions` in `65-motion.mjs`.
- New stylesheet: `src/styles/reduced.css` (imported last in `src/layouts/Base.astro`).
- `MANIFEST.sha256`, regenerated at the tip.

## 7. OPEN AT HANDOFF

**Not in this run (the brief's report-only list):**
- Carry-register **11.158, 11.159 and 11.162**: gated on the content; untouched.
- **`profile.css` and `prototype/p0/`:** parked by v4's own rulings; untouched.
- **The readability pass on `puzzle.js`:** the review's claim was made on an older file and stays unverified on
  `d7a9e5b`; not attempted. This run added comments marked `s109` at every change.
- **`@astrojs/markdown-satteri`:** in use (`astro.config.mjs` 4 and 26); kept.

**For the main seat:**
- Run `npm run check` (or `PUBLIC_MAZO_TEST=1 npm run build`) before `tools/entrance-screens.mjs`, which needs the
  test hook.
- Root `BRIEF.md` §7 still lists "an automatic Reduce Motion version that still feels right" in the backlog; this run
  built one. Only the motion rule (item 14) was in this run's write list, so the backlog line was left.
- Decide whether the Shape and Letter colors buttons should also go from production (see §5).
- Try the three scripts once in a native Windows shell, and P1 on an iPhone (see §4).
- Run gitleaks over the tree and the history where it is installed (see §3).
