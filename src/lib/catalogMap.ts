import { GEIST_ADVANCE } from './generated/geistAdvance';

/**
 * Mapa de un catálogo en la home (Fronts.tsx): el catálogo en el centro, sus colecciones a los dos lados y sus ítems
 * en dos columnas de etiquetas, unidos por aristas. Se calcula en el servidor, porque la home no admite JS nuevo
 * (spec §5.1). Las coordenadas son porcentajes del mapa y la altura se mide en filas de `MAP.rowRem`.
 *
 * Una etiqueta puede ocupar dos líneas. Cuántas ocupa se mide con los avances reales de Geist (GEIST_ADVANCE) y el
 * ancho de su columna en el mapa más estrecho, una tarjeta de 51.5rem (home.css, @container cat); los nombres de
 * colección van en JetBrains Mono, de ancho fijo. En un mapa más ancho, la etiqueta cabe igual o mejor.
 */
export const MAP = {
  /** Alto de una fila, en rem: una línea de etiqueta con su aire. */
  rowRem: 1.3,
  /** Filas entre dos colecciones del mismo lado, y de margen arriba y abajo. */
  gap: 0.7,
  pad: 0.6,
  /** x (en %) de los ítems y de los nodos de colección del lado izquierdo; el derecho es su espejo. */
  itemX: 33,
  groupX: 41,
  /**
   * Ancho de la columna de etiquetas en el mapa más estrecho: (itemX − 1.5) % de una tarjeta de 51.5rem (824 px, la de
   * una ventana de 1 280 px) menos su relleno lateral de 1.6rem y su borde de 2 px: 0.315 × 768.8 = 242.2 px.
   */
  labelPx: 242,
  /** Etiquetas: Geist a 0.8rem. Colecciones: JetBrains Mono a 0.62rem, en mayúsculas y con 0.1em de espaciado. */
  itemEmPx: 12.8,
  headCharPx: 0.6 * 9.92 + 0.992,
  /** Hueco entre el nombre de la colección y su cifra (0.45rem). */
  headGapPx: 7.2,
} as const;

const geistPx = (text: string, emPx: number) => [...text].reduce((w, ch) => w + (GEIST_ADVANCE[ch] ?? 600), 0) * (emPx / 1000);

/** Líneas que ocupa un texto partiendo por espacios, como el navegador, con el ancho de cada palabra. */
export function wrapLines(words: number[], spacePx: number, widthPx: number): number {
  let n = 1;
  let cur = -1;
  for (const w of words) {
    if (cur < 0) cur = w;
    else if (cur + spacePx + w <= widthPx) cur += spacePx + w;
    else {
      n++;
      cur = w;
    }
  }
  return n;
}

/** Líneas de una etiqueta de ítem (Geist 0.8rem) en la columna del mapa más estrecho. */
export function itemLines(text: string, widthPx: number = MAP.labelPx): number {
  const words = text.split(/\s+/).filter(Boolean);
  return wrapLines(
    words.map((w) => geistPx(w, MAP.itemEmPx)),
    geistPx(' ', MAP.itemEmPx),
    widthPx,
  );
}

/** Líneas del nombre de una colección (mono, ancho fijo) junto a su cifra. */
export function headLines(name: string, count: number, widthPx: number = MAP.labelPx): number {
  const room = widthPx - MAP.headGapPx - String(count).length * MAP.headCharPx;
  const words = name.split(/\s+/).filter(Boolean);
  return wrapLines(
    words.map((w) => w.length * MAP.headCharPx),
    MAP.headCharPx,
    room,
  );
}

export interface MapGroupInput {
  /** Nombre de la colección, sin su cifra: la cifra es `items.length`. */
  head: string;
  /** Etiqueta de cada ítem tal como se pinta. */
  items: string[];
}

export interface MapGroup {
  side: 'l' | 'r';
  /** y (en %) de la fila del nombre de la colección, donde va su nodo. */
  headY: number;
  /** y (en %) del centro de cada ítem. */
  itemY: number[];
}

export interface CatalogMapLayout {
  rows: number;
  groups: MapGroup[];
  /** Aristas por colección, en el orden de `groups`: centro → colección → cada ítem. Coordenadas en % (viewBox 100×100). */
  edges: string[];
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function layoutCatalogMap(input: MapGroupInput[]): CatalogMapLayout {
  const headRows = input.map((g) => headLines(g.head, g.items.length));
  const itemRows = input.map((g) => g.items.map((t) => itemLines(t)));
  const size = input.map((_, gi) => headRows[gi] + itemRows[gi].reduce((a, b) => a + b, 0));

  // Reparto voraz: cada colección, de la más grande a la más pequeña, al lado que lleva menos filas. Cada lado conserva
  // el orden original de sus colecciones.
  const load = { l: 0, r: 0 };
  const side: ('l' | 'r')[] = [];
  [...input.keys()]
    .sort((a, b) => size[b] - size[a] || a - b)
    .forEach((gi) => {
      const s = load.l <= load.r ? 'l' : 'r';
      side[gi] = s;
      load[s] += size[gi] + (load[s] ? MAP.gap : 0);
    });
  const rows = Math.max(load.l, load.r) + 2 * MAP.pad;
  const pct = (row: number) => r2((row / rows) * 100);

  const groups: MapGroup[] = input.map((_, gi) => ({ side: side[gi], headY: 0, itemY: [] }));
  for (const s of ['l', 'r'] as const) {
    // Cada lado va centrado en el alto del mapa.
    let row = MAP.pad + (rows - 2 * MAP.pad - load[s]) / 2;
    input.forEach((_, gi) => {
      if (side[gi] !== s) return;
      groups[gi].headY = pct(row + headRows[gi] / 2);
      row += headRows[gi];
      for (const n of itemRows[gi]) {
        groups[gi].itemY.push(pct(row + n / 2));
        row += n;
      }
      row += MAP.gap;
    });
  }

  const edges = groups.map((g) => {
    const x = (v: number) => (g.side === 'l' ? v : 100 - v);
    const gx = x(MAP.groupX);
    const ix = x(MAP.itemX);
    const hubToGroup = `M50 50C${r2((50 + gx) / 2)} 50 ${r2((50 + gx) / 2)} ${g.headY} ${gx} ${g.headY}`;
    const toItems = g.itemY.map((y) => `M${gx} ${g.headY}C${r2((gx + ix) / 2)} ${g.headY} ${r2((gx + ix) / 2)} ${y} ${ix} ${y}`);
    return [hubToGroup, ...toItems].join('');
  });

  return { rows: r2(rows), groups, edges };
}
