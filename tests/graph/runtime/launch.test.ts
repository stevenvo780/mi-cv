import { beforeEach, describe, expect, it, vi } from 'vitest';
import { launchScene, type LaunchOptions } from '@/graph/runtime/launch';
import type { SceneEvent } from '@/graph/runtime/protocol';

/**
 * Arranque de la escena desde GraphStage (spec §4.4, paso 3): worker con OffscreenCanvas o, sin él, GraphScene en el
 * hilo principal. Todo simulado salvo el buzón y `dispatch`, que son los reales: lo que se comprueba es qué recibe la
 * escena, con qué estado arranca y qué pasa cuando algo falla.
 */

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const scenes: FakeScene[] = [];
class FakeScene {
  ready = false;
  readonly calls: string[] = [];
  boot?: { options: Record<string, unknown>; resolve: () => void; reject: (e: unknown) => void };
  constructor(readonly emit: (e: SceneEvent) => void) {
    scenes.push(this);
  }
  init(options: Record<string, unknown>): Promise<void> {
    this.calls.push('init');
    return new Promise((resolve, reject) => {
      this.boot = {
        options,
        resolve: () => {
          this.ready = true;
          resolve();
        },
        reject,
      };
    });
  }
  resize(w: number, h: number, dpr: number) {
    if (!this.ready) throw new Error('resize antes de init');
    this.calls.push(`resize ${w}x${h}@${dpr}`);
  }
  setPointer(x: number, y: number, inside: boolean) {
    this.calls.push(`pointer ${x},${y},${inside}`);
  }
  setScroll(s: number) {
    this.calls.push(`scroll ${s}`);
  }
  setMotion(on: boolean) {
    this.calls.push(`motion ${on}`);
  }
  focusNode(index: number | null) {
    if (!this.ready) throw new Error('focusNode antes de init');
    this.calls.push(`focus ${index}`);
  }
  setVisible(visible: boolean) {
    this.calls.push(`visible ${visible}`);
  }
  dispose() {
    this.calls.push('dispose');
  }
}

class FakeWorker {
  readonly posted: unknown[] = [];
  readonly transfers: unknown[][] = [];
  terminated = false;
  onmessage: ((ev: MessageEvent<SceneEvent>) => void) | null = null;
  onerror: ((ev: ErrorEvent) => void) | null = null;
  postMessage(m: unknown, transfer: unknown[] = []) {
    this.posted.push(m);
    this.transfers.push(transfer);
  }
  terminate() {
    this.terminated = true;
  }
  /** Evento de la escena que corre dentro del worker. */
  emit(e: SceneEvent) {
    this.onmessage?.({ data: e } as MessageEvent<SceneEvent>);
  }
  crash(message: string) {
    const ev = { message, preventDefault: vi.fn() };
    this.onerror?.(ev as unknown as ErrorEvent);
    return ev;
  }
}

const GRAPH = { nodeCount: 3 };
const settle = () => new Promise((r) => setTimeout(r, 0));

function setup(opts: { worker?: boolean | 'throws'; transfer?: 'throws' } = {}) {
  const state = { motion: true, size: { width: 800, height: 600, dpr: 1 } };
  const canvases: { transferControlToOffscreen: () => unknown }[] = [];
  const offscreen = { offscreen: true };
  const workers: FakeWorker[] = [];
  const sceneModule = deferred<typeof FakeScene>();
  const graph = deferred<typeof GRAPH>();
  const o = {
    tier: 2,
    binUrl: 'http://x/graph.bin',
    size: () => state.size,
    motion: () => state.motion,
    mountCanvas: vi.fn(() => {
      const c = {
        transferControlToOffscreen: () => {
          if (opts.transfer === 'throws') throw new Error('InvalidStateError');
          return offscreen;
        },
      };
      canvases.push(c);
      return c;
    }),
    clearHost: vi.fn(),
    createWorker: opts.worker
      ? () => {
          if (opts.worker === 'throws') throw new Error('SecurityError');
          const w = new FakeWorker();
          workers.push(w);
          return w;
        }
      : null,
    loadScene: vi.fn(() => sceneModule.promise),
    loadGraph: vi.fn(() => graph.promise),
    onEvent: vi.fn<(e: SceneEvent) => void>(),
    onFail: vi.fn(),
    warn: vi.fn(),
  };
  const link = launchScene(o as unknown as LaunchOptions);
  /** Termina de cargar el chunk de GraphScene y el binario del fallback. */
  const loadMain = async () => {
    sceneModule.resolve(FakeScene);
    graph.resolve(GRAPH);
    await settle();
  };
  return { o, link, state, canvases, offscreen, workers, sceneModule, graph, loadMain };
}

beforeEach(() => {
  scenes.length = 0;
});

describe('launchScene en el hilo principal (sin worker)', () => {
  it('acepta mensajes en cuanto arranca, antes de que llegue el chunk de three, y no pierde la pausa', async () => {
    const { o, link, state, loadMain } = setup();
    expect(o.mountCanvas).toHaveBeenCalledTimes(1);
    // El usuario pulsa pausa mientras se descarga GraphScene (~136 KB gz de three).
    state.motion = false;
    link.send({ type: 'motion', on: false });
    link.send({ type: 'scroll', s: 0.5 });
    state.size = { width: 1024, height: 768, dpr: 2 };
    link.send({ type: 'resize', width: 1024, height: 768, dpr: 2 });
    await loadMain();
    const [scene] = scenes;
    // Arranca con el estado vigente al hacer init, no con el del momento en que se pidió el arranque.
    expect(scene.boot?.options).toMatchObject({ motion: false, width: 1024, height: 768, dpr: 2, tier: 2, graph: GRAPH });
    expect(scene.calls).toEqual(['init']);
    scene.boot!.resolve();
    await settle();
    // Y lo encolado se aplica tras init: la escena no anima con el botón en «pausado».
    expect(scene.calls).toEqual(['init', 'motion false', 'scroll 0.5', 'resize 1024x768@2']);
    link.send({ type: 'focus', index: 2 });
    expect(scene.calls.at(-1)).toBe('focus 2');
    expect(o.onFail).not.toHaveBeenCalled();
  });

  it('los eventos de la escena llegan a onEvent', async () => {
    const { o, loadMain } = setup();
    await loadMain();
    scenes[0].emit({ type: 'ready' });
    expect(o.onEvent).toHaveBeenCalledWith({ type: 'ready' });
  });

  it.each([
    ['el chunk de GraphScene (ChunkLoadError)', 'scene'],
    ['el binario del grafo', 'graph'],
    ['init (sin contexto WebGL)', 'init'],
  ] as const)('si falla %s, avisa en consola y vuelve al póster', async (_label, where) => {
    const { o, sceneModule, graph } = setup();
    const err = new Error(`fallo en ${where}`);
    if (where === 'scene') sceneModule.reject(err);
    else sceneModule.resolve(FakeScene);
    if (where === 'graph') graph.reject(err);
    else graph.resolve(GRAPH);
    await settle();
    if (where === 'init') scenes[0].boot!.reject(err);
    await settle();
    expect(o.warn).toHaveBeenCalledWith('[grafo] fallback sin escena:', err);
    expect(o.onFail).toHaveBeenCalledTimes(1);
  });

  it('dispose() durante la carga: no crea la escena ni avisa de fallos tardíos', async () => {
    const { o, link, loadMain } = setup();
    link.dispose();
    await loadMain();
    expect(scenes).toEqual([]);
    expect(o.onFail).not.toHaveBeenCalled();
  });

  it('dispose() durante init libera la escena y no abre el buzón', async () => {
    const { link, loadMain } = setup();
    link.send({ type: 'focus', index: 1 });
    await loadMain();
    link.dispose();
    scenes[0].boot!.resolve();
    await settle();
    expect(scenes[0].calls).toEqual(['init', 'dispose']);
  });
});

describe('launchScene con worker', () => {
  it('transfiere el canvas y manda init con el estado vigente; los mensajes van al worker', () => {
    const { link, workers, offscreen, o } = setup({ worker: true });
    const [w] = workers;
    expect(w.posted[0]).toEqual({ type: 'init', canvas: offscreen, binUrl: 'http://x/graph.bin', width: 800, height: 600, dpr: 1, tier: 2, motion: true });
    expect(w.transfers[0]).toEqual([offscreen]);
    link.send({ type: 'motion', on: false });
    expect(w.posted[1]).toEqual({ type: 'motion', on: false });
    expect(o.loadScene).not.toHaveBeenCalled();
  });

  it('los eventos del worker llegan a onEvent; un error tras ready no cambia de vía', () => {
    const { o, workers } = setup({ worker: true });
    const [w] = workers;
    w.emit({ type: 'ready' });
    w.emit({ type: 'error', message: 'webgl-context-lost' });
    expect(o.onEvent.mock.calls.map(([e]) => e)).toEqual([{ type: 'ready' }, { type: 'error', message: 'webgl-context-lost' }]);
    expect(w.terminated).toBe(false);
    expect(o.loadScene).not.toHaveBeenCalled();
  });

  it('un error del worker antes de ready (OffscreenCanvas sin WebGL2) pasa al hilo principal con el estado vigente', async () => {
    const { o, link, state, workers, loadMain } = setup({ worker: true });
    const [w] = workers;
    state.motion = false;
    link.send({ type: 'motion', on: false });
    state.size = { width: 500, height: 400, dpr: 3 };
    link.send({ type: 'resize', width: 500, height: 400, dpr: 3 });
    link.send({ type: 'scroll', s: 2.25 });
    w.emit({ type: 'error', message: 'Error creating WebGL context.' });
    expect(w.terminated).toBe(true);
    expect(o.clearHost).toHaveBeenCalledTimes(1);
    expect(o.mountCanvas).toHaveBeenCalledTimes(2);
    expect(o.warn).toHaveBeenCalledWith('[grafo] el worker falló, uso el hilo principal:', 'Error creating WebGL context.');
    // El error no llega a GraphStage (que volvería al póster).
    expect(o.onEvent).not.toHaveBeenCalled();
    await loadMain();
    const [scene] = scenes;
    expect(scene.boot?.options).toMatchObject({ motion: false, width: 500, height: 400, dpr: 3 });
    scene.boot!.resolve();
    await settle();
    // Lo que se mandó al worker antes del fallo se repite en la escena nueva: la pausa no se pierde.
    expect(scene.calls).toEqual(['init', 'motion false', 'resize 500x400@3', 'scroll 2.25']);
    expect(o.onFail).not.toHaveBeenCalled();
  });

  it('onerror del worker (chunk o excepción) pasa al hilo principal sin perder la pausa ni el tamaño', async () => {
    const { o, link, state, workers, loadMain } = setup({ worker: true });
    const [w] = workers;
    state.motion = false;
    link.send({ type: 'motion', on: false });
    link.send({ type: 'resize', width: 640, height: 480, dpr: 1 });
    const ev = w.crash('Uncaught SyntaxError');
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(w.terminated).toBe(true);
    await loadMain();
    const [scene] = scenes;
    expect(scene.boot?.options.motion).toBe(false);
    scene.boot!.resolve();
    await settle();
    expect(scene.calls).toEqual(['init', 'motion false', 'resize 640x480@1']);
    // Tras el cambio, los mensajes van a la escena del hilo principal y no al worker muerto.
    const posted = w.posted.length;
    link.send({ type: 'scroll', s: 3 });
    expect(scene.calls.at(-1)).toBe('scroll 3');
    expect(w.posted).toHaveLength(posted);
    expect(o.onFail).not.toHaveBeenCalled();
  });

  it('el fallback tras el worker también avisa y vuelve al póster si falla', async () => {
    const { o, workers, sceneModule } = setup({ worker: true });
    workers[0].emit({ type: 'error', message: 'No se pudo cargar el grafo (404)' });
    const err = new Error('ChunkLoadError');
    sceneModule.reject(err);
    await settle();
    expect(o.warn).toHaveBeenLastCalledWith('[grafo] fallback sin escena:', err);
    expect(o.onFail).toHaveBeenCalledTimes(1);
  });

  it('si crear el worker o transferir el canvas lanza, usa el hilo principal (y termina el worker creado)', async () => {
    for (const opts of [{ worker: 'throws' as const }, { worker: true, transfer: 'throws' as const }]) {
      scenes.length = 0;
      const { o, workers, loadMain } = setup(opts);
      expect(o.warn).toHaveBeenCalledWith('[grafo] worker no disponible, uso el hilo principal:', expect.any(Error));
      expect(workers.every((w) => w.terminated)).toBe(true);
      expect(o.clearHost).toHaveBeenCalledTimes(1);
      await loadMain();
      expect(scenes).toHaveLength(1);
    }
  });

  it('dispose() termina el worker, y un fallo posterior ya no arranca nada', () => {
    const { o, link, workers } = setup({ worker: true });
    const [w] = workers;
    link.dispose();
    expect(w.terminated).toBe(true);
    w.crash('tarde');
    w.emit({ type: 'error', message: 'tarde' });
    expect(o.loadScene).not.toHaveBeenCalled();
    expect(o.onEvent).not.toHaveBeenCalled();
  });
});
