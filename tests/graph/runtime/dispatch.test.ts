import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dispatch } from '@/graph/runtime/dispatch';
import type { MainToWorker } from '@/graph/runtime/protocol';
import type { GraphScene } from '@/graph/scene/GraphScene';

type Msg = Exclude<MainToWorker, { type: 'init' }>;

/** Escena simulada: un vi.fn() por cada método que `dispatch` puede llamar. */
function fakeScene() {
  return {
    resize: vi.fn(),
    setPointer: vi.fn(),
    setScroll: vi.fn(),
    setMotion: vi.fn(),
    focusNode: vi.fn(),
    setVisible: vi.fn(),
    dispose: vi.fn(),
  };
}

describe('dispatch', () => {
  let fake: ReturnType<typeof fakeScene>;
  let scene: GraphScene;

  beforeEach(() => {
    fake = fakeScene();
    scene = fake as unknown as GraphScene;
  });

  /** Tras un mensaje, solo el método esperado se ha llamado, y una sola vez. */
  const onlyCalled = (method: keyof typeof fake) => {
    for (const [name, fn] of Object.entries(fake)) expect(fn, name).toHaveBeenCalledTimes(name === method ? 1 : 0);
  };

  it('resize → resize(width, height, dpr)', () => {
    dispatch(scene, { type: 'resize', width: 1280, height: 720, dpr: 2 });
    expect(fake.resize).toHaveBeenCalledWith(1280, 720, 2);
    onlyCalled('resize');
  });

  it('pointer → setPointer(x, y, inside)', () => {
    dispatch(scene, { type: 'pointer', x: -0.25, y: 0.5, inside: true });
    expect(fake.setPointer).toHaveBeenCalledWith(-0.25, 0.5, true);
    onlyCalled('setPointer');
  });

  it('scroll → setScroll(s)', () => {
    dispatch(scene, { type: 'scroll', s: 2.4 });
    expect(fake.setScroll).toHaveBeenCalledWith(2.4);
    onlyCalled('setScroll');
  });

  it('motion → setMotion(on)', () => {
    dispatch(scene, { type: 'motion', on: false });
    expect(fake.setMotion).toHaveBeenCalledWith(false);
    onlyCalled('setMotion');
  });

  it('focus → focusNode(index), también con null', () => {
    dispatch(scene, { type: 'focus', index: 7 });
    expect(fake.focusNode).toHaveBeenCalledWith(7);
    onlyCalled('focusNode');
    dispatch(scene, { type: 'focus', index: null });
    expect(fake.focusNode).toHaveBeenLastCalledWith(null);
  });

  it('visible → setVisible(visible)', () => {
    dispatch(scene, { type: 'visible', visible: false });
    expect(fake.setVisible).toHaveBeenCalledWith(false);
    onlyCalled('setVisible');
  });

  it('dispose → dispose()', () => {
    dispatch(scene, { type: 'dispose' });
    expect(fake.dispose).toHaveBeenCalledWith();
    onlyCalled('dispose');
  });

  it('una variante desconocida (fuera del protocolo) no lanza ni toca la escena', () => {
    // La exhaustividad la comprueba tsc: dispatch.ts deja de compilar si el protocolo gana una variante sin su caso
    // (default con `never`). En ejecución, un mensaje que no es del protocolo se ignora.
    for (const msg of [{ type: 'init' }, { type: 'nope', x: 1 }, {}]) {
      expect(() => dispatch(scene, msg as unknown as Msg)).not.toThrow();
    }
    for (const [name, fn] of Object.entries(fake)) expect(fn, name).not.toHaveBeenCalled();
  });
});
