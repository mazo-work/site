// What the checks expect of the site (BRIEF.md §3, §4, §6). Later units add their own check files;
// this file holds the expectations U1 can already state.

// v4: two masks (BRIEF.md §3); Profile is parked, never offered and never loaded.
export const THEMES = ['paper', 'night'];
export const THEME_KEY = 'mazo-theme';           // localStorage key the theme boot script reads (no cookie)

/** The entrance is excepted from WCAG as art (§3); its skip-intro link is its accessible way in. */
export const ENTRANCE = '/';

/** Every page of §3, by URL. U3 builds them. */
export const ROUTES = [
  '/',                         // the entrance (the puzzle)
  '/home/',
  '/about/',
  '/projects/',
  '/projects/mazo/',           // MAZO's making-of
  '/projects/case-study-2/',   // the second case study: a "coming soon" shell
  '/notes/',                   // Lab notes
  '/notes/note-template/',     // the one template note
  '/now/',
  '/uses/',
  '/recruiters/',              // For recruiters
  '/colophon/',
  '/404.html',
];

/** Pages without a Markdown twin, a sitemap entry or JSON-LD. */
export const NOT_DOCUMENTS = ['/404.html'];

/** Case-study shells: not Articles (they have no content yet). */
export const SHELLS = ['/projects/case-study-2/'];

/** JSON-LD @types each page must carry (top level or in @graph). */
export function jsonldExpected(url) {
  if (NOT_DOCUMENTS.includes(url)) return null;
  if (url === '/') return ['WebSite'];
  if (url === '/home/') return ['WebSite', 'Person'];
  if (url === '/about/') return ['ProfilePage', 'Person'];
  if (SHELLS.includes(url)) return ['WebPage'];
  if (/^\/(projects|notes)\/[^/]+\/$/.test(url)) return ['Article'];
  return ['WebPage'];
}

/** The one named third-party exception (§3): Cloudflare Web Analytics. Host -> allowed request types. */
export const BEACON_HOSTS = {
  'static.cloudflareinsights.com': ['script'],
  'cloudflareinsights.com': ['fetch', 'xhr', 'ping', 'other'],
};

/** WCAG 2.2 AA, as axe-core tags. */
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
