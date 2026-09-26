import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from '@/app/[locale]/(home)/page';
import { HOME } from '@/content/home';
import {
  catalogoGrupos,
  catalogoKinds,
  catalogos,
  catalogosDe,
  esCatalogo,
  frenteOrder,
  nombreItem,
  ordenHome,
  productoDeItem,
  productos,
  tarjetasDeFrente,
  trabajosEnCatalogos,
} from '@/data/frentes';
import { ART } from '@/components/home/art';
import { normalizeSearch } from '@/lib/text';

const html = async (locale: 'es' | 'en') => renderToStaticMarkup(await HomePage({ params: Promise.resolve({ locale }) }));

describe('datos de los catálogos', () => {
  it('Humanizar va primero (en /compartir) y los otros catálogos conservan su orden', () => {
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

describe('catálogos en la home', () => {
  // El catálogo es un trabajo más de su frente: lo abre con su escena (art/<id>), que es el enlace al catálogo, y un
  // separador («N proyectos con sitio propio») lo corta de las tarjetas que siguen (spec §4.10).
  it.each(['es', 'en'] as const)('/%s: cada catálogo abre su frente, y un separador lo corta de las tarjetas', async (locale) => {
    const page = await html(locale);
    expect(page).not.toContain('data-front="catalogos"');
    expect(page).not.toContain('class="cats');
    for (const c of catalogos) {
      const front = page.match(new RegExp(`<article[^>]*data-front="${c.frente}"[\\s\\S]*?</article>`))?.[0] ?? '';
      expect(front.match(/<div class="front-body"><div[^>]*>/)?.[0], c.nombre).toContain(`data-node="producto:${c.id}"`);
      expect(front, c.nombre).toContain(HOME[locale].catalogs.label(c.incluye.length, c.unidad[locale]));
      const divider = `<p class="cards-divider" id="sitios-${c.frente}">${HOME[locale].fronts.ownSites(ordenHome[c.frente].length)}</p>`;
      expect(front.indexOf(divider), c.nombre).toBeGreaterThan(front.indexOf('class="cat-scene'));
      expect(front.indexOf(divider), c.nombre).toBeLessThan(front.indexOf('class="card art-host"'));
    }
  });

  // La escena dice cuánto reúne y de qué colecciones, no el nombre de cada obra: la invitación es entrar. Un solo enlace
  // al catálogo (la escena, con su rótulo), y la leyenda de colecciones con su cifra.
  it.each(['es', 'en'] as const)('/%s: la escena es el enlace al catálogo, con su arte y la leyenda de colecciones', async (locale) => {
    const page = await html(locale);
    expect(page.match(/class="cat"/g)).toHaveLength(catalogos.length);
    for (const c of catalogos) {
      const tile = page.match(new RegExp(`<div id="catalogo-${c.id}"[\\s\\S]*?<p class="cat-actions">[\\s\\S]*?</p></div></div>`))?.[0] ?? '';
      expect(page.match(new RegExp(`data-node="producto:${c.id}"`, 'g')), c.nombre).toHaveLength(1);
      expect(tile, c.nombre).toContain(`<a class="cat-scene art-host" href="${c.url}" rel="noopener" target="_blank"><div class="cat-art"><div class="art art-${c.id}" aria-hidden="true"`);
      expect(tile, c.nombre).toContain(`<span class="cat-enter">${HOME[locale].catalogs.enter}<span class="sr-only"> ${c.nombre}</span> ↗</span>`);
      expect(tile.match(new RegExp(`href="${c.url}"`, 'g')), c.nombre).toHaveLength(1);
      for (const g of catalogoGrupos(c)) {
        expect(tile, `${c.nombre}: ${g.kind}`).toContain(
          `<li data-k="${g.kind}"><span>${catalogoKinds[g.kind][locale].replace(/&/g, '&amp;')}</span> <span class="cat-kind-n">${g.items.length}</span></li>`,
        );
      }
    }
  });

  // La tarjeta del catálogo no enlaza sus ítems: la escena lleva al catálogo, y cada ítem se descubre allí.
  it.each(['es', 'en'] as const)('/%s: la tarjeta de un catálogo no enlaza ninguno de sus ítems', async (locale) => {
    const page = await html(locale);
    for (const c of catalogos) {
      const tile = page.match(new RegExp(`<div id="catalogo-${c.id}"[\\s\\S]*?<p class="cat-actions">[\\s\\S]*?</p></div></div>`))?.[0] ?? '';
      for (const i of c.incluye) {
        if (i.url && i.url !== c.url) expect(tile, `${c.nombre}: ${nombreItem(i, locale)}`).not.toContain(`href="${i.url.replace(/&/g, '&amp;')}"`);
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

describe('qué está dentro de qué', () => {
  // Un ítem de catálogo que es además un producto del portafolio: por su sitio, su repositorio o su `producto`. Su
  // tarjeta dice «También en …». Estructuras Preontológicas está en Paideía (la tesis) y en Kósmos (su repositorio).
  it('productoDeItem reconoce los ítems que tienen tarjeta, y la tarjeta nombra sus catálogos', async () => {
    const own = Object.fromEntries(catalogos.map((c) => [c.id, c.incluye.flatMap((i) => productoDeItem(i)?.id ?? [])]));
    expect(own).toEqual({
      humanizar: ['demeter', 'graf', 'devkits-crm', 'cauce-v3', 'agora', 'warehouse', 'communityos', 'devkits-hours', 'prizma', 'devkits'],
      stevenai: [],
      clavis: ['estructuras-preontologicas'],
      complexlab: ['estructuras-preontologicas'],
    });
    const estructuras = productos.find((p) => p.id === 'estructuras-preontologicas')!;
    expect(catalogosDe(estructuras).map((c) => c.nombre)).toEqual(['Paideía', 'Kósmos']);
    const page = await html('es');
    expect(page).toContain('<p class="card-in">También en Paideía y Kósmos</p>');
    expect(page.match(/<p class="card-in">También en Humanizar<\/p>/g)).toHaveLength(own.humanizar.length);
  });

  it('Umbral recorre los repositorios de Kósmos: la tarjeta de Kósmos la enlaza y la de Umbral lo dice', async () => {
    const umbral = productos.find((p) => p.id === 'umbral-atlas')!;
    expect(umbral.vistaDe?.catalogo).toBe('complexlab');
    for (const locale of ['es', 'en'] as const) {
      const page = await html(locale);
      const kosmos = page.match(/<div id="catalogo-complexlab"[\s\S]*?<p class="cat-actions">[\s\S]*?<\/p><\/div><\/div>/)?.[0] ?? '';
      expect(kosmos).toContain(`<span class="cat-view">${umbral.vistaDe!.texto[locale]} <a href="${umbral.url}"`);
      expect(umbral.subtitulo![locale]).toContain('Kósmos');
    }
  });
});

describe('tarjetas: el emblema manda y el texto se revela', () => {
  it('cada producto tiene su pieza de arte registrada', () => {
    expect(Object.keys(ART).sort()).toEqual(productos.map((p) => p.id).sort());
  });

  // El texto de cada proyecto sigue en el HTML (buscadores, lectores de pantalla): en .card-info, que con puntero se
  // revela al pasar y en táctil abre «¿Qué es?» (popover nativo).
  it.each(['es', 'en'] as const)('/%s: cada tarjeta lleva emblema, su texto en el HTML y el botón que lo abre en táctil', async (locale) => {
    const page = await html(locale);
    for (const f of frenteOrder) {
      for (const p of tarjetasDeFrente(f)) {
        const card = page.match(new RegExp(`<li class="card art-host" data-node="producto:${p.id}"[\\s\\S]*?</li>`))?.[0] ?? '';
        expect(card, p.id).toMatch(new RegExp(`<div class="card-art"><(div|svg) class="art art-${p.id}"[^>]* aria-hidden="true"`));
        expect(card, p.id).toContain(`<div class="card-info" id="info-${p.id}" popover="auto">`);
        expect(card, p.id).toContain(`<p class="card-desc">${p.descripcion[locale].replace(/&/g, '&amp;').replace(/"/g, '&quot;')}</p>`);
        // React escribe popoverTarget tal cual; el parser HTML no distingue mayúsculas en los atributos.
        expect(card, p.id).toContain(`<button type="button" class="card-more" popoverTarget="info-${p.id}">${HOME[locale].fronts.more}`);
      }
    }
  });
});

describe('orden de las tarjetas en la home', () => {
  it('ordenHome recorre cada tarjeta de su frente una vez, y la home las pinta en ese orden', async () => {
    for (const f of frenteOrder) {
      const esperadas = productos.filter((p) => p.frente === f && !esCatalogo(p)).map((p) => p.id);
      expect([...ordenHome[f]].sort(), f).toEqual([...esperadas].sort());
      expect(tarjetasDeFrente(f).map((p) => p.id), f).toEqual(ordenHome[f]);
    }
    const page = await html('es');
    const pintadas = [...page.matchAll(/class="card art-host" data-node="producto:([^"]+)"/g)].map((m) => m[1]);
    expect(pintadas).toEqual(frenteOrder.flatMap((f) => ordenHome[f]));
  });
});

describe('proyectos del frente Ciencias', () => {
  it.each(['es', 'en'] as const)('/%s: Umbral, Phúsis y Nóesis tienen una ficha propia y no duplican los catálogos', async (locale) => {
    const page = await html(locale);
    for (const [id, url, times] of [
      // Umbral sale dos veces: su tarjeta y el enlace de la tarjeta de Kósmos («Sus experimentos, en escenas 3D»).
      ['umbral-atlas', 'https://umbral-atlas.stevenvallejo.com', 2],
      ['phusis', 'https://phusis.stevenvallejo.com', 1],
      ['noesis-lab', 'https://noesis-lab.stevenvallejo.com', 1],
    ] as const) {
      expect(productos.find((p) => p.id === id)?.frente).toBe('ciencias');
      expect(catalogos.some((c) => c.id === id)).toBe(false);
      expect(page.match(new RegExp(`data-node="producto:${id}"`, 'g'))).toHaveLength(1);
      expect(page.match(new RegExp(`href="${url}"`, 'g'))).toHaveLength(times);
    }
  });
});
