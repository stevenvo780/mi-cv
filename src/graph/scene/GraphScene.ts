import {
  ACESFilmicToneMapping,
  AddEquation,
  BufferAttribute,
  BufferGeometry,
  Color,
  CustomBlending,
  DataTexture,
  FloatType,
  Group,
  HalfFloatType,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Material,
  Matrix4,
  Mesh,
  NearestFilter,
  NoToneMapping,
  OneFactor,
  OneMinusSrcColorFactor,
  PerspectiveCamera,
  PlaneGeometry,
  RedFormat,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderer,
  type IUniform,
  type Object3D,
  type WebGLRenderTarget,
} from 'three';
import { CAMERA0 } from '../camera0';
import type { DecodedGraph } from '../codec';
import { LAYOUT_NAMES } from '../layout-names';
import { BACKGROUND_COLOR } from '../palette';
import type { SceneEvent } from '../runtime/protocol';
import { QualityGovernor, TIERS, type Tier } from '../runtime/quality';
import { frameAt, type FrameContext } from './choreography';
import { damp, POSE_KEYS, settling, type Damped } from './damping';
import { buildSceneData, clusterCentroids, helixSpan, type SceneData } from './data';
import { ribbonIndex, ribbonVertices } from './ribbon';
import * as S from './shaders';

export interface SceneInit {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  width: number;
  height: number;
  dpr: number;
  tier: Tier;
  motion: boolean;
  graph: DecodedGraph;
}

interface Composer {
  /** Donde el RenderPass pinta la escena (espacio lineal): es la variante de programa que hay que precompilar. */
  readonly inputBuffer: WebGLRenderTarget;
  render(deltaTime?: number): void;
  setSize(width: number, height: number): void;
  dispose(): void;
}

/** Materiales del postprocesado según dónde pintan: en sus búferes internos (lineales) o en pantalla. */
interface PostPrograms {
  offscreen: Material[];
  onscreen: Material[];
}

const EDGE_SEGMENTS = 20;
const HOVER_RADIUS_PX = 18;
const IDLE_MS = 8000;

const requestFrame: (cb: (t: number) => void) => number =
  typeof globalThis.requestAnimationFrame === 'function'
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number;
const cancelFrame: (id: number) => void =
  typeof globalThis.cancelAnimationFrame === 'function' ? globalThis.cancelAnimationFrame.bind(globalThis) : (id) => clearTimeout(id);

/** Un índice de nodo que no sea un entero en [0, count) no es ningún nodo. */
const nodeIndex = (index: number | null, count: number): number | null =>
  index !== null && Number.isInteger(index) && index >= 0 && index < count ? index : null;

/** Materiales que un pase guarda en sus propios campos (los de MipmapBlurPass no están en los tipos de postprocessing). */
const ownMaterials = (pass: object): Material[] => Object.values(pass).filter((v): v is Material => v instanceof Material);

export class GraphScene {
  ready = false;
  private renderer!: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(CAMERA0.fov, 1, 0.05, 60);
  private readonly group = new Group();
  private data!: SceneData;
  private ctx!: FrameContext;
  private composer: Composer | null = null;
  /** Cuenta los montajes del compositor: uno que termina cuando ya lo adelantó otro (o un dispose) se descarta. */
  private composerSeq = 0;
  private governor!: QualityGovernor;
  private tier: Tier = 2;
  private highlight!: DataTexture;
  private nodeGeometry!: InstancedBufferGeometry;
  private edgeGeometry!: InstancedBufferGeometry;
  private edgeMaterial!: ShaderMaterial;
  /** Canvas con los listeners de pérdida de contexto (se retiran en dispose). */
  private canvas: EventTarget | null = null;
  private readonly u = {
    uLayouts: { value: null as DataTexture | null },
    uHighlight: { value: null as DataTexture | null },
    uFrom: { value: 0 },
    uTo: { value: 1 },
    uMix: { value: 0 },
    uTime: { value: 0 },
    uDim: { value: 1 },
    uHoverActive: { value: 0 },
    uPixelRatio: { value: 1 },
    uViewportH: { value: 1 },
    uFocus: { value: CAMERA0.distance as number },
    uResolution: { value: new Vector2(1, 1) },
    uWidth: { value: 0.9 },
    uGlow: { value: 0 },
    uAspect: { value: new Vector2(1, 1) },
  };
  private width = 1;
  private height = 1;
  private dpr = 1;
  /** DPR que pidió el hilo principal, sin el tope del nivel: al volver a subir de nivel se recupera. */
  private requestedDpr = 1;
  private motion = true;
  private visible = true;
  private disposed = false;
  /** rAF pendiente del bucle; null con el bucle parado (antes de `ready`, con la escena oculta o liberada). */
  private rafId: number | null = null;
  private last = 0;
  private lastInput = 0;
  private frameCount = 0;
  private time = 0;
  private sTarget = 0;
  private readonly pointer = { x: 0, y: 0, inside: false };
  /** Magnitudes amortiguadas (scroll, pose de la cámara, resaltado y paralaje) y sus objetivos: ver damping.ts. */
  private readonly cur: Damped = { s: 0, distance: CAMERA0.distance, yaw: CAMERA0.yaw, pitch: CAMERA0.pitch, tx: 0, ty: 0, tz: 0, shiftX: 0, dim: 1, hoverActive: 0, parallaxX: 0, parallaxY: 0 };
  private readonly goal: Damped = { ...this.cur };
  private hovered = -1;
  private readonly lastEmit = { x: -1, y: -1 };
  private focused: number | null = null;
  private dirty = true;
  private readonly tmp = new Vector3();
  private readonly mvp = new Matrix4();

  private readonly onContextLost = (e: Event) => {
    e.preventDefault();
    this.emit({ type: 'error', message: 'webgl-context-lost' });
  };

  constructor(private readonly emit: (e: SceneEvent) => void) {}

  async init(o: SceneInit): Promise<void> {
    this.tier = o.tier;
    this.motion = o.motion;
    this.governor = new QualityGovernor(o.tier);
    this.renderer = new WebGLRenderer({ canvas: o.canvas, antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(new Color(BACKGROUND_COLOR), 1);
    this.canvas = o.canvas as EventTarget;
    this.canvas.addEventListener('webglcontextlost', this.onContextLost);
    this.canvas.addEventListener('contextlost', this.onContextLost);

    this.data = buildSceneData(o.graph, TIERS[o.tier].decor);
    this.ctx = { aspect: o.width / Math.max(o.height, 1), clusterCenters: clusterCentroids(this.data), helixSpan: helixSpan(this.data) };
    this.buildMeshes();
    this.scene.add(this.group);
    this.applySize(o.width, o.height, o.dpr);
    // Con bloom, setupComposer deja compilados (sin bloquear) los programas de la escena y del postprocesado.
    await this.setupComposer();
    // dispose() pudo llegar mientras init esperaba: no se pinta ni se anuncia `ready` sobre un renderer liberado.
    if (this.disposed) return;
    this.update(0, true);
    if (!this.composer) await this.precompile(null);
    if (this.disposed) return;
    this.ready = true;
    this.last = performance.now();
    this.lastInput = this.last;
    this.renderFrame(0);
    this.emit({ type: 'ready' });
    if (this.visible) this.rafId = requestFrame(this.loop);
  }

  /** Mensaje `resize` del hilo principal. Un tamaño o un DPR nuevos reinician la espera del regulador para subir. */
  resize(width: number, height: number, dpr: number): void {
    if (this.disposed) return;
    const changed = Math.max(1, Math.round(width)) !== this.width || Math.max(1, Math.round(height)) !== this.height || dpr !== this.requestedDpr;
    if (changed) this.governor.resetBackoff();
    this.applySize(width, height, dpr);
  }

  setPointer(x: number, y: number, inside: boolean): void {
    if (this.disposed) return;
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.inside = inside;
    this.lastInput = performance.now();
    this.dirty = true;
  }

  setScroll(s: number): void {
    if (this.disposed) return;
    this.sTarget = s;
    this.lastInput = performance.now();
    this.dirty = true;
  }

  setMotion(on: boolean): void {
    if (this.disposed) return;
    this.motion = on;
    this.dirty = true;
  }

  /** Un índice que no sea un entero en [0, nodeCount) se trata como null (con -1 la cámara iría a NaN). */
  focusNode(index: number | null): void {
    if (this.disposed) return;
    this.focused = nodeIndex(index, this.data.nodeCount);
    this.applyHighlight(this.focused ?? this.hovered);
    this.lastInput = performance.now();
    this.dirty = true;
  }

  /** Oculta, el bucle no pide frames. Al volver, el primer dt se mide desde ahora: el reloj de la animación no salta. */
  setVisible(visible: boolean): void {
    if (this.disposed) return;
    this.visible = visible;
    if (!visible) {
      this.stopLoop();
      return;
    }
    if (this.ready && this.rafId === null) {
      this.last = performance.now();
      this.rafId = requestFrame(this.loop);
    }
  }

  /** Libera todo. Después, los mensajes se ignoran y un init o un cambio de nivel a medias ya no pinta ni emite. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.ready = false;
    this.stopLoop();
    this.canvas?.removeEventListener('webglcontextlost', this.onContextLost);
    this.canvas?.removeEventListener('contextlost', this.onContextLost);
    this.canvas = null;
    this.composer?.dispose();
    this.composer = null;
    this.scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
        (obj.material as ShaderMaterial).dispose();
      }
    });
    this.u.uLayouts.value?.dispose();
    this.highlight?.dispose();
    this.renderer?.dispose();
  }

  private stopLoop(): void {
    if (this.rafId !== null) cancelFrame(this.rafId);
    this.rafId = null;
  }

  private applySize(width: number, height: number, dpr: number): void {
    this.width = Math.max(1, Math.round(width));
    this.height = Math.max(1, Math.round(height));
    this.requestedDpr = dpr;
    this.dpr = Math.min(dpr, TIERS[this.tier].maxDpr);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(this.width, this.height, false);
    this.composer?.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    if (this.ctx) this.ctx.aspect = this.camera.aspect;
    const bw = this.width * this.dpr;
    const bh = this.height * this.dpr;
    this.u.uResolution.value.set(bw, bh);
    this.u.uViewportH.value = bh;
    this.u.uPixelRatio.value = this.dpr;
    this.u.uWidth.value = 0.85 * this.dpr;
    this.u.uAspect.value.set(this.camera.aspect, 1);
    this.dirty = true;
  }

  private buildMeshes(): void {
    const d = this.data;
    const layouts = new DataTexture(d.layoutTexture, d.nodeCount, d.layoutCount, RGBAFormat, FloatType);
    layouts.minFilter = NearestFilter;
    layouts.magFilter = NearestFilter;
    layouts.needsUpdate = true;
    this.u.uLayouts.value = layouts;
    this.highlight = new DataTexture(new Uint8Array(d.nodeCount), d.nodeCount, 1, RedFormat, UnsignedByteType);
    this.highlight.minFilter = NearestFilter;
    this.highlight.magFilter = NearestFilter;
    this.highlight.unpackAlignment = 1;
    this.highlight.needsUpdate = true;
    this.u.uHighlight.value = this.highlight;

    const pick = (...names: (keyof typeof this.u)[]) => Object.fromEntries(names.map((n) => [n, this.u[n] as IUniform])) as Record<string, IUniform>;
    // uFocus: plano de foco (bokeh de los nodos) y origen de la niebla, que aplican las tres capas.
    const shared = ['uLayouts', 'uHighlight', 'uFrom', 'uTo', 'uMix', 'uTime', 'uFocus'] as const;

    const background = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({ vertexShader: S.BACKGROUND_VERT, fragmentShader: S.BACKGROUND_FRAG, uniforms: pick('uAspect', 'uDim'), depthTest: false, depthWrite: false }),
    );
    background.frustumCulled = false;
    background.renderOrder = -10;
    this.scene.add(background);

    // Aristas: cinta de EDGE_SEGMENTS tramos instanciada por arista, con el índice antihorario de ribbon.ts.
    const ribbon = ribbonVertices(EDGE_SEGMENTS);
    const edges = new InstancedBufferGeometry();
    edges.setIndex(ribbonIndex(EDGE_SEGMENTS));
    edges.setAttribute('position', new BufferAttribute(new Float32Array(ribbon.t.length * 3), 3));
    edges.setAttribute('aT', new BufferAttribute(ribbon.t, 1));
    edges.setAttribute('aSide', new BufferAttribute(ribbon.side, 1));
    const e = d.edges;
    const inst = (arr: Float32Array, size: number) => new InstancedBufferAttribute(arr, size);
    edges.setAttribute('aA', inst(e.a, 1));
    edges.setAttribute('aB', inst(e.b, 1));
    edges.setAttribute('aOffA', inst(e.offA, 3));
    edges.setAttribute('aOffB', inst(e.offB, 3));
    edges.setAttribute('aColA', inst(e.colA, 3));
    edges.setAttribute('aColB', inst(e.colB, 3));
    edges.setAttribute('aSeed', inst(e.seed, 1));
    edges.setAttribute('aWeight', inst(e.weight, 1));
    edges.setAttribute('aSemantic', inst(e.semantic, 1));
    edges.instanceCount = e.count;
    this.edgeGeometry = edges;
    // EDGE_FRAG saca el color premultiplicado por el alfa: la mezcla la eligen los factores, según haya compositor o no
    // (useComposer). Es estado de GL, no del programa: cambiar de nivel no recompila las aristas.
    this.edgeMaterial = new ShaderMaterial({
      vertexShader: S.EDGE_VERT,
      fragmentShader: S.EDGE_FRAG,
      uniforms: pick(...shared, 'uResolution', 'uWidth', 'uDim', 'uHoverActive'),
      transparent: true,
      depthWrite: false,
      blending: CustomBlending,
      blendEquation: AddEquation,
      blendSrc: OneFactor,
      blendDst: OneFactor,
    });
    const edgeMesh = new Mesh(edges, this.edgeMaterial);
    edgeMesh.frustumCulled = false;
    edgeMesh.renderOrder = 1;
    this.group.add(edgeMesh);

    // Hubs de cristal: icosaedro con normales planas (detalle 0).
    const ico = new IcosahedronGeometry(1, 0);
    const hubs = new InstancedBufferGeometry();
    hubs.setAttribute('position', ico.getAttribute('position'));
    hubs.setAttribute('normal', ico.getAttribute('normal'));
    hubs.setAttribute('aRef', inst(d.hubs.ref, 1));
    hubs.setAttribute('aColor', inst(d.hubs.color, 3));
    hubs.setAttribute('aScale', inst(d.hubs.scale, 1));
    hubs.instanceCount = d.hubs.count;
    const hubMesh = new Mesh(hubs, new ShaderMaterial({ vertexShader: S.HUB_VERT, fragmentShader: S.HUB_FRAG, uniforms: pick(...shared, 'uDim') }));
    hubMesh.frustumCulled = false;
    hubMesh.renderOrder = 2;
    this.group.add(hubMesh);

    // Nodos: quad instanciado con impostor de esfera SDF.
    const plane = new PlaneGeometry(1, 1);
    const nodes = new InstancedBufferGeometry();
    nodes.setIndex(plane.getIndex());
    nodes.setAttribute('position', plane.getAttribute('position'));
    nodes.setAttribute('uv', plane.getAttribute('uv'));
    const n = d.nodes;
    nodes.setAttribute('aRef', inst(n.ref, 1));
    nodes.setAttribute('aOffset', inst(n.offset, 3));
    nodes.setAttribute('aColor', inst(n.color, 3));
    nodes.setAttribute('aSize', inst(n.size, 1));
    nodes.setAttribute('aSeed', inst(n.seed, 1));
    nodes.setAttribute('aSemantic', inst(n.semantic, 1));
    nodes.instanceCount = n.count;
    this.nodeGeometry = nodes;
    const nodeMesh = new Mesh(
      nodes,
      new ShaderMaterial({
        vertexShader: S.NODE_VERT,
        fragmentShader: S.NODE_FRAG,
        uniforms: pick(...shared, 'uPixelRatio', 'uViewportH', 'uDim', 'uHoverActive', 'uGlow'),
        transparent: true,
        depthWrite: false,
      }),
    );
    nodeMesh.frustumCulled = false;
    nodeMesh.renderOrder = 3;
    this.group.add(nodeMesh);
  }

  /**
   * Bloom real (postprocessing, carga diferida) solo en los niveles que lo permiten; si no, halo en el shader.
   * Un compositor nuevo no se activa hasta tener compilados sus programas y los de la escena en su variante (búfer
   * lineal): así el primer frame con bloom no compila en síncrono. Mientras, se sigue pintando como antes.
   */
  private async setupComposer(): Promise<void> {
    const seq = ++this.composerSeq;
    const current = () => !this.disposed && seq === this.composerSeq;
    if (!TIERS[this.tier].bloom) {
      this.useComposer(null);
      return;
    }
    let next: Composer | null = null;
    try {
      // Destructurado en la propia sentencia del import(): así webpack recorta postprocessing a lo que se usa. Con
      // `const pp = await import(...)` y `pp.X` lo metía entero (112.8 KB gz frente a 16.6 KB), y el worker con sus
      // chunks se pasaba del presupuesto del 3D (≤ 175 KB gz, spec §5).
      const { BlendFunction, BloomEffect, EffectComposer, EffectPass, NoiseEffect, RenderPass, ToneMappingEffect, ToneMappingMode, VignetteEffect } =
        await import('postprocessing');
      if (!current()) return;
      const composer = new EffectComposer(this.renderer, { frameBufferType: HalfFloatType });
      next = composer;
      // El constructor pone autoClear = false; hasta que se active, el renderer sigue pintando directo a pantalla.
      this.renderer.autoClear = this.composer === null;
      composer.addPass(new RenderPass(this.scene, this.camera));
      const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.85, luminanceSmoothing: 0.25, intensity: 1.35, radius: 0.72 });
      const vignette = new VignetteEffect({ offset: 0.28, darkness: 0.62 });
      const noise = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: true });
      noise.blendMode.opacity.value = 0.05;
      const tone = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
      const effects = new EffectPass(this.camera, bloom, vignette, noise, tone);
      composer.addPass(effects);
      composer.setSize(this.width, this.height);
      // Los 4 programas del postprocesado: luminancia y desenfoque mipmap del bloom (búferes internos) y el EffectPass
      // que junta los efectos (a pantalla). KawaseBlurPass y CopyPass no se usan con mipmapBlur ni sin stencil.
      await this.precompile(composer, {
        offscreen: [bloom.luminancePass.fullscreenMaterial, ...ownMaterials(bloom.mipmapBlurPass)],
        onscreen: [effects.fullscreenMaterial],
      });
      if (!current()) {
        composer.dispose();
        return;
      }
      this.useComposer(composer);
    } catch (err) {
      next?.dispose();
      console.warn('[grafo] postprocesado no disponible, uso halo en shader', err);
      if (current()) this.useComposer(null);
    }
  }

  /** Activa (o quita) el compositor y deja el renderer como lo necesita cada camino. */
  private useComposer(composer: Composer | null): void {
    if (this.composer !== composer) this.composer?.dispose();
    this.composer = composer;
    // EffectComposer pone autoClear = false y su dispose() no lo restaura: sin compositor, el renderer vuelve a borrar.
    this.renderer.autoClear = composer === null;
    this.renderer.toneMapping = composer ? NoToneMapping : ACESFilmicToneMapping;
    this.u.uGlow.value = composer ? 0 : 1;
    // Aristas. Con compositor, suma aditiva (ONE, ONE) en el búfer lineal: HDR y un solo tone mapping al final. Sin él,
    // cada fragmento llega ya con tone mapping y en sRGB, y en aditivo un haz de aristas superpuestas se quemaba a
    // blanco (la lemniscata de Contacto en móvil, T1). Ahí la mezcla es de pantalla, 1 − (1 − a)(1 − b): una arista
    // sola pinta igual y el haz satura suave, sin pasar de 1 (medido en e2e/graph3d.spec.ts, spec §3.3).
    this.edgeMaterial.blendDst = composer ? OneFactor : OneMinusSrcColorFactor;
    // El tamaño pudo cambiar mientras se compilaba.
    composer?.setSize(this.width, this.height);
  }

  /**
   * Compila sin bloquear (compileAsync) los programas que usará el siguiente frame. three elige la variante de cada
   * programa según el render target activo al llamar a compile(), que lo lee en síncrono: con compositor, la escena y
   * los pases internos pintan en búferes lineales (vale cualquiera; se usa inputBuffer) y el EffectPass, en pantalla.
   */
  private precompile(composer: Composer | null, post: PostPrograms = { offscreen: [], onscreen: [] }): Promise<unknown> {
    const r = this.renderer;
    const jobs: Promise<unknown>[] = [];
    const compile = (root: Object3D) => jobs.push(r.compileAsync(root, this.camera));
    // El triángulo de pantalla de postprocessing (position y uv): la clave del programa depende de qué atributos
    // tiene la geometría (sin position, three compila otra variante y el primer frame vuelve a compilar).
    const screen = new BufferGeometry();
    screen.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    screen.setAttribute('uv', new BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
    const sceneOf = (materials: Material[]) => {
      const s = new Scene();
      for (const m of materials) s.add(new Mesh(screen, m));
      return s;
    };
    r.setRenderTarget(composer?.inputBuffer ?? null);
    compile(this.scene);
    if (post.offscreen.length > 0) compile(sceneOf(post.offscreen));
    r.setRenderTarget(null);
    if (post.onscreen.length > 0) compile(sceneOf(post.onscreen));
    return Promise.all(jobs);
  }

  private async changeTier(tier: Tier): Promise<void> {
    const hadBloom = TIERS[this.tier].bloom;
    this.tier = tier;
    const decor = Math.min(TIERS[tier].decor, this.data.decorCount);
    this.nodeGeometry.instanceCount = this.data.nodeCount + decor;
    this.edgeGeometry.instanceCount = this.data.edges.count - this.data.decorEdgePrefix[this.data.decorCount] + this.data.decorEdgePrefix[decor];
    this.applySize(this.width, this.height, this.requestedDpr);
    if (hadBloom !== TIERS[tier].bloom) await this.setupComposer();
    // dispose() o un cambio de nivel posterior pudieron llegar durante la espera: este ya no se anuncia.
    if (this.disposed || this.tier !== tier) return;
    this.emit({ type: 'tier', tier });
  }

  private readonly loop = (now: number): void => {
    this.rafId = null;
    if (this.disposed || !this.visible) return;
    this.rafId = requestFrame(this.loop);
    const idle = now - this.lastInput > IDLE_MS;
    this.frameCount++;
    // 30 fps en reposo: el frame saltado no mueve `last`, así el dt del siguiente abarca los dos y el reloj no va a media velocidad.
    if (idle && this.frameCount % 2 === 1) return;
    const interval = Math.max(now - this.last, 0);
    const dt = Math.min(interval / 1000, 0.05);
    this.last = now;
    const start = performance.now();
    const settling = this.update(dt);
    if (!this.motion && !this.dirty && !settling) return;
    this.renderFrame(dt);
    this.dirty = false;
    if (this.motion && !idle) {
      // Coste del frame (update + envío del render) e intervalo entre frames: el intervalo nunca baja del refresco
      // de la pantalla (16.7 ms a 60 Hz), así que con él solo no se podría subir de nivel (ver QualityGovernor).
      const next = this.governor.sample(performance.now() - start, now, interval);
      if (next !== null) void this.changeTier(next);
    }
  };

  private renderFrame(dt: number): void {
    if (this.composer) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
  }

  /** Posición de un nodo semántico en la forma actual (sin la respiración del shader), escrita en `out`. */
  private nodeLayoutPos(i: number, out: Vector3): Vector3 {
    const a = this.data.layouts[this.u.uFrom.value];
    const b = this.data.layouts[this.u.uTo.value];
    const m = this.u.uMix.value;
    const k = i * 3;
    return out.set(a[k] + (b[k] - a[k]) * m, a[k + 1] + (b[k + 1] - a[k + 1]) * m, a[k + 2] + (b[k + 2] - a[k + 2]) * m);
  }

  /**
   * Avanza el estado; devuelve true mientras alguna magnitud amortiguada no haya llegado a su objetivo.
   * `snap` (solo en init) coloca la cámara en su pose sin amortiguar.
   */
  private update(dt: number, snap = false): boolean {
    if (this.motion) this.time += dt;
    this.u.uTime.value = this.time;
    const c = this.cur;
    const g = this.goal;
    g.s = this.sTarget;
    c.s = damp(c.s, g.s, 4, dt);
    const frame = frameAt(c.s, this.ctx);
    this.u.uFrom.value = LAYOUT_NAMES.indexOf(frame.from);
    this.u.uTo.value = LAYOUT_NAMES.indexOf(frame.to);
    this.u.uMix.value = frame.mix;

    const pose = frame.pose;
    g.distance = pose.distance;
    g.tx = pose.target[0];
    g.ty = pose.target[1];
    g.tz = pose.target[2];
    if (this.focused !== null) {
      const f = this.nodeLayoutPos(this.focused, this.tmp);
      g.tx = f.x;
      g.ty = f.y;
      g.tz = f.z;
      g.distance = Math.max(pose.distance * 0.72, 2.2);
    }
    g.yaw = pose.yaw;
    g.pitch = pose.pitch;
    g.shiftX = pose.shiftX;
    g.dim = pose.dim;
    for (const k of POSE_KEYS) c[k] = snap ? g[k] : damp(c[k], g[k], 5, dt);

    g.parallaxX = this.pointer.inside ? this.pointer.x : 0;
    g.parallaxY = this.pointer.inside ? this.pointer.y : 0;
    c.parallaxX = damp(c.parallaxX, g.parallaxX, 3, dt);
    c.parallaxY = damp(c.parallaxY, g.parallaxY, 3, dt);
    const drift = this.time * 0.035;
    this.group.rotation.set(c.pitch + c.parallaxY * 0.08, c.yaw + drift + c.parallaxX * 0.14, 0, 'XYZ');
    this.tmp.set(c.tx, c.ty, c.tz).applyEuler(this.group.rotation);
    this.group.position.set(c.shiftX - this.tmp.x, -this.tmp.y, -this.tmp.z);
    this.group.updateMatrixWorld();
    this.camera.position.set(0, 0, c.distance);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateMatrixWorld();
    this.u.uFocus.value = c.distance;
    this.u.uDim.value = c.dim;

    g.hoverActive = this.hovered >= 0 || this.focused !== null ? 1 : 0;
    c.hoverActive = damp(c.hoverActive, g.hoverActive, 6, dt);
    this.u.uHoverActive.value = c.hoverActive;
    if (this.pointer.inside || this.hovered >= 0) this.pick();

    return settling(c, g);
  }

  /** Hover por proyección en CPU de los nodos semánticos (~200): sin lectura de GPU ni reservas por nodo. */
  private pick(): void {
    if (!this.pointer.inside) {
      this.setHovered(-1, 0, 0);
      return;
    }
    const px = ((this.pointer.x + 1) / 2) * this.width;
    const py = ((1 - this.pointer.y) / 2) * this.height;
    this.mvp.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse).multiply(this.group.matrixWorld);
    let best = -1;
    let bestD = Infinity;
    let bx = 0;
    let by = 0;
    for (let i = 0; i < this.data.nodeCount; i++) {
      const p = this.nodeLayoutPos(i, this.tmp).applyMatrix4(this.mvp);
      if (p.z > 1) continue;
      const sx = ((p.x + 1) / 2) * this.width;
      const sy = ((1 - p.y) / 2) * this.height;
      const dist = Math.hypot(sx - px, sy - py);
      if (dist < HOVER_RADIUS_PX + this.data.nodes.size[i] * 0.5 && dist < bestD) {
        best = i;
        bestD = dist;
        bx = sx;
        by = sy;
      }
    }
    this.setHovered(best, bx, by);
  }

  private setHovered(index: number, x: number, y: number): void {
    if (index === this.hovered) {
      if (index >= 0 && Math.hypot(x - this.lastEmit.x, y - this.lastEmit.y) > 1.5) {
        this.lastEmit.x = x;
        this.lastEmit.y = y;
        this.emit({ type: 'hover', index, x, y });
      }
      return;
    }
    this.hovered = index;
    if (this.focused === null) this.applyHighlight(index);
    this.lastEmit.x = x;
    this.lastEmit.y = y;
    this.emit(index >= 0 ? { type: 'hover', index, x, y } : { type: 'hover-end' });
  }

  /** 255 = nodo activo, 153 = vecinos, 0 = resto. */
  private applyHighlight(index: number): void {
    const buf = this.highlight.image.data as Uint8Array;
    buf.fill(0);
    if (index >= 0) {
      buf[index] = 255;
      for (const j of this.data.adjacency[index]) buf[j] = Math.max(buf[j], 153);
    }
    this.highlight.needsUpdate = true;
    this.dirty = true;
  }
}
