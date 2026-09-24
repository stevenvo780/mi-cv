import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DecodedGraph } from '@/graph/codec';
import type { MainToWorker, SceneEvent, WorkerToMain } from '@/graph/runtime/protocol';

/**
 * El worker (src/graph/worker/graph.worker.ts) con una escena y un cargador simulados. `dispatch` es el real: lo que se
 * comprueba es qué llega a la escena y cuándo. La escena de verdad no admite resize ni focusNode antes de init (sus
 * datos aún no existen), así que el worker encola todo lo que llegue antes de que esté lista.
 */
const h = vi.hoisted(() => {
  const state = {
    scenes: [] as InstanceType<typeof FakeScene>[],
    graph: {} as unknown,
    load: null as null | { url: string; resolve: (g: unknown) => void; reject: (e: unknown) => void },
  };
  class FakeScene {
    ready = false;
    readonly calls: string[] = [];
    /** El init en curso: la prueba decide cuándo termina. */
    boot?: { resolve: () => void; reject: (e: unknown) => void; options: Record<string, unknown> };
    constructor(readonly emit: (e: unknown) => void) {
      state.scenes.push(this);
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
    resize(w: number, hh: number, dpr: number) {
      this.guard('resize');
      this.calls.push(`resize ${w}x${hh}@${dpr}`);
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
      this.guard('focusNode');
      this.calls.push(`focus ${index}`);
    }
    setVisible(visible: boolean) {
      this.calls.push(`visible ${visible}`);
    }
    dispose() {
      this.calls.push('dispose');
    }
    /** Como la escena real: sin init no hay datos (focusNode leería this.data.nodeCount de undefined). */
    private guard(method: string) {
      if (!this.ready) throw new Error(`${method} antes de init`);
    }
  }
  return { state, FakeScene };
});

vi.mock('@/graph/scene/GraphScene', () => ({ GraphScene: h.FakeScene }));
vi.mock('@/graph/runtime/loader', () => ({
  loadGraphBinary: (url: string) =>
    new Promise((resolve, reject) => {
      h.state.load = { url, resolve, reject };
    }),
}));

interface FakeScope {
  postMessage: ReturnType<typeof vi.fn<(m: WorkerToMain) => void>>;
  onmessage: ((event: MessageEvent<MainToWorker>) => void) | null;
}

let scope: FakeScope;
const send = (msg: MainToWorker) => scope.onmessage!({ data: msg } as MessageEvent<MainToWorker>);
/** Deja correr las promesas pendientes (cargador, init y el vaciado de la cola). */
const settle = () => new Promise((r) => setTimeout(r, 0));
const INIT = { type: 'init', canvas: {} as OffscreenCanvas, width: 800, height: 600, dpr: 1, tier: 2, motion: true, binUrl: 'http://x/graph.bin' } as const;

beforeEach(async () => {
  vi.resetModules();
  h.state.scenes.length = 0;
  h.state.load = null;
  scope = { postMessage: vi.fn(), onmessage: null };
  vi.stubGlobal('self', scope);
  await import('@/graph/worker/graph.worker');
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('graph.worker', () => {
  it('escucha mensajes al cargarse', () => {
    expect(scope.onmessage).toBeTypeOf('function');
  });

  it('init: carga el binario y arranca la escena con el canvas y las medidas del mensaje', async () => {
    send(INIT);
    expect(h.state.load?.url).toBe(INIT.binUrl);
    h.state.load!.resolve(h.state.graph);
    await settle();
    const [scene] = h.state.scenes;
    expect(scene.boot?.options).toEqual({ canvas: INIT.canvas, width: 800, height: 600, dpr: 1, tier: 2, motion: true, graph: h.state.graph as DecodedGraph });
  });

  it('encola lo que llega antes de que la escena esté lista: nunca llama a resize ni a focusNode antes de init', async () => {
    send({ type: 'resize', width: 10, height: 10, dpr: 1 }); // antes incluso del init
    send(INIT);
    send({ type: 'focus', index: 3 });
    send({ type: 'scroll', s: 0.4 });
    h.state.load!.resolve(h.state.graph);
    await settle();
    const [scene] = h.state.scenes;
    // Cargado el binario, init está en curso: la escena aún no ha recibido nada más.
    expect(scene.calls).toEqual(['init']);
    send({ type: 'resize', width: 1024, height: 768, dpr: 2 });
    send({ type: 'scroll', s: 1.2 });
    await settle();
    expect(scene.calls).toEqual(['init']);
    scene.boot!.resolve();
    await settle();
    // Solo el último mensaje de cada tipo, y ninguno falló por llegar antes de init.
    expect(scene.calls).toEqual(['init', 'resize 1024x768@2', 'focus 3', 'scroll 1.2']);
    expect(scope.postMessage).not.toHaveBeenCalled();
  });

  it('con la escena lista, despacha cada mensaje en cuanto llega', async () => {
    send(INIT);
    h.state.load!.resolve(h.state.graph);
    await settle();
    const [scene] = h.state.scenes;
    scene.boot!.resolve();
    await settle();
    send({ type: 'pointer', x: 0.5, y: -0.5, inside: true });
    send({ type: 'pointer', x: 0.1, y: 0.2, inside: false });
    send({ type: 'visible', visible: false });
    expect(scene.calls).toEqual(['init', 'pointer 0.5,-0.5,true', 'pointer 0.1,0.2,false', 'visible false']);
  });

  it('reenvía al hilo principal los eventos de la escena', async () => {
    send(INIT);
    const [scene] = h.state.scenes;
    const ready: SceneEvent = { type: 'ready' };
    scene.emit(ready);
    scene.emit({ type: 'hover', index: 4, x: 12, y: 34 });
    expect(scope.postMessage.mock.calls.map(([m]) => m)).toEqual([ready, { type: 'hover', index: 4, x: 12, y: 34 }]);
  });

  it('un fallo al cargar el binario llega como evento error, y la cola no se aplica', async () => {
    send(INIT);
    send({ type: 'resize', width: 1, height: 1, dpr: 1 });
    h.state.load!.reject(new Error('No se pudo cargar el grafo (404)'));
    await settle();
    expect(scope.postMessage).toHaveBeenCalledWith({ type: 'error', message: 'No se pudo cargar el grafo (404)' });
    expect(h.state.scenes[0].calls).toEqual([]);
  });

  it('un fallo en init (p. ej. sin WebGL2 en el OffscreenCanvas) también llega como error', async () => {
    send(INIT);
    h.state.load!.resolve(h.state.graph);
    await settle();
    send({ type: 'focus', index: 1 });
    h.state.scenes[0].boot!.reject('sin contexto webgl2');
    await settle();
    expect(scope.postMessage).toHaveBeenCalledWith({ type: 'error', message: 'sin contexto webgl2' });
    expect(h.state.scenes[0].calls).toEqual(['init']);
  });
});
