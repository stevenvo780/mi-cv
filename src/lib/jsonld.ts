import { productos } from '@/data/frentes';
import expEs from '@/locales/es/common/experience.json';
import { EMPRESAS } from '@/graph/relations';
import { parseDates } from '@/graph/sources';
import { PROFILES, SITE, localeUrl, type Locale } from './site';

const FREELANCE = new Set<string>(['infraestructura', 'videojuegos', 'appsWeb']);
const ORG_URL: Partial<Record<string, string>> = { humanizar: 'https://humanizar.tech' };

export interface PersonFacts {
  jobTitle: string[];
  description: string;
  knowsAbout: string[];
}

export function currentEmployers() {
  const exp = expEs as Record<string, string>;
  return EMPRESAS.filter((k) => !FREELANCE.has(k) && parseDates(exp[`experience.dates.${k}`]).yearEnd === null).map((k) => ({
    '@type': 'Organization' as const,
    name: exp[`experience.${k}`],
    ...(ORG_URL[k] ? { url: ORG_URL[k] } : {}),
  }));
}

export function buildHomeJsonLd(locale: Locale, facts: PersonFacts, dateModified: string) {
  const person = `${SITE}/#person`;
  const website = `${SITE}/#website`;
  const page = localeUrl(locale);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': website, url: SITE, name: 'Mouseîon', inLanguage: ['es', 'en'], publisher: { '@id': person } },
      {
        '@type': 'ProfilePage',
        '@id': `${page}#profile`,
        url: page,
        inLanguage: locale,
        isPartOf: { '@id': website },
        mainEntity: { '@id': person },
        dateModified,
      },
      {
        '@type': 'Person',
        '@id': person,
        name: 'Steven Vallejo Ortiz',
        url: SITE,
        image: `${page}/opengraph-image`,
        jobTitle: facts.jobTitle,
        description: facts.description,
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universidad de Antioquia' },
        worksFor: currentEmployers(),
        knowsAbout: facts.knowsAbout,
        knowsLanguage: ['es', 'en'],
        sameAs: [PROFILES.github, PROFILES.linkedin, PROFILES.instagram],
      },
      {
        '@type': 'ItemList',
        '@id': `${page}#portfolio`,
        itemListElement: productos
          .filter((p) => p.url && p.status === 'live')
          .map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: { '@type': 'CreativeWork', name: p.nombre, url: p.url, description: p.descripcion[locale] },
          })),
      },
    ],
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
