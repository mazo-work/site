# S109 STATE: v4's verified fixes and the reduced-motion design (the source of truth; read s109-BRIEF.md §0 first)

Resume rule: start at the first unticked unit. Never redo a ticked one. If resumed with "resume": read §0, run
`python3 tools/burr/check.py` and `npm run check` once, continue.

| Unit | Done | Commit | Turns | Checks | CI | Notes |
|---|---|---|---|---|---|---|
| U1 WebGL lifecycle (items 1–6) | [x] | 725202f, c11e449 | 16 | 79 of 79 | green (run 45941681583, on c11e449; run 45940620136 on 725202f failed, see log) | `puzzle.js`: `disposeMesh` never disposes the shared `voxGeo` (C1); `load()` disposes each letter's material and `InstancedMesh` (C2); the `RoomEnvironment` and the `PMREMGenerator` are disposed once the map is made (C3); the halo takes `PAL.haloOpacity` (C4); `skip()` returns during `lift` and `site` too (C10); the hold, the five rows and `finishUp`'s two waits go through `later()`, and `load()`/`jumpToEnd()` clear them (P2). New check `entrance.lifecycle` (1). Test hook: `gpu()` and `state().halo`. |
| U2 UI races (items 7–10) | [ ] | | | | | |
| U3 the reduced-motion design (items 11–14) | [ ] | | | | | |
| U4 build and dead weight (items 15–18) | [ ] | | | | | |
| U5 handoff and manifest | [ ] | | | | | |

## Budget

- Units done: 1 of 5 · turns so far: 40 · average per unit: 16 (after the 12 turns of reading and baseline).
- Estimated turns left: about 60 (U2 4 to tick, U3 22, U4 15, U5 10).
- Session started 2026-11-27 04:04 UTC (read from `date`).

## Checks not yet expected to pass

(`npm run check` reads root `STATE.md`'s section of this name, not this file; nothing is listed there.)

(none)

## Changed checks (§2: a check changes only where an item changes the behaviour it asserts)

(none yet)

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
