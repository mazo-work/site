// The parakeet watches the pointer (v4 BRIEF.md §3; U8), on the pages where it sits on the portrait: its head turns
// toward a mouse or pen, at most a quarter turn up or down, transform only, at most once a frame. Nothing is stored
// or sent. With touch (no pointer to follow) or with Pause motion on, it keeps still.
const head = document.querySelector('.parakeet[data-place="portrait"] .bird-head');
if (head) {
  let x = 0, y = 0, queued = false;
  const turn = () => {
    queued = false;
    if (document.documentElement.dataset.motion === 'paused') { head.style.transform = ''; return; }
    const b = head.closest('svg').getBoundingClientRect();
    const hx = b.left + b.width * 0.5, hy = b.top + b.height * 0.35;
    const deg = Math.max(-24, Math.min(24, (Math.atan2(y - hy, Math.abs(x - hx) + 1) * 180) / Math.PI));
    head.style.transform = `rotate(${(x < hx ? -1 : 1) * deg}deg)` + (x < hx ? ' scaleX(-1)' : '');
  };
  // S109: Pause motion brings the head back to rest at once, not at the next pointer move
  new MutationObserver(() => { if (document.documentElement.dataset.motion === 'paused') head.style.transform = ''; })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    x = e.clientX; y = e.clientY;
    if (!queued) { queued = true; requestAnimationFrame(turn); }
  }, { passive: true });
}
