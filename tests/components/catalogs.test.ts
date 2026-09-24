import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from '@/app/[locale]/(home)/page';
import { HOME } from '@/content/home';
import { catalogoGrupos, catalogoKinds, catalogos, esCatalogo, nombreItem, productos, trabajosEnCatalogos } from '@/data/frentes';
import { normalizeSearch } from '@/lib/text';

const html = async (locale: 'es' | 'en') => renderToStaticMarkup(await HomePage({ params: Promise.resolve({ locale }) }));

describe('datos de los catálogos', () => {
  it('Paideía, Kósmos y Daímon son los catálogos, en el orden de los frentes', () => {
    expect(catalogos.map((c) => c.nombre)).toEqual(['Daímon', 'Paideía', 'Kósmos']);
    expect(productos.filter((p) => p.tipo === 'catalogo').every(esCatalogo)).toBe(true);
  });

  // Cifras verificadas en cada repo (Kósmos: lib/catalog.ts y docs/CATALOG_AUDIT.md; Daímon: lib/components-data.ts y
  // lib/catalog-groups.ts; Paideía: app/trabajos/works.ts, app/ponencias y sus tres módulos). Si un catálogo crece,
  // se añade el ítem en frentes.ts y se actualiza aquí: la home las deriva de `incluye`.
  it('cada catálogo reúne lo que publica su sitio, agrupado por colección', () => {
    const shape = Object.fromEntries(catalogos.map((c) => [c.id, catalogoGrupos(c).map((g) => `${g.kind}:${g.items.length}`)]));
    expect(shape).toEqual({
      stevenai: ['infraestructura:9', 'asistentes:5', 'herramientas:5', 'inferencia:2'],
      clavis: ['curso:3', 'ponencia:8', 'tesis:1', 'ensayo:3'],
      complexlab: ['matematicas:8', 'sistemas-complejos:6', 'fisica:4', 'emergencia:3', 'computo-cientifico:2'],
    });
  });

  it('ítems sin duplicados, con enlace https salvo el repositorio privado, y colecciones con nombre en los dos idiomas', () => {
    for (const c of catalogos) {
      for (const locale of ['es', 'en'] as const) {
        const names = c.incluye.map((i) => nombreItem(i, locale));
        expect(new Set(names).size, `${c.nombre} /${locale}`).toBe(names.length);
        for (const name of names) expect(name.trim(), c.nombre).not.toBe('');
      }
      for (const i of c.incluye) {
        if (i.url) expect(i.url, nombreItem(i, 'es')).toMatch(/^https:\/\/[^\s]+$/);
        expect(catalogoKinds[i.kind].es.trim(), i.kind).not.toBe('');
        expect(catalogoKinds[i.kind].en.trim(), i.kind).not.toBe('');
      }
    }
    const sinEnlace = catalogos.flatMap((c) => c.incluye.filter((i) => !i.url).map((i) => nombreItem(i, 'es')));
    expect(sinEnlace).toEqual(['Talos · Harness de automatización']);
  });

  // Las etiquetas descriptivas (todo Kósmos, las de Daímon, los cursos de Paideía) van en los dos idiomas; un texto solo
  // queda para nombres propios y obras publicadas en español (ponencias, tesis, ensayos).
  it('los ítems de Kósmos llevan su nombre en inglés; en Daímon y Paideía, las etiquetas que no son nombres propios', () => {
    const kosmos = catalogos.find((c) => c.id === 'complexlab')!;
    expect(kosmos.incluye.filter((i) => typeof i.nombre === 'string').map((i) => i.nombre)).toEqual([]);
    const en = (id: string) => catalogos.find((c) => c.id === id)!.incluye.map((i) => nombreItem(i, 'en'));
    expect(en('stevenai')).toEqual(expect.arrayContaining(['Talos · Automation harness', 'Pixel art generator', 'Local GGUF AI chat', 'Cauce V3']));
    expect(en('clavis')).toEqual(expect.arrayContaining(['Classical Greek', 'Neurophilosophy', 'Philosophy of the City', 'La retórica como téchne']));
  });

  // neuronalLearning está en Kósmos (su faceta de cómputo) y en Daímon (su faceta de IA): cada tarjeta lo cuenta, el
  // total de la banda no lo cuenta dos veces.
  it('el total de la banda cuenta cada trabajo una vez aunque esté en dos catálogos', () => {
    const suma = catalogos.reduce((n, c) => n + c.incluye.length, 0);
    const repetidos = ['https://github.com/stevenvo780/neuronalLearning'];
    for (const url of repetidos) expect(catalogos.filter((c) => c.incluye.some((i) => i.url === url)), url).toHaveLength(2);
    expect(trabajosEnCatalogos(catalogos)).toBe(suma - repetidos.length);
  });
});

describe('banda de catálogos en la home', () => {
  it.each(['es', 'en'] as const)('/%s: cifras derivadas de los datos, nunca escritas a mano', async (locale) => {
    const page = await html(locale);
    expect(page).toContain(HOME[locale].catalogs.title(catalogos.length, trabajosEnCatalogos(catalogos)));
    for (const c of catalogos) expect(page, c.nombre).toContain(HOME[locale].catalogs.label(c.incluye.length, c.unidad[locale]));
    expect(HOME.es.catalogs.title(3, 59)).toBe('Tres catálogos, 59 trabajos dentro');
    expect(HOME.en.catalogs.label(23, 'projects')).toBe('Catalog · 23 projects');
  });

  it.each(['es', 'en'] as const)('/%s: cada catálogo sale una sola vez, en su tarjeta grande, con cada ítem enlazado', async (locale) => {
    const page = await html(locale);
    expect(page.match(/class="cat reveal"/g)).toHaveLength(catalogos.length);
    for (const c of catalogos) {
      // Una sola tarjeta por producto: el catálogo ya no se repite en la rejilla de su frente.
      expect(page.match(new RegExp(`data-node="producto:${c.id}"`, 'g')), c.nombre).toHaveLength(1);
      // Su frente lo enlaza desde la cabecera.
      expect(page, c.nombre).toContain(`href="#catalogo-${c.id}"`);
      for (const i of c.incluye) if (i.url) expect(page, nombreItem(i, locale)).toContain(`href="${i.url.replace(/&/g, '&amp;')}"`);
    }
  });

  it.each(['es', 'en'] as const)('/%s: cada ítem sale con su nombre en el idioma de la página', async (locale) => {
    const page = await html(locale);
    const other = locale === 'es' ? 'en' : 'es';
    for (const c of catalogos) {
      for (const i of c.incluye) {
        const shown = nombreItem(i, locale);
        const hidden = nombreItem(i, other);
        const text = (name: string) => (i.url ? `rel="noopener" target="_blank">${name}</a>` : `<span>${name} <span class="cat-private">`);
        expect(page, `${c.nombre}: ${shown}`).toContain(text(shown));
        if (hidden !== shown) expect(page, `${c.nombre}: ${hidden}`).not.toContain(text(hidden));
      }
    }
  });

  it('el buscador encuentra un catálogo por lo que contiene', async () => {
    const page = await html('es');
    const search = (id: string) => page.match(new RegExp(`data-node="producto:${id}" data-search="([^"]*)"`))?.[1] ?? '';
    expect(search('complexlab')).toContain(normalizeSearch('Atractor de Lorenz'));
    const pageEn = await html('en');
    expect(pageEn.match(/data-node="producto:complexlab" data-search="([^"]*)"/)?.[1]).toContain(normalizeSearch('Lorenz attractor'));
    expect(search('stevenai')).toContain(normalizeSearch('Jarvis IA v2'));
    expect(search('clavis')).toContain(normalizeSearch('Redes Neuronales — Hinton'));
    expect(search('clavis')).toContain(normalizeSearch('Ponencias'));
  });
});
