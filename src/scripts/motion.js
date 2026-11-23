// Pause motion (BRIEF.md §3, Motion; WCAG 2.2.2): one real button in the utility row. Pressed, it sets
// <html data-motion="paused">, which pauses every looping animation (CSS: animation-play-state); page transitions
// still play. The choice is kept in localStorage (no cookie) so the next page opens paused too: the boot script in
// <head> restores it before first paint. Nothing else is stored or sent.
const KEY = 'mazo-motion';
const root = document.documentElement;
const buttons = () => document.querySelectorAll('[data-pause]');

function paused() { return root.dataset.motion === 'paused'; }
function sync() { for (const b of buttons()) b.setAttribute('aria-pressed', String(paused())); }
function set(on) {
  if (on) root.setAttribute('data-motion', 'paused'); else root.removeAttribute('data-motion');
  try { if (on) localStorage.setItem(KEY, 'paused'); else localStorage.removeItem(KEY); } catch { /* private mode: this page only */ }
  sync();
}

sync();
for (const b of buttons()) b.addEventListener('click', () => set(!paused()));
addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  let v = null; try { v = localStorage.getItem(KEY); } catch {}
  if (v === 'paused') root.setAttribute('data-motion', 'paused'); else root.removeAttribute('data-motion');
  sync();
});
