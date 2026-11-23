// Entering an orb (v4, U7): when an orb of the ring is clicked (or pressed with Enter), its dot takes the
// view-transition name `orb-entry` (the destination's main takes the same name) and a note says where it was, so the
// destination's boot script can start the flood from there. Nothing else is stored, and nothing is sent.
const KEY = 'mazo-entry';
for (const a of document.querySelectorAll('.ring .orb-link')) {
  a.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const dot = a.querySelector('.orb-dot'), b = dot.getBoundingClientRect();
    const x = ((b.left + b.width / 2) / innerWidth) * 100, y = ((b.top + b.height / 2) / innerHeight) * 100;
    try { sessionStorage.setItem(KEY, JSON.stringify({ to: new URL(a.href).pathname, x: +x.toFixed(2), y: +y.toFixed(2), t: Date.now() })); } catch { /* private mode: a plain page change */ }
    dot.style.viewTransitionName = 'orb-entry';
  });
}
// back to Home from the bfcache: the dot gives its name back, so the next page change is an ordinary one
addEventListener('pageshow', (e) => { if (e.persisted) for (const d of document.querySelectorAll('.ring .orb-dot')) d.style.viewTransitionName = ''; });
