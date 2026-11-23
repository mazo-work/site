# Proposed budget (U15)

From the numbers in `handoff/measure.md` (Lighthouse 13.6.0, 2026-11-23, `npm run build && node tools/measure.mjs
--lighthouse`) and the build's own size table (the colophon). Brotli sizes; "first visit" means an empty cache.
Proposed for Jon to adopt; a later unit can turn each line into a check that fails the build.

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

**Not yet measurable here, so not budgeted:** the Cloudflare beacon's own size (it cannot be fetched from this
environment; it is the one file not counted above), and the entrance on a real phone: this sandbox draws WebGL in
software, which puts every frame of the puzzle on the main thread and reads as 31 s (desktop) to 160 s (mobile) of
"blocking time". Measure the entrance on a mid-range phone over 4G (spec P1 already plans that test) before setting
its frame-time budget; the spec's target is 60 fps.

**Over budget now:** About's LCP on Lighthouse mobile, 1.96 s (99/100 performance). The portrait is loaded eagerly
with high priority since this unit; the cause is not yet found (Lighthouse 13's LCP breakdown is the next step).

**SEO below 100** only where intended: the 404 and the coming-soon shell carry `noindex`.
