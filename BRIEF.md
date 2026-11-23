# Site v4 brief: a contract for one Claude Code cloud session

**Role:** you are a senior designer and front-end engineer. You take the v3 site (Astro, static, hardened, two
working themes and a parked third) to v4: one predictable structure across themes, the two themes reworked to Jon's
reviewed mocks, a navigation ring with an "enter the orb" transition, and a parakeet that lives on the site.
**Repository:** `mazo-work/site` (public). **Branch:** `v4`, created from `v3`. **Written:** 2026-11-23, after a mocks
review with Jon (the operator). Every decision below is his unless marked as Claude's proposal he accepted.

This repository is public, and so is this brief. Nothing you write names or describes the operator's home
infrastructure.

## 0. Read first, every time you start or resume

1. This file, then `STATE.md`. **`STATE.md` is the source of truth for progress.** Resume at the first unticked unit;
   never redo a ticked unit; never rewrite a ticked unit's files except to fix a failing check, which you record there.
2. `docs/v4-mocks/`: the reviewed mocks, as Design-canvas source files (`.dc.html`). They do not render on their own
   (they need the canvas runtime, and their `/_blob/…` image addresses do not resolve here): **read them for values**,
   such as structure, sizes, colours, fonts, spacing and motion. `docs/v4-mocks/README.md` maps each file to a page.
3. `docs/briefs/v3-BRIEF.md` and `docs/briefs/v3-HANDOFF.md`: the v3 contract and what v3 built. Everything in v3's
   §3 still holds unless §3 here changes it: the headers, the CSP, the agent layer, the crawler policy, the words rule,
   the personal-data rule, the static-only rule.
4. §9 of `docs/briefs/v3-BRIEF.md` (Jon's taste profile), before every design unit.

## 1. Checkpoints: so a usage limit never costs more than one unit

As in v3: one unit at a time in `STATE.md`'s order; a unit is done when `npm run check` passes for everything built so
far; commit (`v4: <unit> <what>`), push `v4`, tick the unit in `STATE.md` with its commit hash, push that too. Log your
turns per unit, the running average and the estimate of turns left; if the rest will not fit in what is likely left of
a five-hour window, finish the unit in hand, write `STATE.md`, push, and say so. Never hold work only in the chat. If
you are resumed with "resume": read §0, run `npm run check` once, continue at the first unticked unit.

## 2. What changes, in one paragraph

Jon's review of the mocks: the themes differed too much from each other. v4 gives every theme **one skeleton**, so the
menu and the theme toggle never move; the themes differ in type, colour, texture and motion only. Paper (v3's
Editorial) is the cleanest: its centred masthead and enclosed menu band are the model. Night (v3's Terminal) is the
most creative: its ring of orbs becomes the home page's navigation in **both** themes, and clicking an orb **enters its
atmosphere** to reach the page. Profile is parked: hidden, not deleted. The parakeet becomes a resident: it appears
after the entrance, perches on the mark, flies between pages and lands in the portrait.

## 3. Decisions (fixed: do not change them; propose changes in the handoff)

**One skeleton, every page, every theme** (the mocks show it):
1. A slim **utility row**: "Replay the intro" on the left; on the right the **mask toggle**, offering **Paper** and
   **Night** only. Also in this row, left, a **Pause motion** control (see Motion).
2. The **masthead**: the MAZO block mark centred, Jon's name centred under it. Large on Home (mark about 540 px wide on
   desktop), smaller on every other page (about 300 px). Paper draws the mark in ink with the riso red light; Night
   draws it as LED dots with the orange light; the light blinks as in v3.
3. The **menu band**: a double rule above, a single rule below, five items centred: **About · Projects · Lab notes ·
   Now · For recruiters**. Hover and the current page share one treatment per theme (an underline in the accent).
4. The **page content**.
5. The **footer**: "Jonathan Mazo · [JON: region]" left, **Colophon** right. The Colophon page stays; it is reached
   from the footer only.
6. The **Ask** button (the gag chatbot) bottom-right, the same size and place in both themes.

**Rooms.** The menu has five items. **Uses moves into Now** as a section of the Now page (`/now/#uses`); `/uses/`
redirects there (a Cloudflare Pages `_redirects` file, 301). Every agent file (twins, `llms.txt`, sitemap, JSON-LD)
follows.

**Type.** **Atkinson Hyperlegible Next for all body text, in every theme** (Jon: the most legible of all themes).
Display faces stay per theme: Paper, IM Fell English and IM Fell English SC; Night, Doto (the dotted face) for
headings and Jon's name, Martian Mono for labels, the menu and small caps. IM Fell is an OFL font with a Reserved Font
Name: self-host it unmodified, or, if you subset it, rename it as the OFL requires and record that in the colophon.
Fonts load only for the active theme, as in v3.

**Paper** (`docs/v4-mocks/Main.dc.html`, `Editorial-About.dc.html`, `Editorial-Phone.dc.html`): cream paper with
grain; ink #1B1816; riso red #E5484D for print effects (the off-register headline, the mark's light, the Ask button's
offset shadow, underlines) and #B0301B for small accent text (it passes 4.5:1 on the paper). Keep: the off-register
red under display headlines, the halftone portrait (live CSS over the photo, as v3), the paper grain. **Removed, and
not to come back:** ornaments and icons (the eye, arrows with notes, red-pen marks), section numbering and page
numbers, the dateline and issue number. Personality comes from type, scale, colour and the bird, not ornament.

**Night** (`Terminal-Home.dc.html`, `Terminal-About.dc.html`, `Terminal-Phone.dc.html`): near-black #07060B with a
faint dot grid; text #DAD6F0; **purple #8B5CFF, green #46D98A and orange #FF6A2B as accents only**: purple for the
orbit and underlines, green for hover, focus and Ask, orange for the light. No glow blobs, no multicolour halos, no
chromatic fringes on text (Jon: the glowing spheres bordered on AI slop). The X-ray portrait stays, **less saturated**
than v3's (muted violet to pale cyan, as in the mock).

**The ring, in both themes** (Home only, directly under the menu band): a slow orbit (about 90 s a turn) of five orbs,
one per room, round a central sphere whose core is the O's light; orbs grow and brighten at the front and dim at the
back. Night renders it as the mock: neutral outlined orbs, a thin purple orbit, a wireframe sphere. **Paper renders the
same geometry in print**: ink lines for the orbit, ink-dot orbs that turn red on hover and focus, and a halftone sphere
(dots, not shading); no glow. The orbs are real links. The ring **pauses while the pointer is over it or an orb has
focus**, so nobody has to chase a moving target, and the menu band above stays the plain way in. On a phone the ring
is smaller and decorative (dots orbiting the sphere, as in `Terminal-Phone.dc.html`); the menu band is the navigation
there. Jon may later replace the spheres with another shape or a stripe: keep the ring one component with its look in
the theme files.

**Entering an orb** (Jon: "zoom in, entering the orb's atmosphere, to navigate to each page"): clicking an orb plays a
transition in which the orb grows to fill the screen, as if breaking through its atmosphere, and the destination page
settles out of it. Use the browser's cross-document View Transitions (a `view-transition-name` on the clicked orb
matched to the destination's main region, plus a circular reveal); no client router. Night: a dark-to-light atmosphere
with a brief purple rim. Paper: an ink flood that clears to paper. Browsers without cross-document View Transitions get
a normal page change. Navigation by the menu band keeps each theme's v3 page transition (Jon liked them).

**The parakeet.** A placeholder sprite, as in `docs/v4-mocks/Parakeet.dc.html` (a 12 × 12 pixel map; reuse it), kept
in one file so Jon's artist's sprite replaces it with no code change. Behaviour:
- After the entrance, it **appears** beside the MAZO blocks.
- On pages without a portrait it **perches on the O** of the masthead mark and **hops back and forth** as on a branch.
- Between pages it **flies**: give it one `view-transition-name` so the browser carries it from the mark to the
  portrait and back.
- On About and For recruiters it **lands in the portrait's place**; the photo shows, and the bird sits on the frame.
- On pages with the portrait its **head follows the pointer**: one small script, transform-only, nothing stored or sent,
  still when there is no pointer (touch). The colophon says what it does and does not do.
- The seed-bowl game stays in the backlog.

**The portrait.** Replace v2's parrot with the blue parakeet photo in `src/assets/parakeet.jpg` (CC0, from rawpixel;
credit it in the colophon even though CC0 does not require it). Alt text: "A parakeet, standing in for Jon". Paper's
halftone and Night's X-ray are drawn over it live, as v3 does.

**Profile.** Hidden: removed from the mask toggle and never loaded. Keep its files; it returns in its own session.

**Motion.** Jon's rule stands: the same motion for everyone (no automatic Reduce Motion variant yet). v4 adds motion
that loops for more than 5 s (the ring, the bird's hop, the light's blink), so the WCAG 2.2.2 floor now needs a
**Pause motion** control: in the utility row, a real button, remembered for the visit (local storage, no cookie), that
pauses every looping animation; page transitions still play. Animate only `transform` and `opacity` (and the reveal's
`clip-path`).

**Budget.** No size budget for this version (Jon: get the design right first; a performance session follows). Measure
and report as in v3; do not trade design for bytes.

**Unchanged from v3** (keep every check passing): the `_headers` (CSP, HSTS, isolation, Permissions-Policy,
`X-Robots-Tag: noindex` until launch), the crawler policy, the agent layer, no third parties but the analytics beacon,
static only, the words rule (`[JON: …]` slots, no marketing copy), WCAG 2.2 AA on every page in both themes.

## 4. The generic-AI-look ban

v3's §4 list stands, plus, from Jon's review: glow blobs, multicolour halos, chromatic fringes on text, glowing
gradient orbs; ornamental icons and dingbats; numbered sections, page numbers, datelines. Keep the §4 loop (screenshot,
critique against the list, the mocks and §9, revise once, log it in `handoff/design-log.md`).

## 5. Boundaries (hard)

As v3's §5: work only on `v4`; never push to `main`, `v2`, `v3` or `gh-pages`; never change
`.github/workflows/test-page.yml`; no deploys, no Cloudflare access, no tokens, no secrets; static only; nothing about
the operator's infrastructure; licences recorded. Latitude: free within §3 and §4; propose changes in the handoff.

## 6. Units, in order

| Unit | What | Done when |
|---|---|---|
| U0 | The branch is ready (made by the reviewing session: v3's `BRIEF.md`, `STATE.md`, `HANDOFF.md` and `MANIFEST.sha256` moved to `docs/briefs/` as `v3-…`; the mocks and the photo added). Run `npm run check` and record the baseline | check passes as inherited |
| U1 | The skeleton: utility row (Replay, Pause motion, mask toggle Paper · Night), masthead (large and small), menu band (five items), footer (Colophon), Ask; identical markup in both themes | check passes; Profile not offered |
| U2 | Rooms: Uses into Now, `/uses/` 301 to `/now/#uses`, Colophon in the footer only; agent files follow | check passes |
| U3 | Type: Atkinson for body text everywhere; IM Fell (Paper) and Doto with Martian Mono (Night), per-theme loading, licences | check passes |
| U4 | Paper to its mocks, with the §4 loop | check passes; design-log entry |
| U5 | Night to its mocks, with the §4 loop | as U4 |
| U6 | The ring (both themes, Home): orbit, depth, pause on hover and focus, Paper's print rendering, the phone variant | check passes; orbs are links in every theme |
| U7 | Entering an orb: the cross-document transition in both themes, and the fallback | check passes; recorded in a screen capture or frame sequence in `handoff/` |
| U8 | The parakeet: appear, perch and hop, fly (view transition), land in the portrait, head follows the pointer | check passes; no network request from the bird |
| U9 | The portrait: the CC0 parakeet photo, alt text, Paper's halftone and Night's softer X-ray, colophon credit | check passes |
| U10 | Pause motion: the control, its memory, every loop paused, transitions kept | check passes; axe passes |
| U11 | Measure and screenshots: every page × Paper and Night × mobile and desktop into `handoff/screens/`; Lighthouse; sizes | numbers in the handoff |
| U12 | `HANDOFF.md`, v3's seven sections | §8 of v3's brief, applied |

## 7. Backlog (do not build; leave room)

The Profile theme's own session; another shape or a stripe in place of the orbs; per-theme page transitions explored
further; the seed-bowl game; more chatbot personalities and gags; the tracker-free human/bot counter; telemetry (scroll
depth, rage clicks), aggregate and identifier-free, after the design work; an automatic Reduce Motion version that
still feels right; Jon's own fonts and the artist's sprite; a console-style ring menu as a separate project.
