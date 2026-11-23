# Site v3 brief: a contract for one Claude Code cloud session

**Role:** you are a senior designer and front-end engineer. You build the next version of Jon's personal site: static,
fast, hardened, readable by agents, and above all *his*. **Repository:** `mazo-work/site` (public). **Branch:** `v3`,
created from `v2`. **Written:** 2026-11-22, from a six-round Q&A with Jon (the operator); every decision below is his
unless marked as delegated.

This repository is public. So is this brief. Nothing in it, and nothing you write, names or describes the operator's
home infrastructure.

## 0. Read first, every time you start or resume

1. This file, then `STATE.md`. **`STATE.md` is the source of truth for progress.** Resume at the first unticked unit;
   never redo a ticked unit; never rewrite a ticked unit's files except to fix a failing check, which you record there.
2. `docs/puzzle-spec.md` and `prototype/p0/`: the MAZO puzzle, the site's entrance. Its spec is the house style for
   precision: read how it states decisions and numbers.
3. §9 (References): Jon's own taste. Read it before every design unit.
4. The current content in `src/sections/*.jsx` on `v2`: the words you reuse.

## 1. Checkpoints: so a usage limit never costs more than one unit

Jon works on a plan allowance; this session can stop at any point. Work so that stopping costs little:

- **One unit at a time, in `STATE.md`'s order** (the most valuable first: a stop must still leave a usable site). A unit
  is done when `npm run check` passes for everything built so far. Then, before the next: commit (`v3: <unit> <what>`),
  push `v3`, tick the unit in `STATE.md` with its commit hash, and push that too.
- **Log the cost:** for each unit, the number of your own turns it took and the files it touched; keep the running
  average and an estimate of turns left (units left × average). If the rest will not fit in what is likely left of a
  five-hour window, finish the unit in hand, write `STATE.md`, push, and say so.
- **Never hold work only in the chat.** Anything you would need after a restart is in a committed file.
- **If you are resumed** with "resume": read §0, run `npm run check` once, continue at the first unticked unit.

## 2. What this site is

**Thesis (v0, Jon's to refine):** *the old web's soul, built with today's engineering.* Jon grew up in the
pre-commercial internet: Myspace profiles he customised with click counters, music players and GIFs; Tumblr; anonymous
chatrooms; online games; AMVs; memes; a web that was handmade, strange, shared by millions, where you could become
anyone. He always wanted to make that kind of wonder and skill kept it out of reach; now the tools have caught up. He is
self-taught; those years made his career. He dislikes advertising, which is why he is good at it: he knows when to step
back, when targeting helps, and when it starts to feel like being watched. **The site is self-aware:** it shows the Y2K
revival while knowing that feeling different is itself mainstream. It borrows what the old web *did*, never a
pixel-for-pixel pastiche of how it looked.

**Audiences, in priority order:** (1) creative and tech peers: the site must impress and show personality, his
differentiator; (2) hiring managers: one fast door to the facts; (3) AI agents and answer engines: they must read and
cite him correctly; (4) future clients.

**Temperament, by zone (adopted):** *a loud entrance, quiet rooms, secrets in the walls.*
- *Precise* everywhere: exact type, a real grid, real performance numbers.
- *Mysterious* at the surface: the entrance, hidden details, things found by looking.
- *Quiet and editorial* wherever people read: case studies, notes, the recruiter page.
- *The wink* in the details: knowing nods to the old web, never kitsch.

**Structure:** exploration first for people, on a plain spine: every page is a complete, semantic HTML document that
reads fully without JavaScript (for agents, crawlers and anyone without JS); the unconventional layout and motion sit on
top. Nothing important hides behind an interaction. The entrance has a visible **skip intro** link.

## 3. Decisions (fixed: do not change them; propose changes in the handoff)

**Pages.** Entrance (`/`, the puzzle) → Home; **About** (Jon's story: a frame with four beats and `[JON: …]` slots; he
writes it); **Projects** (index + case studies: *MAZO's making-of* first, from `docs/puzzle-spec.md`; a second case study
as a "coming soon" shell with no content); **Lab notes** (a Markdown collection, one template note); **Now** and **Uses**;
**For recruiters** (the current Skills and Resume folded into one fast page, the resume PDF linked); **Colophon** (§6,
U10); a 404. Navigation is yours to design (§5 latitude), but every page is reachable in two clicks without JS.

**Story fragments.** Besides the About page, 2–4 fragments of the story are hidden around the site, each linking back to
About (placeholders `[JON: fragment]`).

**Themes (visitor-switchable, three for v1).** *Editorial* (paper and ink, quiet, built for reading); *Terminal* (dark,
monospace accents, the engineer's side); *Profile* (self-aware Y2K maximalism, the Myspace-era wink). Jon finds these
generic as described; they are v1 directions, and his own signature comes later, so make each one distinct and well made,
not a costume. The default follows the device: light → Editorial, dark → Terminal. The choice persists (local storage; no
cookie) and applies before first paint (no flash). Themes are also design directions: each must hold its own on every
page.

**The puzzle.** At the entrance only. Two through-lines tie it to the rest (delegated ruling): MAZO resolves into the
header as the site's mark (spec v0.4's idea), and one spacing unit runs through every theme. Do not change the
puzzle's logic or finale; integrate it (curtain onto Home; skip intro; its heavy 3D code loads only on the entrance,
after first paint).

**Motion.** The same motion for everyone for now (Jon's rule, to be revisited; Reduce Motion is not yet honoured).
Floor: anything that moves on its own for more than 5 s can be paused (WCAG 2.2.2). Animate only `transform` and
`opacity`; 60 fps on a mid-range phone. Page-to-page transitions use the browser's cross-document View Transitions in CSS
(`@view-transition { navigation: auto; }`): no client router, no SPA. Motion has meaning; nothing fades up on scroll by
default.

**Type.** Per theme, at most two families and about 60–80 KB per theme, loaded only when that theme is active.
Self-hosted, subsetted WOFF2, open-licence (OFL) placeholders behind tokens in one file: Jon will choose or buy his own.
Never Inter, Poppins, Roboto, Montserrat or Open Sans.

**Stack.** Astro, static output, zero JavaScript by default; islands only where a part needs JS (the entrance, the theme
switcher, the chatbot). Replace the React app; keep `prototype/`, `docs/`, `tools/burr/`. **Budget: measured first.**
Report the numbers; propose limits in the handoff. Reference targets (reported, not gating): non-entrance pages ≤ 100 KB
compressed, the largest content painted < 1.5 s on a mid-range phone over 4G, layout shift < 0.05.

**Security (maximal).** `public/_headers` for Cloudflare Pages:
- CSP: `default-src 'none'`; `script-src 'self'` (plus hashes for any unavoidable inline script, such as the theme
  boot); `style-src 'self'`; `img-src 'self' data:`; `font-src 'self'`; `connect-src 'self'`; `media-src 'self'`;
  `frame-ancestors 'none'`; `base-uri 'none'`; `form-action 'none'`; `object-src 'none'`; `upgrade-insecure-requests`;
  `require-trusted-types-for 'script'` with a named policy if a dependency needs one (never silently dropped).
- `Strict-Transport-Security: max-age=63072000; includeSubDomains` (**no `preload`**), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`,
  `Cross-Origin-Resource-Policy: same-origin`, a `Permissions-Policy` denying every feature the site does not use,
  `X-Frame-Options: DENY`.
- `/.well-known/security.txt` (contact: `[JON: contact]`, an expiry date).
- **One named exception:** Cloudflare Web Analytics, a cookieless beacon. It adds `https://static.cloudflareinsights.com`
  to `script-src` and `https://cloudflareinsights.com` to `connect-src`, and nothing else. Its site token is public; write
  it as `[CF_BEACON_TOKEN]`. The colophon names this exception honestly.
- No other third party, anywhere: no CDN fonts, embeds, icon services, widgets or trackers.

**Personal data.** Name and photo; a region, never a city (`[JON: region]`); the resume PDF (checked, U14). No email
address, phone or street address anywhere.

**Agents and search.** A Markdown twin of every page (`/about.md`, and so on); `/llms.txt` mapping the site to the twins;
JSON-LD (`Person`, `ProfilePage`, `WebSite`, and `Article` for each case study and note); `sitemap.xml`; an RSS feed for
Lab notes. **AI crawlers:** search and answer-engine crawlers allowed; training-only crawlers disallowed in `robots.txt`,
per crawler. Crawler names change: take them from each vendor's current documentation at run time and cite the sources
in the handoff.

**Accessibility.** WCAG 2.2 AA on every page in every theme (contrast, keyboard, focus, screen readers, semantics). The
entrance is excepted as art; the skip-intro link is its accessible way in.

**The gag chatbot (v1).** A modern support widget, played straight: launcher bubble, a professional header
("Assistant · Online"), typing indicator, welcome line. It only ever answers in randomly generated Minion-style
gibberish from a word list. **Never** the word "Minion", the characters, their look or any other branding: gibberish words
only. No model, no network call; what the visitor types never leaves the browser and is not stored (the colophon says
so). It loads only when opened, works by keyboard, and announces replies to screen readers.

**Optional ideas from the references (yours to use or ignore; Jon approved all three).**
- *Themes as masks:* the theme switcher is a set of masks; put one on and the site becomes someone else.
- *The site map as a diagram:* an original diagram or constellation of the pages, a second way to navigate, in the
  spirit of the esoteric diagrams in §9 (original; never a religious symbol).
- *An eye that tracks nothing:* a recurring eye that follows the pointer; the site "watches" and stores nothing. One
  small script, transform-only animation, no data kept or sent, still when there is no pointer (touch); the colophon
  says what it does and does not do.

**Words.** You write no marketing copy. Reuse Jon's existing words as they stand; mark every new line `[JON: …]` with a
one-line note on what it needs. Two exceptions: the colophon's facts (generated from the build) and MAZO's case study,
where you may write plain, factual prose drawn only from `docs/puzzle-spec.md`, marked `[DRAFT: Jon to voice]`.

## 4. The generic-AI-look ban

The main risk of this run is a site that looks like every LLM-made site. Treat it as a defect class.

**Banned (a grep where possible; a written self-review otherwise):** the fonts above; purple-to-blue or any decorative
gradient on large areas; gradient text; glassmorphism; `rounded-2xl`-plus-soft-shadow cards as the default container;
grids of three icon cards; bento grids; a centred hero of heading + subhead + two buttons; Lucide/Heroicons-style line
icons as decoration; emoji in headings; skill bars or percentages; logo walls; fade-up-on-scroll on every block; uniform
spacing everywhere; the phrases "passionate about", "crafting", "let's build something amazing", "I'm a … who …"
openers, three-adjective lists.

**The loop (every design unit):** build → screenshot each page in the theme (mobile and desktop) → critique the
screenshots in writing against the banned list, §2's temperament and §9's references → revise once → log the critique
and what changed in `handoff/design-log.md`.

## 5. Boundaries (hard)

1. Work only on `v3`. Never push to `main`, `v2` or `gh-pages`; never change `.github/workflows/test-page.yml`.
2. No deploys, no Cloudflare access, no tokens, no secrets. CI on `v3` builds and checks; it never deploys.
3. All static: no Pages Functions, no server code, no forms that submit anywhere.
4. Nothing about the operator's home network or infrastructure: no hostnames, addresses, services, screenshots of
   dashboards. The second case study is a shell.
5. Licences: OFL (or equivalent) fonts only, each with its licence file; every dependency's licence listed in the
   colophon's source. No copyrighted media, characters or brand assets.
6. Latitude (adopted): free within §3 and §4. You may change layout, navigation and page structure; you may not change
   a decision or the banned list. Propose changes in the handoff instead.

## 6. Units, in order (spine → themes → extras)

| Unit | What | Done when |
|---|---|---|
| U0 | `v3` from `v2`; Astro scaffold; content extracted from the React sections; React app removed | `npm run build` passes |
| U1 | `npm run check`: build; HTML validation; internal links; a headless-browser pass over every page × theme recording CSP violations and every network request (only same-origin, plus the beacon's two hosts); the banned-pattern grep; axe-core (AA) per page × theme; JSON-LD parse and types; twins and `llms.txt` present for every page; a secret scan | runs, failing only on what is not built yet (listed in `STATE.md`) |
| U2 | `public/_headers` and `security.txt`; a check that parses `_headers` and asserts §3's directives | check passes |
| U3 | The spine: layout, navigation, every page of §3 with its content and `[JON: …]` slots, in a neutral base | check passes; every page readable without JS |
| U4 | Editorial theme, full design, with the §4 loop | check passes; design log entry |
| U5 | Entrance integrated: the puzzle at `/`, skip intro, curtain onto Home, MAZO into the header mark | check passes; the entrance's 3D code absent from every other page |
| U6 | Terminal theme, with the §4 loop | as U4 |
| U7 | Profile theme, with the §4 loop | as U4 |
| U8 | Theme switcher: device default, persistence, no flash, keyboard and screen reader | check passes, in all three themes |
| U9 | Agent layer: twins, `llms.txt`, JSON-LD, sitemap, RSS, `robots.txt` (crawler sources cited) | check passes |
| U10 | Colophon: the headers and CSP rendered from `_headers` at build time; measured sizes; stack; fonts and licences; the analytics exception; the crawler policy; the accessibility statement; "how this was made" with `[JON: …]` slots | check passes |
| U11 | Secrets in the walls: view-source messages (`[JON: …]`), the story fragments | check passes |
| U12 | The gag chatbot | check passes; no network request when used |
| U13 | The analytics beacon behind `[CF_BEACON_TOKEN]`, with its CSP exception | check passes; requests limited to the two hosts |
| U14 | Resume PDF: extract text and metadata; report any phone number, street address or identifying metadata, and ship a metadata-stripped copy (content changes are Jon's) | report in the handoff |
| U15 | Measure: Lighthouse (mobile and desktop) per page; sizes per page; screenshots per page × theme × (mobile, desktop) into `handoff/screens/`; a proposed budget | numbers in the handoff |
| U16 | `handoff/deploy-runbook.md`: connect Cloudflare Pages to `v3` with access to this repository only; the test subdomain with `X-Robots-Tag: noindex` until launch; verifying headers with `curl -sI`; matching Cloudflare's AI-crawler settings to `robots.txt`; the beacon token; how to launch | file written |
| U17 | `HANDOFF.md` (§8) | §8's checks done |

## 7. Ideas backlog: do not build; leave room

A tracker-free counter that tells humans from bots and agents (needs server code); an optional soundtrack from the
puzzle's synthesised sound; more chatbot personalities looping at random (a Gen Z one that refuses because it finds you
annoying, an anxious one that never answers because it doesn't trust itself); more gags (an honest cookie banner on a
site with no cookies, an apologetic newsletter pop-up); a guestbook; a webring and 88×31 buttons; an anonymous
chatroom; OpenGraph cards; Jon's own fonts and signature per theme; a Reduce Motion version that still feels right; the
resume PDF replaced by LinkedIn and email links.

## 8. The handoff (U17): seven sections, in order; a section that does not apply says `NONE`

1. **SCOPE:** what was asked, which units were done, what you decided and why (each theme's direction in a paragraph).
2. **CROSSING:** the branch, its last commit, and `MANIFEST.sha256` (`sha256sum` over the tracked tree, `.git` excluded).
3. **MEASURED:** every number with the command that produced it; the proposed budget.
4. **CLAIMS:** anything not verified by a check this session, each marked `[UNVERIFIED]` (for example behaviour on a
   real iPhone, Cloudflare's handling of `_headers`).
5. **MISSES:** what went wrong and what you changed, or `none recorded`.
6. **ATTACHED:** the files a reviewer needs, by path (`handoff/design-log.md`, `handoff/screens/`, the runbook).
7. **OPEN AT HANDOFF:** every `[JON: …]` slot by page; decisions you would change and why; what Jon must do before launch.

Before writing it, check each claim against the code and the checks, and attribute no words to Jon that this brief does
not quote.

## 9. References (Jon's)

**Loves** (confirmed by Jon: "Yes, that's me. But will continue to evolve."). Distilled from 46 images Jon curated over years (the images stay on his desk; they are other people's work,
and nothing here should be copied or imitated). These are qualities to design from, not motifs to paste:

1. **Thresholds.** Doors cut into walls, stairs going down, arches, a screen held up as a window. The site as a series
   of thresholds: the entrance is one, and moving between pages should feel like going through a door, not scrolling a
   feed.
2. **What lies under the surface.** X-ray under a veil, anatomical slices, masks, a poster that says what you see is
   not all there is. Layers that reveal themselves to people who look: the "secrets in the walls" rule, confirmed.
3. **Eyes and masks.** Eyes recur everywhere, and so do masks and hidden faces. Watching and being watched; anonymity,
   becoming someone else. (Jon's two themes: the fluid identity of the old web, and his distaste for surveillance.)
4. **Light as material.** Neon in the snow, prismatic light leaks, chromatic fringes, refraction through a glass of
   water, glow. Light is the accent: the puzzle's white sweep and glow belong to this family.
5. **Texture over gloss.** Halftone, woodcut and engraving, risograph and photocopy grain, film grain, pencil, pastel.
   Printed and handled surfaces, never the smooth, shadowed, rounded look.
6. **The hand-made line.** Pen sketches, boiling pencil marks, single-weight cartoon outlines, wireframe geometry. Thin
   lines carry structure.
7. **Deadpan surreal.** Surrealist paintings, uncanny masked figures, an alien on a rotary phone, a head made of a jar.
   Humour that is strange and played straight, never cute. (The gag chatbot is this.)
8. **Diagrams and geometry.** Esoteric diagrams, mandala symmetry, moiré circles, abstract geometric compositions,
   rotating wireframe solids. Maps and diagrams as things of beauty.
9. **Loops, not reveals.** A quarter of the set is short seamless loops: hypnotic, ambient, cycling. Motion that loops
   in place is his language; content fading up on scroll is not.
10. **High and low, mixed as equals.** Old-master painting next to manga, graffiti wildstyle, 1980s Japanese
    illustration, pop art, ritual masquerade costume, film photography of a mountain lake. No hierarchy of taste.
11. **Gravity.** Several images are dark and unflinching (mortality, conflict). The site is allowed weight and tension;
    it is not cheerful by default. (Attitude only: no such imagery on the site.)

**Palettes that recur (two families, plus collage):**
- *Night:* near-black grounds; electric violet and magenta, signal orange-red, cyan-teal; light as the highlight.
- *Paper:* warm cream and newsprint grey; ink black; one hot accent (coral, vermilion).
- *Collage:* pastel mint, coral and cream; vaporwave gradients used knowingly; early-web 3D textures.

**How they map to the themes:** *Editorial* is the Paper family (ink, halftone, engraving, riso grain); *Terminal* is
the Night family (neon, light traces, wireframes, loops); *Profile* is the Collage family (pop, kitsch, early-web 3D, the
deadpan surreal).

**One observation to use or ignore:** graffiti wildstyle is lettering that interlocks; the MAZO puzzle is letters that
interlock in three dimensions.

**Dislikes:** none yet, by design: they come from Jon's review of this run's screenshots (U15). Until then, §4's
banned list does their job.
