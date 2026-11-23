# STATE: v3 progress (the source of truth; read BRIEF.md §0 first)

Resume rule: start at the first unticked unit. Never redo a ticked unit.

| Unit | Done | Commit | Turns | Files | Notes |
|---|---|---|---|---|---|
| U0 scaffold | [x] | 17b87c7 | 28 | 30 | Astro 7.4.13 + three 0.170.0 pinned; v2's words in `src/data/v2-words.ts`; React app removed. 13 of the 28 turns were the one-time read of the brief's inputs. |
| U1 check suite | [x] | 4e78de4 | 11 | 17 | `npm run check`: 32 checks, 22 pass, 10 pending (listed below). Proven against a broken fixture. CI workflow `check.yml` (check only). |
| U2 headers | [x] | 1ddc1d3 | 6 | 3 | `public/_headers` (§3 CSP + `trusted-types 'none'`, HSTS no preload, COOP/CORP, XFO, Permissions-Policy denying 55 unused features), `security.txt`; check `headers.*` (4) passes. |
| U3 spine | [x] | 03d2128 | 11 | 27 | 13 pages; every page reads without JS and is ≤ 2 clicks from every other; 30 checks pass, 6 pending (U9). `tools/screens.mjs` added. |
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

- Units done: 4 of 18 · turns so far: 56 · average turns per unit: 14 (11.3 without U0's one-time read) · estimated turns left: 14 × 14 ≈ 196 (design units will run above the average)
- Wall clock: session started 2026-11-23 02:37 UTC; U0 done 02:47; U1 02:54; U2 02:58; U3 03:06.
- Last updated: 2026-11-23 03:06 UTC, after U3.

## Checks not yet expected to pass

(U1 lists here what fails only because it is not built yet; each line is removed when its unit lands.
`npm run check` reads the lines below: a failing check listed here prints as PENDING instead of failing the run.)

- `jsonld.types` no JSON-LD yet (U9)
- `agents` no twins, llms.txt, sitemap, RSS or robots.txt yet (U9)

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
- U1 · decision: HTML validation is html-validate (recommended rules; trailing-whitespace off for compressed output;
  SRI required only cross-origin), not the Nu checker: offline, no Java, fast. Playwright is pinned to 1.63.0, the
  version whose Chromium is preinstalled here; CI installs its matching browser.
- U1 · decision: the CSP pass serves dist/ with dist/_headers applied (a Cloudflare-like static server), so violations
  are the ones production would raise. axe runs in a second pass with CSP bypassed (it is injected); colours, focus and
  semantics are unchanged by that. On the entrance, `[data-art]` (the 3D stage) is excluded from axe (§3, art).
- U1 · decision: routes fixed in `tools/check/config.mjs`: /home/, /about/, /projects/ (+ /mazo/, /case-study-2/),
  /notes/ (+ /note-template/), /now/, /uses/, /recruiters/, /colophon/, /404.html; the entrance is /. The theme lives in
  localStorage under `mazo-theme`. A case-study shell is `noindex`, out of the sitemap, and WebPage (not Article).
- U1 · decision: a check-only CI workflow, `.github/workflows/check.yml` (push to v3; contents: read; actions pinned to
  the same commits as test-page.yml, which is untouched).
- U2 · decision: the CSP adds `trusted-types 'none'` to §3's list: with `require-trusted-types-for 'script'` and no
  policy needed, no script may create one (a default policy would be a bypass). Proposed as a change in the handoff.
- U2 · decision: Permissions-Policy denies every feature Chrome 157 recognises that the site does not use (55);
  `ambient-light-sensor` and `attribution-reporting` were dropped as unrecognised; `bluetooth` and `web-share` stay
  although Linux Chrome warns they are unrecognised (other platforms have them); `autoplay` stays at its default for
  the entrance's tap-started sound; client hints (`ch-*`) are left alone.
- U2 · unverified: whether Cloudflare Pages applies `_headers` to its 404 responses; the runbook (U16) checks it with curl.
- U3 · check fix in a ticked unit (U1): `pages.semantic` and `browser.nojs` required 80 characters of text in every
  `<main>`; the 404 and the case-study shell are short by design, so both are now exempt (30-pages.mjs, 50-browser.mjs).
- U3 · decision: Markdown syntax highlighting is off: Shiki writes inline `style` attributes, which `style-src 'self'`
  blocks (the check caught it). Code blocks are plain; a theme may style them.
- U3 · decision: structure. Home is the hub (every room plus projects and the latest notes, so every page is two clicks
  from every other); the header carries the rooms and the mark (links to /home/); the footer carries Colophon and
  "Replay the intro" (/). The entrance's own nav is Skip intro and For recruiters (the spec: a skip control and a direct
  link to the recruiter page are always available). About, Now and Uses are Markdown pages (`src/pages/*.md`) so Jon
  edits prose, not templates; About's beats keep fixed ids (`#beat-1`…`#beat-4`) for U11's fragments.
- U3 · decision: functional labels are mine and plain (Skip intro, Replay the intro, Not found, Coming soon., Name,
  Region, Contact); listed for Jon in the handoff. v2's "Hi, I'm Jonathan Mazo" is Home's h1, as it stands.
- U3 · found: v2's headshot (`src/assets/headshot.webp`) is a photo of a parrot, with the alt text "Jonathan Mazo".
  Kept as it stands (Jon's image and words); flagged for the handoff (a real photo, or alt text that says what it shows).
