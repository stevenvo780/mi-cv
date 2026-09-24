import { describe, expect, it } from 'vitest';
import { catalogos } from '@/data/frentes';
import { getShareDestinations, SHARE_COPY } from '@/lib/shareLinks';

const expectedIds = [
  'cv', 'cv-engineer', 'cv-philosopher', 'services', 'blog', 'lore',
  'front-informatica', 'front-filosofia', 'front-ciencias', 'front-enterprise',
  'catalog-humanizar', 'catalog-stevenai', 'catalog-clavis', 'catalog-complexlab',
  'jarvis', 'instagram', 'github', 'linkedin',
];

const externalUrls: Record<string, string> = {
  'cv-engineer': 'https://informatico.stevenvallejo.com',
  'cv-philosopher': 'https://filosofo.stevenvallejo.com',
  services: 'https://praxis.stevenvallejo.com',
  blog: 'https://schole.stevenvallejo.com',
  'catalog-humanizar': 'https://catalogo.humanizar.tech/',
  'catalog-stevenai': 'https://daimon.stevenvallejo.com',
  'catalog-clavis': 'https://paideia.stevenvallejo.com',
  'catalog-complexlab': 'https://kosmos.stevenvallejo.com',
  jarvis: 'https://wa.me/573023954534',
  instagram: 'https://www.instagram.com/stev_vallejo/',
  github: 'https://github.com/stevenvo780',
  linkedin: 'https://www.linkedin.com/in/steven-vallejo/',
};

describe('destinos de la tarjeta QR', () => {
  it.each(['es', 'en'] as const)('/%s: cubre sitios, áreas, catálogos y contacto en el orden publicado', (locale) => {
    const destinations = getShareDestinations(locale);
    expect(destinations.map(({ id }) => id)).toEqual(expectedIds);
    expect(destinations.map(({ group }) => group)).toEqual([
      ...Array(6).fill('main'), ...Array(4).fill('fronts'),
      ...Array(4).fill('catalogs'), ...Array(4).fill('contact'),
    ]);
    expect(Object.keys(SHARE_COPY[locale].groups)).toEqual(['main', 'fronts', 'catalogs', 'contact']);
  });

  it.each(['es', 'en'] as const)('/%s: los QR internos abren la página del idioma elegido', (locale) => {
    const urls = Object.fromEntries(getShareDestinations(locale).map(({ id, url }) => [id, url]));
    const origin = `https://www.stevenvallejo.com/${locale}`;
    expect(urls.cv).toBe(origin);
    expect(urls.lore).toBe(`${origin}/lore`);
    for (const front of ['informatica', 'filosofia', 'ciencias', 'enterprise']) {
      expect(urls[`front-${front}`]).toBe(`${origin}/${front}`);
    }
    for (const [id, url] of Object.entries(externalUrls)) expect(urls[id], id).toBe(url);
  });

  it('incluye los cuatro catálogos públicos, empezando por Humanizar', () => {
    const listed = getShareDestinations('es').filter(({ group }) => group === 'catalogs');
    expect(listed.map(({ id }) => id)).toEqual(catalogos.map(({ id }) => `catalog-${id}`));
    expect(listed.map(({ label }) => label)).toEqual(['Humanizar', 'Daímon', 'Paideía', 'Kósmos']);
    expect(listed.map(({ url }) => url)).toEqual(catalogos.map(({ url }) => url));
  });

  it.each(['es', 'en'] as const)('/%s: cada opción tiene un destino único y no inventa el WhatsApp personal', (locale) => {
    const destinations = getShareDestinations(locale);
    expect(new Set(destinations.map(({ id }) => id)).size).toBe(destinations.length);
    expect(new Set(destinations.map(({ url }) => url)).size).toBe(destinations.length);
    for (const destination of destinations) {
      expect(destination.label.trim(), destination.id).not.toBe('');
      expect(destination.description.trim(), destination.id).not.toBe('');
      expect(destination.url, destination.id).toMatch(/^https:\/\/[^\s]+$/);
    }
    expect(destinations.filter(({ url }) => url.startsWith('https://wa.me/')).map(({ id }) => id)).toEqual(['jarvis']);
    expect(destinations.some(({ id }) => id.includes('personal'))).toBe(false);
  });
});
