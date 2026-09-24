import { describe, expect, it } from 'vitest';
import { ribbonIndex, ribbonVertices } from '@/graph/scene/ribbon';
import { EDGE_VERT } from '@/graph/scene/shaders';

/*
 * Sentido de giro de la cinta de aristas, en CPU. Se reproduce la extrusión de EDGE_VERT en coordenadas de
 * pantalla (y hacia arriba, como las de WebGL): tangente por diferencias entre t ± 0.02, normal = tangente
 * girada 90° a la izquierda, (-tng.y, tng.x), y desplazamiento de aSide · semiancho sobre esa normal. WebGL
 * toma como frontales los triángulos antihorarios en pantalla, y three descarta los traseros (FrontSide).
 */

type P = [number, number];
const SEGMENTS = 20;

/** Posición en pantalla de cada vértice de la cinta para una curva 2D, como la calcula EDGE_VERT. */
function extrude(curve: (t: number) => P, segments: number, halfWidth = 1): P[] {
  const { t, side } = ribbonVertices(segments);
  return Array.from(t, (tv, i) => {
    const s0 = curve(Math.max(tv - 0.02, 0));
    const s1 = curve(Math.min(tv + 0.02, 1));
    const tng: P = [s1[0] - s0[0], s1[1] - s0[1]];
    const tl = Math.hypot(tng[0], tng[1]);
    const nrm: P = tl > 1e-4 ? [-tng[1] / tl, tng[0] / tl] : [0, 1];
    const p = curve(tv);
    return [p[0] + nrm[0] * side[i] * halfWidth, p[1] + nrm[1] * side[i] * halfWidth];
  });
}

/** Área con signo (×2) de cada triángulo: > 0 antihorario, < 0 horario. */
function windings(index: ArrayLike<number>, pos: P[]): number[] {
  const out: number[] = [];
  for (let k = 0; k < index.length; k += 3) {
    const [a, b, c] = [pos[index[k]], pos[index[k + 1]], pos[index[k + 2]]];
    out.push((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  }
  return out;
}

const bezier = (a: P, c: P, b: P) => (t: number): P => {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
};

/** Bézier como las del shader: control en el punto medio, desplazado ±0.16·longitud en perpendicular. */
const edge = (a: P, b: P, sgn: 1 | -1) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const perp: P = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
  return bezier(a, [(a[0] + b[0]) / 2 + perp[0] * len * 0.16 * sgn, (a[1] + b[1]) / 2 + perp[1] * len * 0.16 * sgn], b);
};

/** Curvas en pantalla (px): rectas y aristas curvadas a un lado y al otro, en varias direcciones. */
const CURVES: Record<string, (t: number) => P> = {
  'recta →': bezier([0, 0], [50, 0], [100, 0]),
  'recta ←': bezier([100, 0], [50, 0], [0, 0]),
  'recta ↑': bezier([0, 0], [0, 50], [0, 100]),
  'recta ↙': bezier([80, 90], [40, 45], [0, 0]),
  'arista → curvada a la izquierda': edge([0, 0], [100, 0], 1),
  'arista → curvada a la derecha': edge([0, 0], [100, 0], -1),
  'arista ↖ curvada a la izquierda': edge([300, 20], [40, 210], 1),
  'arista ↓ curvada a la derecha': edge([10, 400], [30, 12], -1),
  'arista corta (8 px)': edge([0, 0], [6, 5], 1),
};

/** El índice que traía el brief de la T3 (dejaba todas las aristas de espaldas). */
function legacyIndex(segments: number): number[] {
  const index: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  return index;
}

describe('cinta de aristas', () => {
  it('la extrusión reproducida es la del vertex shader: normal = tangente girada a la izquierda, aSide sobre ella', () => {
    expect(EDGE_VERT).toMatch(/vec2 nrm = tl > 1e-4 \? vec2\(-tng\.y, tng\.x\) \/ tl : vec2\(0\.0, 1\.0\);/);
    expect(EDGE_VERT).toMatch(/clip\.xy \+= nrm \* aSide \*/);
    expect(EDGE_VERT).toMatch(/bez\(a, c, b, max\(aT - 0\.02, 0\.0\)\)/);
    expect(EDGE_VERT).toMatch(/bez\(a, c, b, min\(aT \+ 0\.02, 1\.0\)\)/);
  });

  it('vértices: dos por punto de la curva (aSide −1 y +1), t de 0 a 1', () => {
    const { t, side } = ribbonVertices(SEGMENTS);
    expect(t).toHaveLength((SEGMENTS + 1) * 2);
    expect(side).toHaveLength((SEGMENTS + 1) * 2);
    for (let i = 0; i <= SEGMENTS; i++) {
      expect(t[i * 2]).toBeCloseTo(i / SEGMENTS, 6);
      expect(t[i * 2 + 1]).toBeCloseTo(i / SEGMENTS, 6);
      expect([side[i * 2], side[i * 2 + 1]]).toEqual([-1, 1]);
    }
  });

  it('índice: dos triángulos por tramo que cubren todos los vértices', () => {
    const index = ribbonIndex(SEGMENTS);
    expect(index).toHaveLength(SEGMENTS * 6);
    expect(new Set(index).size).toBe((SEGMENTS + 1) * 2);
    expect(Math.max(...index)).toBe((SEGMENTS + 1) * 2 - 1);
  });

  it('todos los triángulos quedan antihorarios en pantalla (de frente), para cualquier curva', () => {
    const index = ribbonIndex(SEGMENTS);
    for (const [name, curve] of Object.entries(CURVES)) {
      const w = windings(index, extrude(curve, SEGMENTS));
      expect(w.filter((x) => !(x > 0)), name).toEqual([]);
    }
  });

  it('el orden antiguo (a, a+1, a+2, …) sale horario: la comprobación no es vacía', () => {
    for (const [name, curve] of Object.entries(CURVES)) {
      const w = windings(legacyIndex(SEGMENTS), extrude(curve, SEGMENTS));
      expect(w.every((x) => x < 0), name).toBe(true);
    }
  });
});
