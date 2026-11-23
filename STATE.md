# STATE: v3 progress (the source of truth; read BRIEF.md §0 first)

Resume rule: start at the first unticked unit. Never redo a ticked unit.

| Unit | Done | Commit | Turns | Files | Notes |
|---|---|---|---|---|---|
| U0 scaffold | [x] | 17b87c7 | 28 | 30 | Astro 7.4.13 + three 0.170.0 pinned; v2's words in `src/data/v2-words.ts`; React app removed. 13 of the 28 turns were the one-time read of the brief's inputs. |
| U1 check suite | [x] | 4e78de4 | 11 | 17 | `npm run check`: 32 checks, 22 pass, 10 pending (listed below). Proven against a broken fixture. CI workflow `check.yml` (check only). |
| U2 headers | [x] | 1ddc1d3 | 6 | 3 | `public/_headers` (§3 CSP + `trusted-types 'none'`, HSTS no preload, COOP/CORP, XFO, Permissions-Policy denying 55 unused features), `security.txt`; check `headers.*` (4) passes. |
| U3 spine | [x] | 03d2128 | 11 | 27 | 13 pages; every page reads without JS and is ≤ 2 clicks from every other; 30 checks pass, 6 pending (U9). `tools/screens.mjs` added. |
| U4 Editorial | [x] | 98557fb | 29 | 26 | Literata + Libre Franklin (77.6 KB); grain, hairlines, vermilion, hanging heads, page turn, halftone portrait, glyph diagram. Design log entry. New check `fonts.*` (4). 34 pass, 6 pending. |
| U5 entrance | [x] | 9b2a62d | 9 | 9 | P0 ported (76 diff lines, all integration); curtain = cross-document view transition into Home; word → mark morph; 3D code only on /, after first paint (130 KB gzip). New check `entrance.*` (3) incl. a headless play-through. 37 pass, 6 pending. |
| U6 Terminal | [x] | 2ca5e5b | 7 | 8 | Martian Mono + Atkinson Hyperlegible Next (58.5 KB); LED-panel mark, neon flicker, fringe, ## / ./ / ~/ winks, X-ray portrait, CRT transition. Design log entry. 37 pass, 6 pending. |
| U7 Profile | [x] | bb3b20c | 9 | 6 | Bungee Shade + Nunito (78.5 KB); graph-paper tile, windows with title bars, bevel buttons, extruded mark, tilted profile pic, window-pop transition. Design log entry. 37 pass, 6 pending. |
| U8 theme switcher | [x] | e058cfb | 5 | 6 | Masks as a native radio group; no flash; device default followed live; keyboard; localStorage, no cookie. New check `switcher.*` (4). 41 pass, 6 pending. |
| U9 agent layer | [x] | d7af40b | 8 | 14 | 12 twins from built HTML, llms.txt, sitemap (11 URLs), RSS, JSON-LD per page type, robots.txt from vendor docs (sources in `src/data/crawlers.ts`). 47 pass, 0 pending. |
| U10 colophon | [x] | c791ef8 | 6 | 7 | Generated from the build: headers/CSP, stack, licences (+ /licences.txt), fonts, crawlers, storage, accessibility; sizes measured post-build (7-17 KB brotli per page before fonts). 47 pass. |
| U11 secrets | [x] | 8239eb2 | 3 | 9 | View-source note (the mark as text + [JON] slot) on every page; 4 story fragments as native details, linking to About's beats. New check `secrets-in-walls.*` (2). 49 pass. |
| U12 gag chatbot | [x] | a105b6c | 6 | 8 | Launcher on content pages; widget JS + CSS load on first open; invented vocabulary; role=log; no network, nothing stored. New check `chatbot.*` (4). 53 pass. |
| U13 analytics beacon | [x] | ba20fae | 9 | 5 | Beacon on every page, token as `[CF_BEACON_TOKEN]`; CSP + exactly two hosts; colophon names it. New check `beacon.*` (2). 55 pass. |
| U14 resume PDF | [x] | 88560cc | 5 | 4 | Metadata stripped (info, XMP with IDs, file ID); text and pixels identical. Report `handoff/resume-pdf.md`: the page shows an email address (Jon's to remove). 55 pass. |
| U15 measure | [x] | 9283d5a | 10 | 9 | Lighthouse 13.6.0 × 13 pages × 2; sizes; 78 WebP screenshots (13.8 MB); `handoff/measure.md`, `handoff/budget.md`. About's mobile LCP 1.96 s open. 55 pass. |
| U16 deploy runbook | [ ] | | | | |
| U17 HANDOFF.md | [ ] | | | | |

## Budget

- Units done: 16 of 18 · turns so far: 162 · average turns per unit: 10.1 · estimated turns left: 2 units × 5 ≈ 10
- Wall clock: session started 2026-11-23 02:37 UTC; U0 done 02:47; U1 02:54; U2 02:58; U3 03:06; U4 03:19; U5 03:28; U6 03:32; U7 03:38; U8 03:41; U9 03:47; U10 03:52; U11 03:55; U12 04:00; U13 04:08; U14 04:14; U15 04:36.
- Last updated: 2026-11-23 04:36 UTC, after U15.

## Checks not yet expected to pass

(U1 lists here what fails only because it is not built yet; each line is removed when its unit lands.
`npm run check` reads the lines below: a failing check listed here prints as PENDING instead of failing the run.)

(none: every check is expected to pass from U9 on)

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
- U4 · found: Astro 7 renders Markdown with its own processor, Sätteri, not remark; remark plugins would need the old
  unified stack. The glyph drawing is a Sätteri mdast plugin instead, and `@astrojs/markdown-satteri` is now an
  explicit, pinned dependency (it was only transitive).
- U4 · decision: Editorial is scoped as "any theme but Terminal or Profile", so it is also the look without
  JavaScript; the base tokens are the Paper palette. Without JavaScript on a dark device the page keeps Editorial's
  structure with the dark tokens (U3's media query).
- U4 · decision: fonts come from Fontsource's npm packages (OFL, Latin subset, WOFF2), pinned in
  `tools/fonts/fonts.json`; `node tools/fonts/fetch.mjs` copies them and their licences to `public/fonts/` and writes
  the @font-face block into `src/styles/fonts.css` (the one type file). `font-display: swap`; CLS is measured in U15.
- U4 · decision: Terminal and Profile use system fonts until U6 and U7, so neither downloads Editorial's (the new
  `fonts.loads` check enforces it).
- U5 · decision: the curtain is a cross-document view transition, not P0's iframe: the CSP (`default-src 'none'`,
  `frame-ancestors 'none'`) allows no frames, and Home is a page of its own. The entrance sets a one-time
  sessionStorage flag; the boot script (new hash in `_headers`) turns it into `data-curtain` on Home; Home's CSS raises
  the old page's still picture over 1.4 s on P0's curve with Home underneath. Browsers without cross-document view
  transitions get P0's stage lift on the entrance, then Home opens (a cut).
- U5 · decision: MAZO into the mark: at the curtain the 3D word is swapped for an image of its own texture
  (`toDataURL`, allowed by `img-src data:`) at the same screen rectangle, named `mark` like Home's header mark, so the
  page change morphs one into the other. The view-transition group animates size as well as position: the one place a
  property other than transform or opacity animates, and it is the platform's own; noted for the handoff.
- U5 · decision: P0's preview-only controls (Shape, Letter colors, Debug) show only with `#debug`; P0's done card
  and Replay stay in the markup, hidden and unreachable, so its logic runs unchanged; "Replay the intro" is the site's
  footer link. Back from Home (bfcache) reloads the entrance for a fresh puzzle. P0's `window.__mazo` test hook is kept.
- U5 · decision: the word's stand-in font drops P0's named families (one was on the banned list); the look is P0's
  dark stage on every theme until the puzzle's own looks are chosen (spec, P2).
- U6 · decision: Terminal's loops (the light block's neon flicker, the footer cursor) end within 5 s, so WCAG 2.2.2
  needs no pause control; the generated winks (`##`, `./`, `../`, `//`, `[01]`) use CSS alt text `/ ""` so screen
  readers skip them; the crumb (`~/path/`) is `aria-hidden` and shown only in Terminal.
- U7 · decision: Profile shows Home's "Rooms" heading (visually hidden in the other themes) as a window title bar:
  a functional label, listed with the others for Jon. Its one gradient (title bars, coral to pink) is annotated.
- U8 · decision: the switcher is a native radio group (fieldset with a visually hidden legend "Theme"), not custom
  ARIA; it lives in the header of every content page (not on the entrance, which keeps P0's look, nor the 404's
  header, which has none of its own). No "follow the device" option once a choice is made (the brief asks for none);
  until then the site follows the device live.
- U8 · correction (U9): the line above says the 404 has no header; it has the site header, switcher included.
- U9 · found: from this environment only Anthropic's crawler page was reachable; the other vendors' hosts are outside
  the network allowlist. Their crawler names and purposes come from web search results that quote the official pages
  (each URL recorded in `src/data/crawlers.ts`); marked as read through search, not fetched, for the handoff. I did
  not ask to widen the network (no questions mid-run).
- U9 · decision: "training-only" is read literally. Disallowed: GPTBot, ClaudeBot, Applebot-Extended,
  MistralAI-Training. Allowed and flagged for Jon, because each also serves search or answers: Google-Extended (it
  also controls grounding in Gemini's answers), CCBot (its archive also feeds search indexes), Meta-ExternalAgent
  (training or product indexing), Amazonbot (products and services; may train). Not named: Bytespider (no vendor
  documentation found), MistralAI-Index (purpose not confirmed), Cohere (its page says it runs no crawlers). The IETF
  AIPREF training signal that Anthropic and Google now read is not added: its syntax is a draft I could not verify.
- U9 · decision: twins are generated from each built page's `<main>` (they can never drift); the puzzle's UI is
  marked `data-twin="skip"`. JSON-LD states only facts (name; languages from "Bilingual: English & Spanish"); a
  photo, `sameAs` links, a region and a job title wait for Jon.
- U10 · fix in a ticked unit's file (U4, `editorial.css`), not a failing check: Editorial's label style capitalised
  every table header cell, which showed crawler tokens in capitals on the colophon; now only column headers.
- U10 · decision: "every dependency's licence" is met twice: the colophon lists the direct dependencies with their
  licences and roles, and `/licences.txt` lists every installed package (from package-lock.json). Only three.js is
  sent to visitors (the entrance). Sizes are measured from the built files by a build hook and written into the
  colophon (the colophon's own row is measured before the table is added).
- U11 · decision: four fragments (the brief allows two to four): the 404 (beat 1), Lab notes (beat 2), MAZO's case
  study (beat 3), the colophon (beat 4); which page carries which beat is Jon's to change. The marker is the light
  block's square, the site's one recurring secret. The link text "The whole story" and the summary's hidden name
  "A fragment of the story" are functional labels, listed for Jon. The optional "eye that tracks nothing" is not built.
- U12 · decision: the gibberish is original: invented words and syllables in a singsong style, none taken from the
  films' vocabulary or catchphrases; a check greps src, public and dist for the brand name. The welcome line ("Hi! How
  can I help you today?"), the placeholder, "Send" and the close label are new words written straight for the gag;
  they are not shown as [JON] slots (a slot in the widget would break the joke) and are listed for Jon instead.
- U12 · decision: the widget's rounded panel, round launcher and soft shadows are the joke's costume (a support widget
  played straight), annotated `radius-ok` / `shadow-ok`. Its stylesheet is a plain file in public/ attached on first
  open, because Astro hoists a dynamic import's CSS into every page.
- U13 · check fix in a ticked unit (U5, `52-entrance.mjs`): with the beacon in every page, the play-through first
  reached the network (refused by this sandbox), then, once its requests were routed, Chrome began aborting the
  curtain's view transition ("opt-in disabled") in 3 to 4 runs of 5. Cause: Playwright's request interception, even
  for one host, makes Chrome drop cross-document view transitions (no interception: no abort in any run). The
  play-through now uses its own browser with no interception, where the beacon's hosts do not resolve; failed beacon
  loads are ignored by their source URL. The site itself was not at fault.
- U13 · unverified: Cloudflare's real beacon.min.js could not be fetched here (proxy 403), so whether it works under
  `require-trusted-types-for 'script'` and `trusted-types 'none'` is not known. The runbook (U16) checks the console
  after deploy; if it needs a policy, the brief says to add a named one, never to drop the directive.
- U13 · decision: no Subresource Integrity on the beacon (Cloudflare changes the file in place); an html-validate
  directive next to the script records the exception.
- U14 · decision: the stripped copy replaces `public/Profile.pdf` under the same name (no link changes); the report
  names kinds and places, never values, because the repository is public. The email address on the page is left for
  Jon (content changes are his) and is a must-fix before launch in the handoff.
- U15 · decision: Lighthouse runs on the built site served locally with `_headers` applied (http on 127.0.0.1), the
  beacon blocked; mobile is Lighthouse's default (simulated slow 4G, 4x CPU), harsher than the brief's 4G reference.
  Screenshots are WebP (quality 72, 2x); the longest phone pages are scaled to WebP's 16383 px limit. Fix in a ticked
  unit's file (U4, `Portrait.astro`), found by measuring: the portrait was lazy-loaded above the fold; now eager, high
  priority. It did not move About's LCP (1.96 s): cause open, listed in the handoff.
- U15 · unverified: the entrance's performance on a real phone (software WebGL here inflates blocking time to
  31-160 s); the beacon's size.
