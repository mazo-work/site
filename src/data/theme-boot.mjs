// The one inline script (BRIEF.md §3: the theme boot). It runs in <head> before any stylesheet, so the page paints
// in the right mask with no flash: the visitor's stored choice, else the device's (light: Paper, dark: Night). v4: two
// masks only (Profile is parked: never offered, never loaded); a stored "profile" or any v3 name falls back to the
// device. It also restores Pause motion (<html data-motion="paused">) before first paint, marks <html data-js> for
// parts that need JavaScript, and <html data-curtain> on the page the entrance's curtain opens onto (a flag the
// entrance leaves in sessionStorage; read once, then removed). Its sha256 is in public/_headers' script-src;
// `npm run check` fails if the two drift apart. Keep it byte-stable.
export const THEMES = ['paper', 'night'];
export const THEME_KEY = 'mazo-theme';
export const MOTION_KEY = 'mazo-motion';
export const BOOT = `(function(){var d=document.documentElement,t,m;try{t=localStorage.getItem('${THEME_KEY}');m=localStorage.getItem('${MOTION_KEY}')}catch(e){}if(${JSON.stringify(THEMES)}.indexOf(t)<0)t=matchMedia('(prefers-color-scheme: dark)').matches?'night':'paper';d.setAttribute('data-theme',t);if(m==='paused')d.setAttribute('data-motion','paused');d.setAttribute('data-js','');try{var c=sessionStorage.getItem('mazo-curtain');if(c){sessionStorage.removeItem('mazo-curtain');d.setAttribute('data-curtain',c)}}catch(e){}})()`;
