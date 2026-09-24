import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  Color,
  DataTexture,
  FloatType,
  Group,
  HalfFloatType,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Matrix4,
  Mesh,
  NearestFilter,
  NoToneMapping,
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
  type WebGLRenderTarget,
} from 'three';
import { CAMERA0 } from '../camera0';
import type { DecodedGraph } from '../codec';
import { LAYOUT_NAMES } from '../layout-names';
import type { SceneEvent } from '../runtime/protocol';
import { QualityGovernor, TIERS, type Tier } from '../runtime/quality';
import { frameAt, type FrameContext } from './choreography';
import { buildSceneData, clusterCentroids, helixSpan, type SceneData } from './data';
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

const EDGE_SEGMENTS = 20;
const HOVER_RADIUS_PX = 18;
const IDLE_MS = 8000;

const requestFrame: (cb: (t: number) => void) => number =
  typeof globalThis.requestAnimationFrame === 'function'
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number;
const cancelFrame: (id: number) => void =
  typeof globalThis.cancelAnimationFrame === 'function' ? globalThis.cancelAnimationFrame.bind(globalThis) : (id) => clearTimeout(id);

const damp = (current: number, target: number, lambda: number, dt: number) => current + (target - current) * (1 - Math.exp(-lambda * dt));

export class GraphScene {
  ready = false;
  private renderer!: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(CAMERA0.fov, 1, 0.05, 60);
  private readonly group = new Group();
  private data!: SceneData;
  private ctx!: FrameContext;
  private composer: Composer | null = null;
  private governor!: QualityGovernor;
  private tier: Tier = 2;
  private highlight!: DataTexture;
  private nodeGeometry!: InstancedBufferGeometry;
  private edgeGeometry!: InstancedBufferGeometry;
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
  private rafId = 0;
  private last = 0;
  private lastInput = 0;
  private frameCount = 0;
  private time = 0;
  private s = 0;
  private sTarget = 0;
  private readonly pointer = { x: 0, y: 0, inside: false };
  private readonly parallax = { x: 0, y: 0 };
  private readonly pose = { distance: CAMERA0.distance as number, yaw: CAMERA0.yaw as number, pitch: CAMERA0.pitch as number, tx: 0, ty: 0, tz: 0, shiftX: 0, dim: 1 };
  private hovered = -1;
  private lastEmit = { x: -1, y: -1 };
  private focused: number | null = null;
  private hoverActive = 0;
  private dirty = true;
  private readonly tmp = new Vector3();
  private readonly mvp = new Matrix4();

  constructor(private readonly emit: (e: SceneEvent) => void) {}

  async init(o: SceneInit): Promise<void> {
    this.tier = o.tier;
    this.motion = o.motion;
    this.governor = new QualityGovernor(o.tier);
    this.renderer = new WebGLRenderer({ canvas: o.canvas, antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(new Color(0x05090b), 1);
    const onLost = (e: Event) => {
      e.preventDefault();
      this.emit({ type: 'error', message: 'webgl-context-lost' });
    };
    (o.canvas as EventTarget).addEventListener('webglcontextlost', onLost);
    (o.canvas as EventTarget).addEventListener('contextlost', onLost);

    this.data = buildSceneData(o.graph, TIERS[o.tier].decor);
    this.ctx = { aspect: o.width / Math.max(o.height, 1), clusterCenters: clusterCentroids(this.data), helixSpan: helixSpan(this.data) };
    this.buildMeshes();
    this.scene.add(this.group);
    this.resize(o.width, o.height, o.dpr);
    await this.setupComposer();
    // dispose() pudo llegar mientras init esperaba: no se pinta ni se anuncia `ready` sobre un renderer liberado.
    if (this.disposed) return;
    this.update(0);
    // Con bloom la escena se pinta en el búfer del compositor (espacio lineal), no en pantalla (sRGB): se precompila
    // esa variante de los programas, que es la que se usa. compile() lee el render target activo de forma síncrona.
    this.renderer.setRenderTarget(this.composer?.inputBuffer ?? null);
    const compiled = this.renderer.compileAsync(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    await compiled;
    if (this.disposed) return;
    this.ready = true;
    this.last = performance.now();
    this.lastInput = this.last;
    this.renderFrame(0);
    this.emit({ type: 'ready' });
    this.rafId = requestFrame(this.loop);
  }

  resize(width: number, height: number, dpr: number): void {
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

  setPointer(x: number, y: number, inside: boolean): void {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.inside = inside;
    this.lastInput = performance.now();
    this.dirty = true;
  }

  setScroll(s: number): void {
    this.sTarget = s;
    this.lastInput = performance.now();
    this.dirty = true;
  }

  setMotion(on: boolean): void {
    this.motion = on;
    this.dirty = true;
  }

  focusNode(index: number | null): void {
    this.focused = index;
    this.applyHighlight(index ?? this.hovered);
    this.lastInput = performance.now();
    this.dirty = true;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (visible) this.last = performance.now();
  }

  dispose(): void {
    this.disposed = true;
    cancelFrame(this.rafId);
    this.composer?.dispose();
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

    // Aristas: cinta de EDGE_SEGMENTS tramos instanciada por arista.
    const verts = (EDGE_SEGMENTS + 1) * 2;
    const aT = new Float32Array(verts);
    const aSide = new Float32Array(verts);
    for (let i = 0; i <= EDGE_SEGMENTS; i++) {
      aT[i * 2] = aT[i * 2 + 1] = i / EDGE_SEGMENTS;
      aSide[i * 2] = -1;
      aSide[i * 2 + 1] = 1;
    }
    // Orden antihorario en pantalla: el shader extruye aSide = +1 hacia la normal (tangente girada 90° a la
    // izquierda). Con el orden inverso todos los triángulos quedan de espaldas y FrontSide los descarta.
    const index: number[] = [];
    for (let i = 0; i < EDGE_SEGMENTS; i++) {
      const a = i * 2;
      index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    const edges = new InstancedBufferGeometry();
    edges.setIndex(index);
    edges.setAttribute('position', new BufferAttribute(new Float32Array(verts * 3), 3));
    edges.setAttribute('aT', new BufferAttribute(aT, 1));
    edges.setAttribute('aSide', new BufferAttribute(aSide, 1));
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
    const edgeMesh = new Mesh(
      edges,
      new ShaderMaterial({
        vertexShader: S.EDGE_VERT,
        fragmentShader: S.EDGE_FRAG,
        uniforms: pick(...shared, 'uResolution', 'uWidth', 'uDim', 'uHoverActive'),
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    );
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

  /** Bloom real (postprocessing, carga diferida) solo en los niveles que lo permiten; si no, halo en el shader. */
  private async setupComposer(): Promise<void> {
    this.composer?.dispose();
    this.composer = null;
    if (!TIERS[this.tier].bloom) {
      this.renderer.toneMapping = ACESFilmicToneMapping;
      this.u.uGlow.value = 1;
      return;
    }
    try {
      const pp = await import('postprocessing');
      if (this.disposed) return;
      const composer = new pp.EffectComposer(this.renderer, { frameBufferType: HalfFloatType });
      composer.addPass(new pp.RenderPass(this.scene, this.camera));
      const bloom = new pp.BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.85, luminanceSmoothing: 0.25, intensity: 1.35, radius: 0.72 });
      const vignette = new pp.VignetteEffect({ offset: 0.28, darkness: 0.62 });
      const noise = new pp.NoiseEffect({ blendFunction: pp.BlendFunction.OVERLAY, premultiply: true });
      noise.blendMode.opacity.value = 0.05;
      const tone = new pp.ToneMappingEffect({ mode: pp.ToneMappingMode.ACES_FILMIC });
      composer.addPass(new pp.EffectPass(this.camera, bloom, vignette, noise, tone));
      composer.setSize(this.width, this.height);
      this.renderer.toneMapping = NoToneMapping;
      this.u.uGlow.value = 0;
      this.composer = composer;
    } catch (err) {
      console.warn('[grafo] postprocesado no disponible, uso halo en shader', err);
      this.renderer.toneMapping = ACESFilmicToneMapping;
      this.u.uGlow.value = 1;
    }
  }

  private async changeTier(tier: Tier): Promise<void> {
    const hadBloom = TIERS[this.tier].bloom;
    this.tier = tier;
    const decor = Math.min(TIERS[tier].decor, this.data.decorCount);
    this.nodeGeometry.instanceCount = this.data.nodeCount + decor;
    this.edgeGeometry.instanceCount = this.data.edges.count - this.data.decorEdgePrefix[this.data.decorCount] + this.data.decorEdgePrefix[decor];
    this.resize(this.width, this.height, this.requestedDpr);
    if (hadBloom !== TIERS[tier].bloom) await this.setupComposer();
    this.emit({ type: 'tier', tier });
  }

  private readonly loop = (now: number): void => {
    if (this.disposed) return;
    this.rafId = requestFrame(this.loop);
    if (!this.visible) {
      this.last = now;
      return;
    }
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

  private nodeLayoutPos(i: number): [number, number, number] {
    const a = this.data.layouts[this.u.uFrom.value];
    const b = this.data.layouts[this.u.uTo.value];
    const m = this.u.uMix.value;
    return [a[i * 3] + (b[i * 3] - a[i * 3]) * m, a[i * 3 + 1] + (b[i * 3 + 1] - a[i * 3 + 1]) * m, a[i * 3 + 2] + (b[i * 3 + 2] - a[i * 3 + 2]) * m];
  }

  /** Avanza el estado; devuelve true mientras las magnitudes amortiguadas no hayan convergido. */
  private update(dt: number): boolean {
    if (this.motion) this.time += dt;
    this.u.uTime.value = this.time;
    this.s = damp(this.s, this.sTarget, 4, dt);
    const frame = frameAt(this.s, this.ctx);
    this.u.uFrom.value = LAYOUT_NAMES.indexOf(frame.from);
    this.u.uTo.value = LAYOUT_NAMES.indexOf(frame.to);
    this.u.uMix.value = frame.mix;

    let { distance } = frame.pose;
    let [tx, ty, tz] = frame.pose.target;
    if (this.focused !== null) {
      [tx, ty, tz] = this.nodeLayoutPos(this.focused);
      distance = Math.max(distance * 0.72, 2.2);
    }
    const k = 5;
    const p = this.pose;
    p.distance = damp(p.distance, distance, k, dt);
    p.yaw = damp(p.yaw, frame.pose.yaw, k, dt);
    p.pitch = damp(p.pitch, frame.pose.pitch, k, dt);
    p.tx = damp(p.tx, tx, k, dt);
    p.ty = damp(p.ty, ty, k, dt);
    p.tz = damp(p.tz, tz, k, dt);
    p.shiftX = damp(p.shiftX, frame.pose.shiftX, k, dt);
    p.dim = damp(p.dim, frame.pose.dim, k, dt);
    if (dt === 0) Object.assign(p, { distance, yaw: frame.pose.yaw, pitch: frame.pose.pitch, tx, ty, tz, shiftX: frame.pose.shiftX, dim: frame.pose.dim });

    this.parallax.x = damp(this.parallax.x, this.pointer.inside ? this.pointer.x : 0, 3, dt);
    this.parallax.y = damp(this.parallax.y, this.pointer.inside ? this.pointer.y : 0, 3, dt);
    const drift = this.time * 0.035;
    this.group.rotation.set(p.pitch + this.parallax.y * 0.08, p.yaw + drift + this.parallax.x * 0.14, 0, 'XYZ');
    this.tmp.set(p.tx, p.ty, p.tz).applyEuler(this.group.rotation);
    this.group.position.set(p.shiftX - this.tmp.x, -this.tmp.y, -this.tmp.z);
    this.group.updateMatrixWorld();
    this.camera.position.set(0, 0, p.distance);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateMatrixWorld();
    this.u.uFocus.value = p.distance;
    this.u.uDim.value = p.dim;

    const hoverTarget = this.hovered >= 0 || this.focused !== null ? 1 : 0;
    this.hoverActive = damp(this.hoverActive, hoverTarget, 6, dt);
    this.u.uHoverActive.value = this.hoverActive;
    if (this.pointer.inside || this.hovered >= 0) this.pick();

    return (
      Math.abs(this.s - this.sTarget) > 1e-3 ||
      Math.abs(p.distance - distance) > 1e-3 ||
      Math.abs(p.ty - ty) > 1e-3 ||
      Math.abs(this.hoverActive - hoverTarget) > 1e-3 ||
      Math.abs(this.parallax.x - (this.pointer.inside ? this.pointer.x : 0)) > 1e-3
    );
  }

  /** Hover por proyección en CPU de los nodos semánticos (~200): sin lectura de GPU. */
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
      const [x, y, z] = this.nodeLayoutPos(i);
      this.tmp.set(x, y, z).applyMatrix4(this.mvp);
      if (this.tmp.z > 1) continue;
      const sx = ((this.tmp.x + 1) / 2) * this.width;
      const sy = ((1 - this.tmp.y) / 2) * this.height;
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
        this.lastEmit = { x, y };
        this.emit({ type: 'hover', index, x, y });
      }
      return;
    }
    this.hovered = index;
    if (this.focused === null) this.applyHighlight(index);
    this.lastEmit = { x, y };
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
