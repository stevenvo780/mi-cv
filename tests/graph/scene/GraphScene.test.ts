import * as pp from 'postprocessing';
import {
  ACESFilmicToneMapping,
  AddEquation,
  CustomBlending,
  NoToneMapping,
  OneFactor,
  OneMinusSrcColorFactor,
  type Group,
  type Material,
  type Object3D,
  type Scene,
  type ShaderMaterial,
  type Vector2,
} from 'three';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { buildArtifacts } from '@/graph/artifacts';
import { decodeGraph } from '@/graph/codec';
import { LAYOUT_NAMES } from '@/graph/layout-names';
import { dispatch } from '@/graph/runtime/dispatch';
import type { MainToWorker, SceneEvent } from '@/graph/runtime/protocol';
import { BACKGROUND_COLOR } from '@/graph/palette';
import { QualityGovernor, type Tier } from '@/graph/runtime/quality';
import { VIGNETTE } from '@/graph/scene/background';
import { GraphScene } from '@/graph/scene/GraphScene';
import * as S from '@/graph/scene/shaders';

/*
 * GraphScene sin GPU. three es el real salvo WebGLRenderer, que es un doble: registra lo que se le pide (DPR,
 * render target activo, autoClear, tone mapping, compilaciones y frames). postprocessing es el real, así que el
 * compositor se comporta como en el navegador; entre otras cosas, pone `autoClear = false` al construirse.
 * El reloj es simulado: rAF y performance.now solo avanzan con frames.tick() y frames.advance().
 */

const frames = vi.hoisted(() => {
  const pending = new Map<number, (t: number) => void>();
  let next = 1;
  let clock = 1000;
  globalThis.requestAnimationFrame = (cb: (t: number) => void) => {
    const id = next++;
    pending.set(id, cb);
    return id;
  };
  globalThis.cancelAnimationFrame = (id: number) => {
    pending.delete(id);
  };
  return {
    pending,
    now: () => clock,
    reset() {
      pending.clear();
      clock = 1000;
    },
    /** Avanza el reloj `ms` y ejecuta los rAF pendientes: un frame. */
    tick(ms = 1000 / 60) {
      clock += ms;
      const cbs = [...pending.values()];
      pending.clear();
      for (const cb of cbs) cb(clock);
    },
    /** Avanza el reloj sin frames. */
    advance(ms: number) {
      clock += ms;
    },
  };
});

interface RenderCall {
  /** La escena del grafo (no un pase de postprocesado). */
  main: boolean;
  target: unknown;
  autoClear: boolean;
  toneMapping: number;
  uTime: number | undefined;
  /** Pose del grafo en ese frame: giro del grupo (yaw, pitch) e intensidad (uDim). */
  yaw: number;
  pitch: number;
  dim: number | undefined;
  /** Posición del grupo (sale de tx, ty, tz y shiftX). */
  pos: number[];
  at: number;
}
interface CompileCall {
  target: unknown;
  materials: string[];
  /** Atributos de la geometría de cada malla compilada (three los incluye en la clave del programa). */
  attributes: string[];
  /** Frames de la escena pintados con compositor antes de esta compilación. */
  composerFramesBefore: number;
}
interface FakeRenderer {
  clearColor: string;
  autoClear: boolean;
  toneMapping: number;
  pixelRatios: number[];
  renders: RenderCall[];
  compiles: CompileCall[];
  composerFrames: number;
  disposed: boolean;
}

const gpu = vi.hoisted(() => ({
  renderers: [] as FakeRenderer[],
  graphScene: null as Scene | null,
  /** Con hold, compileAsync no resuelve hasta release(): simula una compilación en paralelo que tarda. */
  hold: false,
  held: [] as (() => void)[],
  release() {
    for (const r of this.held.splice(0)) r();
  },
}));

vi.mock('three', async (importOriginal) => {
  const three = await importOriginal<typeof import('three')>();
  const uniformOf = (scene: Object3D, name: string) => {
    let t: number | undefined;
    scene.traverse((o) => {
      const u = ((o as { material?: ShaderMaterial }).material?.uniforms ?? {}) as Record<string, { value: unknown }>;
      if (t === undefined && typeof u[name]?.value === 'number') t = u[name].value as number;
    });
    return t;
  };
  class Renderer {
    clearColor = '';
    autoClear = true;
    toneMapping: number = three.NoToneMapping;
    outputColorSpace = three.SRGBColorSpace;
    shadowMap = { enabled: false, autoUpdate: true };
    capabilities = { maxVaryings: 16, logarithmicDepthBuffer: false, reversedDepthBuffer: false };
    pixelRatios: number[] = [];
    renders: RenderCall[] = [];
    compiles: CompileCall[] = [];
    composerFrames = 0;
    disposed = false;
    private pixelRatio = 1;
    private width = 0;
    private height = 0;
    private target: unknown = null;
    constructor() {
      gpu.renderers.push(this);
    }
    setClearColor(c: InstanceType<typeof three.Color>) {
      this.clearColor = `#${c.getHexString()}`;
    }
    getClearColor(c: InstanceType<typeof three.Color>) {
      return c.set(0, 0, 0);
    }
    getClearAlpha() {
      return 1;
    }
    setClearAlpha() {}
    clear() {}
    setPixelRatio(v: number) {
      this.pixelRatio = v;
      this.pixelRatios.push(v);
    }
    setSize(w: number, h: number) {
      this.width = w;
      this.height = h;
    }
    getSize(t: Vector2) {
      return t.set(this.width, this.height);
    }
    getDrawingBufferSize(t: Vector2) {
      return t.set(Math.floor(this.width * this.pixelRatio), Math.floor(this.height * this.pixelRatio));
    }
    getContext() {
      return { getContextAttributes: () => ({ alpha: false }) };
    }
    setRenderTarget(t: unknown) {
      this.target = t;
    }
    getRenderTarget() {
      return this.target;
    }
    compileAsync(scene: Object3D) {
      const materials: string[] = [];
      const attributes: string[] = [];
      scene.traverse((o) => {
        const m = (o as { material?: Material }).material;
        if (!m) return;
        materials.push(m.name || m.type);
        attributes.push(Object.keys((o as InstanceType<typeof three.Mesh>).geometry.attributes).sort().join('+'));
      });
      this.compiles.push({ target: this.target, materials, attributes, composerFramesBefore: this.composerFrames });
      return gpu.hold ? new Promise((r) => gpu.held.push(() => r(scene))) : Promise.resolve(scene);
    }
    render(scene: Scene) {
      const main = scene === gpu.graphScene;
      if (main && this.target !== null) this.composerFrames++;
      const group = main ? scene.children.find((o) => o.type === 'Group') : undefined;
      this.renders.push({
        main,
        target: this.target,
        autoClear: this.autoClear,
        toneMapping: this.toneMapping,
        uTime: main ? uniformOf(scene, 'uTime') : undefined,
        yaw: group?.rotation.y ?? Number.NaN,
        pitch: group?.rotation.x ?? Number.NaN,
        dim: main ? uniformOf(scene, 'uDim') : undefined,
        pos: group ? group.position.toArray() : [],
        at: performance.now(),
      });
    }
    dispose() {
      this.disposed = true;
    }
  }
  return { ...three, WebGLRenderer: Renderer };
});

const { bin } = buildArtifacts();
const graph = decodeGraph(bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength) as ArrayBuffer);
const PP_OFFSCREEN = ['LuminanceMaterial', 'DownsamplingMaterial', 'UpsamplingMaterial'];

/** Deja correr las promesas pendientes (import dinámico, compileAsync). */
const flush = async () => {
  for (let i = 0; i < 20; i++) await new Promise((r) => setTimeout(r, 0));
};

function create() {
  const events: SceneEvent[] = [];
  const canvas = new EventTarget();
  const scene = new GraphScene((e) => events.push(e));
  gpu.graphScene = (scene as unknown as { scene: Scene }).scene;
  return { scene, events, canvas };
}

async function mount(o: { tier?: Tier; dpr?: number; motion?: boolean } = {}) {
  const { scene, events, canvas } = create();
  await scene.init({ canvas: canvas as unknown as OffscreenCanvas, width: 960, height: 600, dpr: o.dpr ?? 1, tier: o.tier ?? 1, motion: o.motion ?? true, graph });
  const renderer = gpu.renderers[gpu.renderers.length - 1];
  return { scene, events, canvas, renderer };
}

let sample: MockInstance<QualityGovernor['sample']>;

beforeEach(() => {
  frames.reset();
  gpu.renderers.length = 0;
  gpu.hold = false;
  gpu.held.length = 0;
  vi.spyOn(performance, 'now').mockImplementation(frames.now);
  sample = vi.spyOn(QualityGovernor.prototype, 'sample');
});
afterEach(() => {
  vi.restoreAllMocks();
});

/** Frames de `frameMs` durante `ms`. Con `ping`, hay input cada segundo: si no, a los 8 s entra el reposo y el regulador no mide. */
function run(scene: GraphScene, ms: number, frameMs = 1000 / 60, ping = true) {
  let sincePing = 0;
  for (let t = 0; t < ms; t += frameMs) {
    frames.tick(frameMs);
    sincePing += frameMs;
    if (ping && sincePing >= 1000) {
      scene.setPointer(0, 0, false);
      sincePing = 0;
    }
  }
}

/** Frames (con input) hasta que el regulador pide un nivel. Vuelve justo tras ese frame, antes de las microtareas. */
function runUntilTierRequest(scene: GraphScene, frameMs: number, maxMs = 120_000): Tier {
  let sincePing = 0;
  for (let t = 0; t < maxMs; t += frameMs) {
    const seen = sample.mock.results.length;
    frames.tick(frameMs);
    const hit = sample.mock.results.slice(seen).find((r) => r.value !== null);
    if (hit) return hit.value as Tier;
    sincePing += frameMs;
    if (sincePing >= 1000) {
      scene.setPointer(0, 0, false);
      sincePing = 0;
    }
  }
  throw new Error('el regulador no pidió ningún nivel');
}

const SLOW = 28;
const FAST = 1000 / 60;
const lastMain = (r: FakeRenderer) => r.renders.filter((x) => x.main).at(-1)!;
const tiers = (events: SceneEvent[]) => events.filter((e) => e.type === 'tier').map((e) => (e as { tier: Tier }).tier);

describe('GraphScene sin GPU', () => {
  it('arranca: con bloom (T2) emite ready y pinta la escena en el búfer del compositor', async () => {
    const { events, renderer } = await mount({ tier: 2 });
    expect(events).toEqual([{ type: 'ready' }]);
    frames.tick();
    expect(lastMain(renderer).target).not.toBeNull();
    expect(renderer.toneMapping).toBe(NoToneMapping);
  });

  it('borra con el fondo de la paleta (--ink-0)', async () => {
    const { renderer } = await mount();
    expect(renderer.clearColor).toBe(BACKGROUND_COLOR);
  });

  it('con el movimiento en pausa, sigue pintando hasta que toda la pose llega (en Frentes se mueven tx y tz)', async () => {
    const { scene, renderer } = await mount({ motion: false });
    scene.setScroll(3);
    run(scene, 10_000, FAST, false);
    // Dentro de Frentes, del primer centroide al segundo: s cambia poco y ty casi nada; tx y tz, bastante.
    scene.setScroll(3.24);
    run(scene, 10_000, FAST, false);
    const last = lastMain(renderer);
    // En reposo ya no pinta.
    const n = renderer.renders.length;
    run(scene, 1000, FAST, false);
    expect(renderer.renders.length).toBe(n);
    // Un frame forzado muestra dónde había llegado la pose: el último frame pintado ya estaba ahí.
    scene.setPointer(0, 0, false);
    frames.tick();
    const settled = lastMain(renderer);
    expect(Math.hypot(...last.pos.map((v, i) => v - settled.pos[i]))).toBeLessThanOrEqual(2e-3);
    expect(Math.abs(last.yaw - settled.yaw)).toBeLessThanOrEqual(2e-3);
  });

  describe('autoClear (el EffectComposer lo apaga y su dispose no lo restaura)', () => {
    it('al bajar a un nivel sin bloom, el renderer vuelve a borrar', async () => {
      const { scene, events, renderer } = await mount({ tier: 2 });
      expect(renderer.autoClear).toBe(false);
      expect(runUntilTierRequest(scene, SLOW)).toBe(1);
      await flush();
      expect(tiers(events)).toEqual([1]);
      frames.tick();
      expect(lastMain(renderer)).toMatchObject({ target: null, autoClear: true, toneMapping: ACESFilmicToneMapping });
    });

    it('si el montaje del compositor falla, el renderer sigue borrando y usa el halo del shader', async () => {
      vi.spyOn(pp.EffectPass.prototype, 'initialize').mockImplementation(() => {
        throw new Error('EffectPass no disponible');
      });
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const composerDispose = vi.spyOn(pp.EffectComposer.prototype, 'dispose');
      const { events, renderer } = await mount({ tier: 2 });
      expect(warn).toHaveBeenCalledOnce();
      expect(composerDispose).toHaveBeenCalledOnce();
      expect(events).toEqual([{ type: 'ready' }]);
      frames.tick();
      expect(lastMain(renderer)).toMatchObject({ target: null, autoClear: true, toneMapping: ACESFilmicToneMapping });
    });
  });

  // Sin compositor (T1), cada fragmento llega con tone mapping y en sRGB: sumadas en aditivo, las aristas de un haz se
  // quemaban a blanco (la lemniscata de Contacto en móvil, medida en e2e/graph3d.spec.ts). EDGE_FRAG saca el color
  // premultiplicado por el alfa, así que la mezcla se elige con los factores (estado de GL, no del programa).
  describe('mezcla de las aristas', () => {
    const edgeMaterial = () => {
      let found: ShaderMaterial | undefined;
      gpu.graphScene!.traverse((o) => {
        const m = (o as { material?: ShaderMaterial }).material;
        if (m?.fragmentShader === S.EDGE_FRAG) found = m;
      });
      return found!;
    };
    const blend = (m: ShaderMaterial) => ({ blending: m.blending, equation: m.blendEquation, src: m.blendSrc, dst: m.blendDst });
    /** (ONE, ONE) con el color premultiplicado: la misma suma que la aditiva de three (SRC_ALPHA, ONE). */
    const ADDITIVE = { blending: CustomBlending, equation: AddEquation, src: OneFactor, dst: OneFactor };
    /** Pantalla: 1 − (1 − a)(1 − b). Satura suave y no pasa de 1. */
    const SCREEN = { blending: CustomBlending, equation: AddEquation, src: OneFactor, dst: OneMinusSrcColorFactor };

    it('con compositor (T2), suma aditiva en el búfer lineal (HDR, un solo tone mapping al final)', async () => {
      await mount({ tier: 2 });
      expect(blend(edgeMaterial())).toEqual(ADDITIVE);
    });

    it('sin compositor (T1), mezcla de pantalla', async () => {
      await mount({ tier: 1 });
      expect(blend(edgeMaterial())).toEqual(SCREEN);
    });

    it('al bajar de T2 a T1 pasa a pantalla sin recompilar el programa (la precompilación de la T7 sigue valiendo)', async () => {
      const { scene, events } = await mount({ tier: 2 });
      const m = edgeMaterial();
      const version = m.version;
      expect(runUntilTierRequest(scene, SLOW)).toBe(1);
      await flush();
      expect(tiers(events)).toEqual([1]);
      expect(blend(m)).toEqual(SCREEN);
      expect(m.version).toBe(version);
    });

    it('si el montaje del compositor falla, mezcla de pantalla', async () => {
      vi.spyOn(pp.EffectPass.prototype, 'initialize').mockImplementation(() => {
        throw new Error('EffectPass no disponible');
      });
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      await mount({ tier: 2 });
      expect(blend(edgeMaterial())).toEqual(SCREEN);
    });
  });

  // El fondo del canvas es la página detrás del póster (spec §3.1): sin tone mapping de three y, con compositor,
  // adelantado a la viñeta y al ACES del EffectPass (uPost = 1). Así el fundido póster → canvas solo cambia el grafo.
  describe('fondo', () => {
    const background = () => {
      let found: ShaderMaterial | undefined;
      gpu.graphScene!.traverse((o) => {
        const m = (o as { material?: ShaderMaterial }).material;
        if (m?.fragmentShader === S.BACKGROUND_FRAG) found = m;
      });
      return found!;
    };
    const post = () => background().uniforms.uPost.value as number;

    it('no pasa por el tone mapping de three (T1 lo aplicaría en el shader y hundía --ink-0 a negro)', async () => {
      await mount({ tier: 1 });
      expect(background().toneMapped).toBe(false);
      expect(post()).toBe(0);
    });

    it('con compositor (T2) se adelanta al EffectPass (uPost = 1), con la viñeta de background.ts', async () => {
      const { scene } = await mount({ tier: 2 });
      expect(post()).toBe(1);
      const composer = (scene as unknown as { composer: { passes: { effects?: unknown[] }[] } }).composer;
      const vignette = composer.passes.flatMap((p) => p.effects ?? []).find((e) => e instanceof pp.VignetteEffect) as pp.VignetteEffect;
      expect({ offset: vignette.offset, darkness: vignette.darkness }).toEqual(VIGNETTE);
    });

    it('al bajar de T2 a T1, o si el compositor falla, vuelve a uPost = 0', async () => {
      const { scene, events } = await mount({ tier: 2 });
      expect(runUntilTierRequest(scene, SLOW)).toBe(1);
      await flush();
      expect(tiers(events)).toEqual([1]);
      expect(post()).toBe(0);

      vi.spyOn(pp.EffectPass.prototype, 'initialize').mockImplementation(() => {
        throw new Error('EffectPass no disponible');
      });
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      await mount({ tier: 2 });
      expect(post()).toBe(0);
    });
  });

  it('focusNode con un índice que no es un entero en [0, nodeCount) lo trata como null: ni excepción ni NaN', async () => {
    const { scene } = await mount();
    const group = gpu.graphScene!.children.find((o) => o.type === 'Group') as Group;
    for (const bad of [-1, graph.nodeCount, graph.nodeCount + 5, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => scene.focusNode(bad), String(bad)).not.toThrow();
      run(scene, 300);
      expect(group.matrixWorld.elements.every(Number.isFinite), String(bad)).toBe(true);
    }
    // Un índice válido sí lleva la cámara al nodo (el más alejado del centro en la forma del hero); null la devuelve.
    const red = graph.layouts[LAYOUT_NAMES.indexOf('red')];
    let far = 0;
    for (let i = 1; i < graph.nodeCount; i++) if (Math.hypot(red[i * 3], red[i * 3 + 1], red[i * 3 + 2]) > Math.hypot(red[far * 3], red[far * 3 + 1], red[far * 3 + 2])) far = i;
    const before = group.position.clone();
    scene.focusNode(far);
    run(scene, 2000);
    expect(group.position.distanceTo(before)).toBeGreaterThan(1e-3);
    scene.focusNode(null);
    run(scene, 4000);
    expect(group.position.distanceTo(before)).toBeLessThan(1e-2);
  });

  describe('dispose', () => {
    it('retira los listeners de pérdida de contexto', async () => {
      const { scene, events, canvas } = await mount();
      scene.dispose();
      canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
      canvas.dispatchEvent(new Event('contextlost', { cancelable: true }));
      expect(events.filter((e) => e.type === 'error')).toEqual([]);
    });

    it('antes del dispose, una pérdida de contexto se anuncia como error', async () => {
      const { events, canvas } = await mount();
      const e = new Event('webglcontextlost', { cancelable: true });
      canvas.dispatchEvent(e);
      expect(e.defaultPrevented).toBe(true);
      expect(events.at(-1)).toEqual({ type: 'error', message: 'webgl-context-lost' });
    });

    it('deja ready = false y libera el compositor', async () => {
      const composerDispose = vi.spyOn(pp.EffectComposer.prototype, 'dispose');
      const { scene, renderer } = await mount({ tier: 2 });
      expect(scene.ready).toBe(true);
      scene.dispose();
      expect(scene.ready).toBe(false);
      expect(composerDispose).toHaveBeenCalledOnce();
      expect(renderer.disposed).toBe(true);
      expect((scene as unknown as { composer: unknown }).composer).toBeNull();
    });

    it('un cambio de nivel sin bloom que termina después del dispose no emite tier', async () => {
      const { scene, events } = await mount({ tier: 2 });
      expect(runUntilTierRequest(scene, SLOW)).toBe(1);
      scene.dispose();
      await flush();
      expect(tiers(events)).toEqual([]);
    });

    it('un cambio de nivel con bloom que termina después del dispose no emite tier ni deja compositor', async () => {
      const composerDispose = vi.spyOn(pp.EffectComposer.prototype, 'dispose');
      const { scene, events } = await mount({ tier: 2 });
      runUntilTierRequest(scene, SLOW);
      await flush();
      expect(tiers(events)).toEqual([1]);
      gpu.hold = true;
      expect(runUntilTierRequest(scene, FAST)).toBe(2);
      await flush(); // import de postprocessing resuelto; la precompilación sigue en curso
      scene.dispose();
      const disposedSoFar = composerDispose.mock.calls.length;
      gpu.release();
      await flush();
      expect(tiers(events)).toEqual([1]);
      // El compositor que se estaba montando se libera al terminar la espera.
      expect(composerDispose.mock.calls.length).toBe(disposedSoFar + 1);
      expect((scene as unknown as { composer: unknown }).composer).toBeNull();
    });

    it('después del dispose ningún mensaje lanza ni vuelve a pintar', async () => {
      const { scene, renderer } = await mount({ tier: 2 });
      scene.dispose();
      const rendersBefore = renderer.renders.length;
      const msgs: Exclude<MainToWorker, { type: 'init' }>[] = [
        { type: 'resize', width: 800, height: 500, dpr: 2 },
        { type: 'pointer', x: 0.1, y: 0.2, inside: true },
        { type: 'scroll', s: 2 },
        { type: 'motion', on: false },
        { type: 'focus', index: 3 },
        { type: 'focus', index: 99_999 },
        { type: 'visible', visible: false },
        { type: 'visible', visible: true },
        { type: 'dispose' },
      ];
      for (const m of msgs) expect(() => dispatch(scene, m), m.type).not.toThrow();
      run(scene, 500, FAST, false);
      expect(renderer.renders.length).toBe(rendersBefore);
      expect(frames.pending.size).toBe(0);
    });

    it('durante init: no pinta ni emite ready (regresión del fix 1 de la T3)', async () => {
      const { scene, events, canvas } = create();
      const pending = scene.init({ canvas: canvas as unknown as OffscreenCanvas, width: 960, height: 600, dpr: 1, tier: 2, motion: true, graph });
      scene.dispose();
      await pending;
      await flush();
      frames.tick();
      expect(events).toEqual([]);
      expect(scene.ready).toBe(false);
      expect(gpu.renderers[0].renders).toEqual([]);
      expect(frames.pending.size).toBe(0);
    });
  });

  describe('bucle', () => {
    it('setVisible(false) cancela el rAF y setVisible(true) lo reanuda', async () => {
      const { scene, renderer } = await mount();
      frames.tick();
      expect(frames.pending.size).toBe(1);
      scene.setVisible(false);
      expect(frames.pending.size).toBe(0);
      const n = renderer.renders.length;
      frames.tick();
      expect(renderer.renders.length).toBe(n);
      scene.setVisible(true);
      expect(frames.pending.size).toBe(1);
      scene.setVisible(true);
      expect(frames.pending.size).toBe(1);
      frames.tick();
      expect(renderer.renders.length).toBe(n + 1);
    });

    it('al reanudar tras un rato oculto, el reloj de la animación no salta', async () => {
      const { scene, renderer } = await mount();
      run(scene, 1000);
      const t0 = lastMain(renderer).uTime!;
      scene.setVisible(false);
      frames.advance(10_000);
      scene.setVisible(true);
      frames.tick();
      expect(lastMain(renderer).uTime! - t0).toBeLessThanOrEqual(0.05);
    });

    it('en reposo (30 fps tras 8 s sin input) el reloj de la animación va a tiempo real (regresión del fix 1 de la T3)', async () => {
      const { scene, renderer } = await mount();
      run(scene, 9000, FAST, false);
      const a = lastMain(renderer);
      run(scene, 3000, FAST, false);
      const b = lastMain(renderer);
      const ratio = (b.uTime! - a.uTime!) / ((b.at - a.at) / 1000);
      expect(ratio).toBeGreaterThan(0.97);
      expect(ratio).toBeLessThan(1.03);
    });
  });

  it('el DPR pedido vuelve al subir de nivel (regresión del fix 1 de la T3)', async () => {
    const { scene, renderer } = await mount({ tier: 2, dpr: 2 });
    expect(renderer.pixelRatios.at(-1)).toBe(1.5);
    runUntilTierRequest(scene, SLOW);
    await flush();
    expect(renderer.pixelRatios.at(-1)).toBe(1);
    expect(runUntilTierRequest(scene, FAST)).toBe(2);
    await flush();
    expect(renderer.pixelRatios.at(-1)).toBe(1.5);
  });

  describe('precompilación del postprocesado', () => {
    const ppCompiles = (r: FakeRenderer) => ({
      offscreen: r.compiles.filter((c) => PP_OFFSCREEN.every((m) => c.materials.includes(m))),
      onscreen: r.compiles.filter((c) => c.materials.includes('EffectMaterial')),
      sceneInBuffer: r.compiles.filter((c) => c.target !== null && c.materials.includes('ShaderMaterial')),
    });

    it('al montar el compositor en init: pases internos en búfer lineal, EffectPass en pantalla, antes del primer frame', async () => {
      const { renderer } = await mount({ tier: 2 });
      const c = ppCompiles(renderer);
      expect(c.offscreen).toHaveLength(1);
      expect(c.offscreen[0].target).not.toBeNull();
      expect(c.onscreen).toHaveLength(1);
      expect(c.onscreen[0].target).toBeNull();
      expect(c.sceneInBuffer).toHaveLength(1);
      for (const x of [...c.offscreen, ...c.onscreen, ...c.sceneInBuffer]) expect(x.composerFramesBefore).toBe(0);
      // Con la misma geometría que el triángulo de pantalla de postprocessing: si no, la clave del programa cambia.
      const ppScreen = Object.keys((pp.Pass as unknown as { fullscreenGeometry: { attributes: object } }).fullscreenGeometry.attributes).sort().join('+');
      for (const x of [...c.offscreen, ...c.onscreen]) expect(new Set(x.attributes)).toEqual(new Set([ppScreen]));
    });

    it('al subir de T1 a T2: precompila antes del primer frame con bloom y, mientras tanto, pinta sin compositor y borrando', async () => {
      const { scene, events, renderer } = await mount({ tier: 2 });
      runUntilTierRequest(scene, SLOW);
      await flush();
      const bloomFrames = renderer.composerFrames;
      gpu.hold = true;
      runUntilTierRequest(scene, FAST);
      await flush();
      const c = ppCompiles(renderer);
      expect(c.offscreen).toHaveLength(2);
      expect(c.onscreen).toHaveLength(2);
      expect(c.sceneInBuffer).toHaveLength(2);
      expect(c.onscreen[1].composerFramesBefore).toBe(bloomFrames);
      // Compilando: sigue el nivel sin bloom, con autoClear aunque el EffectComposer ya se haya construido.
      frames.tick();
      expect(lastMain(renderer)).toMatchObject({ target: null, autoClear: true, toneMapping: ACESFilmicToneMapping });
      expect(tiers(events)).toEqual([1]);
      gpu.release();
      await flush();
      expect(tiers(events)).toEqual([1, 2]);
      frames.tick();
      expect(renderer.composerFrames).toBe(bloomFrames + 1);
      expect(lastMain(renderer)).toMatchObject({ autoClear: false, toneMapping: NoToneMapping });
    });
  });

  it('un resize reinicia la espera del regulador; el reajuste interno al cambiar de nivel, no', async () => {
    const reset = vi.spyOn(QualityGovernor.prototype, 'resetBackoff');
    const { scene } = await mount({ tier: 2 });
    scene.resize(960, 600, 1);
    expect(reset).not.toHaveBeenCalled();
    scene.resize(800, 600, 1);
    expect(reset).toHaveBeenCalledTimes(1);
    scene.resize(800, 600, 2);
    expect(reset).toHaveBeenCalledTimes(2);
    runUntilTierRequest(scene, SLOW);
    await flush();
    expect(reset).toHaveBeenCalledTimes(2);
  });
});
