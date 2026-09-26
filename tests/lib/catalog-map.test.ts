import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { HOME } from '@/content/home';
import { catalogoGrupos, catalogoKinds, catalogos, nombreItem } from '@/data/frentes';
import { MAP, headLines, itemLines, layoutCatalogMap, wrapLines } from '@/lib/catalogMap';
import { GEIST_ADVANCE } from '@/lib/generated/geistAdvance';
import { LOCALES } from '@/lib/site';

// fontkit viene compilado dentro de next (como en tests/content/fonts.test.ts).
const fontkit = createRequire(import.meta.url)('next/dist/compiled/@next/font/dist/fontkit').default;
type Font = { unitsPerEm: number; characterSet: number[]; glyphForCodePoint(cp: number): { advanceWidth: number }; layout(t: string): { glyphs: { advanceWidth: number }[]; positions: { xAdvance: number }[] } };
const openFont = (name: string): Font => (fontkit.default ?? fontkit)(readFileSync(fileURLToPath(new URL(`../../src/app/fonts/${name}.woff2`, import.meta.url))));
const geist = openFont('geist-home');
const mono = openFont('jetbrains-home');

/** Ancho real de un texto con kerning (layout de fontkit), en px. */
const realPx = (font: Font, text: string, emPx: number) => (font.layout(text).positions.reduce((w, p) => w + p.xAdvance, 0) / font.unitsPerEm) * emPx;

const labels = LOCALES.flatMap((locale) =>
  catalogos.flatMap((c) =>
    catalogoGrupos(c).flatMap((g) => g.items.map((i) => (i.url ? nombreItem(i, locale) : `${nombreItem(i, locale)} ${HOME[locale].catalogs.private}`))),
  ),
);
const heads = LOCALES.flatMap((locale) => catalogos.flatMap((c) => catalogoGrupos(c).map((g) => ({ name: catalogoKinds[g.kind][locale], count: g.items.length }))));

describe('medida de las etiquetas del mapa', () => {
  it('la tabla de avances es la de geist-home.woff2 (npx tsx scripts/build-text-widths.mts la regenera)', () => {
    const table = Object.fromEntries(
      [...geist.characterSet].map((cp) => [String.fromCodePoint(cp), Math.round((geist.glyphForCodePoint(cp).advanceWidth / geist.unitsPerEm) * 1000)]),
    );
    expect(GEIST_ADVANCE).toEqual(table);
  });

  // El mapa reserva filas por etiqueta; si el navegador partiera una en más líneas de las reservadas, se solaparía con
  // la siguiente. Se reparte cada etiqueta con los anchos reales (con kerning) y debe dar las mismas líneas.
  it('cada etiqueta ocupa las líneas que el mapa le reserva, con el ancho real de Geist', () => {
    for (const text of labels) {
      const words = text.split(/\s+/);
      const real = wrapLines(
        words.map((w) => realPx(geist, w, MAP.itemEmPx)),
        realPx(geist, ' ', MAP.itemEmPx),
        MAP.labelPx,
      );
      expect(itemLines(text), text).toBe(real);
    }
    // Hoy solo Talos (privado, en español) parte en dos: el mapa sigue siendo una línea por ítem.
    expect(labels.filter((t) => itemLines(t) > 1)).toEqual(['Talos · Harness de automatización privado']);
  });

  it('JetBrains Mono es de ancho fijo: el nombre de cada colección cabe en las líneas que se le reservan', () => {
    const advance = mono.glyphForCodePoint('M'.codePointAt(0)!).advanceWidth / mono.unitsPerEm;
    expect(advance).toBe(0.6);
    for (const { name, count } of heads) {
      const room = MAP.labelPx - MAP.headGapPx - String(count).length * MAP.headCharPx;
      expect(name.toUpperCase().length * MAP.headCharPx <= room ? 1 : 2, name).toBeLessThanOrEqual(headLines(name, count));
    }
  });
});

describe('reparto del mapa', () => {
  const layouts = LOCALES.flatMap((locale) =>
    catalogos.map((c) => ({
      name: `${c.nombre} /${locale}`,
      map: layoutCatalogMap(catalogoGrupos(c).map((g) => ({ head: catalogoKinds[g.kind][locale], items: g.items.map((i) => nombreItem(i, locale)) }))),
    })),
  );

  it('dos lados, posiciones dentro del mapa y en orden, sin que dos filas se pisen', () => {
    for (const { name, map } of layouts) {
      expect(new Set(map.groups.map((g) => g.side)), name).toEqual(new Set(['l', 'r']));
      for (const side of ['l', 'r'] as const) {
        const ys = map.groups.filter((g) => g.side === side).flatMap((g) => [g.headY, ...g.itemY]);
        for (const y of ys) expect(y > 0 && y < 100, `${name}: ${y}`).toBe(true);
        // Una fila mide 100 / rows %: dos centros consecutivos quedan al menos a esa distancia.
        for (let k = 1; k < ys.length; k++) expect(ys[k] - ys[k - 1], name).toBeGreaterThanOrEqual(100 / map.rows - 0.02);
      }
    }
  });

  it('una arista por colección: nace en el centro, pasa por su nodo y llega a cada ítem', () => {
    for (const { name, map } of layouts) {
      map.groups.forEach((g, gi) => {
        const d = map.edges[gi];
        expect(d.startsWith('M50 50C'), name).toBe(true);
        expect(d.match(/M/g), name).toHaveLength(1 + g.itemY.length);
        const x = g.side === 'l' ? MAP.itemX : 100 - MAP.itemX;
        for (const y of g.itemY) expect(d, name).toContain(` ${x} ${y}`);
      });
    }
  });

  it('los lados se equilibran: ninguno lleva más del doble de filas que el otro salvo que una colección sola lo exija', () => {
    expect(layouts.find((l) => l.name === 'Kósmos /es')!.map.rows).toBeLessThan(20);
    expect(layouts.find((l) => l.name === 'Daímon /es')!.map.rows).toBeLessThan(15);
  });
});
