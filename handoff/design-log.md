# Design log

The §4 loop for each design unit: build, screenshot every page in the theme (mobile 390 × 844 and desktop 1440 × 900,
`node tools/screens.mjs --themes=<theme> --scale=1`), critique the screenshots in writing against §4's banned list, §2's
temperament and §9's references, revise once, and record it here.

## U4 · Editorial (2026-11-23)

**Direction.** The Paper family: a broadsheet that knows it is a website. Warm newsprint (`#f5f0e6`) under a fine SVG
grain, warm black ink, and one hot accent (vermilion `#e5442d`) used the way a risograph uses its second drum: the
mark's light block, the short rules over headings, the numbers in the contents, the active room, the registration
mark. Literata (a book face built for long reading: 400, italic, 700 for real bold) sets text and headlines; Libre
Franklin 500 (the newspaper grotesque) sets labels in spaced capitals. 77.6 KB of fonts. Every space is a whole number
of the mark's block (`--u`, 6 px): labels sit 2 units apart, list items 3, lines 5, sections 10. Reading pages hang
their headings in a margin column beside one measure of text (a subgrid on desktop). Between pages, a page turn
(transform and opacity only) while the masthead stays put. Its one secret: the portrait is a halftone print that
clears to the colour photo when you look closer. Editorial is also the look without JavaScript.

**Screens (v1):** all 13 pages × mobile and desktop.

**Critique of v1, against §4's banned list:**
- Fonts: Literata and Libre Franklin; none banned, no third-party host.
- Gradients: one, the halftone's 5 px dot screen, a texture under a threshold filter (annotated `gradient-ok`). No
  colour washes, no gradient text, no glass.
- Containers: no cards. Hairlines carry the structure; the one bordered element is the resume link. No radius, no
  soft shadow.
- No three-icon grid, bento, logo wall, skill bars or percentages: skills are a definition list with plain tags.
- No centred hero: Home is set left, one heading, one lede, then a numbered contents list. No button pair.
- No decorative line icons: the footer's registration mark is a printer's mark, one per page, part of the Paper
  family's vocabulary.
- No emoji in headings; no fade-up on scroll (the only motion: the page turn, the mark's light block slipping on hover,
  the portrait clearing on hover).
- Spacing varies by role on the unit, not uniformly.
- Words: only Jon's v2 words, the case study's draft, and `[JON: …]` slots.

**Against §2's temperament:** quiet rooms, yes (one measure, hanging heads, wide margins); precise, yes (the unit,
numbered contents, hairlines); mysterious at the surface, weakly (one hover secret in this theme; the entrance and
U11 carry most of it); the wink, subtly (the registration mark, the mark's misregistered light block).

**Against §9:** texture over gloss (grain, halftone), the hand-made line (hairlines), thresholds (the page turn),
light as material (only as the accent, as the Paper family should), diagrams (weak in v1: see 4).

**Problems in v1:**
1. The halftone was too pale to read as a picture. Cause: a `screen` blend against a half-cell gradient caps the
   darkest dot at about a fifth of the cell and drops every tone lighter than mid-grey.
2. About's portrait sat under the lede and pushed the story below the fold on desktop.
3. The case study's `[DRAFT]` note was set in spaced capitals: unreadable at that length.
4. The case study showed the four glyphs as a code block of X's, in the one place where a diagram is the content.
5. Home on a phone: about 90 px of dead space between the head and the contents.
6. Lists used default discs, out of place on printed matter.

**Revision (once):**
1. Halftone rebuilt: the photo averaged 50/50 with a centre-to-corner dot gradient, then thresholded at mid-grey, so a
   dot's radius follows the tone from nothing to the whole cell. The parrot now reads as a printed picture.
2. About's head is two columns on wide screens: title and lede left, portrait right.
3. The draft note is a small italic note.
4. A ```` ```glyphs ```` block now draws the letters as blocks (a Sätteri mdast plugin, `src/lib/markdown-glyphs.mjs`),
   with the stencil O's gap outlined in the accent, where the light lands in the finale. The text stays in the HTML
   for agents and the Markdown twin; a caption serves screen readers.
5. Head margin removed inside Home's grid.
6. En-dash list markers.

**Left for Jon:** the straight apostrophe in "Hi, I'm" is his text as it stands; the portrait is a parrot (see the
handoff). Terminal and Profile show the neutral structure with system fonts until U6 and U7.

## U6 · Terminal (2026-11-23)

**Direction.** The Night family: the engineer's side as a dark instrument. Near-black ground (`#0b0c10`), cool
off-white text, and light as the highlight: a cyan-teal signal (`#36e3d0`) for links, numbers and markers, violet for
tags and quotes, magenta and cyan split slightly behind the headline like a chromatic fringe, and the mark's light
block in the finale's warm white, flickering on once like a neon tube. Martian Mono (wide, square; 400 and 700) sets
the structure: headings, labels, code, navigation. Atkinson Hyperlegible Next (built for legibility; 400, italic, 700)
sets the reading text, because reading pages stay quiet in every theme. 58.5 KB of fonts. Its winks are the site's own
facts: every page has a Markdown twin, so headings carry Markdown's `##`; rooms are `./About`; the masthead shows the
page's path, `~/about/`; lists read like a listing (`[01]`). The portrait is an X-ray, a cyan negative, that clears to
the photo when you look closer. Between pages, the old page powers off to a line and the new one powers on from it, a
CRT in transform and opacity only. Loops stay under five seconds (the neon flicker once, a cursor that blinks four
times then rests), so nothing needs a pause control.

**Screens (v1):** all 13 pages × mobile and desktop.

**Critique of v1, against §4's banned list:** no banned font; no gradient at all; no gradient text (the fringe is two
offset text shadows behind solid text, not a fill); no glass; no cards, radius or soft shadows (dashed rules carry the
structure; the one bordered element is the resume link); no icon grids, bento, logo wall, skill bars; no centred hero;
no line icons; no emoji; no scroll fades; spacing on the unit, varied by role; words unchanged. **Against §2:** precise
(the unit, the listing); quiet where people read (one column, the measure, a legible sans); the wink is strongest here
(`##`, `./`, `~/`). **Against §9:** light as material (signal, fringe, neon flicker), what lies under the surface
(X-ray), thresholds (the CRT), loops (short, by rule); the wireframe idea failed in v1 (see 1).

**Problems in v1:**
1. The mark drawn as outlines became a mesh at header size: unreadable as MAZO.
2. The `~/home/` crumb floated in the middle of the masthead, detached from anything.
3. Footer links were set larger than the name beside them.
4. About's beat headings sat glued to their text (no space after a heading inside a section).
5. The headline's fringe was slightly too strong at display sizes.

**Revision (once):**
1. The mark is an LED panel: filled cells split by hairline gaps in the ground colour. Readable at any size, and it
   matches the case study's glyph drawing.
2. The crumb sits beside the name; the rooms are pushed to the right.
3. Footer links take the label size.
4. Base rule: a line of space between a section's children, two units after a heading.
5. Fringe reduced to 0.03 em at lower opacity.

**Left for Jon:** none beyond Editorial's notes.
