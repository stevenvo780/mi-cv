import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BACKGROUND_COLOR, HALO_COLOR } from '@/graph/palette';
import { smoothstep } from '@/graph/scene/choreography';
import { ACES_INPUT, ACES_OUTPUT, STAGE_HALO, VIGNETTE, haloDim, haloFrame } from '@/graph/scene/background';
import * as S from '@/graph/scene/shaders';

const ATTRS: Record<string, string[]> = {
  NODE_VERT: ['aRef', 'aOffset', 'aColor', 'aSize', 'aSeed', 'aSemantic'],
  HUB_VERT: ['aRef', 'aColor', 'aScale'],
  EDGE_VERT: ['aT', 'aSide', 'aA', 'aB', 'aOffA', 'aOffB', 'aColA', 'aColB', 'aSeed', 'aWeight', 'aSemantic'],
};

describe('shaders', () => {
  it('declaran los atributos que la escena les pasa', () => {
    for (const [name, attrs] of Object.entries(ATTRS)) {
      const src = (S as Record<string, string>)[name];
      for (const a of attrs) expect(src, `${name}:${a}`).toMatch(new RegExp(`attribute\\s+\\w+\\s+${a};`));
    }
  });
  it('los fragment shaders del grafo aplican tone mapping y espacio de color de three; el fondo, solo el espacio de color', () => {
    for (const name of ['NODE_FRAG', 'HUB_FRAG', 'EDGE_FRAG']) {
      const src = (S as Record<string, string>)[name];
      expect(src, name).toContain('#include <tonemapping_fragment>');
      expect(src, name).toContain('#include <colorspace_fragment>');
    }
    // El fondo trae sus colores exactos (los de la página detrás del póster): el ACES de three los hundía (§3.1).
    expect(S.BACKGROUND_FRAG).not.toContain('#include <tonemapping_fragment>');
    expect(S.BACKGROUND_FRAG).toContain('#include <colorspace_fragment>');
  });
  it('nodos, hubs y aristas comparten la misma posición animada (nodePos)', () => {
    for (const name of ['NODE_VERT', 'HUB_VERT', 'EDGE_VERT']) expect((S as Record<string, string>)[name], name).toContain('nodePos(');
  });
  it('ningún shader fuerza GLSL3 a mano', () => {
    for (const src of Object.values(S)) expect(src).not.toContain('#version');
  });
  it('ninguna variable ni parámetro usa una palabra reservada de GLSL ES 3.00 (three compila como 300 es)', () => {
    // Regresión: `vec3 layoutPos(int layout, …)` no compilaba ('layout' : syntax error). Lista de GLSL ES 3.00 §3.7–3.8.
    const reserved = [
      'layout', 'centroid', 'flat', 'smooth', 'invariant', 'sample', 'patch', 'coherent', 'volatile', 'restrict', 'readonly',
      'writeonly', 'resource', 'shared', 'buffer', 'filter', 'input', 'output', 'common', 'partition', 'active', 'asm', 'class',
      'union', 'enum', 'typedef', 'template', 'this', 'goto', 'inline', 'noinline', 'public', 'static', 'extern', 'external',
      'interface', 'long', 'short', 'double', 'half', 'fixed', 'unsigned', 'superp', 'sizeof', 'cast', 'namespace', 'using',
    ];
    const decl = new RegExp(`\\b(?:float|u?int|bool|[iu]?vec[234]|mat[234]|sampler2D)\\s+(${reserved.join('|')})\\b`);
    for (const [name, src] of Object.entries(S)) expect(src.match(decl)?.[0], name).toBeUndefined();
  });
  it('cada uniform se declara una sola vez por programa (uFocus pasó al bloque común)', () => {
    for (const name of ['NODE_VERT', 'HUB_VERT', 'EDGE_VERT']) {
      const src = (S as Record<string, string>)[name];
      const decls = [...src.matchAll(/uniform\s+\w+\s+(\w+);/g)].map((m) => m[1]);
      expect(decls.filter((d, i) => decls.indexOf(d) !== i), name).toEqual([]);
    }
  });
  it('aristas: el alfa es cobertura, no intensidad (con mezcla aditiva, glow en el alfa deja la base al cuadrado)', () => {
    const alpha = S.EDGE_FRAG.match(/gl_FragColor\s*=\s*vec4\(col,\s*([^;]+)\);/)?.[1];
    expect(alpha).toBeDefined();
    expect(alpha).not.toMatch(/glow|pulse|base/);
    expect(S.EDGE_FRAG).toMatch(/BASE_SEMANTIC\s*=\s*0\.15;/);
  });
  it('aristas: el color sale premultiplicado por el alfa, tras el tone mapping y el espacio de color (GraphScene elige la mezcla)', () => {
    const tail = S.EDGE_FRAG.slice(S.EDGE_FRAG.indexOf('#include <colorspace_fragment>'));
    expect(tail).toMatch(/^#include <colorspace_fragment>\s*(\/\*[\s\S]*?\*\/\s*)?gl_FragColor\.rgb \*= gl_FragColor\.a;\s*\}/);
    expect(S.EDGE_FRAG).not.toContain('premultiplied_alpha_fragment');
  });
  it('aristas: con el nodo activo en el extremo b, los pulsos recorren la cinta al revés (salen hacia el vecino)', () => {
    expect(S.EDGE_VERT).toMatch(/vT\s*=\s*mix\(aT,\s*1\.0\s*-\s*aT,[^;]*hB[^;]*\);/);
  });
  it('respiración con ruido simplex por instancia, sin senos del tiempo', () => {
    const body = S.NODE_VERT.slice(S.NODE_VERT.indexOf('vec3 nodePos('), S.NODE_VERT.indexOf('float fogOf('));
    expect(body).toContain('simplex(');
    expect(body).not.toMatch(/\b(sin|cos)\s*\(\s*uTime/);
    expect(S.NODE_VERT).toMatch(/float simplex\(vec2 p\)/);
  });
  it('niebla: nada delante del plano de foco ni en él; detrás sube hasta 0.7 (spec §3.3)', () => {
    // Se evalúa la expresión real de fogOf (constantes y bordes del smoothstep leídos del GLSL).
    const src = S.NODE_VERT;
    const consts = Object.fromEntries([...src.matchAll(/const float (\w+) = ([\d.]+);/g)].map((m) => [m[1], Number(m[2])]));
    const body = src.slice(src.indexOf('float fogOf('), src.indexOf('}', src.indexOf('float fogOf(')));
    const m = body.match(/return (\w+) \* smoothstep\(([^,]+), ([^,]+), depth\);/);
    expect(m, body).not.toBeNull();
    const expr = (e: string, focus: number) => Function(...Object.keys(consts), 'uFocus', `return ${e};`)(...Object.values(consts), focus) as number;
    const focus = 4.4;
    const fog = (depth: number) => consts[m![1]] * smoothstep(expr(m![2], focus), expr(m![3], focus), depth);
    expect(fog(focus - 0.6)).toBe(0);
    expect(fog(focus - 0.1)).toBe(0);
    expect(fog(focus)).toBe(0);
    expect(fog(focus + 0.3)).toBeGreaterThan(0.05);
    expect(fog(focus + 0.6)).toBeGreaterThan(fog(focus + 0.3));
    expect(fog(focus + 5)).toBeCloseTo(0.7, 6);
  });
  it('niebla en los tres materiales del grafo', () => {
    for (const name of ['NODE_VERT', 'HUB_VERT', 'EDGE_VERT']) expect((S as Record<string, string>)[name], name).toMatch(/fogOf\(/);
    expect(S.HUB_FRAG).toMatch(/mix\(col,[^;]*vFog\)/);
    expect(S.EDGE_FRAG).toMatch(/1\.0 - vFog/);
  });
});

describe('colores del fondo', () => {
  it('palette.ts exporta el fondo (--ink-0) y el halo de home.css', () => {
    const css = readFileSync(new URL('../../../src/styles/home.css', import.meta.url), 'utf8');
    expect(css).toMatch(new RegExp(`--ink-0:\\s*${BACKGROUND_COLOR};`));
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(HALO_COLOR.slice(i, i + 2), 16));
    expect(css).toContain(`rgb(${r} ${g} ${b} /`);
  });

  const num = (src: string, re: RegExp) => {
    const m = src.match(re);
    expect(m, String(re)).not.toBeNull();
    return m![1].split(',').map(Number);
  };
  const close = (got: number[], want: readonly number[], digits = 6) => got.forEach((v, i) => expect(v).toBeCloseTo(want[i], digits));

  it('el fondo es la página detrás del póster: --ink-0 y el halo de .stage::before, en sRGB y con su elipse (background.ts)', () => {
    const src = S.BACKGROUND_FRAG;
    const srgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    close(num(src, /const vec3 INK = vec3\(([^)]+)\);/), srgb(BACKGROUND_COLOR));
    close(num(src, /const vec3 HALO = vec3\(([^)]+)\);/), srgb(HALO_COLOR));
    const { center, radius } = haloFrame();
    close(num(src, /const vec2 HALO_CENTER = vec2\(([^)]+)\);/), center);
    close(num(src, /const vec2 HALO_RADIUS = vec2\(([^)]+)\);/), radius);
    // Las paradas del degradado, en orden: (posición, alfa).
    const stops = [...src.matchAll(/HALO_STOP_(\d) = vec2\(([^)]+)\);/g)].map((m) => m[2].split(',').map(Number));
    expect(stops).toEqual(STAGE_HALO.stops.map((s) => [...s]));
    // Composición en sRGB (como el navegador) y paso a lineal antes del espacio de color de salida.
    expect(src).toMatch(/srgbToLinear\(mix\(INK, HALO, a\)\)/);
    // Hero: el halo tal cual; el resto de secciones lo atenúan con uDim, como antes: (0.3 + 0.4 · dim) / 0.7.
    expect(src).toMatch(/haloAlpha\([^;]*\) \* haloDim\(uDim\);/);
    const dim = src.match(/float haloDim\(float dim\) \{\s*return \(([\d.]+) \+ ([\d.]+) \* dim\) \/ ([\d.]+);/);
    expect(dim, 'haloDim en GLSL').not.toBeNull();
    for (const d of [0, 0.35, 1]) expect((Number(dim![1]) + Number(dim![2]) * d) / Number(dim![3])).toBeCloseTo(haloDim(d), 9);
    expect(haloDim(1)).toBe(1);
    expect(haloDim(0.35)).toBeCloseTo(0.44 / 0.7, 9);
  });

  it('con compositor (uPost), el fondo se adelanta al ACES y a la viñeta del EffectPass, con las inversas exactas', () => {
    const src = S.BACKGROUND_FRAG;
    expect(src).toMatch(/if \(uPost > 0\.5\) col = inverseAces\(col\) \/ vignette\(vUv\);/);
    close(num(src, /const float VIGNETTE_OFFSET = ([\d.]+);/), [VIGNETTE.offset], 9);
    close(num(src, /const float VIGNETTE_DARKNESS = ([\d.]+);/), [VIGNETTE.darkness], 9);
    // Las matrices inversas del ACES de three: producto por la directa = identidad (columnas, como mat3 en GLSL).
    const mat = (name: string) => {
      const body = src.match(new RegExp(`const mat3 ${name} = mat3\\(([\\s\\S]*?)\\);\\n`))?.[1] ?? '';
      const n = body.split(',').map(Number);
      expect(n, name).toHaveLength(9);
      return [n.slice(0, 3), n.slice(3, 6), n.slice(6, 9)];
    };
    const mul = (a: number[][], b: number[][]) => b.map((col) => [0, 1, 2].map((r) => a[0][r] * col[0] + a[1][r] * col[1] + a[2][r] * col[2]));
    for (const [inv, dir] of [
      [mat('ACES_INPUT_INV'), ACES_INPUT],
      [mat('ACES_OUTPUT_INV'), ACES_OUTPUT],
    ] as const) {
      const id = mul(dir.map((c) => [...c]), inv);
      id.forEach((col, c) => col.forEach((v, r) => expect(v).toBeCloseTo(c === r ? 1 : 0, 6)));
    }
  });
});
