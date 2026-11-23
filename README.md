# mazo-work/site, v3

Jonathan Mazo's personal site: static, fast, hardened, readable by agents. Built with [Astro](https://astro.build)
(static output, zero JavaScript by default). The brief for this version is `BRIEF.md`; progress is in `STATE.md`.

```bash
npm ci            # install from the lockfile
npm run dev       # local preview with reload
npm run build     # the static site into dist/
```

The scripts set `ASTRO_TELEMETRY_DISABLED=1` (POSIX shells; on Windows set it yourself).

## Layout

| Path | What it holds |
| --- | --- |
| `src/pages/` | One file per page (routes). |
| `src/data/v2-words.ts` | Jon's words carried over from v2, verbatim. |
| `public/` | Files served as they are (the resume PDF; later `_headers`, `robots.txt`). |
| `docs/`, `prototype/p0/`, `tools/burr/` | The MAZO puzzle: its spec, its preview, its solver and checker. |
