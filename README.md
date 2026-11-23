# mazo-work/site, v4

Jonathan Mazo's personal site: static, hardened, readable by agents. Built with [Astro](https://astro.build) (static
output, zero JavaScript by default). Two masks, Paper and Night, on one skeleton; a ring of rooms on Home; a resident
parakeet. The brief for this version is `BRIEF.md`, progress and every decision are in `STATE.md`, and `HANDOFF.md`
summarises the run; v3's are in `docs/briefs/`.

```bash
npm ci            # install from the lockfile
npm run dev       # local preview with reload
npm run build     # the static site into dist/
npm run check     # build, then every check in tools/check/ (STATE.md lists any still pending)
```

The scripts set `ASTRO_TELEMETRY_DISABLED=1` (POSIX shells; on Windows set it yourself).

## Layout

| Path | What it holds |
| --- | --- |
| `src/pages/` | One file per page (routes). |
| `src/entrance/` | The MAZO puzzle, ported from `prototype/p0` (its logic and finale unchanged; edits marked `v3`; its colours per mask, marked `v4`), loaded only by `/` after first paint. |
| `src/components/` | The skeleton (`Masthead`, `Utility`, `Footer`, `Chat`), the `Ring`, the `Parakeet` (its sprite is `src/assets/parakeet.svg`: replace that file), the `Portrait`. |
| `src/styles/` | `skeleton.css`, `pages.css`, `ring.css`, `entry.css`, `parakeet.css`: geometry and motion; `themes/paper.css` and `themes/night.css`: each mask's type, colour and texture; `fonts.css`: every face and each mask's font tokens. `themes/profile.css` is parked. |
| `src/data/v2-words.ts` | Jon's words carried over from v2, verbatim. |
| `tools/check/` | `npm run check`: HTML, links, pages, rooms, the banned list, a headless pass per page × mask (CSP, network, errors), layout, the skeleton, fonts, the entrance, the ring, entering an orb, the parakeet, Pause motion, axe, JSON-LD, the agent files, secrets. `config.mjs` holds what they expect. |
| `tools/measure.mjs`, `tools/screens.mjs`, `tools/entrance-screens.mjs`, `tools/entry-frames.mjs` | Lighthouse and sizes per mask; screenshots; the entrance's moments; entering an orb, frame by frame (see `HANDOFF.md`). |
| `tools/slots.mjs` | Every `[JON: …]` slot still to write, by page, from the build. |
| `tools/fonts/` | `fetch.mjs` copies the fonts from their pinned packages; `rename.py` renames a font whose licence reserves its name. |
| `tools/verify-live.mjs` | After a deploy: compares the live site's headers with `public/_headers` (see `handoff/deploy-runbook.md`). |
| `tools/pdf/strip.py` | Reports what a PDF carries (values redacted) and writes a copy without its metadata; see `handoff/resume-pdf.md`. |
| `tools/screens.mjs` | Screenshots of the built site per page × theme × (mobile, desktop), for the design loop and U15. |
| `src/content/` | Lab notes and case studies (Markdown). About, Now and Uses are Markdown pages in `src/pages/`. |
| `public/` | Files served as they are: `_headers`, `_redirects`, the fonts, the ring's halftone sphere. |
| `docs/`, `prototype/p0/`, `tools/burr/` | The MAZO puzzle: its spec, its preview, its solver and checker. |
