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

## U7 · Profile (2026-11-23)

**Direction.** The Collage family, as self-aware Y2K maximalism: what the old profile page *did*, made well, not its
pixels. You could pick your own background: here it is a pale mint graph-paper tile on cream. Content sat in boxes
with title bars: here, hard-edged windows (2 px ink border, a hard 6 px shadow with no blur) with a title bar and a
window button, the "screen held up as a window" threshold of §9. Buttons were bevelled and pressed in: the rooms are
mint bevel buttons; the current room is pressed and coral. Type was 3D: Bungee Shade, a signage face whose shading
is part of the letters (no effects), sets display; Nunito (rounded, friendly; 400, italic, 800) sets everything else.
78.5 KB of fonts. The mark is extruded in coral, its light block pink. Lists rank their items in small coral badges.
The profile picture is stuck on at an angle and straightens when you touch it. One knowing vaporwave gradient, only on
title bars (coral to pink), annotated. Between pages, the old window drops back and the new one pops up with a small
overshoot.

**Screens (v1):** all 13 pages × mobile and desktop.

**Critique of v1, against §4's banned list:** no banned font; one gradient, small (title bars), on purpose and
annotated, coral to pink (not purple to blue); no gradient text (Bungee Shade's shading is outlines in the font); no
glass; the containers are the theme's idiom and the opposite of the banned card: square corners, 2 px borders, a hard
shadow with no blur, a title bar; no three-icon grid, bento or logo wall (windows stack in the 12-column grid, sized by
content); no skill bars; no centred hero (left-set headline, no button pair); no line icons (the window button is a
plain square); no emoji (the list marker ✦ is a typographic star, not a heading emoji); no scroll fades; spacing on
the unit. **Against §2:** the wink is the whole theme, kept from kitsch by a strict palette, a real grid and no
glitter, cursor trails, marquees or blinkies; reading stays quiet inside windows at one measure. **Against §9:**
collage palette, early-web 3D (bevels, shaded type, the extruded mark), high and low mixed (a signage face over a
friendly sans), thresholds (windows).

**Problems in v1:**
1. The graph-paper tile was too strong behind the headline and lede.
2. On reading pages the title bars stopped at the text measure, leaving a dead strip inside the window.
3. About's beats were too far apart inside the window, and a gap opened between the head and the first beat.

**Revision (once):**
1. A paler tile (`#d3f3e7` lines).
2. Title bars run the full window width; only the text keeps the measure.
3. Beats a line apart; no gap after the head.

**Found by the checks after the revision:** the draft note's grey on mint measured 4.47:1 (axe), just under AA; it is
now full ink.

**Left for Jon:** Profile is the theme most likely to need his own signature (BRIEF §3: his fonts and signature per
theme come later).

---

# v4

The same loop (v4 BRIEF.md §4), now also against v4's additions to the banned list (glow blobs, multicolour halos,
chromatic fringes on text, glowing gradient orbs; ornamental icons and dingbats; numbered sections, page numbers,
datelines) and against the reviewed mocks in `docs/v4-mocks/`. Screens: `node tools/screens.mjs --themes=<mask>
--scale=1`, every page at 390 × 844 and 1440 × 900.

## U4 · Paper (2026-11-23)

**Direction (the mocks, applied to every page).** v3's Editorial, cleaned to Jon's review: cream paper `#EEE7DA` under
v3's SVG grain, ink `#1B1816`, and the riso red `#E5484D` for print effects only (the mark's light, the Ask button's
hard offset, the underlines of here and hover, the off-register copy under display type); `#B0301B` for small red text
(the teasers' labels). IM FELL English (served as "Mazo Paper") sets display type at the mocks' sizes (Home's headline
120 px, a room's title 150 px, a beat 36 px, a pulled line 46 px in the italic), IM FELL English SC ("Mazo Paper SC")
sets every label in its own small capitals, and Atkinson Hyperlegible Next sets everything read, at 19 px on a desktop
and 17 px on a phone. Every display headline is printed twice: the ink, and a riso-red copy a few points down and to
the right underneath (`.misreg::before`, the words from `data-text`, hidden from screen readers with `/ ""`). Home is
the mock: the headline and Jon's lines on the left, "Latest project" and "Latest note" on the right, 7 to 4 with 88 px
between. About is the mock's frame: the title, the opening line, four beats with a line pulled out between the second
and third, the closing line, and the portrait in the side column (still v2's parrot until U9; the bird lands there in
U8). For recruiters takes the same side column for the portrait and the facts. Reading pages keep one measure
(660 px). v3's page turn between pages stays.

**Screens (v1):** 12 pages × mobile and desktop (`/uses/` is now a redirect).

**Critique of v1, against the banned lists:**
- Fonts: IM FELL (renamed, as its licence requires), Atkinson Hyperlegible Next; none banned, none from a third party.
- Gradients: one, the halftone's 5 px dot screen under a threshold filter (annotated); no washes, no gradient text,
  no glass, no glow of any kind.
- Containers: no cards. Hairlines and the menu band's double rule carry the structure; teasers are a label, a title
  and a line between two hairlines, and the whole block is the title's link target.
- No icons, dingbats or ornaments: v3's registration mark, the short red rules over headings and the roman numerals
  before the beats are gone; so is every number in front of a list item (v3 numbered the rooms and the work). The one
  date left is a note's own date in the Lab notes list, which is the note's metadata, not a dateline.
- No centred hero, no button pair: Home sets its headline left, beside the two latest things.
- Spacing is not uniform: the display type is huge and tight (line-height .85), the labels small and close to their
  titles, the beats 42 px apart, the pulled line given the most air.

**Critique of v1, against the mocks, §2 and §9:**
- Matches: the utility row, the centred mark and italic name, the band, the footer; Home's and About's grids and
  sizes; the off-register red; the phone layouts (one column, the band in two rows, the headline at 58 px).
- §9's texture over gloss (grain, halftone, a second printing in red) and one hot accent hold; the page turn is a
  threshold. "Quiet rooms": the reading pages are a single column of 19 px text under a loud headline.
- Wrong in v1: every reading page ran its text across the whole frame (1184 px lines on the case study and the
  colophon). U1's rule that stripped v3's containers of their padding (`.frame .prose { max-width: none }`) outranked
  the measure.

**The one revision:** that rule is gone (the pages' geometry now lives in `pages.css`), so every reading page keeps
the 660 px measure; the colophon's own prose now says "mask" where v3 said "theme", lists `mazo-motion` among what is
stored, and no longer claims that every loop stops within five seconds (Pause motion stops them now).

**Left for later units, by design:** the ring under the band on Home (U6), the parakeet on the mark and in the
portrait (U8), the parakeet photo, its caption and alt text (U9).

## U5 · Night (2026-11-23)

**Direction (the mocks, applied to every page).** v3's Terminal, quieted to Jon's review: near-black `#07060B` under
a faint dot grid (one 1 px dot per 26 px), text `#DAD6F0`, and three accents with one job each: purple `#8B5CFF` for
underlines and rules (and U6's orbit), green `#46D98A` for hover, focus and Ask, orange `#FF6A2B` for the light. Doto
800 sets the display headlines (Home's 62 px, a room's up to 140 px) and the name; Atkinson Hyperlegible Next sets the
reading, with titles in its 600 as the mocks set them; Martian Mono in spaced capitals sets every label, the rows and
the band. Home is the mock's three columns (the headline and Jon's lines, then the latest project, then the latest
note: 6 to 3 to 3). About is the shared frame with the pulled line between two purple hairlines in the italic. The
portrait is the mock's instrument: an X-ray in a round window, a thin purple ring with four ticks, and a green line
that scans it every 7 s (a loop, so Pause motion stops it). v3's CRT power-off and power-on between pages stays.

**Screens (v1):** 12 pages × mobile and desktop.

**Critique of v1, against the banned lists:**
- No glow anywhere but the LED mark's 2 px halo (it is how an LED reads): the mock's purple glow behind About's
  headline and the soft glow under the scan line were not built; v3's chromatic fringe and glowing hover went in U1.
- Gradients: one, the dot grid, a texture (annotated). Radius: the portrait's round window and its scan line's clip
  (annotated); no cards, no soft shadows.
- No icons, dingbats or numbering: v3's `##`, `./`, `~/path` and `[01]` winks are gone (the mocks have none, and
  `[01]` is numbering).
- One accent per job: the mock coloured the teasers' labels green and orange; here they are the label grey, because
  the brief gives green to hover, focus and Ask and orange to the light only.

**Critique of v1, against the mocks, §2 and §9:**
- Matches: the rows and the band in Martian Mono capitals, the LED mark, Home's three columns and sizes, About's
  frame, the portrait's ring and scan, the phone layouts (Doto at 40 px, the band in two rows).
- §9: light as material (the orange light, the green scan), diagrams and wireframe (the ring and ticks; U6's orbit),
  loops in place (the blink, the scan), what lies under the surface (the X-ray).
- Wrong in v1: room titles were shrunk across the board (about 105 px on a desktop) so that "recruiters", ten letters
  of a wide monospaced face, would fit its column: every short title lost the mock's 140 px to protect one long word.
  And the colophon scrolled 2 px sideways on a phone: a long URL in Martian Mono could not break.

**The one revision:** room titles take the mock's size again (up to 140 px) and only a title with a word of nine
letters or more takes a smaller size (`display-long`, from `src/data/display.ts`); code in running text may break
anywhere. A new check, `layout.fit`, loads every page in both masks at 390 and 1440 px and fails on any sideways
scroll or any display headline whose words run past its box; it caught the colophon's 2 px before the fix.

**Left for later units:** the ring (U6), the bird on the mark and the portrait (U8), the softer X-ray of the parakeet
photo (U9).
