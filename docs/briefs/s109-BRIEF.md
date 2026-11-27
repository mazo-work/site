# S109 brief: v4's verified fixes and the reduced-motion design (one Claude Code cloud session)

**Session:** S109, an away seat. The main seat is the operator's Claude Project; it verifies and merges this work.
**Written:** 2026-11-27 by the main seat at S108, from the Gemini seat's v4 review (High-reasoning pass, read from its
Session 0 transcript) after the main seat checked every finding against `v4` at `d7a9e5b`.
**Effort:** high (recommended by the main seat; the operator sets it).
**Repository:** `mazo-work/site`, the only repository you write to. Branch `s109-fixes` (from `v4` at `d7a9e5b`, the
first production deploy). Never merge, never open a pull request. **`v4` is the production branch: a merge deploys,
so only the main seat merges, after verification.**
**You write in:** `src/`, `public/`, `tools/check/`, `package.json` (scripts only), `docs/puzzle-spec.md`, `BRIEF.md`
(the motion rule only, item 3.7), and `docs/briefs/s109-STATE.md` and `s109-HANDOFF.md`, plus `MANIFEST.sha256` at the
end. Nothing in `src/content/`, `src/pages/` text, any `[JON: …]` slot, `.github/`, `prototype/` or `handoff/`
changes, and no dependency is added or upgraded.
**Runs beside you:** S106 on `homelab-kb`, S107 on `homelab-tools`. You share no files with them.

**Why.** An independent review (the Gemini seat) audited an older v4 snapshot. The main seat re-checked each finding
on `d7a9e5b`: 12 confirmed, 2 plausible (need a browser), 6 false or moot. **The operator lifted his S96 freeze ("no
changes once V4 is deployed until we finalize the content") for this run only**, for these fixes and the
reduced-motion design (*"Exception: fixes + motion only (Recommended)"*). He adopted the review's reduced-motion design,
which changes his standing rule (*"Adopt Gemini's design"*). The site's other queued runs (carry-register 11.158,
11.159, 11.162) stay gated on the content: **none of them is in this run.**

## 0. Read first, every time you start or resume

This file, then `docs/briefs/s109-STATE.md` (create it from §4's units at your first start; it is the source of
truth). Then root `BRIEF.md` §0 and its motion rule (line 126), `STATE.md` (v4's units, U7, U8 and U10 above all),
`docs/puzzle-spec.md`, and `tools/check/checks/65-motion.mjs`. Resume at the first unticked unit; never redo a
ticked one.

## 1. Checkpoints, so a usage limit never costs more than one unit

One unit at a time, in order. A unit is done when its acceptance passes, `python3 tools/burr/check.py` and
`npm run check` both pass (v4's baseline: 78 checks, 78 pass; state your count and explain every change), and CI is
green on its push. CI runs on pushes to `v3` and `v4` only, so run it on your branch with
`gh workflow run check.yml --ref s109-fixes`, then read it with `gh run list --branch s109-fixes -L 1`. If you can't
read it, write `CI: [UNVERIFIED]`. Then commit (`s109: <unit> <what>`), push, tick the unit in STATE with its hash,
push. Log turns per unit and an estimate of turns left; if the rest will not fit in what is likely left of your window,
finish the unit in hand, write STATE, push, and say so. Never hold work only in the chat. If resumed with "resume":
read §0, run both suites once, continue.

## 2. Boundaries (hard)

No new dependency, no version change, no network beyond `npm ci` and Playwright's browser install. No content or
copy changes. Every visual change is limited to what an item names; anything else that moves on a screenshot is a
miss. Every new check has a planted control that fails it (the unfixed code) and a reachability test that produces its
verdict. Never weaken an existing check to make it pass: change one only where an item changes the behaviour it
asserts, and say why in STATE.

## 3. What to fix (IDs are the main seat's; line numbers are `d7a9e5b`'s)

**WebGL lifecycle (`src/entrance/puzzle.js`)**
1. **C1, the shared geometry.** `disposeMesh()` (394) disposes `m.geometry`, and is called on `lightBlock` (194, 630),
   whose geometry is the shared `voxGeo` (70) that every letter and the fallers use. Never dispose `voxGeo` there.
2. **C2, letters leak on every replay.** `load()` removes `pieces[L]` (196) without disposing their materials or their
   `InstancedMesh` buffers. Dispose them, leaving `voxGeo` alone.
3. **C3, the environment.** Dispose `pmrem` (60) and the temporary `RoomEnvironment` once `scene.environment` is set.
4. **C4, Paper's halo.** `load()` sets `orbHalo.material.opacity = 0.22` (200), overwriting Paper's
   `haloOpacity: 0.16` (24). Use `PAL.haloOpacity`.
5. **C10, Skip during the curtain.** `skip()` (648) guards only `phase === 'done'`; `jumpToEnd()` can then run during
   `lift` or `site`. Guard those too.
6. **P2, timers.** Eight `setTimeout`s; only `holdTimer` is cleared. Track the ones that act on puzzle state and clear
   them in `load()` and `jumpToEnd()`.

**UI races**
7. **P1, "Click for sound" mutes on the first click (plausible, prove it first).** The capture-phase `wakeAudio`
   (143) resumes audio on `pointerdown`; if that resolves before `click`, `#sound.onclick` (662–665) toggles sound off.
   Reproduce it in Playwright before fixing it; if it does not reproduce, record how you tried and leave the code.
8. **C7, phone ring dots stay tappable.** `ring.css` (84–86): `.orb-dot { visibility: visible }` inside a hidden
   link. On a phone the ring is a picture (v4 U6): make it inert there.
9. **C8, duplicate transition names.** `ring.js` (11) names the clicked dot `orb-entry` without clearing the others.
   Clear every dot's name first.
10. **C9, rapid theme toggles.** `theme-switch.js` (16): an older transition's `finally()` removes `theme-switching`
    while a newer one runs. Remove it only for the latest transition.

**The reduced-motion design (adopted by the operator from the review)**
11. **The entrance.** `HONOR_RM` (31) honours OS `prefers-reduced-motion: reduce`: no idle spin or momentum drift;
    interaction unchanged.
12. **The curtain, by mask, under reduced motion.** Paper: the existing 0.45 s opacity fade (`mazo-curtain-fade`).
    Night: a banded reveal (`data-curtain="scan"`): the puzzle fades out while Home is revealed top to bottom in 6
    bands (`clip-path: inset(0 0 100% 0)` to `inset(0 0 0 0)`, `steps(6, end)`, 650–800 ms). Both: zero transform
    movement, no flashing (well under WCAG 2.3.1's three flashes a second), and no flying mark morph. The curtain
    mode passes as today through `sessionStorage` `mazo-curtain` (595) and the boot script, which accepts
    `rise | fade | scan`. Without cross-document view transitions, the opacity fade (`moveStage(0, 0, 450, opened)`).
    Without reduced motion, the curtain rises as today.
13. **Site-wide.** Under `prefers-reduced-motion: reduce`, **and under Pause motion**, the spatial view transitions
    (Night's CRT collapse, Paper's page slide, the orb flood and emerge, the parakeet's flight) become short opacity
    cross-fades. The parakeet's head returns to rest while motion is paused. Today the CSS holds no
    `prefers-reduced-motion` rule, and Pause motion's `animation-play-state` rule does not reach
    `::view-transition-*` (`skeleton.css` 117–119).
14. **Words follow the rule.** Update the motion rule in root `BRIEF.md` (line 126), the "owner's choice" comments
    at `HONOR_RM` and `CURTAIN_FADE` (31, 583), and `docs/puzzle-spec.md`'s motion lines, saying what changed and that
    the operator adopted it at S108. **`motion.transitions` changes:** with motion paused, a page change must now
    animate opacity only, within a duration you state. Name the change in STATE. Add a check that runs with
    Playwright's `reducedMotion: 'reduce'` and asserts items 11–13 in both masks.

**Build and dead weight**
15. **C6, Windows scripts.** `package.json` 7–9 set `ASTRO_TELEMETRY_DISABLED=1` in POSIX form, which fails in
    native Windows shells. Make them run on both, with no new dependency.
16. **C5, production test surfaces.** `window.__mazo` (722) and `#debug` (81) ship in production. Seven check
    references use `window.__mazo`, so gate both behind a build-time flag that only the check's build sets. The
    checks must keep passing, and the production build must hold neither surface. Prove it on `dist/`.
17. **C11, Night's table headers.** `night.css` 106 sets weight 600 on `.prose th`, whose font is Martian Mono
    (`--label`, line 38), which ships 400 only. With `font-synthesis: none`, it renders at 400. Remove the 600, so
    nothing on screen changes.
18. **C12, a dead rule.** `night.css` sets `& a:hover` twice in one scope (35, 68); the later one wins. Remove the
    first, so nothing on screen changes.

**Not in this run (report only, in your handoff):** 11.158, 11.159 and 11.162 (gated on the content); `profile.css`
and `prototype/p0/` (parked by v4's own rulings); the readability pass on `puzzle.js` (the review's claim was made on
an older file and is unverified on `d7a9e5b`); `@astrojs/markdown-satteri` (in use, `astro.config.mjs` 4 and 26:
keep it).

## 4. Units, in order

| Unit | What | Acceptance |
|---|---|---|
| U1 | WebGL lifecycle: items 1–6. | The entrance check gains: 10 replays and shape switches with no WebGL error, every letter still drawn, and `renderer.info.memory` geometries and textures flat after the first; Paper's halo reads 0.16; Skip during `lift` changes nothing. Each assertion fails on `d7a9e5b` (planted control). |
| U2 | UI races: items 7–10. | P1 reproduced and fixed, or reported as not reproduced; a phone tap on a dot does not navigate; two dots clicked with the first navigation cancelled leave one `orb-entry`; three fast theme toggles end with `theme-switching` removed only after the last. |
| U3 | The reduced-motion design: items 11–14. | Under `reducedMotion: 'reduce'`, in both masks: no idle spin; Paper fades; Night reveals in 6 bands with no transform; no flying mark. Page changes under reduced motion and under Pause motion animate opacity only. Docs and comments updated. Entrance screenshots of both curtains. |
| U4 | Build and dead weight: items 15–18. | Scripts run under bash and PowerShell (or `cmd`) logic, with no new dependency; `dist/` holds no `__mazo` and no debug HUD; the checks still pass; screenshots of Night's tables and links unchanged. |
| U5 | `docs/briefs/s109-HANDOFF.md` in the seven sections (SCOPE, CROSSING, MEASURED, CLAIMS, MISSES, ATTACHED, OPEN AT HANDOFF; a section that does not apply says `NONE`); `MANIFEST.sha256` regenerated. | Both suites pass; CI green on the last push (by `workflow_dispatch`); gitleaks over the tree and history, 0 findings. |
