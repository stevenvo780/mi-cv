import { describe, expect, it } from 'vitest';
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
  it('los fragment shaders aplican tone mapping y espacio de color de three', () => {
    for (const name of ['BACKGROUND_FRAG', 'NODE_FRAG', 'HUB_FRAG', 'EDGE_FRAG']) {
      const src = (S as Record<string, string>)[name];
      expect(src, name).toContain('#include <tonemapping_fragment>');
      expect(src, name).toContain('#include <colorspace_fragment>');
    }
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
});
