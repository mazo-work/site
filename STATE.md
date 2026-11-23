# STATE: v3 progress (the source of truth; read BRIEF.md §0 first)

Resume rule: start at the first unticked unit. Never redo a ticked unit.

| Unit | Done | Commit | Turns | Files | Notes |
|---|---|---|---|---|---|
| U0 scaffold | [x] | 17b87c7 | 28 | 30 | Astro 7.4.13 + three 0.170.0 pinned; v2's words in `src/data/v2-words.ts`; React app removed. 13 of the 28 turns were the one-time read of the brief's inputs. |
| U1 check suite | [ ] | | | | |
| U2 headers | [ ] | | | | |
| U3 spine | [ ] | | | | |
| U4 Editorial | [ ] | | | | |
| U5 entrance | [ ] | | | | |
| U6 Terminal | [ ] | | | | |
| U7 Profile | [ ] | | | | |
| U8 theme switcher | [ ] | | | | |
| U9 agent layer | [ ] | | | | |
| U10 colophon | [ ] | | | | |
| U11 secrets | [ ] | | | | |
| U12 gag chatbot | [ ] | | | | |
| U13 analytics beacon | [ ] | | | | |
| U14 resume PDF | [ ] | | | | |
| U15 measure | [ ] | | | | |
| U16 deploy runbook | [ ] | | | | |
| U17 HANDOFF.md | [ ] | | | | |

## Budget

- Units done: 1 of 18 · turns so far: 28 · average turns per unit: 28 (15 without the one-time read) · estimated turns left: 17 × 15 ≈ 255
- Wall clock: session started 2026-11-23 02:37 UTC; U0 done 02:47 UTC.
- Last updated: 2026-11-23 02:48 UTC, after U0.

## Checks not yet expected to pass

(U1 lists here what fails only because it is not built yet; each line is removed when its unit lands.)

## Log

(one line per event: a resume, a failing check fixed in a ticked unit, a unit split, a stop for budget)

- 2026-11-23 02:37 UTC · session start (fresh, not a resume). Working branch is `v3` as the brief says; the cloud session's
  default branch (`claude/…`) is not used. Nothing pushed anywhere but `v3`.
- U0 · decision: Astro 7.4.13 (the current major; its engine floor, Node 22.23.4, is met) and three.js 0.170.0, the
  version the puzzle prototype is built and tested on. Exact pins; lockfile committed.
- U0 · decision: Astro inlines script chunks under 4 KB and small stylesheets by default; both are switched off
  (`vite.build.assetsInlineLimit: 0`, `build.inlineStylesheets: 'never'`) so the CSP needs no hashes but the theme boot.
- U0 · decision: Hero.jsx's tagline is not carried over: it opens with a phrase on §4's banned list, and §3 forbids
  changing the banned list. Home gets a `[JON: …]` slot in its place. Listed for the handoff.
- U0 · decision: Contact.jsx's form (it posted to a third party) and the "Let’s Connect" button are not carried over
  (§5.3, no forms that submit anywhere; §3, no email). How visitors reach Jon becomes a `[JON: contact]` slot.
- U0 · decision: the public origin is read from `SITE_URL` at build time; the placeholder is `https://mazo.invalid`
  (a reserved TLD that can never resolve). `[JON: domain]` for the handoff.
- U0 · decision: Astro telemetry is off in every npm script (`ASTRO_TELEMETRY_DISABLED=1`).
