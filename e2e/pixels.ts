import { inflateSync } from 'node:zlib';

/**
 * Lectura de píxeles de las capturas de Playwright para los e2e del grafo 3D, sin dependencias: un decodificador PNG
 * (8 bits, RGB o RGBA, sin entrelazado, que es lo que produce Chrome) y análisis de regiones conexas.
 */

export interface Pixels {
  width: number;
  height: number;
  /** RGBA, 4 bytes por píxel. */
  data: Uint8Array;
}

export function decodePng(png: Buffer): Pixels {
  if (png.readUInt32BE(0) !== 0x89504e47 || png.readUInt32BE(4) !== 0x0d0a1a0a) throw new Error('no es un PNG');
  let width = 0;
  let height = 0;
  let channels = 0;
  const idat: Buffer[] = [];
  for (let at = 8; at < png.length; ) {
    const length = png.readUInt32BE(at);
    const type = png.toString('latin1', at + 4, at + 8);
    const body = png.subarray(at + 8, at + 8 + length);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      const [depth, color, , , interlace] = body.subarray(8, 13);
      channels = color === 6 ? 4 : color === 2 ? 3 : 0;
      if (depth !== 8 || !channels || interlace !== 0) throw new Error(`PNG no admitido: profundidad ${depth}, color ${color}, entrelazado ${interlace}`);
    } else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
    at += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const rows = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const row = rows.subarray(y * stride, (y + 1) * stride);
    const up = y > 0 ? rows.subarray((y - 1) * stride, y * stride) : new Uint8Array(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? row[i - channels] : 0;
      const b = up[i];
      const c = i >= channels ? up[i - channels] : 0;
      let predictor = 0;
      if (filter === 1) predictor = a;
      else if (filter === 2) predictor = b;
      else if (filter === 3) predictor = (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        predictor = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else if (filter !== 0) throw new Error(`filtro PNG desconocido: ${filter}`);
      row[i] = (src[i] + predictor) & 0xff;
    }
  }
  if (channels === 4) return { width, height, data: rows };
  const data = new Uint8Array(width * height * 4);
  for (let p = 0; p < width * height; p++) {
    data[p * 4] = rows[p * 3];
    data[p * 4 + 1] = rows[p * 3 + 1];
    data[p * 4 + 2] = rows[p * 3 + 2];
    data[p * 4 + 3] = 255;
  }
  return { width, height, data };
}

/** Píxeles en los que `a` supera a `b` en al menos `min` niveles en algún canal (lo que una capa añade de luz). */
export function brighter(a: Pixels, b: Pixels, min: number): Uint8Array {
  if (a.width !== b.width || a.height !== b.height) throw new Error('capturas de distinto tamaño');
  const mask = new Uint8Array(a.width * a.height);
  for (let p = 0; p < mask.length; p++) {
    const i = p * 4;
    if (a.data[i] - b.data[i] >= min || a.data[i + 1] - b.data[i + 1] >= min || a.data[i + 2] - b.data[i + 2] >= min) mask[p] = 1;
  }
  return mask;
}

/** Píxeles quemados a blanco: los tres canales en `min` o más. */
export function white(img: Pixels, min = 250): Uint8Array {
  const mask = new Uint8Array(img.width * img.height);
  for (let p = 0; p < mask.length; p++) {
    const i = p * 4;
    if (img.data[i] >= min && img.data[i + 1] >= min && img.data[i + 2] >= min) mask[p] = 1;
  }
  return mask;
}

export interface Region {
  area: number;
  /** Lado mayor de su caja: una línea es larga y un punto no. */
  extent: number;
  x: number;
  y: number;
}

/** Regiones conexas (8 vecinos) de una máscara, de mayor a menor área. */
export function regions(mask: Uint8Array, width: number): Region[] {
  const height = mask.length / width;
  const seen = new Uint8Array(mask.length);
  const stack: number[] = [];
  const out: Region[] = [];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    let area = 0;
    let [x0, y0, x1, y1] = [width, height, 0, 0];
    seen[start] = 1;
    stack.push(start);
    while (stack.length) {
      const p = stack.pop()!;
      const x = p % width;
      const y = (p - x) / width;
      area++;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const q = ny * width + nx;
          if (mask[q] && !seen[q]) {
            seen[q] = 1;
            stack.push(q);
          }
        }
      }
    }
    out.push({ area, extent: Math.max(x1 - x0, y1 - y0) + 1, x: x0, y: y0 });
  }
  return out.sort((a, b) => b.area - a.area);
}

export const count = (mask: Uint8Array) => mask.reduce((n, v) => n + v, 0);

/** Distancia de lo pintado a cada borde (px): 0 = toca el borde, así que la forma sale cortada. Null si no hay nada. */
export interface Margins {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function margins(mask: Uint8Array, width: number): Margins | null {
  const height = mask.length / width;
  let [x0, y0, x1, y1] = [width, height, -1, -1];
  for (let p = 0; p < mask.length; p++) {
    if (!mask[p]) continue;
    const x = p % width;
    const y = (p - x) / width;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return x1 < 0 ? null : { left: x0, right: width - 1 - x1, top: y0, bottom: height - 1 - y1 };
}
