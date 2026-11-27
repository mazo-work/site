# S109 STATE: v4's verified fixes and the reduced-motion design (the source of truth; read s109-BRIEF.md §0 first)

Resume rule: start at the first unticked unit. Never redo a ticked one. If resumed with "resume": read §0, run
`python3 tools/burr/check.py` and `npm run check` once, continue.

| Unit | Done | Commit | Turns | Checks | CI | Notes |
|---|---|---|---|---|---|---|
| U1 WebGL lifecycle (items 1–6) | [x] | 725202f, c11e449 | 16 | 79 of 79 | green (run 45941681583, on c11e449; run 45940620136 on 725202f failed, see log) | `puzzle.js`: `disposeMesh` never disposes the shared `voxGeo` (C1); `load()` disposes each letter's material and `InstancedMesh` (C2); the `RoomEnvironment` and the `PMREMGenerator` are disposed once the map is made (C3); the halo takes `PAL.haloOpacity` (C4); `skip()` returns during `lift` and `site` too (C10); the hold, the five rows and `finishUp`'s two waits go through `later()`, and `load()`/`jumpToEnd()` clear them (P2). New check `entrance.lifecycle` (1). Test hook: `gpu()` and `state().halo`. |
| U2 UI races (items 7–10) | [x] | f8e1e1d | 10 | 83 of 83 | green (run 45942679694, on 5ebd8c5, which carries f8e1e1d) | P1 reproduced and fixed: the sound button decides from whether the sound was running when the press began (read in a capture listener ahead of the wake), not after the wake has started it. `ring.css`: on a phone the dots take no pointer events (C7). `ring.js`: every dot gives up `orb-entry` before the clicked one takes it (C8). `theme-switch.js`: only the latest transition removes `theme-switching` (C9). New check `races.*` (4). |
| U3 the reduced-motion design (items 11–14) | [x] | 8ee6184 | 20 | 87 of 87 | green (run 45943362330, on b1181e9, which carries 8ee6184) | `puzzle.js`: `HONOR_RM = true`; `CURTAIN` is `rise`, or under reduce motion `fade` (Paper) or `scan` (Night), stored in `mazo-curtain`; without cross-document view transitions both reduced curtains fade the stage (`moveStage(0, 0, 450)`). `base.css`: the scan (old fades, new revealed by `clip-path` in `steps(6, end)`, 720 ms), no group moves and the mark keeps no name under fade and scan. New `reduced.css` (imported last in `Base.astro`): under `prefers-reduced-motion: reduce` and under Pause motion, page changes are one 250 ms opacity cross-fade. `parakeet.js`: the head rests the moment Pause motion is pressed. `parakeet.css`: after a reduced curtain the bird appears without growing. Docs: root `BRIEF.md`'s motion rule, `docs/puzzle-spec.md` (v0.5), the comments at `HONOR_RM` and `CURTAIN`. New check `reduced.*` (4); `motion.transitions` changed (below). Screens: `docs/briefs/s109-screens/`. |
| U4 build and dead weight (items 15–18) | [x] | 14ab860 | 14 | 89 of 89 | see the log (dispatched on the push that carries this row) | `package.json`: `dev`, `build` and `preview` start Astro from `node -e` with `ASTRO_TELEMETRY_DISABLED` set by Node, so no shell syntax sets it (C6). `puzzle.js` and `index.astro`: `window.__mazo`, the `#debug` hash, the HUD and its button exist only when `PUBLIC_MAZO_TEST=1`, which only `tools/check/run.mjs` sets (C5). `night.css`: the `.prose th` weight 600 (C11) and the first `a:hover` (C12) removed. New check `production.*` (2). Pictures of Night's tables and links before and after in `docs/briefs/s109-screens/`. |
| U5 handoff and manifest | [ ] | | | | | |

## Budget

- Units done: 4 of 5 · turns so far: 84 · average per unit: 18 (after the 12 turns of reading and baseline).
- Estimated turns left: about 10 (U5).
- Session started 2026-11-27 04:04 UTC (read from `date`).

## Checks not yet expected to pass

(`npm run check` reads root `STATE.md`'s section of this name, not this file; nothing is listed there.)

(none)

## Changed checks (§2: a check changes only where an item changes the behaviour it asserts)

- `motion.transitions` (U3, item 14): it asserted that, with motion paused, a page change still runs view-transition
  animations. Item 14 changes that behaviour: with motion paused a page change must animate opacity only. It now also
  asserts that every running view-transition animation animates opacity alone and lasts at most 300 ms (the site uses
  250 ms). On the U2 tree it fails with 30 problems (Paper's slide, Night's collapse, the mark's and the bird's
  flight); on the U3 tree it passes. Its other assertion (transitions still play) is unchanged.
- `entrance.*` (U1): `entrance.lifecycle` added beside the existing results; `entrance.play` and the rest unchanged.

## Log

- 2026-11-27 04:04 UTC · session start (fresh). Branch `s109-fixes` from `origin/s109-fixes` (`fed5844`, the brief on
  `v4`'s `d7a9e5b`). The cloud session's default branch (`claude/…`) is not used: the operator named `s109-fixes`.
  Nothing is pushed anywhere else; no merge, no pull request.
- Baseline · Node 22.23.5, npm 10.9.9, `npm ci --ignore-scripts` from the lockfile; Playwright 1.63.0 uses the
  container's pre-installed Chromium (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`), so no browser download.
  `python3 tools/burr/check.py`: both designs PASS. `npm run check`: 78 checks, 78 passed, 0 pending, 0 failed (133 s),
  matching the brief's baseline.
- Baseline · CI: the `gh` CLI is limited to search in this environment, so `gh workflow run` is replaced by the
  GitHub connector's workflow dispatch and run listing on `check.yml` at `s109-fixes`. Where that cannot be read,
  the unit says `CI: [UNVERIFIED]`.
- 2026-11-27 04:12 UTC · the session's worker restarted once before this file was written; nothing was lost (the
  baseline had finished).
- U1 · found: the brief's measure (`renderer.info.memory` geometries and textures flat) does not catch C2: on
  `d7a9e5b` both counts stay flat over replays, because the renderer counts `BufferGeometry` objects and the letters'
  leak is their `InstancedMesh` instance buffers. The check therefore also counts live WebGL buffers and textures (a
  wrapper around `create*`/`delete*` in the check's browser, nothing in the site): on `d7a9e5b` they grow by 4 buffers
  a round (one per letter); fixed, flat. Both measures are asserted.
- U1 · found: C1 draws correctly on `d7a9e5b` (three.js re-uploads a disposed geometry still in use), so its
  assertion is that `voxGeo` is never disposed (a `dispose` listener in the test hook): 11 disposals over the ten
  rounds on `d7a9e5b`, 0 fixed. C3 is asserted as the renderer holding one texture at the start (the environment map):
  2 on `d7a9e5b` (the generator's own target), 1 fixed.
- U1 · found: P2 had no visible effect on `d7a9e5b` (every untracked timer re-checks the phase), so its assertion is
  structural: a Replay at the first frame of the fall leaves no puzzle timer pending (counted by the chunk that set
  it; the live region's 30 ms timer excluded): 5 on `d7a9e5b` (the rows), 0 fixed.
- U1 · planted controls: `d7a9e5b`'s `puzzle.js` plus only the test-hook additions: `entrance.lifecycle` fails with
  26 problems (Paper's halo 0.22, both masks' five pending row timers, live buffers growing, `voxGeo` disposed 11
  times, 2 textures at the start, Skip during the lift taking the state from `lift` to `done`). A second control
  (the fixed file with a letter hidden and an error thrown on a shape switch) fails "every letter drawn" (draws and
  triangles differ from the start) and the error capture. Skip during the lift is driven by holding Home's warm-up
  fetch in the page (not Playwright routing, which turns cross-document view transitions off).
- U1 · CI: the first run (on 725202f) failed `entrance.lifecycle` in both masks with "execution context destroyed":
  on the slower runner, the check's wait of three frames between Skip and Replay outlasted the curtain's 650 ms wait,
  so the page navigated. c11e449 does Skip and Replay one frame apart inside the page; both controls re-run and still
  fail as before; CI green.
- U2 · P1 reproduced in Playwright before the fix (`tools`-free script in the session's scratch space): on a fresh
  entrance, a mouse click on "Click for sound" ended "Sound off" (aria-pressed false, `mazo-sound=off`, audio
  suspended), and so did Enter on the focused button (the capture-phase `keydown` wake resolves before `click`); a slow
  press (150 ms between down and up) did not. Fixed as above; `races.sound` presses by click and by Enter.
- U2 · planted control: the four U2 files at their pre-U2 state (U1's tree): all four `races.*` fail (the first press
  mutes; every one of the five phone dots opens its room; two `orb-entry` names; `theme-switching` taken off twice
  while the last transition ran). Fixed: all pass.
- U2 · decision: `races.theme-toggle` presses the toggles 90 ms apart, so each change has applied while the previous
  transition still runs (pressed in the same task, `apply()` sees the old mask and returns, so only one transition
  would start).
- U3 · decision: the reduced design takes the masthead, the mark, the parakeet and a clicked dot out of the view
  transition (`view-transition-name: none`) and hides the orb's veils, so a page change is one root cross-fade; giving
  the named groups no animation instead would have drawn the old picture of each (the dot, the large header) stretched
  to the new one's box for 250 ms. `!important` because the named rules of `entry.css` and `parakeet.css` outrank a
  `(*)` selector.
- U3 · decision: the curtain modes go through the boot script unchanged: it already copies any `mazo-curtain` value
  into `data-curtain` and the CSS reads `rise`, `fade` and `scan`; changing it would change its CSP hash for nothing.
- U3 · decision: "zero transform movement" in the reduced curtains is read to include the bird's appearance after
  them (it grew from 0.4 to 1): after `fade` or `scan` it appears in the same six steps by opacity alone. With the
  curtain rising (no reduce motion) it grows as before.
- U3 · decision: the scan takes 720 ms (the brief: 650 to 800); each band changes once (hidden to shown) while the
  scene fades evenly, so no area flashes (WCAG 2.3.1 counts pairs of opposing changes in one area).
- U3 · found: the puzzle's reduced version, now live, has no hold: under reduce motion `finale()` calls `clickIn(true)`,
  which runs `dimBack(true)` and `startHold(true)`, whose wait is 0 ms, so the 1.5 s `RM` hold in `startHold` is never
  reached, and the fall then plays at its usual pace. The spec said "instant sweep and fall, 1.5 s hold"; it now
  describes the code (a quick sweep, no hold, then the fall). The code is P0's and is left as it is: not an item here.
- U3 · found: under the device's setting the site-wide rules also take the mark's name away on a page the curtain
  opens with `rise`, so a stale `rise` under reduce motion would not fly the word either. The puzzle never stores `rise`
  under reduce motion, so this only makes the rule hold twice.
- U3 · planted controls: the U2 tree's `src/` with the U3 checks: `motion.transitions` 30 problems, `reduced.curtain`
  22 (`rise`, transforms, the flying mark group), `reduced.pages` and `reduced.head` fail. `reduced.entrance` needs the
  hook's `yaw`, so its control is the U3 file with `HONOR_RM = false`: it fails with the spin (about 0.11 rad in 1.2 s)
  and the drift (about 0.45 rad), and `reduced.curtain` with it (12: `rise`, the 1.4 s transform, no bands, the stage
  rising without view transitions).
- U3 · conflict with the brief: U3's acceptance asks for entrance screenshots of both curtains, but the brief's
  write list has no place for them and `handoff/` must not change. They are in `docs/briefs/s109-screens/` (ten JPEGs,
  554 KB: the puzzle before Skip, then four frames of each curtain), beside this file. Made by pausing the transition's
  animations on Home under `reducedMotion: 'reduce'` and stepping their time; the script stayed in the session's scratch
  space (it is not a check and the write list has no `tools/` beyond `tools/check/`).
- U3 · CI green on b1181e9 (run 45943362330).
- U4 · decision (C6): `node -e` starts `astro` with `shell: true`, so npm's shell finds it on PATH on every system
  (`astro.cmd` on Windows), passes the script's arguments on (`npm run dev -- --host` reaches Astro) and exits with
  Astro's code. The quoted program uses only double quotes outside and single quotes inside, and no `$`, `%`, `!`, `^`,
  `&`, `|`, `<` or `>`, so `cmd.exe` (npm's default shell on Windows) and PowerShell pass it to Node unchanged.
  Measured here under bash: `npm run build` builds and exits 0; `npm run preview -- --port 4999` serves Home (200);
  the same program, pointed at `node`, shows the child gets `ASTRO_TELEMETRY_DISABLED=1` and the arguments
  `["dev","--host"]`, and passes on an exit code of 3. No Windows shell exists in this container, so the Windows run is
  [UNVERIFIED]: reasoned from cmd's and PowerShell's quoting, not run. `production.scripts` fails on any
  `NAME=value cmd` in a script (control: the three v4 scripts, 3 problems).
- U4 · decision (C5): the flag is `PUBLIC_MAZO_TEST` (Astro passes `PUBLIC_` variables to client code and folds an
  unset one away, so the production chunk has no trace of the hook: checked with `grep` on `dist/`). The debug HUD
  is the `#debug` panel, its Debug button and the `#debug` hash; the two other dev buttons (Shape, Letter colors) are
  not named by the item and stay, but they only ever showed through `#debug:target`, so in production they can no
  longer be shown (noted for the main seat). `production.surfaces` builds a production copy into a temporary folder
  and finds neither `__mazo` nor the HUD, and finds both in the check's own `dist/`. Control (the U3 `src/` and
  `package.json`): 2 problems (`__mazo` in the production puzzle chunk; the HUD on the entrance).
- U4 · found: `tools/entrance-screens.mjs` (outside this run's write list) reads `window.__mazo`, so it now needs the
  check's build (`npm run check` or `PUBLIC_MAZO_TEST=1 npm run build`) before it runs; left unchanged, for the main
  seat.
- U4 · C11 and C12, measured: computed `th` weight 600 before, 400 after (Martian Mono, which ships 400 only, rendered
  at 400 both times); `a:hover` green (`rgb(70, 217, 138)`) before and after. Pictures at 2x, Night, 1280 px: both
  links at rest and hovered, and MAZO's table, are byte-identical before and after. The Colophon's table differs in
  768 pixels, all inside its size columns: it prints the build's own page weights, which moved by 0.1 kB on some rows
  because this unit made the CSS and the entrance smaller; its paths column and its rules match. Saved at half size
  as `night-*-before.png` and `night-*-after.png`.
