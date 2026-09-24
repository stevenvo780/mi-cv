/*
 * Fondo de la escena = la página detrás del póster (spec §3.1): `--ink-0` con el halo de `.home .stage::before`
 * (home.css). El canvas lo reproduce (a 2–3 niveles de 8 bits, medido en e2e/graph3d.spec.ts) para que el fundido
 * póster → canvas (600 ms) solo cambie el grafo. Sin compositor (T1) basta con no pasar el fondo por el tone mapping; con él (T2 y T3), el EffectPass aplica
 * viñeta y ACES a toda la imagen, así que el fondo sale con las inversas de los dos (BACKGROUND_FRAG, `uPost`).
 * Sin three: los tests lo comprueban en CPU contra home.css, el chunk de three y el shader de postprocessing.
 */
import { BACKGROUND_COLOR, HALO_COLOR } from '../palette';

export type Vec3 = [number, number, number];
type Mat3 = readonly (readonly [number, number, number])[];

/**
 * El halo de home.css, tal cual: `inset: -10%` y `radial-gradient(60% 55% at 50% 48%, rgb(35 67 90 / 0.28),
 * rgb(35 67 90 / 0.08) 45%, transparent 70%)`. Paradas: (posición en el radio de la elipse, alfa).
 */
export const STAGE_HALO = {
  inset: -0.1,
  size: [0.6, 0.55],
  at: [0.5, 0.48],
  stops: [
    [0, 0.28],
    [0.45, 0.08],
    [0.7, 0],
  ],
} as const;

/** La elipse del halo en fracciones del escenario (x a la derecha, y hacia abajo, como el CSS). */
export function haloFrame(): { center: [number, number]; radius: [number, number] } {
  const box = 1 - 2 * STAGE_HALO.inset;
  return {
    center: [STAGE_HALO.inset + STAGE_HALO.at[0] * box, STAGE_HALO.inset + STAGE_HALO.at[1] * box],
    radius: [STAGE_HALO.size[0] * box, STAGE_HALO.size[1] * box],
  };
}

/** Alfa del degradado a una distancia `t` del centro (1 = borde de la elipse): lineal entre paradas, 0 después. */
export function haloAlpha(t: number): number {
  const s = STAGE_HALO.stops;
  for (let i = 1; i < s.length; i++) {
    if (t <= s[i][0]) return s[i - 1][1] + ((s[i][1] - s[i - 1][1]) * (t - s[i - 1][0])) / (s[i][0] - s[i - 1][0]);
  }
  return s[s.length - 1][1];
}

/** Atenuación del halo con la del grafo (`dim` de la coreografía): (0.3 + 0.4 · dim) / 0.7, que es 1 en el hero (dim = 1). */
const HALO_DIM = { floor: 0.3, gain: 0.4 } as const;
export const haloDim = (dim: number) => (HALO_DIM.floor + HALO_DIM.gain * dim) / (HALO_DIM.floor + HALO_DIM.gain);

const srgb = (hex: string): Vec3 => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as Vec3;
export const INK_SRGB = srgb(BACKGROUND_COLOR);
export const HALO_SRGB = srgb(HALO_COLOR);

/** Color de la página en (x, y) del escenario, en sRGB [0, 1]: el halo compuesto sobre --ink-0 como lo hace el navegador. */
export function stageBackground(x: number, y: number, dim = 1): Vec3 {
  const { center, radius } = haloFrame();
  const a = haloAlpha(Math.hypot((x - center[0]) / radius[0], (y - center[1]) / radius[1])) * haloDim(dim);
  return INK_SRGB.map((c, i) => c + (HALO_SRGB[i] - c) * a) as Vec3;
}

/** La viñeta del EffectPass (GraphScene). La misma cuenta que el VignetteEffect de postprocessing, técnica por defecto. */
export const VIGNETTE = { offset: 0.28, darkness: 0.62 } as const;

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
};
export function vignette(u: number, v: number): number {
  return smoothstep(0.8, VIGNETTE.offset * 0.799, Math.hypot(u - 0.5, v - 0.5) * (VIGNETTE.darkness + VIGNETTE.offset));
}

/* ACES filmic de three 0.186 (tonemapping_pars_fragment), el que aplica el ToneMappingEffect. Matrices por columnas, como mat3 en GLSL. */
export const ACES_INPUT: Mat3 = [
  [0.59719, 0.076, 0.0284],
  [0.35458, 0.90834, 0.13383],
  [0.04823, 0.01566, 0.83777],
];
export const ACES_OUTPUT: Mat3 = [
  [1.60475, -0.10208, -0.00327],
  [-0.53108, 1.10813, -0.07276],
  [-0.07367, -0.00605, 1.07602],
];
const RRT = { a: 0.0245786, b: 0.000090537, c: 0.983729, d: 0.432951, e: 0.238081 };

const mul = (m: Mat3, v: Vec3): Vec3 => [0, 1, 2].map((r) => m[0][r] * v[0] + m[1][r] * v[1] + m[2][r] * v[2]) as Vec3;

/** Inversa de una matriz 3 × 3 por columnas. */
export function inverse3(m: Mat3): Mat3 {
  const [[a, d, g], [b, e, h], [c, f, i]] = m; // filas: (a b c), (d e f), (g h i)
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const det = a * A + b * B + c * C;
  const rows = [
    [A, -(b * i - c * h), b * f - c * e],
    [B, a * i - c * g, -(a * f - c * d)],
    [C, -(a * h - b * g), a * e - b * d],
  ].map((row) => row.map((x) => x / det));
  return [0, 1, 2].map((col) => [rows[0][col], rows[1][col], rows[2][col]] as const);
}
export const ACES_INPUT_INV = inverse3(ACES_INPUT);
export const ACES_OUTPUT_INV = inverse3(ACES_OUTPUT);

export function acesFilmic(color: Vec3, exposure = 1): Vec3 {
  const v = mul(ACES_INPUT, color.map((c) => (c * exposure) / 0.6) as Vec3);
  const t = v.map((x) => (x * (x + RRT.a) - RRT.b) / (x * (RRT.c * x + RRT.d) + RRT.e)) as Vec3;
  return mul(ACES_OUTPUT, t).map((x) => Math.min(Math.max(x, 0), 1)) as Vec3;
}

/**
 * Inversa de `acesFilmic` (exposición 1): el color lineal que, tras el ACES, sale como `color`. La curva RRT/ODT es un
 * cociente de cuadráticas: y = (v² + a v − b) / (c v² + d v + e) ⇒ (1 − c y) v² + (a − d y) v − (b + e y) = 0.
 */
export function inverseAcesFilmic(color: Vec3): Vec3 {
  const y = mul(ACES_OUTPUT_INV, color).map((x) => Math.max(x, 0)) as Vec3;
  const v = y.map((t) => {
    const A = 1 - RRT.c * t;
    const B = RRT.a - RRT.d * t;
    const C = -(RRT.b + RRT.e * t);
    return (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A);
  }) as Vec3;
  return mul(ACES_INPUT_INV, v).map((x) => x * 0.6) as Vec3;
}

/** Constantes y funciones GLSL del fondo, generadas desde este módulo (BACKGROUND_FRAG). */
export function backgroundGlsl(): string {
  const f = (x: number) => {
    const s = String(Number(x.toFixed(9)));
    return s.includes('.') ? s : `${s}.0`;
  };
  const vec = (v: readonly number[]) => `vec${v.length}(${v.map(f).join(', ')})`;
  const mat = (m: Mat3) => `mat3(${m.flat().map(f).join(', ')})`;
  const { center, radius } = haloFrame();
  return /* glsl */ `
const vec3 INK = ${vec(INK_SRGB)};
const vec3 HALO = ${vec(HALO_SRGB)};
const vec2 HALO_CENTER = ${vec(center)};
const vec2 HALO_RADIUS = ${vec(radius)};
${STAGE_HALO.stops.map((s, i) => `const vec2 HALO_STOP_${i} = ${vec(s)};`).join('\n')}
const float VIGNETTE_OFFSET = ${f(VIGNETTE.offset)};
const float VIGNETTE_DARKNESS = ${f(VIGNETTE.darkness)};
const mat3 ACES_INPUT_INV = ${mat(ACES_INPUT_INV)};
const mat3 ACES_OUTPUT_INV = ${mat(ACES_OUTPUT_INV)};

float haloAlpha(float t) {
${STAGE_HALO.stops
  .slice(1)
  .map((_, j) => `  if (t <= HALO_STOP_${j + 1}.x) return mix(HALO_STOP_${j}.y, HALO_STOP_${j + 1}.y, (t - HALO_STOP_${j}.x) / (HALO_STOP_${j + 1}.x - HALO_STOP_${j}.x));`)
  .join('\n')}
  return HALO_STOP_${STAGE_HALO.stops.length - 1}.y;
}
float haloDim(float dim) {
  return (${f(HALO_DIM.floor)} + ${f(HALO_DIM.gain)} * dim) / ${f(HALO_DIM.floor + HALO_DIM.gain)};
}
vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}
float vignette(vec2 uv) {
  return smoothstep(0.8, VIGNETTE_OFFSET * 0.799, distance(uv, vec2(0.5)) * (VIGNETTE_DARKNESS + VIGNETTE_OFFSET));
}
vec3 inverseAces(vec3 c) {
  vec3 y = max(ACES_OUTPUT_INV * c, 0.0);
  vec3 A = 1.0 - ${f(RRT.c)} * y;
  vec3 B = ${f(RRT.a)} - ${f(RRT.d)} * y;
  vec3 C = -(${f(RRT.b)} + ${f(RRT.e)} * y);
  return (ACES_INPUT_INV * ((-B + sqrt(B * B - 4.0 * A * C)) / (2.0 * A))) * 0.6;
}
`;
}
