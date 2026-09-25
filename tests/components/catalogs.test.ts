import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from '@/app/[locale]/(home)/page';
import { HOME } from '@/content/home';
import { catalogoGrupos, catalogoKinds, catalogos, esCatalogo, nombreItem, productos, trabajosEnCatalogos } from '@/data/frentes';
import { normalizeSearch } from '@/lib/text';

const html = async (locale: 'es' | 'en') => renderToStaticMarkup(await HomePage({ params: Promise.resolve({ locale }) }));

describe('datos de los catálogos', () => {
  it('Humanizar abre la banda y los otros catálogos conservan su orden', () => {
    expect(catalogos.map((c) => c.nombre)).toEqual(['Humanizar', 'Daímon', 'Paideía', 'Kósmos']);
    expect(productos.filter((p) => p.tipo === 'catalogo').every(esCatalogo)).toBe(true);
  });

  // Humanizar: catalogo-publico.json; Kósmos: lib/catalog.ts; Daímon: lib/components-data.ts; Paideía: app/trabajos/works.ts.
  // Si un catálogo crece,
  // se añade el ítem en frentes.ts y se actualiza aquí: la home las deriva de `incluye`.
  it('cada catálogo reúne lo que publica su sitio, agrupado por colección', () => {
    const shape = Object.fromEntries(catalogos.map((c) => [c.id, catalogoGrupos(c).map((g) => `${g.kind}:${g.items.length}`)]));
    expect(shape).toEqual({
      humanizar: ['producto:12', 'servicio:3'],
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

  // neuronalLearning tiene la misma URL en Kósmos y Daímon; el helper deduplica ese destino.
  it('el helper cuenta una sola vez los enlaces idénticos entre catálogos', () => {
    const suma = catalogos.reduce((n, c) => n + c.incluye.length, 0);
    const repetidos = ['https://github.com/stevenvo780/neuronalLearning'];
    for (const url of repetidos) expect(catalogos.filter((c) => c.incluye.some((i) => i.url === url)), url).toHaveLength(2);
    expect(trabajosEnCatalogos(catalogos)).toBe(suma - repetidos.length);
  });
});

describe('banda de catálogos en la home', () => {
  it.each(['es', 'en'] as const)('/%s: las tarjetas conservan sus cifras sin la entradilla redundante', async (locale) => {
    const page = await html(locale);
    expect(page).toContain(`data-front="catalogos" aria-label="${HOME[locale].catalogs.eyebrow}"`);
    expect(page).not.toContain('class="cats-head');
    expect(page).not.toContain('class="cats-lead');
    expect(page).not.toContain('catalogos-title');
    expect(page).not.toContain(locale === 'es' ? 'trabajos dentro' : 'works inside');
    for (const c of catalogos) expect(page, c.nombre).toContain(HOME[locale].catalogs.label(c.incluye.length, c.unidad[locale]));
    expect(HOME.en.catalogs.label(23, 'projects')).toBe('Catalog · 23 projects');
  });

  it.each(['es', 'en'] as const)('/%s: cada catálogo sale una sola vez, en su tarjeta grande, con cada ítem enlazado', async (locale) => {
    const page = await html(locale);
    expect(page.match(/class="cat reveal"/g)).toHaveLength(catalogos.length);
    expect(page).not.toContain('class="front-cat"');
    for (const c of catalogos) {
      // Una sola tarjeta por producto: el catálogo ya no se repite en la rejilla de su frente.
      expect(page.match(new RegExp(`data-node="producto:${c.id}"`, 'g')), c.nombre).toHaveLength(1);
      expect(page, c.nombre).toContain(`id="catalogo-${c.id}"`);
      expect(page, c.nombre).not.toContain(`href="#catalogo-${c.id}"`);
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
    expect(search('humanizar')).toContain(normalizeSearch('Agentes de IA a la medida'));
    expect(page).toContain('href="https://catalogo.humanizar.tech/"');
  });

});

describe('proyectos del frente Ciencias', () => {
  it.each(['es', 'en'] as const)('/%s: Umbral, Phúsis y Nóesis tienen una ficha propia y no duplican los catálogos', async (locale) => {
    const page = await html(locale);
    for (const [id, url] of [
      ['umbral-atlas', 'https://umbral-atlas.stevenvallejo.com'],
      ['phusis', 'https://phusis.stevenvallejo.com'],
      ['noesis-lab', 'https://noesis-lab.stevenvallejo.com'],
    ] as const) {
      expect(productos.find((p) => p.id === id)?.frente).toBe('ciencias');
      expect(catalogos.some((c) => c.id === id)).toBe(false);
      expect(page.match(new RegExp(`data-node="producto:${id}"`, 'g'))).toHaveLength(1);
      expect(page.match(new RegExp(`href="${url}"`, 'g'))).toHaveLength(1);
    }
  });
});
