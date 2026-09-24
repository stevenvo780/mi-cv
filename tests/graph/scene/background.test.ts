import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BACKGROUND_COLOR, HALO_COLOR } from '@/graph/palette';
import {
  ACES_INPUT,
  ACES_OUTPUT,
  STAGE_HALO,
  VIGNETTE,
  acesFilmic,
  haloAlpha,
  haloFrame,
  inverseAcesFilmic,
  stageBackground,
  vignette,
  type Vec3,
} from '@/graph/scene/background';

const css = readFileSync(new URL('../../../src/styles/home.css', import.meta.url), 'utf8');
const srgb = (hex: string): Vec3 => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as Vec3;

/** El `.home .stage::before` de home.css: el halo que ve la página detrás del póster. */
function cssHalo() {
  const block = css.match(/\.home \.stage::before \{([^}]*)\}/)?.[1] ?? '';
  const inset = Number(block.match(/inset:\s*(-?[\d.]+)%/)?.[1]) / 100;
  const m = block.match(
    /radial-gradient\((\d+)% (\d+)% at (\d+)% (\d+)%, rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\), rgb\(\d+ \d+ \d+ \/ ([\d.]+)\) (\d+)%, transparent (\d+)%\)/,
  );
  expect(m, 'radial-gradient de .home .stage::before').not.toBeNull();
  const n = m!.slice(1).map(Number);
  return {
    inset,
    size: [n[0] / 100, n[1] / 100],
    at: [n[2] / 100, n[3] / 100],
    color: `#${n.slice(4, 7).map((c) => c.toString(16).padStart(2, '0')).join('')}`,
    stops: [
      [0, n[7]],
      [n[9] / 100, n[8]],
      [n[10] / 100, 0],
    ],
  };
}

describe('fondo de la escena = la página detrás del póster (spec §3.1)', () => {
  it('STAGE_HALO es el halo de home.css (inset, tamaño, centro, color y paradas)', () => {
    const h = cssHalo();
    expect(STAGE_HALO.inset).toBeCloseTo(h.inset, 9);
    expect(STAGE_HALO.size).toEqual(h.size);
    expect(STAGE_HALO.at).toEqual(h.at);
    expect(HALO_COLOR).toBe(h.color);
    expect(STAGE_HALO.stops).toEqual(h.stops);
  });

  it('la elipse va en fracciones del escenario: el pseudoelemento mide 1.2 veces el escenario y empieza en −10 %', () => {
    const { center, radius } = haloFrame();
    expect(center[0]).toBeCloseTo(0.5, 9);
    expect(center[1]).toBeCloseTo(-0.1 + 0.48 * 1.2, 9);
    expect(radius[0]).toBeCloseTo(0.6 * 1.2, 9);
    expect(radius[1]).toBeCloseTo(0.55 * 1.2, 9);
  });

  it('haloAlpha interpola en línea recta entre las paradas y vale 0 fuera', () => {
    expect(haloAlpha(0)).toBeCloseTo(0.28, 9);
    expect(haloAlpha(0.225)).toBeCloseTo(0.18, 9);
    expect(haloAlpha(0.45)).toBeCloseTo(0.08, 9);
    expect(haloAlpha(0.575)).toBeCloseTo(0.04, 9);
    expect(haloAlpha(0.7)).toBe(0);
    expect(haloAlpha(3)).toBe(0);
  });

  it('stageBackground compone el halo sobre --ink-0 en sRGB, como el navegador, y la atenuación de Prueba lo baja', () => {
    const ink = srgb(BACKGROUND_COLOR);
    const halo = srgb(HALO_COLOR);
    const { center } = haloFrame();
    const at = (a: number) => ink.map((c, i) => c + (halo[i] - c) * a);
    stageBackground(center[0], center[1]).forEach((c, i) => expect(c).toBeCloseTo(at(0.28)[i], 9));
    stageBackground(0, 0).forEach((c, i) => expect(c).toBeCloseTo(ink[i], 9));
    stageBackground(0.02, 0.98).forEach((c, i) => expect(c).toBeCloseTo(ink[i], 9));
    // En el hero (dim = 1) es el halo tal cual; en Prueba (dim = 0.35) queda en (0.3 + 0.4 · 0.35) / 0.7.
    stageBackground(center[0], center[1], 0.35).forEach((c, i) => expect(c).toBeCloseTo(at(0.28 * (0.44 / 0.7))[i], 9));
  });

  it('el ACES de este módulo es el de three 0.186 (tonemapping_pars_fragment), el que aplica el ToneMappingEffect', () => {
    const chunk = readFileSync(new URL('../../../node_modules/three/src/renderers/shaders/ShaderChunk/tonemapping_pars_fragment.glsl.js', import.meta.url), 'utf8');
    const mat = (name: string) => {
      const body = chunk.match(new RegExp(`const mat3 ${name} = mat3\\(([\\s\\S]*?)\\);`))?.[1] ?? '';
      return [...body.matchAll(/vec3\(([^)]*)\)/g)].map((v) => v[1].split(',').map((x) => Number(x.replace(/\s/g, ''))));
    };
    expect(ACES_INPUT).toEqual(mat('ACESInputMat'));
    expect(ACES_OUTPUT).toEqual(mat('ACESOutputMat'));
    expect(chunk).toContain('vec3 a = v * ( v + 0.0245786 ) - 0.000090537;');
    expect(chunk).toContain('vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;');
    expect(chunk).toContain('color *= toneMappingExposure / 0.6;');
  });

  it('inverseAcesFilmic deshace el ACES en todo el rango del fondo, sin valores negativos', () => {
    const ink = srgb(BACKGROUND_COLOR);
    const halo = srgb(HALO_COLOR);
    for (let a = 0; a <= 0.3001; a += 0.02) {
      const target = ink.map((c, i) => c + (halo[i] - c) * a).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as Vec3;
      const pre = inverseAcesFilmic(target);
      pre.forEach((c) => expect(c).toBeGreaterThanOrEqual(0));
      acesFilmic(pre).forEach((c, i) => expect(c).toBeCloseTo(target[i], 7));
    }
    // Y en general, para colores de la escena (no solo el fondo).
    for (const c of [[0.2, 0.4, 0.6], [0.8, 0.5, 0.1], [0.01, 0.01, 0.01]] as Vec3[]) acesFilmic(inverseAcesFilmic(c)).forEach((v, i) => expect(v).toBeCloseTo(c[i], 6));
  });

  it('vignette es la del VignetteEffect de postprocessing (técnica por defecto): 1 en el centro y menos hacia las esquinas', () => {
    const pp = readFileSync(new URL('../../../node_modules/postprocessing/build/index.js', import.meta.url), 'utf8');
    expect(pp).toContain('float d=distance(uv,center);color*=smoothstep(0.8,offset*0.799,d*(darkness+offset));');
    expect(vignette(0.5, 0.5)).toBe(1);
    expect(vignette(0.6, 0.6)).toBe(1);
    expect(vignette(0, 0.5)).toBeLessThan(0.7);
    expect(vignette(0, 0)).toBeGreaterThan(0.15);
    expect(VIGNETTE).toEqual({ offset: 0.28, darkness: 0.62 });
  });
});
