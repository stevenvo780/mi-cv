import {
  ACESFilmicToneMapping, AdditiveBlending, AmbientLight, BufferAttribute, BufferGeometry,
  Color, CylinderGeometry, DirectionalLight, DoubleSide, DynamicDrawUsage, Group, HalfFloatType,
  IcosahedronGeometry, InstancedMesh, Line, LineBasicMaterial, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, NoToneMapping, Object3D, PerspectiveCamera,
  PlaneGeometry, Points, Quaternion, Raycaster, RingGeometry, Scene, ShaderMaterial,
  TorusGeometry, Vector2, Vector3, WebGLRenderer,
} from 'three';
import type { ActivityDay } from '@/activity/model';
import type { ActivitySceneProps } from '../ActivityScene';
import {
  ATMOSPHERE_FRAGMENT, ATMOSPHERE_VERTEX, PARTICLE_FRAGMENT, PARTICLE_VERTEX,
  RIBBON_FRAGMENT, RIBBON_VERTEX,
} from './shaders';

type Mode = 'year' | 'month' | 'week';
type Callbacks = { select: (date: string) => void; ready: (available: boolean) => void };
type Composer = { render: (delta?: number) => void; setSize: (width: number, height: number) => void; dispose: () => void };
type Pose = { ribbon: Float32Array; nodes: Float32Array; scales: Float32Array };

const TAU = Math.PI * 2;
const SEGMENTS = 480;
const CAPACITY = 365;
const CURRENT_COUNT = 300;
const TEAL = new Color('#74ddce');
const GOLD = new Color('#f3c993');
const VIOLET = new Color('#b6a3e6');
const DARK = new Color('#173630');
const scratch = new Object3D();
const vertexA = new Vector3();
const vertexB = new Vector3();
const tangent = new Vector3();
const side = new Vector3();
const binormal = new Vector3();
const zAxis = new Vector3(0, 0, 1);

const CRYSTAL_VERTEX = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vColor;
varying vec3 vPosition;
void main() {
  vec4 local = instanceMatrix * vec4(position, 1.0);
  vec4 view = modelViewMatrix * local;
  vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
  vView = normalize(-view.xyz);
  vColor = instanceColor;
  vPosition = local.xyz;
  gl_Position = projectionMatrix * view;
}
`;
const CRYSTAL_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uWeek;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vColor;
varying vec3 vPosition;
void main() {
  vec3 n = normalize(vNormal);
  vec3 eye = normalize(vView);
  float fresnel = pow(1.0 - abs(dot(n, eye)), 2.2);
  float lit = max(dot(n, normalize(vec3(-0.5, 1.0, 0.8))), 0.0);
  float spec = pow(max(dot(reflect(normalize(vec3(0.5,-1.0,-0.8)), n), eye), 0.0), 24.0);
  float caustic = pow(0.5 + 0.5 * sin(vPosition.y * 12.0 + vPosition.x * 9.0 + uTime * 1.5), 14.0);
  vec3 col = vColor * (0.22 + lit * mix(0.95, 0.62, uWeek) + fresnel * mix(1.6, 0.86, uWeek));
  col += vec3(1.4,1.3,1.08) * spec * mix(1.5, 0.28, uWeek) + vColor * caustic * 0.28;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** A knotted year, a breathing month ring, and seven individually measured lanterns. */
function curve(mode: Mode, t: number, target: Vector3): Vector3 {
  const a = t * TAU;
  if (mode === 'year') {
    const radius = 2.03 + 0.59 * Math.cos(a * 3);
    return target.set(radius * Math.cos(a * 2), radius * Math.sin(a * 2) * 1.04, 0.88 * Math.sin(a * 3));
  }
  if (mode === 'month') {
    const radius = 2.38 + 0.16 * Math.cos(a * 3);
    return target.set(radius * Math.cos(a), radius * Math.sin(a), 0.62 * Math.sin(a * 2));
  }
  return target.set((t - 0.5) * 5.7, -1.8 + Math.sin(a * 2) * 0.23, Math.cos(a) * 0.45);
}

function ribbonPose(mode: Mode): Float32Array {
  const positions = new Float32Array((SEGMENTS + 1) * 6);
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    curve(mode, t, vertexA);
    curve(mode, t + 0.0005, vertexB);
    tangent.subVectors(vertexB, vertexA).normalize();
    side.crossVectors(tangent, zAxis).normalize();
    binormal.crossVectors(tangent, side).normalize();
    const twist = t * TAU * (mode === 'year' ? 3 : 1) + 0.35;
    side.multiplyScalar(Math.cos(twist)).addScaledVector(binormal, Math.sin(twist));
    const width = mode === 'year' ? 0.14 : mode === 'month' ? 0.23 : 0.16;
    for (let edge = 0; edge < 2; edge++) {
      const offset = (i * 2 + edge) * 3;
      positions[offset] = vertexA.x + side.x * width * (edge ? 1 : -1);
      positions[offset + 1] = vertexA.y + side.y * width * (edge ? 1 : -1);
      positions[offset + 2] = vertexA.z + side.z * width * (edge ? 1 : -1);
    }
  }
  return positions;
}

function seeded(index: number, lane: number): number {
  const x = Math.sin(index * 127.1 + lane * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export class ActivitySculpture {
  private props: ActivitySceneProps;
  private days: ActivityDay[] = [];
  private mode: Mode = 'year';
  private renderer!: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(37, 1, 0.1, 60);
  private readonly sculpture = new Group();
  private readonly instrument = new Group();
  private composer: Composer | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ribbon!: Mesh<BufferGeometry, ShaderMaterial>;
  private crystals!: InstancedMesh<IcosahedronGeometry, ShaderMaterial>;
  private stems!: InstancedMesh<CylinderGeometry, MeshStandardMaterial>;
  private glow!: Points<BufferGeometry, ShaderMaterial>;
  private currents!: Points<BufferGeometry, ShaderMaterial>;
  private dust!: Points<BufferGeometry, ShaderMaterial>;
  private lanternCurrents!: Points<BufferGeometry, ShaderMaterial>;
  private readonly weekOrbits: InstancedMesh<TorusGeometry, MeshBasicMaterial>[] = [];
  private readonly weekThreads: Line<BufferGeometry, LineBasicMaterial>[] = [];
  private atmosphere!: Mesh<PlaneGeometry, ShaderMaterial>;
  private readonly edges: Line<BufferGeometry, LineBasicMaterial>[] = [];
  private readonly rings: Mesh<TorusGeometry, MeshBasicMaterial>[] = [];
  private readonly selection = new Group();
  private pose!: Pose;
  private from!: Pose;
  private target!: Pose;
  private morph = 1;
  private weekWeight = 0;
  private weekFrom = 0;
  private time = 0;
  private last = 0;
  private frame: number | null = null;
  private dirty = true;
  private visible = true;
  private initialized = false;
  private disposed = false;
  private failed = false;
  private width = 1;
  private height = 1;
  private dpr = 1;
  private hovered = -1;
  private readonly pointer = new Vector2();
  private readonly pointerTarget = new Vector2();
  private readonly raycaster = new Raycaster();
  private readonly pointerNdc = new Vector2();
  private readonly rotation = new Quaternion();
  private readonly dragRotation = new Vector2();
  private drag: { id: number; x: number; y: number; moved: boolean; active: boolean; touch: boolean } | null = null;
  private suppressClick = false;
  private observer: ResizeObserver | null = null;
  private intersection: IntersectionObserver | null = null;
  private readonly materials: (ShaderMaterial | MeshBasicMaterial | MeshStandardMaterial | LineBasicMaterial)[] = [];

  constructor(private readonly mount: HTMLDivElement, props: ActivitySceneProps, private readonly callbacks: Callbacks) {
    this.props = props;
  }

  async init(): Promise<void> {
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('aria-hidden', 'true');
    Object.assign(this.canvas.style, { display: 'block', width: '100%', height: '100%', touchAction: 'pan-y' });
    this.renderer = new WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true, stencil: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.04;
    this.renderer.debug.onShaderError = () => this.fail();
    this.canvas.addEventListener('webglcontextlost', this.contextLost);
    this.canvas.addEventListener('pointermove', this.pointerMove);
    this.canvas.addEventListener('pointerdown', this.pointerDown);
    this.canvas.addEventListener('pointerup', this.pointerUp);
    this.canvas.addEventListener('pointercancel', this.pointerCancel);
    this.canvas.addEventListener('pointerleave', this.pointerLeave);
    this.canvas.addEventListener('click', this.click);
    document.addEventListener('visibilitychange', this.visibilityChanged);
    this.mount.appendChild(this.canvas);
    this.mode = this.modeOf(this.props.windowSize);
    this.days = this.props.days.slice(-CAPACITY);
    this.scene.add(this.sculpture);
    this.sculpture.add(this.instrument);
    this.build();
    this.target = this.makePose();
    this.pose = { ribbon: this.target.ribbon.slice(), nodes: this.target.nodes.slice(), scales: this.target.scales.slice() };
    this.from = this.pose;
    this.resize();
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(this.mount);
    this.intersection = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.synchronizeLoop();
    }, { rootMargin: '80px' });
    this.intersection.observe(this.mount);
    // True HDR bloom, route-lazy as in the home. Small screens use shader halos and fewer pixels.
    if (this.width >= 620 && !this.props.reducedMotion) await this.setupBloom();
    if (this.disposed || this.failed) return;
    // Props can change during lazy imports; the first image always reflects the latest period/data.
    this.refreshPose();
    this.paintGeometry();
    this.updateObjects();
    await this.renderer.compileAsync(this.scene, this.camera);
    if (this.disposed || this.failed) return;
    this.refreshPose();
    this.paintGeometry();
    this.updateObjects();
    this.initialized = true;
    this.last = performance.now();
    this.render(0);
    if (this.failed) return;
    this.callbacks.ready(true);
    this.synchronizeLoop();
  }

  update(props: ActivitySceneProps): void {
    if (this.disposed || this.failed) return;
    const changed = this.props.days !== props.days || this.props.windowSize !== props.windowSize;
    this.props = props;
    if (!this.initialized) return;
    if (changed) {
      this.weekFrom = this.weekWeight;
      this.days = props.days.slice(-CAPACITY);
      this.mode = this.modeOf(props.windowSize);
      this.from = { ribbon: this.pose.ribbon.slice(), nodes: this.pose.nodes.slice(), scales: this.pose.scales.slice() };
      this.target = this.makePose();
      this.morph = props.reducedMotion ? 1 : 0;
      if (props.reducedMotion) { this.pose = this.target; this.paintGeometry(); }
      if (props.reducedMotion) this.weekWeight = this.mode === 'week' ? 1 : 0;
    }
    this.dirty = true;
    this.synchronizeLoop();
  }

  private modeOf(size: number): Mode { return size <= 7 ? 'week' : size <= 31 ? 'month' : 'year'; }

  private refreshPose(): void {
    this.mode = this.modeOf(this.props.windowSize);
    this.days = this.props.days.slice(-CAPACITY);
    this.target = this.makePose();
    this.pose = { ribbon: this.target.ribbon.slice(), nodes: this.target.nodes.slice(), scales: this.target.scales.slice() };
    this.from = this.pose;
    this.morph = 1;
    this.weekWeight = this.mode === 'week' ? 1 : 0;
    this.weekFrom = this.weekWeight;
  }

  private makePose(): Pose {
    const nodes = new Float32Array(CAPACITY * 3);
    const scales = new Float32Array(CAPACITY);
    const length = Math.min(this.days.length, this.props.windowSize);
    const start = this.days.length - length;
    const max = Math.max(1, ...this.days.slice(start).map((day) => day.count));
    for (let i = 0; i < this.days.length; i++) {
      // Old dates dissolve in place instead of shooting beyond the stage in a shorter period.
      if (i < start) {
        if (this.pose) nodes.set(this.pose.nodes.subarray(i * 3, i * 3 + 3), i * 3);
        continue;
      }
      const fraction = (i - start) / Math.max(1, length - 1);
      const intensity = Math.sqrt(Math.max(0, this.days[i].count) / max);
      const pathFraction = this.mode === 'week' ? fraction : (i - start + 0.5) / Math.max(1, length);
      curve(this.mode, Math.max(0, pathFraction), vertexA);
      if (this.mode === 'week') {
        vertexA.set((fraction - 0.5) * 5.2, -0.75 + intensity * 1.75 + Math.sin(fraction * Math.PI) * 0.25,
          Math.cos(fraction * TAU) * 0.32 + Math.sin(fraction * Math.PI) * 0.45);
      } else {
        // Crystals sit just above the ribbon, avoiding a chart-like flat distribution.
        vertexA.multiplyScalar(1.06);
        vertexA.z += 0.12;
      }
      vertexA.toArray(nodes, i * 3);
      const base = this.mode === 'year' ? 0.024 : this.mode === 'month' ? 0.087 : 0.12;
      scales[i] = i < start ? 0 : base + intensity * (this.mode === 'year' ? 0.039 : this.mode === 'month' ? 0.092 : 0.13);
    }
    return { ribbon: ribbonPose(this.mode), nodes, scales };
  }

  private shader(vertexShader: string, fragmentShader: string, extra: Record<string, { value: number }> = {}): ShaderMaterial {
    const material = new ShaderMaterial({ vertexShader, fragmentShader,
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uPixelRatio: { value: 1 }, uViewportHeight: { value: 1 }, ...extra },
    });
    this.materials.push(material);
    return material;
  }

  private particleGeometry(count: number): BufferGeometry {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3).setUsage(DynamicDrawUsage));
    geometry.setAttribute('aSize', new BufferAttribute(new Float32Array(count), 1).setUsage(DynamicDrawUsage));
    geometry.setAttribute('aColor', new BufferAttribute(new Float32Array(count * 3), 3).setUsage(DynamicDrawUsage));
    geometry.setAttribute('aPhase', new BufferAttribute(Float32Array.from({ length: count }, (_, i) => seeded(i, 3) * TAU), 1));
    return geometry;
  }

  private particles(count: number, opacity: number): Points<BufferGeometry, ShaderMaterial> {
    const material = this.shader(PARTICLE_VERTEX, PARTICLE_FRAGMENT);
    material.transparent = true;
    material.depthWrite = false;
    material.blending = AdditiveBlending;
    material.uniforms.uOpacity.value = opacity;
    const points = new Points(this.particleGeometry(count), material);
    points.frustumCulled = false;
    return points;
  }

  private build(): void {
    const ribbonGeometry = new BufferGeometry();
    ribbonGeometry.setAttribute('position', new BufferAttribute(new Float32Array((SEGMENTS + 1) * 6), 3).setUsage(DynamicDrawUsage));
    const uv = new Float32Array((SEGMENTS + 1) * 4);
    const indices: number[] = [];
    for (let i = 0; i <= SEGMENTS; i++) { uv.set([i / SEGMENTS, 0, i / SEGMENTS, 1], i * 4); }
    for (let i = 0; i < SEGMENTS; i++) { const k = i * 2; indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    ribbonGeometry.setAttribute('uv', new BufferAttribute(uv, 2));
    ribbonGeometry.setIndex(indices);
    const ribbonMaterial = this.shader(RIBBON_VERTEX, RIBBON_FRAGMENT);
    ribbonMaterial.side = DoubleSide;
    this.ribbon = new Mesh(ribbonGeometry, ribbonMaterial);
    this.ribbon.frustumCulled = false;
    this.sculpture.add(this.ribbon);

    for (let i = 0; i < 2; i++) {
      const material = new LineBasicMaterial({ color: i ? GOLD : TEAL, transparent: true, opacity: 0.68, blending: AdditiveBlending, depthWrite: false });
      this.materials.push(material);
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(new Float32Array((SEGMENTS + 1) * 3), 3).setUsage(DynamicDrawUsage));
      const edge = new Line(geometry, material);
      edge.frustumCulled = false;
      this.edges.push(edge);
      this.sculpture.add(edge);
    }

    this.crystals = new InstancedMesh(new IcosahedronGeometry(1, 0), this.shader(CRYSTAL_VERTEX, CRYSTAL_FRAGMENT, { uWeek: { value: 0 } }), CAPACITY);
    this.crystals.instanceMatrix.setUsage(DynamicDrawUsage);
    // Initialize instanceColor before compiling the material's USE_INSTANCING_COLOR variant.
    for (let i = 0; i < CAPACITY; i++) this.crystals.setColorAt(i, DARK);
    this.crystals.frustumCulled = false;
    this.sculpture.add(this.crystals);

    const stemMaterial = new MeshStandardMaterial({ color: '#2e8a7b', emissive: '#17483f', metalness: 0.85, roughness: 0.23, transparent: true });
    this.materials.push(stemMaterial);
    this.stems = new InstancedMesh(new CylinderGeometry(0.022, 0.048, 1, 8), stemMaterial, CAPACITY);
    this.stems.frustumCulled = false;
    this.sculpture.add(this.stems);
    this.glow = this.particles(CAPACITY, 0.65);
    this.currents = this.particles(CURRENT_COUNT, 0.85);
    this.dust = this.particles(100, 0.28);
    this.sculpture.add(this.glow, this.currents, this.dust);
    // Ornament follows each of the seven real date bodies; it adds no data marks.
    this.lanternCurrents = this.particles(7 * 64, 0);
    this.sculpture.add(this.lanternCurrents);
    for (let layer = 0; layer < 2; layer++) {
      const material = new MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0,
        blending: AdditiveBlending, depthWrite: false });
      this.materials.push(material);
      const orbit = new InstancedMesh(new TorusGeometry(1, layer ? 0.006 : 0.011, 5, 64), material, 7);
      orbit.frustumCulled = false;
      this.weekOrbits.push(orbit);
      this.sculpture.add(orbit);
    }
    for (let i = 0; i < 7; i++) {
      const material = new LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0,
        blending: AdditiveBlending, depthWrite: false });
      this.materials.push(material);
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(new Float32Array(72 * 3), 3).setUsage(DynamicDrawUsage));
      const thread = new Line(geometry, material);
      thread.frustumCulled = false;
      this.weekThreads.push(thread);
      this.sculpture.add(thread);
    }
    const dustPositions = this.dust.geometry.getAttribute('position');
    const dustSize = this.dust.geometry.getAttribute('aSize');
    const dustColor = this.dust.geometry.getAttribute('aColor');
    for (let i = 0; i < 100; i++) {
      const a = seeded(i, 0) * TAU;
      const r = 2.5 + seeded(i, 1) * 1.2;
      dustPositions.setXYZ(i, Math.cos(a) * r, Math.sin(a) * r, (seeded(i, 2) - 0.5) * 3);
      dustSize.setX(i, 0.02 + seeded(i, 4) * 0.025);
      const color = i % 3 === 0 ? GOLD : TEAL;
      dustColor.setXYZ(i, color.r, color.g, color.b);
    }

    const atmosphereMaterial = this.shader(ATMOSPHERE_VERTEX, ATMOSPHERE_FRAGMENT);
    atmosphereMaterial.transparent = true;
    atmosphereMaterial.depthWrite = false;
    atmosphereMaterial.depthTest = false;
    this.atmosphere = new Mesh(new PlaneGeometry(18, 18), atmosphereMaterial);
    this.atmosphere.position.z = -4;
    this.atmosphere.renderOrder = -10;
    this.scene.add(this.atmosphere);

    [3.12, 3.34, 2.92].forEach((radius, index) => {
      const material = new MeshBasicMaterial({ color: index === 1 ? GOLD : TEAL, transparent: true, opacity: index === 1 ? 0.2 : 0.16, blending: AdditiveBlending, depthWrite: false });
      this.materials.push(material);
      const ring = new Mesh(new TorusGeometry(radius, index ? 0.006 : 0.009, 6, 192), material);
      ring.rotation.set(index === 0 ? 0.9 : -0.6, index === 2 ? 0.9 : -0.35, index * 0.6);
      this.rings.push(ring);
      this.instrument.add(ring);
    });
    const tickMaterial = new MeshBasicMaterial({ color: '#8ab8a6', transparent: true, opacity: 0.31 });
    this.materials.push(tickMaterial);
    const ticks = new InstancedMesh(new CylinderGeometry(0.004, 0.004, 0.045, 3), tickMaterial, 96);
    for (let i = 0; i < 96; i++) {
      const a = i / 96 * TAU;
      scratch.position.set(Math.cos(a) * 3.35, Math.sin(a) * 3.35, 0);
      scratch.rotation.set(0, 0, a - Math.PI / 2);
      scratch.scale.set(1, i % 8 === 0 ? 2.4 : 1, 1);
      scratch.updateMatrix();
      ticks.setMatrixAt(i, scratch.matrix);
    }
    this.instrument.add(ticks);

    for (let i = 0; i < 2; i++) {
      const material = new MeshBasicMaterial({ color: i ? '#f3d7a5' : '#9ff4dd', transparent: true, opacity: i ? 0.45 : 0.86, side: DoubleSide, blending: AdditiveBlending, depthWrite: false });
      this.materials.push(material);
      const halo = new Mesh(new RingGeometry(i ? 0.28 : 0.2, i ? 0.285 : 0.211, 64), material);
      this.selection.add(halo);
    }
    this.sculpture.add(this.selection);
    this.scene.add(new AmbientLight('#92cfbc', 1.2));
    const light = new DirectionalLight('#f2d2a0', 3);
    light.position.set(4, 6, 4);
    this.scene.add(light);
  }

  private async setupBloom(): Promise<void> {
    let composer: Composer | null = null;
    try {
      const { BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } = await import('postprocessing');
      if (this.disposed) return;
      const instance = new EffectComposer(this.renderer, { frameBufferType: HalfFloatType, multisampling: 0 });
      composer = instance;
      instance.addPass(new RenderPass(this.scene, this.camera));
      const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.92, luminanceSmoothing: 0.35, intensity: 0.76, radius: 0.64 });
      instance.addPass(new EffectPass(this.camera, bloom, new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC })));
      instance.setSize(this.width, this.height);
      if (this.disposed) { instance.dispose(); return; }
      this.composer = instance;
      this.renderer.toneMapping = NoToneMapping;
    } catch {
      composer?.dispose();
      this.renderer.autoClear = true;
      this.renderer.toneMapping = ACESFilmicToneMapping;
    }
  }

  private readonly resize = (): void => {
    if (this.disposed || !this.renderer) return;
    const rect = this.mount.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, this.width < 620 ? 1.5 : 1.8);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(this.width, this.height, false);
    this.composer?.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    const distance = Math.max(10.4, 10.2 / this.camera.aspect);
    this.camera.position.set(0, 0.3, distance);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
    for (const material of this.materials) if (material instanceof ShaderMaterial) {
      if (material.uniforms.uPixelRatio) material.uniforms.uPixelRatio.value = this.dpr;
      if (material.uniforms.uViewportHeight) material.uniforms.uViewportHeight.value = this.height;
    }
    this.dirty = true;
    this.synchronizeLoop();
  };

  private paintGeometry(): void {
    const attribute = this.ribbon.geometry.getAttribute('position') as BufferAttribute;
    attribute.array.set(this.pose.ribbon);
    attribute.needsUpdate = true;
    this.ribbon.geometry.computeVertexNormals();
    for (let edge = 0; edge < 2; edge++) {
      const positions = this.edges[edge].geometry.getAttribute('position');
      for (let i = 0; i <= SEGMENTS; i++) {
        const k = i * 6 + edge * 3;
        positions.setXYZ(i, this.pose.ribbon[k], this.pose.ribbon[k + 1], this.pose.ribbon[k + 2]);
      }
      positions.needsUpdate = true;
    }
  }

  private updateObjects(): void {
    const moving = !this.props.paused && !this.props.reducedMotion;
    this.pointer.lerp(this.pointerTarget, moving ? 0.06 : 1);
    const t = this.time;
    this.sculpture.rotation.set(0.13 + Math.sin(t * 0.17) * 0.11 + this.pointer.y * 0.1,
      -0.24 + Math.sin(t * 0.13) * 0.28 + this.pointer.x * 0.16 + this.dragRotation.x, -0.13 + Math.sin(t * 0.11) * 0.09);
    this.sculpture.rotation.x += this.dragRotation.y;
    this.sculpture.scale.setScalar(1 + Math.sin(t * 0.7) * 0.012);
    this.instrument.scale.setScalar(this.mode === 'week' ? 0.84 : 1);
    this.rings.forEach((ring, i) => {
      ring.rotation.z = i * 0.6 + t * (i % 2 ? -0.18 : 0.13);
      ring.rotation.y = (i === 2 ? 0.9 : -0.35) + Math.sin(t * 0.2 + i) * 0.12;
      ring.material.opacity = (this.mode === 'week' ? 0.045 : i === 1 ? 0.2 : 0.16);
    });
    this.dust.rotation.z = t * 0.08;
    this.dust.rotation.y = Math.sin(t * 0.12) * 0.18;
    for (const material of this.materials) if (material instanceof ShaderMaterial && material.uniforms.uTime) material.uniforms.uTime.value = t;
    this.crystals.material.uniforms.uWeek.value = this.weekWeight;
    this.stems.material.opacity = this.weekWeight * 0.2;

    const length = Math.min(this.days.length, this.props.windowSize);
    const start = this.days.length - length;
    const max = Math.max(1, ...this.days.slice(start).map((day) => day.count));
    const glowPositions = this.glow.geometry.getAttribute('position');
    const glowSizes = this.glow.geometry.getAttribute('aSize');
    const glowColors = this.glow.geometry.getAttribute('aColor');
    const selected = this.days.findIndex((day) => day.date === this.props.selectedDate);
    for (let i = 0; i < CAPACITY; i++) {
      const day = this.days[i];
      const fraction = (i - start) / Math.max(1, length - 1);
      const shown = !!day && fraction <= Math.max(0, Math.min(1, this.props.reveal)) + 0.0001;
      const intensity = day ? Math.sqrt(Math.max(0, day.count) / max) : 0;
      const k = i * 3;
      const scale = shown ? this.pose.scales[i] : 0;
      const color = day?.count ? TEAL.clone().lerp(intensity > 0.6 ? GOLD : VIOLET, intensity) : DARK;
      if (day?.count && this.weekWeight > 0) {
        const lantern = new Color('#43c6b0').lerp(new Color('#dba34d'), Math.pow(intensity, 2.2));
        color.lerp(lantern, this.weekWeight);
      }
      const emphasized = i === selected || i === this.hovered;
      scratch.position.fromArray(this.pose.nodes, k);
      scratch.rotation.set(i * 0.3 + t * 0.16, i * 1.13 + t * 0.23, i * 0.73);
      scratch.scale.set(scale * (emphasized ? 1.35 : 1), scale * (1.15 + this.weekWeight * 0.3) * (emphasized ? 1.2 : 1), scale);
      scratch.updateMatrix();
      this.crystals.setMatrixAt(i, scratch.matrix);
      this.crystals.setColorAt(i, color);
      glowPositions.setXYZ(i, scratch.position.x, scratch.position.y, scratch.position.z);
      glowSizes.setX(i, day?.count && shown ? scale * (emphasized ? 6.8 : 4.5) : 0);
      glowColors.setXYZ(i, color.r * (day?.count ? 1 : 0), color.g * (day?.count ? 1 : 0), color.b * (day?.count ? 1 : 0));
      const column = this.mode === 'week' && i >= start && shown ? 1 : 0;
      const h = scratch.position.y + 1.72;
      scratch.position.y -= h * 0.5;
      scratch.rotation.set(0, 0, 0);
      scratch.scale.set(column * 0.25, Math.max(0.02, h) * column, column * 0.25);
      scratch.updateMatrix();
      this.stems.setMatrixAt(i, scratch.matrix);
    }
    this.crystals.instanceMatrix.needsUpdate = true;
    if (this.crystals.instanceColor) this.crystals.instanceColor.needsUpdate = true;
    this.stems.instanceMatrix.needsUpdate = true;
    glowPositions.needsUpdate = glowSizes.needsUpdate = glowColors.needsUpdate = true;
    this.selection.visible = selected >= start && selected >= 0 && this.props.reveal >= (selected - start) / Math.max(1, length - 1);
    if (this.selection.visible) {
      this.selection.position.fromArray(this.pose.nodes, selected * 3);
      this.sculpture.updateMatrixWorld(true);
      this.camera.getWorldQuaternion(this.rotation);
      this.sculpture.getWorldQuaternion(this.selection.quaternion).invert().multiply(this.rotation);
      this.selection.scale.setScalar((this.mode === 'week' ? 2.2 : this.mode === 'month' ? 1.2 : 0.63) * (1 + Math.sin(t * 1.8) * 0.1));
    }
    this.updateCurrents();
    this.updateLanterns();
  }

  private updateLanterns(): void {
    const positions = this.lanternCurrents.geometry.getAttribute('position');
    const sizes = this.lanternCurrents.geometry.getAttribute('aSize');
    const colors = this.lanternCurrents.geometry.getAttribute('aColor');
    this.lanternCurrents.material.uniforms.uOpacity.value = this.weekWeight * 0.72;
    const start = Math.max(0, this.days.length - 7);
    const max = Math.max(1, ...this.days.slice(start).map((day) => day.count));
    for (let i = 0; i < 7; i++) {
      const index = start + i;
      const day = this.days[index];
      const fraction = i / Math.max(1, this.days.length - start - 1);
      const visible = !!day && this.weekWeight > 0.001 && fraction <= this.props.reveal;
      const intensity = day ? Math.sqrt(Math.max(0, day.count) / max) : 0;
      const color = new Color('#43c6b0').lerp(new Color('#dba34d'), Math.pow(intensity, 2.2));
      const x = this.pose.nodes[index * 3] ?? 0;
      const y = this.pose.nodes[index * 3 + 1] ?? 0;
      const z = this.pose.nodes[index * 3 + 2] ?? 0;
      const baseY = -1.8 + Math.sin(fraction * TAU * 2) * 0.23;
      const baseZ = Math.cos(fraction * TAU) * 0.45;
      for (let layer = 0; layer < 2; layer++) {
        const orbit = this.weekOrbits[layer];
        const radius = (0.39 + intensity * 0.18) * (layer ? 1.18 : 1);
        scratch.position.set(x, y, z);
        scratch.rotation.set(0.7 + i * 0.31 + Math.sin(this.time * 0.3 + i) * 0.2,
          layer ? 0.7 + i * 0.17 : -0.4, this.time * (layer ? -0.29 : 0.21) + i * 0.8);
        scratch.scale.setScalar(visible ? radius * this.weekWeight : 0);
        scratch.updateMatrix();
        orbit.setMatrixAt(i, scratch.matrix);
        orbit.setColorAt(i, color);
        orbit.material.opacity = this.weekWeight * (layer ? 0.3 : 0.58);
      }
      const thread = this.weekThreads[i];
      thread.material.opacity = visible ? this.weekWeight * 0.22 : 0;
      thread.material.color.copy(color);
      const threadPositions = thread.geometry.getAttribute('position');
      for (let j = 0; j < 72; j++) {
        const u = j / 71;
        const a = u * TAU * 2.5 + this.time * 0.45 + i;
        const radius = Math.sin(u * Math.PI) * (0.09 + u * 0.13);
        threadPositions.setXYZ(j, x + Math.cos(a) * radius, baseY + (y - baseY) * u,
          baseZ + (z - baseZ) * u + Math.sin(a) * radius);
      }
      threadPositions.needsUpdate = true;
      for (let j = 0; j < 64; j++) {
        const k = i * 64 + j;
        const u = (j / 64 + this.time * 0.12 + i * 0.137) % 1;
        const a = u * TAU * 2.5 + this.time * 0.45 + i;
        const radius = Math.sin(u * Math.PI) * (0.09 + u * 0.13);
        positions.setXYZ(k, x + Math.cos(a) * radius, baseY + (y - baseY) * u,
          baseZ + (z - baseZ) * u + Math.sin(a) * radius);
        sizes.setX(k, visible ? (j % 8 === 0 ? 0.066 : 0.028) * this.weekWeight : 0);
        colors.setXYZ(k, color.r * 1.3, color.g * 1.3, color.b * 1.3);
      }
    }
    for (const orbit of this.weekOrbits) {
      orbit.instanceMatrix.needsUpdate = true;
      if (orbit.instanceColor) orbit.instanceColor.needsUpdate = true;
    }
    positions.needsUpdate = sizes.needsUpdate = colors.needsUpdate = true;
  }

  private updateCurrents(): void {
    const positions = this.currents.geometry.getAttribute('position');
    const sizes = this.currents.geometry.getAttribute('aSize');
    const colors = this.currents.geometry.getAttribute('aColor');
    // Decorative moving light, explicitly separate from the one-crystal-per-day data layer.
    for (let i = 0; i < CURRENT_COUNT; i++) {
      const lane = i % 3;
      const u = (seeded(i, 5) + this.time * (0.052 + lane * 0.011)) % 1;
      const j = Math.min(SEGMENTS - 1, Math.floor(u * SEGMENTS));
      const f = u * SEGMENTS - j;
      const k = j * 6;
      vertexA.set((this.pose.ribbon[k] + this.pose.ribbon[k + 3]) * 0.5,
        (this.pose.ribbon[k + 1] + this.pose.ribbon[k + 4]) * 0.5, (this.pose.ribbon[k + 2] + this.pose.ribbon[k + 5]) * 0.5);
      const next = k + 6;
      vertexB.set((this.pose.ribbon[next] + this.pose.ribbon[next + 3]) * 0.5,
        (this.pose.ribbon[next + 1] + this.pose.ribbon[next + 4]) * 0.5, (this.pose.ribbon[next + 2] + this.pose.ribbon[next + 5]) * 0.5);
      vertexA.lerp(vertexB, f);
      const a = u * TAU * 8 + this.time * 0.45 + lane * TAU / 3;
      const spread = lane === 0 ? 0.035 : 0.15;
      vertexA.x += Math.cos(a) * spread;
      vertexA.y += Math.sin(a) * spread;
      vertexA.z += Math.cos(a + 0.7) * spread;
      positions.setXYZ(i, vertexA.x, vertexA.y, vertexA.z);
      const brightness = 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(u * TAU * 3 - this.time * 2 + lane), 4);
      sizes.setX(i, (i % 9 === 0 ? 0.075 : 0.034) * brightness);
      const color = lane === 0 ? TEAL : lane === 1 ? GOLD : VIOLET;
      colors.setXYZ(i, color.r * 1.8, color.g * 1.8, color.b * 1.8);
    }
    positions.needsUpdate = sizes.needsUpdate = colors.needsUpdate = true;
  }

  private readonly tick = (now: number): void => {
    this.frame = null;
    if (this.disposed || this.failed || !this.visible || document.visibilityState === 'hidden') return;
    const delta = Math.min(Math.max((now - this.last) / 1000, 0), 0.05);
    this.last = now;
    if (!this.props.paused && !this.props.reducedMotion) this.time += delta;
    if (this.morph < 1) {
      this.morph = Math.min(1, this.morph + delta / 1.4);
      const mix = this.morph * this.morph * (3 - 2 * this.morph);
      this.weekWeight = this.weekFrom + ((this.mode === 'week' ? 1 : 0) - this.weekFrom) * mix;
      for (const key of ['ribbon', 'nodes', 'scales'] as const) {
        for (let i = 0; i < this.pose[key].length; i++) this.pose[key][i] = this.from[key][i] + (this.target[key][i] - this.from[key][i]) * mix;
      }
      this.paintGeometry();
    }
    this.updateObjects();
    this.render(delta);
    this.dirty = false;
    this.synchronizeLoop();
  };

  private render(delta: number): void {
    if (this.disposed || this.failed) return;
    try {
      if (this.composer) this.composer.render(delta);
      else this.renderer.render(this.scene, this.camera);
    } catch { this.fail(); }
  }

  private synchronizeLoop(): void {
    const active = this.initialized && !this.disposed && !this.failed && this.visible && document.visibilityState !== 'hidden';
    const needsFrame = this.dirty || this.morph < 1 || (!this.props.paused && !this.props.reducedMotion);
    if (active && needsFrame && this.frame === null) {
      this.last = performance.now();
      this.frame = requestAnimationFrame(this.tick);
    } else if (!active && this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }

  private readonly visibilityChanged = (): void => { this.dirty = true; this.synchronizeLoop(); };
  private readonly contextLost = (event: Event): void => { event.preventDefault(); this.fail(); };
  private fail(): void {
    if (this.failed || this.disposed) return;
    this.failed = true;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.callbacks.ready(false);
  }

  private hit(event: PointerEvent | MouseEvent): number {
    if (!this.initialized) return -1;
    const rect = this.canvas!.getBoundingClientRect();
    this.pointerNdc.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    this.scene.updateMatrixWorld(true);
    // Recompute bounds because morphing changes instance matrices.
    this.crystals.computeBoundingSphere();
    const intersections = this.raycaster.intersectObject(this.crystals);
    const first = intersections.find((hit) => hit.instanceId !== undefined && this.days[hit.instanceId]
      && this.pose.scales[hit.instanceId] > 0.008 && hit.instanceId >= this.days.length - this.props.windowSize
      && (hit.instanceId - Math.max(0, this.days.length - this.props.windowSize)) / Math.max(1, Math.min(this.days.length, this.props.windowSize) - 1) <= this.props.reveal);
    if (first?.instanceId !== undefined) return first.instanceId;
    // A precise 3D raycast leads; a small projected target makes year-sized crystals usable.
    const start = Math.max(0, this.days.length - this.props.windowSize);
    let nearest = -1;
    let distance = 15 * 15;
    for (let i = start; i < this.days.length; i++) {
      if (this.pose.scales[i] < 0.008 || (i - start) / Math.max(1, this.days.length - start - 1) > this.props.reveal) continue;
      vertexA.fromArray(this.pose.nodes, i * 3).applyMatrix4(this.sculpture.matrixWorld).project(this.camera);
      if (vertexA.z < -1 || vertexA.z > 1) continue;
      const dx = (vertexA.x - this.pointerNdc.x) * rect.width * 0.5;
      const dy = (vertexA.y - this.pointerNdc.y) * rect.height * 0.5;
      const squared = dx * dx + dy * dy;
      if (squared < distance) { nearest = i; distance = squared; }
    }
    return nearest;
  }

  private readonly pointerMove = (event: PointerEvent): void => {
    if (this.drag && this.drag.id === event.pointerId) {
      const dx = event.clientX - this.drag.x;
      const dy = event.clientY - this.drag.y;
      if (!this.drag.active && Math.abs(dx) > 6 && (!this.drag.touch || Math.abs(dx) > Math.abs(dy) * 1.25)) {
        this.drag.active = true;
        this.canvas?.setPointerCapture(event.pointerId);
      }
      if (this.drag.active) {
        this.dragRotation.x += dx * 0.007;
        this.dragRotation.y = Math.max(-0.8, Math.min(0.8, this.dragRotation.y + dy * 0.004));
        this.drag.moved = true;
        this.drag.x = event.clientX;
        this.drag.y = event.clientY;
        this.dirty = true;
        this.synchronizeLoop();
        return;
      }
    }
    if (event.pointerType === 'touch') return;
    const rect = this.canvas!.getBoundingClientRect();
    this.pointerTarget.set((event.clientX - rect.left) / rect.width * 2 - 1, (event.clientY - rect.top) / rect.height * 2 - 1);
    const hovered = this.hit(event);
    if (hovered !== this.hovered) {
      this.hovered = hovered;
      this.canvas!.style.cursor = hovered >= 0 ? 'pointer' : 'default';
    }
    this.dirty = true;
    this.synchronizeLoop();
  };
  private readonly pointerDown = (event: PointerEvent): void => {
    if (!event.isPrimary || event.button !== 0) return;
    this.suppressClick = false;
    this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, active: false, touch: event.pointerType === 'touch' };
  };
  private readonly pointerUp = (event: PointerEvent): void => {
    if (this.drag?.id !== event.pointerId) return;
    this.suppressClick = this.drag.moved;
    if (this.canvas?.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
    this.drag = null;
  };
  private readonly pointerCancel = (): void => { this.drag = null; this.suppressClick = true; };
  private readonly pointerLeave = (): void => {
    this.hovered = -1;
    this.pointerTarget.set(0, 0);
    if (this.canvas) this.canvas.style.cursor = 'default';
    this.dirty = true;
    this.synchronizeLoop();
  };
  private readonly click = (event: MouseEvent): void => {
    if (this.suppressClick) { this.suppressClick = false; return; }
    const index = this.hit(event);
    if (index >= 0) this.callbacks.select(this.days[index].date);
  };

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.observer?.disconnect();
    this.intersection?.disconnect();
    document.removeEventListener('visibilitychange', this.visibilityChanged);
    this.canvas?.removeEventListener('webglcontextlost', this.contextLost);
    this.canvas?.removeEventListener('pointermove', this.pointerMove);
    this.canvas?.removeEventListener('pointerdown', this.pointerDown);
    this.canvas?.removeEventListener('pointerup', this.pointerUp);
    this.canvas?.removeEventListener('pointercancel', this.pointerCancel);
    this.canvas?.removeEventListener('pointerleave', this.pointerLeave);
    this.canvas?.removeEventListener('click', this.click);
    this.composer?.dispose();
    const geometries = new Set<BufferGeometry>();
    this.scene.traverse((object) => {
      if (object instanceof Mesh || object instanceof Points || object instanceof Line) geometries.add(object.geometry);
    });
    geometries.forEach((geometry) => geometry.dispose());
    this.materials.forEach((material) => material.dispose());
    this.renderer?.dispose();
    this.canvas?.remove();
  }
}
