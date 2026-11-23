# HANDOFF: site v3

Written at the end of one Claude Code cloud session (2026-11-23, 02:37 to about 04:50 UTC) that worked through
`BRIEF.md` unit by unit. `STATE.md` holds the unit table, the cost log and every decision as it was made; this file
summarises them in the order §8 asks. Where the brief is quoted, it is quoted; no other words are attributed to Jon.

## 1. SCOPE

**Asked:** build the next version of the site on `v3` from `BRIEF.md`: units U0 to U17, one at a time, each done
when `npm run check` passes, committed and pushed, then ticked in `STATE.md`.

**Done:** all 18 units (U0 to U17, this file). Nothing was pushed anywhere but `v3`; `.github/workflows/test-page.yml`
is untouched; nothing was deployed.

**The spine.** Astro 7.4.13 (the current major, pinned), static output, no JavaScript by default. 13 pages: the
entrance `/`, Home `/home/`, About, Projects (MAZO's making-of, a coming-soon shell), Lab notes (one template note),
Now, Uses, For recruiters, Colophon, and a 404. Home is the hub, so every page is two plain-link clicks from every
other. Every page is complete HTML that reads without JavaScript (checked in a browser with JavaScript off). One
spacing unit, `--u`, one block of the MAZO mark, sets every space and line in every theme; the mark is the solved
puzzle's 64 blocks, the O's 16th block (the light) its own path.

**Decisions that shaped it** (each is logged in `STATE.md` with its reason):
- The curtain is a page change. The CSP forbids frames, so P0's iframe could not come along: the entrance leaves a
  one-time flag, and Home's cross-document view transition raises the finished scene (a still picture) over 1.4 s on
  P0's curve while the word MAZO, placed as an image over the 3D word, morphs into Home's header mark. P0's logic and
  finale are otherwise unchanged (`src/entrance/puzzle.js`, every edit marked `v3`, 76 diff lines).
- Hero.jsx's tagline was not carried over: it opens with a phrase on §4's banned list. The contact form was not
  carried over (§5.3). Both left `[JON: …]` slots.
- The CSP adds `trusted-types 'none'` to §3's list (no script may create a policy; none needs one). The
  Permissions-Policy denies every feature Chrome 157 knows that the site does not use (55 of them).
- "Training-only" crawlers are refused, read literally: GPTBot, ClaudeBot, Applebot-Extended, MistralAI-Training.
  Four tokens that also serve search or answers stay allowed and are flagged in section 7.
- Twins are generated from each built page's `<main>`, so they cannot drift from the pages.
- The fonts are Fontsource's OFL packages, Latin subset, pinned in `tools/fonts/fonts.json`; one file,
  `src/styles/fonts.css`, holds every face and each theme's tokens.

**Editorial** (the Paper family; also the look without JavaScript). A broadsheet that knows it is a website: warm
newsprint under a fine grain, warm black ink, and one vermilion accent used the way a risograph uses its second drum
(the mark's light block, the short rules over headings, the numbers, the current room). Literata sets text and
headlines, Libre Franklin sets labels in spaced capitals. Reading pages hang their headings in a margin column beside
one measure of text. Between pages, a page turn; the masthead holds still. Its secret is the portrait: a true halftone
print (dot size follows tone) that clears to the colour photo when you look closer.

**Terminal** (the Night family). The engineer's side as a dark instrument: near-black ground, a cyan-teal signal,
violet tags, a magenta-and-cyan fringe behind the headline, and the mark drawn as an LED panel whose warm light block
flickers on once like neon. Martian Mono sets structure, Atkinson Hyperlegible Next sets reading text. Its winks are
the site's own facts: every page has a Markdown twin, so headings carry `##`; rooms are `./About`; the masthead shows
`~/path/`; lists read like a listing. The portrait is an X-ray, a cyan negative. Between pages, a CRT powers off to a
line and on again. Loops end within five seconds, so nothing needs a pause control.

**Profile** (the Collage family). Self-aware Y2K maximalism, after what the old profile page did rather than how it
looked: a pale graph-paper tile you might have picked yourself, content in hard-edged windows with title bars (hard
shadow, no blur), mint bevel buttons that press in, the mark extruded in coral, ranks in small badges, and the profile
picture stuck on at an angle that straightens when you touch it. Bungee Shade (its 3D shading is part of the letters)
sets display, Nunito the rest; one knowing coral-to-pink gradient, on title bars only. Between pages, a window pops.

**The rest:** the theme switcher is three masks (the brief's optional idea), a native radio group; the story's four
fragments are native `<details>` marked by the light block's square; the gag chatbot answers in an invented
vocabulary; the colophon is generated from the build. Not built: the optional site-map diagram and "the eye that
tracks nothing".

## 2. CROSSING

- **Branch:** `v3`, pushed to `origin`. Last commit before this handoff: `a1f6179` (U16 ticked). This file arrives
  in the next commit; `STATE.md`'s U17 tick and `MANIFEST.sha256` in the one after, which is the tip of `v3`.
- **`MANIFEST.sha256`:** `sha256sum` of every tracked file at the tip (itself excluded; `.git` is never tracked).
  Verify from a checkout of the tip:

  ```bash
  git ls-files | grep -vx MANIFEST.sha256 | xargs -d '\n' sha256sum | diff - MANIFEST.sha256 && echo identical
  ```

- **CI:** `.github/workflows/check.yml` (build and check on every push to `v3`, read-only, actions pinned to commits,
  never deploys) ran on GitHub's runners after every push: 30 of 30 completed runs succeeded (#1 to #30, U1 to U15's
  tick); later runs were in progress when this was written.

## 3. MEASURED

**The checks.** `npm run check`: 55 checks, 55 passed, 0 pending, about 80 s in this sandbox. What they cover: HTML
validation (html-validate), links and fragments, the §3 pages and two-click reach, the §4 banned patterns, every page
in every theme in Chromium served with `dist/_headers` (CSP and Trusted Types violations, every request, script errors,
the theme applied), every page without JavaScript, axe-core WCAG 2.2 AA tags per page and theme, `_headers` against
§3 (and each inline script's hash), fonts per theme, the entrance (3D code isolated, puzzle data verified, a headless
play-through to Home), the switcher, the secrets in the walls, the chatbot, the beacon, JSON-LD, the agent files, and
a secret scan. U1's checkers were first run against a deliberately broken copy of the site and each caught its
defect; the checks added later were written against the behaviour they guard (the beacon's includes a refused host).

**Sizes** (`npm run build`; the build measures `dist/` and writes the table into the colophon; brotli, first visit,
before fonts):

| Page | HTML | CSS | JS | Images | Total KB | Total KB, gzip |
| --- | --- | --- | --- | --- | --- | --- |
| / | 1.6 | 7 | 0.9 | 0 | 9.5 | 10.9 |
| /404.html | 1.6 | 5.9 | 1.3 | 0 | 8.7 | 10.1 |
| /about/ | 2.2 | 5.9 | 1.3 | 8.2 | 17.6 | 19.1 |
| /colophon/ | 5.5 | 5.9 | 1.3 | 0 | 12.7 | 14.8 |
| /home/ | 2 | 5.9 | 1.3 | 0 | 9.1 | 10.6 |
| /notes/ | 1.8 | 5.9 | 1.3 | 0 | 8.9 | 10.3 |
| /notes/note-template/ | 2 | 5.9 | 1.3 | 0 | 9.1 | 10.5 |
| /now/ | 1.7 | 5.9 | 1.3 | 0 | 8.8 | 10.2 |
| /projects/ | 1.8 | 5.9 | 1.3 | 0 | 8.9 | 10.3 |
| /projects/case-study-2/ | 1.7 | 5.9 | 1.3 | 0 | 8.8 | 10.1 |
| /projects/mazo/ | 4.7 | 5.9 | 1.3 | 0 | 11.9 | 13.8 |
| /recruiters/ | 2.8 | 5.9 | 1.3 | 8.2 | 18.2 | 19.9 |
| /uses/ | 1.9 | 5.9 | 1.3 | 0 | 9 | 10.4 |

Fonts per theme (WOFF2, loaded only by their theme): Editorial 77.6 KB, Terminal 58.5 KB, Profile 78.5 KB. The
entrance's puzzle, loaded after first paint: 105.4 KB brotli, 499.5 KB raw, 130 KB with `gzip -9` (three.js inside).

**Lighthouse 13.6.0** (`npm run build && node tools/measure.mjs --lighthouse`; Chromium 1243 in this sandbox; built
site served locally with `_headers`; beacon blocked). Mobile, Lighthouse's default (simulated slow 4G, 4x CPU):

| Page | Perf | LCP ms | FCP ms | CLS | TBT ms | Speed index ms | Weight KB | A11y | Best practices | SEO |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 60 | 1053 | 1053 | 0.002 | 160499 | 19336 | 556.7 | 100 | 100 | 100 |
| /404.html | 100 | 907 | 907 | 0.001 | 0 | 907 | 115 | 100 | 100 | 63 |
| /about/ | 99 | 1957 | 904 | 0.001 | 0 | 904 | 127.1 | 100 | 100 | 100 |
| /colophon/ | 100 | 1054 | 1054 | 0.003 | 0 | 1054 | 155 | 100 | 100 | 100 |
| /home/ | 100 | 913 | 913 | 0.001 | 0 | 913 | 116.4 | 100 | 100 | 100 |
| /notes/ | 100 | 904 | 904 | 0.002 | 0 | 904 | 115.3 | 100 | 100 | 100 |
| /notes/note-template/ | 100 | 904 | 904 | 0.001 | 0 | 904 | 116 | 100 | 100 | 100 |
| /now/ | 100 | 903 | 903 | 0.013 | 0 | 903 | 115 | 100 | 100 | 100 |
| /projects/ | 100 | 904 | 904 | 0.045 | 0 | 904 | 115.2 | 100 | 100 | 100 |
| /projects/case-study-2/ | 100 | 902 | 902 | 0.001 | 0 | 902 | 115.1 | 100 | 100 | 66 |
| /projects/mazo/ | 100 | 1053 | 1053 | 0.009 | 0 | 1053 | 150.3 | 100 | 100 | 100 |
| /recruiters/ | 100 | 903 | 903 | 0.017 | 0 | 903 | 152.7 | 100 | 100 | 100 |
| /uses/ | 100 | 903 | 903 | 0.001 | 0 | 903 | 115.5 | 100 | 100 | 100 |

Desktop preset:

| Page | Perf | LCP ms | FCP ms | CLS | TBT ms | Speed index ms | Weight KB | A11y | Best practices | SEO |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 60 | 247 | 247 | 0 | 31677 | 6140 | 556.7 | 100 | 100 | 100 |
| /404.html | 100 | 245 | 245 | 0.004 | 0 | 245 | 115 | 100 | 100 | 63 |
| /about/ | 100 | 488 | 245 | 0.024 | 0 | 245 | 127.1 | 100 | 100 | 100 |
| /colophon/ | 100 | 290 | 290 | 0.039 | 0 | 290 | 155 | 100 | 100 | 100 |
| /home/ | 100 | 258 | 258 | 0.004 | 0 | 258 | 116.4 | 100 | 100 | 100 |
| /notes/ | 100 | 242 | 242 | 0.002 | 0 | 242 | 115.3 | 100 | 100 | 100 |
| /notes/note-template/ | 100 | 246 | 246 | 0.013 | 0 | 246 | 116 | 100 | 100 | 100 |
| /now/ | 100 | 246 | 246 | 0.002 | 0 | 246 | 115 | 100 | 100 | 100 |
| /projects/ | 100 | 246 | 246 | 0.002 | 0 | 246 | 115.2 | 100 | 100 | 100 |
| /projects/case-study-2/ | 100 | 248 | 248 | 0.002 | 0 | 248 | 115.1 | 100 | 100 | 66 |
| /projects/mazo/ | 100 | 288 | 288 | 0.003 | 0 | 288 | 150.3 | 100 | 100 | 100 |
| /recruiters/ | 100 | 250 | 250 | 0.021 | 0 | 250 | 152.7 | 100 | 100 | 100 |
| /uses/ | 100 | 249 | 249 | 0.012 | 0 | 249 | 115.5 | 100 | 100 | 100 |

Read with care: the entrance's blocking time (31 to 160 s) is this sandbox drawing WebGL in software, every frame on
the main thread; it says nothing about a phone with a GPU. About's mobile LCP (1.96 s) is the one number over the
brief's 1.5 s reference, open (section 7). SEO is below 100 only on the two `noindex` pages, by design.

**Resume PDF** (`tools/pdf/strip.py`, pypdf 7.1.1): 1 page; removed: 4 document-info fields, the XMP stream with its
document and instance IDs, the file ID; text byte-identical and pages pixel-identical after (details in
`handoff/resume-pdf.md`).

**Screenshots** (`node tools/measure.mjs --screens`): 78 (13 pages × 3 themes × mobile 390 × 844 and desktop
1440 × 900, full page, 2x), WebP, 13.8 MB.

**Proposed budget** (`handoff/budget.md`, line by line against the numbers above):

| What | Budget | Measured now | Headroom |
| --- | --- | --- | --- |
| Content page, first visit, before fonts (HTML + CSS + JS + images) | 25 KB | 8.7 to 18.2 KB | 6.8 KB on the heaviest (About, For recruiters: the portrait) |
| Fonts, per theme (WOFF2) | 80 KB | 58.5 (Terminal), 77.6 (Editorial), 78.5 (Profile) | 1.5 KB in Profile |
| Content page, first visit, with its theme's fonts | 105 KB | at most 96.7 KB | 8 KB, before the beacon |
| JavaScript on a content page | 2 KB | 0.4 to 0.6 KB (switcher, chat launcher) | |
| The assistant, loaded on first open | 6 KB | under 3 KB (widget and stylesheet) | |
| Entrance before first paint | 15 KB | 9.5 KB | |
| Entrance puzzle, after first paint | 120 KB | 105.4 KB (three.js inside) | 14.6 KB |
| LCP, content pages, Lighthouse mobile (simulated slow 4G, 4x CPU) | 1.5 s | 0.90 to 1.05 s; About 1.96 s | About is over: see below |
| CLS, every page | 0.05 | at most 0.045 | small: font swaps |
| Total blocking time, content pages | 100 ms | 0 ms | |
| Lighthouse accessibility, best practices | 100 | 100 everywhere | |

## 4. CLAIMS

Verified this session by the checks: everything in section 3's check list, in headless Chromium 157 here and on
GitHub's Ubuntu runners. Not verified:

- [UNVERIFIED] Behaviour on real devices: an iPhone or Android phone, Safari, Firefox. Only headless Chromium ran the
  site. The curtain's fallback for browsers without cross-document view transitions (P0's stage lift, then Home)
  never ran.
- [UNVERIFIED] The entrance's frame rate and blocking time on a mid-range phone (software WebGL here).
- [UNVERIFIED] Cloudflare Pages: that it applies `_headers` as the local test server does, including on its 404
  responses; that it builds with Node 22.23.5; that `NPM_FLAGS` works; every dashboard step in the runbook.
- [UNVERIFIED] Cloudflare's real `beacon.min.js` under `require-trusted-types-for 'script'` and `trusted-types
  'none'`, and its size: its host was unreachable here (a stand-in script tested the CSP's two hosts).
- [UNVERIFIED] The crawler names and purposes from OpenAI, Google, Apple, Perplexity, Common Crawl, Meta, Amazon,
  Microsoft, DuckDuckGo, Mistral and Cohere were read through web search results that quote their official pages
  (only Anthropic's page could be fetched); every URL is in `src/data/crawlers.ts` and on the colophon.
- [UNVERIFIED] Screen readers (VoiceOver, NVDA, TalkBack): axe-core and the role, name and focus checks ran; no
  screen reader did.
- [UNVERIFIED] Lighthouse numbers are simulated on this sandbox's CPU, not measured on a phone over 4G.
- [UNVERIFIED] The stripped PDF opens in every reader: it opened and rendered in poppler only.

## 5. MISSES

What went wrong, and what changed (each logged in `STATE.md`):

- Shiki's syntax highlighting writes inline `style` attributes, which the CSP blocked (the check caught it in U3).
  Highlighting is off.
- Astro 7 replaced remark with its own Markdown processor, Sätteri: the glyph-drawing plugin was ported to it (U4).
- Editorial v1's halftone used a blend that capped the darkest dot at a fifth of a cell: rebuilt with the right
  maths (U4). Terminal v1's wireframe mark was an unreadable mesh at header size: now an LED panel (U6). Profile's
  draft note measured 4.47:1 against mint (axe): fixed (U7).
- The colophon showed crawler tokens in capitals through Editorial's label style: fixed in Editorial's file (U10).
- The chatbot's transcript was an `<ol role="log">`, which strips the list (axe): now `div`s. Astro hoisted the
  widget's stylesheet into every page: it is now attached on first open (U12).
- With the beacon in every page, the entrance's play-through check first hit the network, then showed Chrome
  aborting the curtain's view transition in 3 to 4 runs of 5. Cause: Playwright's request interception, not the site.
  The check now runs in its own browser with no interception (U13).
- The portrait was lazy-loaded above the fold: now eager. It did not fix About's LCP, which stays open (U15).
- WebP's 16,383 px limit stopped the screenshot conversion: the longest phone pages are scaled to fit (U15).
- A check rule (80 characters of text in every `<main>`) did not fit the 404 or the shell: both exempted (U3).
- My own test harness for `tools/verify-live.mjs` deadlocked (a synchronous call blocked its own server); the tool
  was then tested properly (U16).
- `STATE.md` once said the 404 has no header; it has one. Corrected in the log (U9).

## 6. ATTACHED

- `HANDOFF.md` (this file), `STATE.md` (units, cost, every decision), `BRIEF.md`.
- `handoff/design-log.md`: the §4 loop for Editorial, Terminal and Profile (critique of v1, the one revision).
- `handoff/screens/`: 78 screenshots, `<theme>--<page>--<mobile|desktop>.webp`.
- `handoff/measure.md`, `handoff/measure.json`: Lighthouse and sizes; `handoff/budget.md`: the proposed budget.
- `handoff/deploy-runbook.md`: Cloudflare Pages, the test subdomain, header checks, crawlers, the token, launch.
- `handoff/resume-pdf.md`: what the resume carried and what ships.
- `MANIFEST.sha256`; `.github/workflows/check.yml`.
- Tools: `tools/check/` (`npm run check`), `tools/screens.mjs`, `tools/measure.mjs`, `tools/verify-live.mjs`,
  `tools/fonts/` (fonts), `tools/pdf/strip.py`.

## 7. OPEN AT HANDOFF

**Every `[JON: …]` slot, by page.** On every page, the view-source note at the top of the HTML also holds
`[JON: a message for whoever reads the source]`.

**`/`**

- [JON: one sentence for search and agents: who you are and what this site is]

**`/404.html`**

- [JON: a line for the 404: the wink]
- [JON: fragment 1: a line or two of the story, from beat 1; it links back to About]

**`/about/`**

- [JON: one sentence for search and agents: who you are, in your words]
- [JON: one line that opens the story; region: [JON: region]]
- [JON: beat 1 title]
- [JON: beat 1, the old web: growing up online before it turned commercial: the profiles you customised, the chatrooms, the games, the AMVs and memes; what that web felt like, and who you could be there.]
- [JON: beat 2 title]
- [JON: beat 2, self-taught: how those years taught you the work and made your career, and the wonder you wanted to make that skill kept out of reach.]
- [JON: beat 3 title]
- [JON: beat 3, advertising: why disliking it makes you good at it: when to step back, when targeting helps, when it starts to feel like being watched.]
- [JON: beat 4 title]
- [JON: beat 4, now: the tools have caught up with the wonder; what you make with them, and why this site.]

**`/colophon/`**

- [JON: contact]
- [JON: how this site was made, in your words: the brief, the puzzle, working with an AI.]
- [JON: what you would tell someone teaching themselves to make things like this.]
- [JON: fragment 4: a line or two of the story, from beat 4; it links back to About]

**`/home/`**

- [JON: one sentence for search and agents: who you are and what this site is]
- [JON: one or two lines in your own voice, in place of v2's tagline (it used a phrase on the brief's banned list)]
- [JON: title of the second case study]
- [JON: note title]
- [JON: one sentence: what the note is about, for the list, the feed and agents]

**`/notes/`**

- [JON: one sentence: what Lab notes are]
- [JON: note title]
- [JON: one sentence: what the note is about, for the list, the feed and agents]
- [JON: fragment 2: a line or two of the story, from beat 2; it links back to About]

**`/notes/note-template/`**

- [JON: note title]
- [JON: one sentence: what the note is about, for the list, the feed and agents]
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

**`/projects/`**

- [JON: one sentence: what the projects are]
- [JON: title of the second case study]

**`/projects/case-study-2/`**

- [JON: title of the second case study]

**`/projects/mazo/`**

- [JON: fragment 3: a line or two of the story, from beat 3; it links back to About]

**`/recruiters/`**

- [JON: region]
- [JON: contact: a profile link; no email or phone on the site]

**`/uses/`**

- [JON: one sentence: what this page lists]
- [JON: one line on what this page lists and why]
- [JON: hardware]
- [JON: the computer, phone and anything else you work with.]
- [JON: making things]
- [JON: the tools you make things with: editors, design tools, the AI tools that built this site.]

**`public/.well-known/security.txt`**

- [JON: contact]

**`astro.config.mjs` and `src/data/origin.mjs` (the build reads `SITE_URL`)**

- [JON: domain]

**Words I wrote that are not slots** (functional labels and the gag's lines; Jon may want to voice them): "Skip
intro", "Replay the intro", "Skip to content", "Not found", "Coming soon." (the brief's term), "Rooms" (Home's
heading, visible in Profile), "Name", "Region", "Contact", "Theme" (the switcher's hidden legend), "The whole story"
and "A fragment of the story" (the fragments), "This page in Markdown" (a link title), the chatbot's "Hi! How can I
help you today?", "Type a message", "Send" and "Close the assistant", the 404's description ("Nothing lives at this
address."), the colophon's description and its generated prose, the sentence at the top of `llms.txt`, the comments in
`robots.txt`, and MAZO's case study, marked `[DRAFT: Jon to voice]`.

**Decisions I would change or want Jon to make, and why:**
- The mixed-use crawlers: Google-Extended (it also decides whether Gemini's answers can ground on the site),
  CCBot, Meta-ExternalAgent and Amazonbot are allowed because the brief refuses *training-only* crawlers. Refusing
  them protects more content from training at the cost of some citations: one line each in `src/data/crawlers.ts`.
- `trusted-types 'none'` is my addition to §3's CSP; keep it unless the beacon needs a policy.
- Reduce Motion is not honoured (the brief's rule, "to be revisited"); the puzzle's reduced version and a fade are
  still in the code behind one setting each, and every theme's page transition is a few lines to soften.
- About's mobile LCP (1.96 s on simulated slow 4G): find the cause with Lighthouse's LCP breakdown, then budget it.
- `font-display: swap` costs a little layout shift (CLS up to 0.045); `optional`, with the entrance warming the
  fonts, would trade a first-visit fallback for none.
- Turn `handoff/budget.md` into checks once Jon agrees the numbers.
- The headshot in v2 (`src/assets/headshot.webp`) shows a parrot, with the alt text "Jonathan Mazo". It is kept as it
  stands; a real photo, or alt text that says what it shows, is Jon's call.
- The entrance keeps P0's dark stage in every theme until the puzzle's looks are chosen (spec, P2).

**Before launch, Jon must:**
1. Remove the email address from the resume PDF, or replace the PDF (`handoff/resume-pdf.md`).
2. Fill the slots above, including the domain (`SITE_URL`) and `security.txt`'s contact.
3. Follow `handoff/deploy-runbook.md`: Pages on `v3` with access to this repository only, the test subdomain with
   `noindex`, `CF_BEACON_TOKEN`, Cloudflare's crawler settings matched to `robots.txt`.
4. On the test subdomain: `node tools/verify-live.mjs https://test.example.com`, check the 404's headers, and check
   the console for CSP or Trusted Types errors from the beacon.
5. Before `includeSubDomains` goes live on the real domain, make sure every subdomain serves HTTPS.
6. Review the screenshots in `handoff/screens/` (the brief: dislikes "come from Jon's review of this run's
   screenshots"), and try the entrance on a real phone.
7. Decide the mixed-use crawlers, and renew `security.txt` before 2027-11-22.
