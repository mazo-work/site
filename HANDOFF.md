# HANDOFF: site v4

Written at the end of one Claude Code cloud session (2026-11-23, 08:05 to about 14:22 UTC; its worker restarted once, between
about 09:40 and 14:04, with nothing lost) that worked through `BRIEF.md` unit by unit. `STATE.md` holds the unit table,
the cost log and every decision as it was made; this file summarises them in the order v3's §8 asks. Where the brief is
quoted, it is quoted; no other words are attributed to Jon.

## 1. SCOPE

**Asked:** take v3 to v4 on `v4`, from `BRIEF.md` and Jon's reviewed mocks (`docs/v4-mocks/`): units U0 to U12 with
U5b, one at a time, each done when `npm run check` passes, committed and pushed, then ticked in `STATE.md`.

**Done:** all 14 units. Nothing was pushed anywhere but `v4`; `.github/workflows/test-page.yml` is untouched; nothing
was deployed. The check workflow (`check.yml`, check only) now also runs on pushes to `v4`.

**One skeleton** (U1). Every page in both masks has the same header: a utility row (Replay the intro, Pause motion on
the left; the mask toggle, Paper and Night, on the right), the MAZO mark centred with Jon's name under it (large on
Home, about 540 px; small elsewhere, about 300 px), and the menu band (a double rule above, a single rule below, About ·
Projects · Lab notes · Now · For recruiters); then the page; then the footer ("Jonathan Mazo · [JON: region]", and the
Colophon, reached from here only); and the Ask button, bottom right. The skeleton's heights are fixed, so the band and
the toggle do not move when the mask changes (a check measures it). Profile is parked: never offered, never loaded, its
files kept.

**Rooms** (U2). Uses is a section of Now (`/now/#uses`); `/uses/`, `/uses` and the old twin `/uses.md` answer with a
301 (`public/_redirects`, which the local test server also applies). The agent files follow (llms.txt lists Uses as a
section of Now; the sitemap dropped it).

**Type** (U3). Atkinson Hyperlegible Next sets all body text in both masks. Paper's display faces are IM FELL English
and IM FELL English SC; their licence reserves their names and the site serves Fontsource's Latin subsets (a modified
version), so they are served renamed "Mazo Paper" and "Mazo Paper SC" (`tools/fonts/rename.py`; glyphs, copyright and
licence unchanged; the colophon says so). Night's are Doto (display headlines, the name) and Martian Mono (labels, the
rows, the band). Each mask loads only its own.

**Paper** (U4), the cleanest: cream paper under a fine grain, ink `#1B1816`, and the riso red `#E5484D` only for print
effects: the mark's light, the Ask button's hard offset, the underline of here and hover, and the off-register copy
printed a few points down and to the right under every display headline. `#B0301B` sets the few small red words.
IM FELL at the mocks' sizes (Home's headline 120 px, a room's title 150 px), its small capitals for every label, the
body in Atkinson at 19 px over one 660 px measure. No ornaments, icons, numbering or datelines: v3's registration mark,
roman numerals and numbered lists are gone. Its portrait is v3's halftone, printed live over the parakeet photo.
Between pages, v3's page turn.

**Night** (U5), the most creative: near-black `#07060B` under a faint dot grid, text `#DAD6F0`, and three accents with
one job each, as the brief assigns them: purple for underlines, rules and the orbit; green for hover, focus and Ask;
orange for the light. Doto's square dots set the display headlines (up to the mocks' 140 px; a title with a word of nine
letters or more takes a smaller size, so "recruiters" stays in its column), Atkinson 600 the titles, Martian Mono in
spaced capitals the labels. No glows, halos or fringes: the mocks' purple glow behind About's headline and the glow
under the portrait's scan line were not built. Its portrait is the mock's instrument: an X-ray (now a soft duotone,
muted violet to pale cyan) in a round window, a thin purple ring with four ticks, a green line that scans it. Between
pages, v3's CRT power-off and power-on.

**The entrance wears the mask** (U5b). The same puzzle, colours only (one palette table in `src/entrance/puzzle.js`,
every edit marked v4). Night is P0 recoloured: M orange, A green, Z purple, O the text colour, its light effects in
orange. Paper prints: the canvas is transparent so the paper and its grain show through; the letters are ink and riso
red with a tint of each; the light is red, the word ink; the glow behind the word is printed as red halftone dots. The
rule holds and is checked: the word and the light land in Home's mark without changing colour.

**The ring** (U6). Home's navigation, under the band, in both masks: five orbs (real links) orbit a sphere whose core
is the O's light, one turn in 90 s, larger and brighter at the front. Transforms only (a squashed plane, a turning arm,
a counter-turn), scaled to its column with container units. It holds still under the pointer, with focus inside it,
and with Pause motion. Night draws the mock's wireframe; Paper prints it (ink orbit, ink dots that turn red, a halftone
sphere of 805 dots). On a phone it is a picture: the links are hidden and their dots orbit.

**Entering an orb** (U7). Clicking an orb opens its room through a cross-document view transition: the dot and the
room's main share the name `orb-entry`; a veil floods out from the orb as a growing circle (Paper ink; Night a dark
atmosphere with a purple rim just ahead of it); the main opens out of the orb as a window of the mask's ground; the
flood clears. The page is marked for it only where the browser has cross-document view transitions, and unmarked when
the transition ends; elsewhere it is a normal page change. The menu band keeps each mask's v3 transition.

**The parakeet** (U8). The mocks' 12 × 12 sprite, in one file with a contract for the artist (`src/assets/parakeet.svg`),
inlined so it loads nothing. It perches on the O and hops back and forth; on About and For recruiters it sits on the
portrait's frame; one view-transition name carries it between the two (it rises on the way); after the entrance's
curtain it appears. On those two pages its head turns toward a mouse or pen (transform only, nothing stored or sent,
still for touch and with Pause motion). The colophon says so.

**The portrait** (U9). The blue parakeet photo (CC0, rawpixel), alt text "A parakeet, standing in for Jon", credited in
the colophon; Paper's halftone and Night's X-ray are drawn over it live and clear to the photo when you point at it.

**Pause motion** (U10, built with the skeleton). A real button that stops every loop (the light, the ring, the bird,
the scan), is remembered on every page (localStorage `mazo-motion`, restored before first paint), and leaves page
transitions playing. Without JavaScript nothing loops, since there is no button to press.

**Decisions that shaped it** (each is in `STATE.md` with its reason):
- The masks are named in code as the brief names them (`paper`, `night`); a stored v3 name or `profile` falls back to
  the device's mask. Without JavaScript every page wears Paper.
- Home's headline, "A child of the internet.", is the one line in the mocks that is not a slot and not v2's; it is
  kept as the mocks set it and listed below for Jon to confirm.
- The ring's room names sit centred under their dots, not to their right as in the mocks: on the right, "For
  recruiters" would leave the frame on any desktop narrower than about 1400 px.
- The ring's depth dims and shrinks the dots; the names keep their size and stay above 4.5:1.
- The mocks' coloured teaser labels (green, orange) are the label grey: the brief gives each accent one job.
- The two-click check now asks the entrance for Home in one click (its way in), since v4's Home shows only the latest
  project and note; every other page still reaches every page in two.

## 2. CROSSING

- **Branch:** `v4`, pushed to `origin`. Last commit before this handoff: `ae07a16` (U11 ticked). This file arrives in
  the next commit; `STATE.md`'s U12 tick and `MANIFEST.sha256` in the one after, which is the tip of `v4`.
- **`MANIFEST.sha256`:** `sha256sum` of every tracked file at the tip (itself excluded; `.git` is never tracked). v3's
  manifest is `docs/briefs/v3-MANIFEST.sha256`. Verify from a checkout of the tip:

  ```bash
  git ls-files | grep -vx MANIFEST.sha256 | xargs -d '\n' sha256sum | diff - MANIFEST.sha256 && echo identical
  ```

- **CI:** `.github/workflows/check.yml` (build and check, read-only, actions pinned, never deploys) listened to `v3`
  only; since U11 it also runs on pushes to `v4`. Its first run on `v4`, #36 (`a3367b2`), passed on GitHub's Ubuntu
  runners: the same 78 checks. Run #37 (`9749a90`) passed too; #38 and #39, for U11's last two commits, were running when
  this was written.

## 3. MEASURED

**The checks.** `npm run check`: 78 checks, 78 passed, 0 pending, 154 s in this sandbox (and on GitHub's runners,
run #36). v3's 55, re-pointed at the two masks (the switcher, the browser pass per page and mask, axe per page and
mask, the entrance, which now solves and skips in both masks and checks that the word and the light land in Home's
mark in the same colours), and v4's 23: `skeleton.*` (4: the same header on every page, Profile parked, the band and
the toggle still across masks, Pause motion), `rooms.*` (2), `layout.fit` (no sideways scroll and no spilling
headline on any page in either mask at 390, 1024 and 1440 px), `fonts.*` (6, rewritten: the families per mask, each
mask loads its own, the reserved names in the served files, the roles), `ring.*` (3), `entry.*` (3), `parakeet.*` (3),
`motion.*` (5). Two of them caught real defects as they were written (`layout.fit`: the colophon's 2 px and the
ring's hidden names; v3's `chatbot.a11y` caught the chat title's contrast), and `fonts.rfn` was proven against the
unrenamed font file.

**Sizes** (`npm run build`; the build measures `dist/`; brotli, first visit, before fonts):

| Page | HTML | CSS | JS | Images | Total KB | Total KB, gzip |
| --- | --- | --- | --- | --- | --- | --- |
| / | 1.9 | 8.7 | 0.8 | 0.0 | 11.4 | 13.1 |
| /404.html | 2.0 | 7.3 | 1.5 | 0.0 | 10.9 | 12.6 |
| /about/ | 3.1 | 7.3 | 1.8 | 71.0 | 83.2 | 85.2 |
| /colophon/ | 6.8 | 7.3 | 1.5 | 0.0 | 15.7 | 18.2 |
| /home/ | 2.6 | 7.3 | 1.8 | 0.0 | 11.8 | 13.6 |
| /notes/ | 2.3 | 7.3 | 1.5 | 0.0 | 11.1 | 12.8 |
| /notes/note-template/ | 2.4 | 7.3 | 1.5 | 0.0 | 11.3 | 13.0 |
| /now/ | 2.5 | 7.3 | 1.5 | 0.0 | 11.3 | 13.1 |
| /projects/ | 2.2 | 7.3 | 1.5 | 0.0 | 11.1 | 12.8 |
| /projects/case-study-2/ | 2.1 | 7.3 | 1.5 | 0.0 | 11.0 | 12.7 |
| /projects/mazo/ | 5.2 | 7.3 | 1.5 | 0.0 | 14.0 | 16.3 |
| /recruiters/ | 3.6 | 7.3 | 1.8 | 71.0 | 83.7 | 85.9 |

Fonts per mask (WOFF2, loaded only by the mask that uses them): Paper 208.7 KB (Atkinson Hyperlegible Next 3 faces,
IM FELL English 2, IM FELL English SC 1), Night 52.0 KB (Atkinson 3, Doto 1, Martian Mono 1). The entrance's puzzle,
loaded after first paint: 105.8 KB brotli, 500.7 KB raw (three.js inside). Paper's halftone sphere on Home:
`public/ring/halftone-sphere.svg`, 45.8 KB, 8.4 KB gzip.

**Lighthouse 13.6.0** (`npm run build && node tools/measure.mjs --lighthouse`; Chromium build
1243 in this sandbox, 4 CPUs; the built site served locally with `_headers`; the beacon
blocked; Paper as a light device, Night as a dark one). Condensed; every column, desktop and mobile, is in
`handoff/measure.md`:

| Page | Paper, mobile: perf · LCP ms · CLS | Night, mobile: perf · LCP ms · CLS | Paper, desktop: perf · LCP ms | Night, desktop: perf · LCP ms |
| --- | --- | --- | --- | --- |
| / | 60 · 1053 · 0.002 | 60 · 1064 · 0.002 | 60 · 288 | 60 · 287 |
| /404.html | 99 · 905 · 0.076 | 100 · 903 · 0.004 | 100 · 245 | 100 · 246 |
| /about/ | 95 · 3004 · 0.002 | 99 · 2107 · 0.001 | 100 · 609 | 100 · 529 |
| /colophon/ | 100 · 1054 · 0.006 | 100 · 1055 · 0.003 | 100 · 287 | 100 · 284 |
| /home/ | 100 · 903 · 0.002 | 100 · 904 · 0.002 | 100 · 252 | 100 · 246 |
| /notes/ | 100 · 903 · 0.002 | 100 · 902 · 0 | 100 · 243 | 100 · 245 |
| /notes/note-template/ | 100 · 904 · 0.002 | 100 · 903 · 0.002 | 100 · 245 | 100 · 246 |
| /now/ | 100 · 905 · 0.033 | 100 · 914 · 0.028 | 100 · 247 | 100 · 246 |
| /projects/ | 100 · 903 · 0.016 | 100 · 903 · 0.002 | 100 · 244 | 100 · 245 |
| /projects/case-study-2/ | 100 · 903 · 0.002 | 100 · 903 · 0.002 | 100 · 284 | 100 · 243 |
| /projects/mazo/ | 100 · 1056 · 0.002 | 100 · 1053 · 0.001 | 100 · 284 | 100 · 288 |
| /recruiters/ | 92 · 3306 · 0.015 | 98 · 2405 · 0.001 | 100 · 685 | 100 · 565 |

Accessibility 100 and best practices 100 on every page in both masks, mobile and desktop. SEO is 63 to 69 everywhere:
the `X-Robots-Tag: noindex` header (until launch) fails its crawlable audit, as intended. Read with care: the entrance's
blocking time (about 160 s mobile, 31 s desktop) is this sandbox drawing WebGL in software, as in v3. The real
regressions against v3 are About's and For recruiters' mobile LCP (Paper 3.0 and 3.3 s, Night 2.1 and 2.4 s; v3's About
1.96 s): the parakeet photo at up to 800 px and IM FELL's weight; and the CLS of Paper's 404 (0.076), its giant
headline's font swapping in.

**Screens:** 60 WebP, 10.2 MB, in `handoff/screens/`: 12 pages × Paper and Night × mobile (390 × 844) and desktop
(1440 × 900), full page at 2x (`node tools/measure.mjs --screens`), and the entrance at three moments (the puzzle, the
hold, the word) in both masks and sizes (`node tools/entrance-screens.mjs`). Entering an orb: ten frames per mask and a
contact sheet each in `handoff/orb-entry/` (`node tools/entry-frames.mjs`, Chrome's screencast of a click on About).

**Budget.** v4 sets none (the brief: get the design right first; a performance session follows). v3's proposal
(`handoff/budget.md`), line by line against v4, for that session:

| v3's line | v3's limit | v4 | |
| --- | --- | --- | --- |
| Content page, first visit, before fonts | 25 KB | 11.0 to 15.7 KB; About and For recruiters 83.2 and 83.7 KB | over on the two portrait pages (the photo, 71 KB) |
| Fonts, per mask | 80 KB | Night 52.0 KB; Paper 208.7 KB | Paper over (IM FELL) |
| Content page with its mask's fonts | 105 KB | Night 63 to 68 KB (135 KB with the portrait); Paper 220 to 224 KB (292 KB) | Paper over |
| JavaScript on a content page | 2 KB | 1.5 to 1.8 KB | within |
| Entrance before first paint | 15 KB | 11.4 KB | within |
| Entrance puzzle, after first paint | 120 KB | 105.8 KB | within |
| LCP, content pages, Lighthouse mobile | 1.5 s | 0.90 to 1.06 s; About and For recruiters 2.1 to 3.3 s | over on the two portrait pages |
| CLS, every page | 0.05 | at most 0.033, but Paper's 404 0.076 | over on one page |
| Total blocking time, content pages | 100 ms | 0, and 74 ms on Night's note template | within |
| Lighthouse accessibility, best practices | 100 | 100 everywhere | within |

## 4. CLAIMS

Verified this session by the checks: everything in section 3's check list, in headless Chromium here. Not verified:

- [UNVERIFIED] Real devices and other engines: an iPhone or Android phone, Safari, Firefox. Only headless Chromium ran
  the site. Entering an orb without cross-document view transitions (Firefox today) was tested by hiding the feature in
  Chromium, not in Firefox.
- [UNVERIFIED] How the ring, the flood and the bird feel at 60 frames a second on a real screen: here Chromium renders
  in software (Paper's flood was recorded at about 13 frames a second).
- [UNVERIFIED] Cloudflare Pages: that `_redirects` keeps the `#uses` fragment in its `Location` header (the local server
  does), that it applies `_headers` as the local server does, and every runbook step.
- [UNVERIFIED] The entrance's frame rate on a phone (software WebGL here), as in v3.
- [UNVERIFIED] Cloudflare's real beacon under the Trusted Types policy, as in v3.
- [UNVERIFIED] Screen readers (VoiceOver, NVDA, TalkBack): axe-core and the role, name, focus and keyboard checks ran;
  no screen reader did.
- [UNVERIFIED] That the IM FELL rename satisfies its author: it follows the licence's text (condition 3: a modified
  version may not use the reserved name), with the original notices kept; no one asked the author.
- [UNVERIFIED] Lighthouse's numbers are simulated on this sandbox's CPU, not measured on a phone over 4G.

## 5. MISSES

What went wrong, and what changed (each is in `STATE.md`):

- The mocks' LED pattern cut the dots of A and O in half (those letters start on odd units): the mark draws them as
  their own path with a shifted pattern (U1).
- U1's rule that stripped v3's containers of padding also removed the reading measure: every reading page ran its
  text across the whole frame until U4's design loop caught it.
- Night's colophon scrolled 2 px sideways on a phone (a long URL in Martian Mono); code in running text may now break
  anywhere, and a new check, `layout.fit`, guards every page (U5).
- A Night rule coloured every h2 near-white, the assistant panel's title too (light on light; axe caught it) (U5).
- The ring's hidden names still took layout space on a phone (the page scrolled sideways) (U6).
- The first take of entering an orb printed ink text over an ink flood (invisible) and cleared the flood before the
  page came out; a probe of every painted frame showed it was the choreography, not a rendering glitch (U7).
- Two of my own tests were wrong, not the site: a parakeet test moved the pointer off-screen, and an orb test read the
  page's state before the boot script's own callback ran (U7, U8).
- html-validate wanted the portrait's caption last (U9).
- Without JavaScript the loops ran with no Pause button to stop them, a WCAG 2.2.2 gap: they now rest (U10).
- The check workflow listened to `v3` only, so no `v4` push was checked on GitHub until U11.
- `STATE.md` first gave U3 33 files (it was 24), and its early wall-clock times were estimates; both were corrected
  from git and `date`.

## 6. ATTACHED

- `HANDOFF.md` (this file), `STATE.md` (units, cost, every decision), `BRIEF.md`; v3's in `docs/briefs/`.
- `handoff/design-log.md`: the §4 loop for Paper and Night (v4 sections at the end; v3's above).
- `handoff/screens/`: 60 screenshots: every page in Paper and Night, phone and desktop, full page at 2x, `<mask>--<page>--<mobile|desktop>.webp`; and the entrance at three moments, `<mask>--entrance-<puzzle|hold|word>--<size>.webp`.
- `handoff/orb-entry/`: entering an orb, ten frames per mask and a contact sheet each.
- `handoff/measure.md`, `handoff/measure.json`: Lighthouse and sizes in both masks.
- `handoff/deploy-runbook.md`, `handoff/budget.md`, `handoff/resume-pdf.md`: v3's, unchanged (see section 7).
- `MANIFEST.sha256`; `.github/workflows/check.yml`.
- Tools: `tools/check/` (`npm run check`), `tools/screens.mjs`, `tools/measure.mjs`, `tools/entrance-screens.mjs`,
  `tools/entry-frames.mjs`, `tools/slots.mjs` (every slot by page), `tools/fonts/` (fetch and rename),
  `tools/ring/halftone-sphere.mjs`, `tools/verify-live.mjs`.

## 7. OPEN AT HANDOFF

**Every `[JON: …]` slot, by page** (`node tools/slots.mjs` prints this list from the build). The footer's
`[JON: region]` is on every page and is listed once, here. On every page, the view-source note also holds
`[JON: a message for whoever reads the source]`.

**`/`**

- [JON: one sentence for search and agents: who you are and what this site is]

**`/404.html`**

- [JON: a line for the 404: the wink]
- [JON: fragment 1: a line or two of the story, from beat 1; it links back to About]

**`/about/`**

- [JON: one sentence for search and agents: who you are, in your words]
- [JON: one line that opens the story]
- [JON: beat 1 title]
- [JON: beat 1, the old web: growing up online before it turned commercial: the profiles you customised, the chatrooms, the games, the AMVs and memes; what that web felt like, and who you could be there.]
- [JON: beat 2 title]
- [JON: beat 2, out of reach: the wonder you wanted to make, and the skill that kept it out of reach.]
- [JON: a line worth pulling out]
- [JON: beat 3 title]
- [JON: beat 3, self-taught: how those years taught you the work and made your career.]
- [JON: beat 4 title]
- [JON: beat 4, advertising: why disliking it makes you good at it: when to step back, when targeting helps, when it starts to feel like being watched.]
- [JON: the closing line: the tools caught up.]

**`/colophon/`**

- [JON: contact]
- [JON: how this site was made, in your words: the brief, the puzzle, working with an AI.]
- [JON: what you would tell someone teaching themselves to make things like this.]
- [JON: fragment 4: a line or two of the story, from beat 4; it links back to About]

**`/home/`**

- [JON: one sentence for search and agents: who you are and what this site is]
- [JON: one or two lines in your own voice, under your own headline]
- [JON: note title]
- [JON: one sentence: what the note is about, for the list, the feed and agents]

**`/notes/`**

- [JON: one sentence: what Lab notes are]
- [JON: note title]
- [JON: one sentence: what the note is about, for the list, the feed and agents]
- [JON: fragment 2: a line or two of the story, from beat 2; it links back to About]

**`/notes/note-template/`**

- [JON: one sentence: what the note is about, for the list, the feed and agents]
- [JON: note title]
- [JON: the opening paragraph: what you tried, and why it was worth a note.]
- [JON: a section heading]
- [JON: the body. This file is the template (src/content/notes/note-template.md): copy it, rename it, change the date in its header. The date sorts the list and the feed.]
- [JON: a quote, if the note has one.]
- [JON: a code sample, if the note has one.]
- [JON: a list, if the note needs one.]

**`/now/`**

- [JON: one sentence: what this page is]
- [JON: date]
- [JON: what you are focused on now: work, learning, making. Two or three short paragraphs.]
- [JON: what you are reading, playing or listening to, if you want it here.]
- [JON: one line on what this section lists and why]
- [JON: hardware]
- [JON: the computer, phone and anything else you work with.]
- [JON: making things]
- [JON: the tools you make things with: editors, design tools, the AI tools that built this site.]

**`/projects/`**

- [JON: one sentence: what the projects are]
- [JON: title of the second case study]

**`/projects/case-study-2/`**

- [JON: title of the second case study]

**`/projects/mazo/`**

- [DRAFT: Jon to voice]
- [JON: fragment 3: a line or two of the story, from beat 3; it links back to About]

**`/recruiters/`**

- [JON: your LinkedIn profile link, which replaces the resume PDF; no email or phone on the site]

**`public/.well-known/security.txt`**

- [JON: contact]

**`astro.config.mjs` and `src/data/origin.mjs` (the build reads `SITE_URL`)**

- [JON: domain]

**Words that are not slots** (Jon may want to voice them): Home's headline "A child of the internet." (from the
mocks, not from v2). The labels come from the brief and the mocks ("Mask", "Paper", "Night", "Pause motion", "Replay the
intro", "Ask", "Latest project", "Latest note", the caption's "A parakeet, standing in for Jon"), except these, which
are mine: the phone's short "Replay" and "Pause", the Ask button's hidden "the assistant", "Rooms, in orbit" (the
ring's name for screen readers), and the colophon's new prose (the parakeet, the portrait's credit, what is stored, the
motion statement). v3's labels are listed in v3's handoff.

**Decisions I would change or want Jon to make, and why:**
- The headline: confirm "A child of the internet." or replace it (`HOME_HEADLINE` in `src/data/site.ts`).
- The ring's names under the dots instead of to the right (the mocks): keep, or allow right-hand names only on wide
  screens.
- One job per accent in Night: the mocks' green and orange teaser labels were greyed; one line each to restore.
- Paper's fonts are 209 KB (IM FELL's outlines are detailed; Night's are 52 KB): for the performance session, which
  could subset IM FELL harder (renamed, as now), or drop the SC face for small capitals synthesised from the roman (a
  visible loss).
- `prefers-reduced-motion` is still not honoured (Jon's rule); Pause motion is the control, and it is remembered. The
  head-follow also stops when motion is paused, which the brief did not ask for.
- v3's `handoff/budget.md` proposed limits that v4 now exceeds on purpose (section 3); it stays as v3 wrote it until
  the performance session sets v4's.
- `handoff/deploy-runbook.md` is v3's: before launch it needs one more step, `curl -sI https://<test host>/uses/` to
  see the 301 and its `Location: /now/#uses`.

**Before launch, Jon must:**
1. Fill the slots above, including the domain (`SITE_URL`) and `security.txt`'s contact; confirm the headline.
2. Follow `handoff/deploy-runbook.md` (v3's), adding the `_redirects` check above; run `node tools/verify-live.mjs`.
3. Try the site on a real phone and in Safari and Firefox: the ring, entering an orb, the bird, the puzzle in both
   masks.
4. Review the screenshots in `handoff/screens/` and the frames in `handoff/orb-entry/`.
5. Have the artist's parakeet replace `src/assets/parakeet.svg` (its contract is at the top of the file).
6. Decide the Profile mask's session (its files are kept: `src/styles/themes/profile.css`, its fonts parked in
   `tools/fonts/fonts.json`).
7. Renew `security.txt` before 2027-11-22.
