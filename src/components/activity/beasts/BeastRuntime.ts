import {
  ACESFilmicToneMapping, AdditiveBlending, BufferAttribute, BufferGeometry, Color,
  Group, HalfFloatType, InstancedMesh, Mesh, MeshBasicMaterial, NoToneMapping, Object3D,
  PerspectiveCamera, PlaneGeometry, Points, Scene, ShaderMaterial, TorusGeometry,
  Vector2, WebGLRenderer,
} from 'three';
import type { BeastSceneProps } from '@/activity/projects/model';
import { createBeast, disposeBeast, type BeastRig } from './anatomies';
import { CommitGalaxy } from './CommitGalaxy';
import { DUST_FRAGMENT, DUST_VERTEX, HALO_FRAGMENT, HALO_VERTEX } from './shaders';

type Composer = { render: (delta?: number) => void; setSize: (width: number, height: number) => void; dispose: () => void };
const TAU = Math.PI * 2;
const normalized = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
const signature = (props: BeastSceneProps) => `${props.kind}:${props.identity}`;

/** One central creature, lit like a miniature theatrical automaton rather than a data plot. */
export class BeastRuntime {
  private props: BeastSceneProps;
  private renderer!: WebGLRenderer;
  private composer: Composer | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(35, 1, 0.1, 50);
  private readonly theatre = new Group();
  private readonly instrument = new Group();
  private readonly galaxy = new CommitGalaxy();
  private active: BeastRig | null = null;
  private outgoing: BeastRig | null = null;
  private activeSignature = '';
  private transition = 1;
  private time = 0;
  private energy = 0;
  private last = 0;
  private frame: number | null = null;
  private initialized = false;
  private visible = true;
  private dirty = true;
  private disposed = false;
  private failed = false;
  private width = 1;
  private height = 1;
  private dust!: Points<BufferGeometry, ShaderMaterial>;
  private halo!: Mesh<PlaneGeometry, ShaderMaterial>;
  private readonly rings: Mesh<TorusGeometry, MeshBasicMaterial>[] = [];
  private readonly stageMaterials: (ShaderMaterial | MeshBasicMaterial)[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private readonly gaze = new Vector2();
  private readonly gazeTarget = new Vector2();

  constructor(private readonly mount: HTMLDivElement, props: BeastSceneProps,
    private readonly ready: (available: boolean) => void) {
    this.props = props;
    this.energy = normalized(props.energy);
  }

  async init(): Promise<void> {
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('aria-hidden', 'true');
    Object.assign(this.canvas.style, { display: 'block', width: '100%', height: '100%', touchAction: 'pan-y' });
    this.renderer = new WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true, stencil: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(new Color('#000000'), 0);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.debug.onShaderError = () => this.fail();
    this.canvas.addEventListener('webglcontextlost', this.contextLost);
    this.canvas.addEventListener('pointermove', this.pointerMove);
    this.canvas.addEventListener('pointerleave', this.pointerLeave);
    document.addEventListener('visibilitychange', this.visibilityChanged);
    this.mount.appendChild(this.canvas);
    this.scene.add(this.theatre);
    this.theatre.add(this.instrument);
    this.buildStage();
    this.theatre.add(this.galaxy);
    this.syncGalaxy();
    this.switchCreature(true);
    this.resize();
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(this.mount);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible) this.dirty = true;
      this.schedule();
    });
    this.intersectionObserver.observe(this.mount);
    if (this.width >= 580 && !this.props.reducedMotion) await this.setupBloom();
    if (this.disposed || this.failed) return;
    this.reconcileInitialProps();
    this.updateObjects();
    await this.renderer.compileAsync(this.scene, this.camera);
    if (this.disposed || this.failed) return;
    // Lazy import, bloom or compilation may overlap a species/identity change.
    this.reconcileInitialProps();
    this.updateObjects();
    this.initialized = true;
    this.render(0);
    if (this.failed) return;
    this.ready(true);
    this.schedule();
  }

  update(props: BeastSceneProps): void {
    if (this.disposed || this.failed) return;
    this.props = props;
    if (!this.initialized) return;
    if (signature(props) !== this.activeSignature) this.switchCreature(props.paused || props.reducedMotion);
    this.syncGalaxy();
    if (props.paused || props.reducedMotion) {
      this.finishTransition();
      this.energy = normalized(props.energy);
    }
    this.dirty = true;
    this.schedule();
  }

  private reconcileInitialProps(): void {
    if (signature(this.props) !== this.activeSignature) this.switchCreature(true);
    this.energy = normalized(this.props.energy);
    this.syncGalaxy();
  }

  private syncGalaxy(): void {
    const plan = this.galaxy.syncCounts(this.props.commits ?? 0, this.props.maximumCommits ?? this.props.commits ?? 0,
      this.props.identity, this.props.kind);
    if (this.canvas) {
      this.canvas.dataset.commitStars = String(plan.renderedCount);
      this.canvas.dataset.commits = String(plan.commits);
      this.canvas.dataset.starUnit = String(plan.unit);
    }
  }

  private switchCreature(immediate: boolean): void {
    if (this.outgoing) { disposeBeast(this.outgoing); this.outgoing = null; }
    if (immediate && this.active) { disposeBeast(this.active); this.active = null; }
    else this.outgoing = this.active;
    this.active = createBeast(this.props.kind, this.props.identity);
    this.activeSignature = signature(this.props);
    this.theatre.add(this.active.root);
    this.transition = immediate || !this.outgoing ? 1 : 0;
    this.active.setFade(this.transition);
    if (this.canvas) this.canvas.dataset.beastKind = this.props.kind;
  }

  private finishTransition(): void {
    this.transition = 1;
    this.active?.setFade(1);
    if (this.outgoing) { disposeBeast(this.outgoing); this.outgoing = null; }
  }

  private buildStage(): void {
    const material = new ShaderMaterial({ vertexShader: DUST_VERTEX, fragmentShader: DUST_FRAGMENT,
      uniforms: { uTime: { value: 0 }, uEnergy: { value: this.energy }, uBurst: { value: 0 }, uDpr: { value: 1 }, uHeight: { value: 1 } },
      transparent: true, depthWrite: false, blending: AdditiveBlending });
    this.stageMaterials.push(material);
    const geometry = new BufferGeometry();
    const count = 170;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = i * 2.399963;
      const r = 1.6 + Math.sin(i * 17.73) ** 2 * 1.55;
      positions.set([Math.cos(a) * r, Math.sin(a) * r * 0.9, Math.sin(i * 12.81) * 1.6], i * 3);
      phases[i] = (Math.sin(i * 17.11) + 1) * 0.5;
      sizes[i] = i % 13 === 0 ? 0.065 : 0.023 + phases[i] * 0.017;
    }
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('aPhase', new BufferAttribute(phases, 1));
    geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
    this.dust = new Points(geometry, material);
    this.dust.frustumCulled = false;
    // Legacy decorative dust no longer looks like uncounted commits.
    this.dust.visible = false;
    this.theatre.add(this.dust);

    const haloMaterial = new ShaderMaterial({ vertexShader: HALO_VERTEX, fragmentShader: HALO_FRAGMENT,
      uniforms: { uTime: { value: 0 }, uEnergy: { value: this.energy } },
      transparent: true, depthWrite: false, depthTest: false });
    this.stageMaterials.push(haloMaterial);
    this.halo = new Mesh(new PlaneGeometry(8, 8), haloMaterial);
    this.halo.position.z = -3;
    this.halo.renderOrder = -20;
    this.halo.visible = false;
    this.scene.add(this.halo);

    for (let i = 0; i < 3; i++) {
      const ringMaterial = new MeshBasicMaterial({ color: i === 1 ? '#be9758' : '#458d7d', transparent: true,
        opacity: i === 1 ? 0.25 : 0.14, blending: AdditiveBlending, depthWrite: false });
      this.stageMaterials.push(ringMaterial);
      const ring = new Mesh(new TorusGeometry(2.5 + i * 0.2, 0.006, 5, 160, TAU * (i === 1 ? 0.83 : 0.69)), ringMaterial);
      ring.rotation.set(Math.PI / 2, i * 0.2, i * 2.1);
      ring.position.y = -2.36 + i * 0.03;
      this.rings.push(ring);
      this.instrument.add(ring);
    }
    const glyphMaterial = new MeshBasicMaterial({ color: '#caaa69', transparent: true, opacity: 0.28, blending: AdditiveBlending, depthWrite: false });
    this.stageMaterials.push(glyphMaterial);
    const glyphs = new InstancedMesh(new PlaneGeometry(0.013, 0.07), glyphMaterial, 64);
    const temp = new Object3D();
    for (let i = 0; i < 64; i++) {
      const a = i / 64 * TAU;
      temp.position.set(Math.cos(a) * 2.85, -2.33, Math.sin(a) * 2.85);
      temp.rotation.set(-Math.PI / 2, 0, a);
      temp.scale.y = i % 8 === 0 ? 2.1 : 1;
      temp.updateMatrix();
      glyphs.setMatrixAt(i, temp.matrix);
    }
    this.instrument.add(glyphs);
  }

  private async setupBloom(): Promise<void> {
    let candidate: Composer | null = null;
    try {
      const { BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } = await import('postprocessing');
      if (this.disposed || this.failed) return;
      const composer = new EffectComposer(this.renderer, { frameBufferType: HalfFloatType, multisampling: 0 });
      candidate = composer;
      composer.addPass(new RenderPass(this.scene, this.camera));
      const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.94, luminanceSmoothing: 0.3, intensity: 0.85, radius: 0.68 });
      composer.addPass(new EffectPass(this.camera, bloom, new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC })));
      composer.setSize(this.width, this.height);
      if (this.disposed || this.failed) { composer.dispose(); return; }
      this.composer = composer;
      this.renderer.toneMapping = NoToneMapping;
    } catch {
      candidate?.dispose();
      this.renderer.autoClear = true;
      this.renderer.toneMapping = ACESFilmicToneMapping;
    }
  }

  private readonly resize = (): void => {
    if (this.disposed || !this.renderer) return;
    const rect = this.mount.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, this.width < 540 ? 1.5 : 1.8);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.width, this.height, false);
    this.composer?.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.position.set(0.15, 0.24, Math.max(10.4, 10.15 / this.camera.aspect));
    this.camera.lookAt(0, -0.04, 0);
    this.camera.updateProjectionMatrix();
    this.galaxy.setViewport(this.height, dpr);
    if (this.dust) {
      this.dust.material.uniforms.uDpr.value = dpr;
      this.dust.material.uniforms.uHeight.value = this.height;
    }
    this.dirty = true;
    this.schedule();
  };

  private pose(rig: BeastRig, fade: number, entering: boolean): void {
    const t = this.time;
    const scale = (rig.kind === 'sprout' ? 0.89 : 0.96) * rig.variation * (0.9 + this.energy * 0.12);
    rig.root.scale.setScalar(scale * (entering ? 0.55 + fade * 0.45 : 0.65 + fade * 0.35));
    rig.root.position.y = Math.sin(t * 0.73 + (rig.kind === 'nautilus' ? 1.8 : 0)) * 0.075
      + (entering ? -(1 - fade) * 0.65 : (1 - fade) * 0.45);
    rig.root.rotation.set(this.gaze.y * 0.045 + Math.sin(t * 0.25) * 0.018,
      -0.12 + this.gaze.x * 0.17 + Math.sin(t * 0.22) * 0.065 + (entering ? (1 - fade) * 0.72 : -(1 - fade) * 0.5),
      Math.sin(t * 0.31) * 0.018);
    rig.setFade(fade);
    rig.animate(t, this.gaze, this.energy);
  }

  private updateObjects(): void {
    const moving = !this.props.paused && !this.props.reducedMotion;
    this.gaze.lerp(this.gazeTarget, moving ? 0.06 : 1);
    const mix = this.transition * this.transition * (3 - 2 * this.transition);
    if (this.active) this.pose(this.active, mix, true);
    if (this.outgoing) this.pose(this.outgoing, 1 - mix, false);
    this.instrument.scale.setScalar(this.props.kind === 'sprout' ? 0.72 : 1);
    this.rings.forEach((ring, i) => { ring.rotation.z = i * 2.1 + this.time * (i % 2 ? -0.055 : 0.07); });
    this.dust.rotation.y = this.time * 0.027;
    this.dust.rotation.z = Math.sin(this.time * 0.15) * 0.07;
    this.dust.material.uniforms.uTime.value = this.time;
    this.dust.material.uniforms.uEnergy.value = this.energy;
    this.dust.material.uniforms.uBurst.value = Math.sin(this.transition * Math.PI) ** 2;
    this.halo.material.uniforms.uTime.value = this.time;
    this.halo.material.uniforms.uEnergy.value = this.energy;
    this.galaxy.update(this.time);
  }

  private readonly tick = (now: number): void => {
    this.frame = null;
    if (!this.available()) return;
    const delta = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    if (!this.props.paused && !this.props.reducedMotion) {
      this.time += delta;
      this.energy += (normalized(this.props.energy) - this.energy) * Math.min(1, delta * 3);
      if (this.transition < 1) {
        this.transition = Math.min(1, this.transition + delta / 1.6);
        if (this.transition === 1) this.finishTransition();
      }
    }
    this.updateObjects();
    this.render(delta);
    this.dirty = false;
    this.schedule();
  };

  private available(): boolean {
    return this.initialized && !this.disposed && !this.failed && this.visible && document.visibilityState !== 'hidden';
  }

  private schedule(): void {
    const active = this.available();
    const motion = !this.props.paused && !this.props.reducedMotion;
    if (active && (this.dirty || motion) && this.frame === null) {
      this.last = performance.now();
      this.frame = requestAnimationFrame(this.tick);
    } else if (!active && this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }

  private render(delta: number): void {
    if (this.disposed || this.failed) return;
    try {
      if (this.composer) this.composer.render(delta);
      else this.renderer.render(this.scene, this.camera);
    } catch { this.fail(); }
  }

  private readonly pointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') return;
    const rect = this.canvas!.getBoundingClientRect();
    this.gazeTarget.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
    this.dirty = true;
    this.schedule();
  };
  private readonly pointerLeave = (): void => { this.gazeTarget.set(0, 0); this.dirty = true; this.schedule(); };
  private readonly visibilityChanged = (): void => { this.dirty = true; this.schedule(); };
  private readonly contextLost = (event: Event): void => { event.preventDefault(); this.fail(); };

  private fail(): void {
    if (this.failed || this.disposed) return;
    this.failed = true;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.ready(false);
    // Never dispose during a shader compile/render stack; release its resources immediately afterward.
    queueMicrotask(() => this.dispose());
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.visibilityChanged);
    this.canvas?.removeEventListener('webglcontextlost', this.contextLost);
    this.canvas?.removeEventListener('pointermove', this.pointerMove);
    this.canvas?.removeEventListener('pointerleave', this.pointerLeave);
    if (this.active) disposeBeast(this.active);
    if (this.outgoing) disposeBeast(this.outgoing);
    this.active = this.outgoing = null;
    this.composer?.dispose();
    this.galaxy.dispose();
    const geometries = new Set<BufferGeometry>();
    this.scene.traverse((object) => {
      if (object instanceof Mesh || object instanceof Points) geometries.add(object.geometry);
    });
    geometries.forEach((geometry) => geometry.dispose());
    this.stageMaterials.forEach((material) => material.dispose());
    this.renderer?.dispose();
    this.canvas?.remove();
  }
}
