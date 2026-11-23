// JSON-LD for every page (BRIEF.md §3): Person, WebSite, ProfilePage, and an Article for each case study and note.
// One graph per page; ids tie them together. Facts only: the name, and the languages from v2's "Bilingual: English
// & Spanish". Jon adds more (sameAs links, a region, a job title) when he decides what to publish.
import { SITE } from './origin.mjs';
import { name } from './v2-words';

export type Schema =
  | { type: 'none' } | { type: 'website' } | { type: 'home' } | { type: 'profile' } | { type: 'webpage' }
  | { type: 'article'; datePublished?: Date; dateModified?: Date };

const PERSON = `${SITE}/#person`;
const WEBSITE = `${SITE}/#website`;
const person = () => ({ '@type': 'Person', '@id': PERSON, name, url: `${SITE}/about/`, knowsLanguage: ['en', 'es'] });
const website = () => ({ '@type': 'WebSite', '@id': WEBSITE, name, url: `${SITE}/`, inLanguage: 'en', author: { '@id': PERSON } });
const day = (d: Date) => d.toISOString().slice(0, 10);

export function jsonldFor(path: string, title: string, description: string, schema: Schema = { type: 'webpage' }) {
  const url = SITE + path;
  const page = (type: string) => ({ '@type': type, '@id': url, url, name: title, description, inLanguage: 'en', isPartOf: { '@id': WEBSITE } });
  let graph: object[];
  switch (schema.type) {
    case 'none': return null;
    case 'website': graph = [website(), person()]; break;
    case 'home': graph = [website(), person(), page('WebPage')]; break;
    case 'profile': graph = [{ ...page('ProfilePage'), mainEntity: { '@id': PERSON } }, person(), website()]; break;
    case 'article': graph = [{
      '@type': 'Article', '@id': url, url, headline: title, description, inLanguage: 'en', mainEntityOfPage: url,
      author: { '@id': PERSON }, publisher: { '@id': PERSON }, isPartOf: { '@id': WEBSITE },
      ...(schema.datePublished ? { datePublished: day(schema.datePublished) } : {}),
      ...(schema.dateModified ? { dateModified: day(schema.dateModified) } : {}),
    }, person()]; break;
    default: graph = [page('WebPage')];
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
