# STATE: v4 progress (the source of truth; read BRIEF.md §0 first)

Resume rule: start at the first unticked unit. Never redo a ticked unit.

| Unit | Done | Commit | Turns | Files | Notes |
|---|---|---|---|---|---|
| U0 baseline | [x] | a15ed3d | 17 | 1 | `npm run check` as inherited: 55 checks, 55 passed, 0 pending, 0 failed (73 s). 15 of the 17 turns were the one-time read of §0's inputs and the install. |
| U1 skeleton | [ ] | | | | |
| U2 rooms | [ ] | | | | |
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

- Units done: 1 of 14 · turns so far: 17 · average turns per unit: 17 (U0 was mostly reading; the real average starts at U1) · estimated turns left: about 13 units × 10 = 130 (v3's average was 9.6)
- Wall clock: session started 2026-11-23 08:05 UTC; U0 done 08:11.
- Last updated: 2026-11-23 08:11 UTC, after U0.

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
