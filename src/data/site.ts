// The site's structure: names, navigation and page descriptions, shared by the layout, Home and the agent files.
// Labels are the page names BRIEF.md §3 gives. Descriptions are [JON: …] slots unless they are Jon's own words
// (v2) or, for MAZO, drawn from docs/puzzle-spec.md.
import { name, resume } from './v2-words';

export const SITE_NAME = name;

export interface NavItem { href: string; label: string; }

/** The menu band (v4 BRIEF §3): five rooms, one click from every page. Home is the mark. */
export const NAV: NavItem[] = [
  { href: '/about/', label: 'About' },
  { href: '/projects/', label: 'Projects' },
  { href: '/notes/', label: 'Lab notes' },
  { href: '/now/', label: 'Now' },
  { href: '/recruiters/', label: 'For recruiters' },
];

/** Pages with the portrait (v4: the parakeet sits on its frame there, and on the mark everywhere else). */
export const PORTRAIT_PAGES = ['/about/', '/recruiters/'];

/** The footer: the Colophon is reached from here only. "Replay the intro" lives in the utility row. */
export const FOOTER_NAV: NavItem[] = [
  { href: '/colophon/', label: 'Colophon' },
];

/** Home's headline. v4: from the reviewed mocks (docs/v4-mocks/Main.dc.html and the others), the one line in them that
 *  is not a [JON: …] slot; not from v2. Listed in the handoff for Jon to confirm or replace. */
export const HOME_HEADLINE = 'A child of the internet.';

export const DESCRIPTIONS = {
  home: '[JON: one sentence for search and agents: who you are and what this site is]',
  recruiters: resume.summary,
  projects: '[JON: one sentence: what the projects are]',
  notes: '[JON: one sentence: what Lab notes are]',
  colophon: 'How this site is built: its stack, headers, sizes, fonts and licences.',
  notFound: 'Nothing lives at this address.',
};
