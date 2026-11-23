// The one inline script (BRIEF.md §3: the theme boot). It runs in <head> before any stylesheet, so the page paints
// in the right theme with no flash: the visitor's stored choice, else the device's (light: Editorial, dark: Terminal).
// It also marks <html data-js> for parts that need JavaScript. Its sha256 is in public/_headers' script-src;
// `npm run check` fails if the two drift apart. Keep it byte-stable.
export const THEMES = ['editorial', 'terminal', 'profile'];
export const THEME_KEY = 'mazo-theme';
export const BOOT = `(function(){var d=document.documentElement,t;try{t=localStorage.getItem('${THEME_KEY}')}catch(e){}if(${JSON.stringify(THEMES)}.indexOf(t)<0)t=matchMedia('(prefers-color-scheme: dark)').matches?'terminal':'editorial';d.setAttribute('data-theme',t);d.setAttribute('data-js','')})()`;
