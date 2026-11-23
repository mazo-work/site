// The site's structure: names, navigation and page descriptions, shared by the layout, Home and the agent files.
// Labels are the page names BRIEF.md §3 gives. Descriptions are [JON: …] slots unless they are Jon's own words
// (v2) or, for MAZO, drawn from docs/puzzle-spec.md.
import { name, resume } from './v2-words';

export const SITE_NAME = name;

export interface NavItem { href: string; label: string; }

/** The header: every room, one click from every page. */
export const NAV: NavItem[] = [
  { href: '/about/', label: 'About' },
  { href: '/projects/', label: 'Projects' },
  { href: '/notes/', label: 'Lab notes' },
  { href: '/now/', label: 'Now' },
  { href: '/uses/', label: 'Uses' },
  { href: '/recruiters/', label: 'For recruiters' },
];

/** The footer. */
export const FOOTER_NAV: NavItem[] = [
  { href: '/colophon/', label: 'Colophon' },
  { href: '/', label: 'Replay the intro' },
];

export const DESCRIPTIONS = {
  home: '[JON: one sentence for search and agents: who you are and what this site is]',
  recruiters: resume.summary,
  projects: '[JON: one sentence: what the projects are]',
  notes: '[JON: one sentence: what Lab notes are]',
  colophon: 'How this site is built: its stack, headers, sizes, fonts and licences.',
  notFound: 'Nothing lives at this address.',
};
