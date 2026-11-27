# S109 STATE: v4's verified fixes and the reduced-motion design (the source of truth; read s109-BRIEF.md §0 first)

Resume rule: start at the first unticked unit. Never redo a ticked one. If resumed with "resume": read §0, run
`python3 tools/burr/check.py` and `npm run check` once, continue.

| Unit | Done | Commit | Turns | Checks | CI | Notes |
|---|---|---|---|---|---|---|
| U1 WebGL lifecycle (items 1–6) | [ ] | | | | | |
| U2 UI races (items 7–10) | [ ] | | | | | |
| U3 the reduced-motion design (items 11–14) | [ ] | | | | | |
| U4 build and dead weight (items 15–18) | [ ] | | | | | |
| U5 handoff and manifest | [ ] | | | | | |

## Budget

- Units done: 0 of 5 · turns so far: 12 (the one-time read of §0's inputs, the install and the baseline).
- Estimated turns left: about 90 (U1 25, U2 20, U3 25, U4 12, U5 8).
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
