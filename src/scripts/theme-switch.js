// The theme switcher (U8). The boot script in <head> has already applied the stored choice or the device's
// (light: Editorial, dark: Terminal) before first paint. This syncs the radios, applies and stores a new choice
// (localStorage only, no cookie), and, while the visitor has made no choice, follows the device live.
const KEY = 'mazo-theme';
const THEMES = ['editorial', 'terminal', 'profile'];
const root = document.documentElement;
const dark = matchMedia('(prefers-color-scheme: dark)');

function stored() { try { const t = localStorage.getItem(KEY); return THEMES.includes(t) ? t : null; } catch { return null; } }
function sync() { for (const i of document.querySelectorAll('[data-theme-switch] input[name="theme"]')) i.checked = i.value === root.dataset.theme; }
function apply(theme) {
  if (root.dataset.theme === theme) return;
  const change = () => { root.setAttribute('data-theme', theme); sync(); };
  if (document.startViewTransition) {
    root.classList.add('theme-switching');
    document.startViewTransition(change).finished.finally(() => root.classList.remove('theme-switching'));
  } else change();
}

sync();
for (const input of document.querySelectorAll('[data-theme-switch] input[name="theme"]')) {
  input.addEventListener('change', () => {
    if (!input.checked) return;
    try { localStorage.setItem(KEY, input.value); } catch { /* private mode: the choice lasts this page */ }
    apply(input.value);
  });
}
dark.addEventListener('change', () => { if (!stored()) apply(dark.matches ? 'terminal' : 'editorial'); });
addEventListener('pageshow', (e) => { if (e.persisted) { const t = stored(); if (t) root.setAttribute('data-theme', t); sync(); } });
