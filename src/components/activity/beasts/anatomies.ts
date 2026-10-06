import {
  AdditiveBlending, BoxGeometry, BufferAttribute, BufferGeometry, CatmullRomCurve3, Color,
  ConeGeometry, CylinderGeometry, DoubleSide, Group, IcosahedronGeometry, Mesh,
  OctahedronGeometry, Shape, ShapeGeometry, ShaderMaterial, SphereGeometry, TorusGeometry,
  TubeGeometry, Vector2, Vector3,
} from 'three';
import type { BeastKind } from '@/activity/projects/model';
import { CORE_FRAGMENT, MEMBRANE_FRAGMENT, METAL_FRAGMENT, SURFACE_VERTEX } from './shaders';

type XYZ = [number, number, number];
type Spine = (u: number, time: number, target: Vector3) => void;
type Tube = { mesh: Mesh<BufferGeometry, ShaderMaterial>; update: (time: number) => void; at: (u: number, time: number, target: Vector3) => void };
type Animate = (time: number, gaze: Vector2, energy: number) => void;

export interface BeastRig {
  root: Group;
  kind: BeastKind;
  variation: number;
  materialList: ShaderMaterial[];
  animate: Animate;
  setFade: (fade: number) => void;
  setEnergy: (energy: number) => void;
}

const TEAL = '#3a9e88';
const BRASS = '#bd8b43';
const GOLD = '#e2ae54';
const VIOLET = '#705d96';
const DARK = '#0b2626';
const TAU = Math.PI * 2;
const up = new Vector3(0, 1, 0);
const forward = new Vector3(0, 0, 1);
const point = new Vector3();
const next = new Vector3();

/** A tiny procedural atelier: independent materials and rigs for each summoned anatomy. */
class Atelier {
  readonly root = new Group();
  readonly materials: ShaderMaterial[] = [];
  readonly animations: Animate[] = [];
  readonly uTime = { value: 0 };
  readonly uEnergy = { value: 0.5 };
  readonly uFade = { value: 1 };
  private readonly cache = new Map<string, ShaderMaterial>();

  constructor(readonly seed: number) {}

  material(color: string, type: 'metal' | 'glass' | 'light' = 'metal', texture = 0.35): ShaderMaterial {
    const key = `${color}:${type}:${texture}`;
    const cached = this.cache.get(key);
    if (cached) return cached;
    const material = new ShaderMaterial({
      vertexShader: SURFACE_VERTEX,
      fragmentShader: type === 'glass' ? MEMBRANE_FRAGMENT : type === 'light' ? CORE_FRAGMENT : METAL_FRAGMENT,
      uniforms: { uTime: this.uTime, uEnergy: this.uEnergy, uFade: this.uFade,
        uSeed: { value: this.seed }, uColor: { value: new Color(color) },
        uTexture: { value: texture }, uWave: { value: type === 'glass' ? 0.045 : 0 } },
      side: DoubleSide,
      transparent: type !== 'metal',
      depthWrite: type === 'metal',
      blending: type === 'light' ? AdditiveBlending : undefined,
    });
    this.materials.push(material);
    this.cache.set(key, material);
    return material;
  }

  mesh(geometry: BufferGeometry, material: ShaderMaterial, position: XYZ = [0, 0, 0], scale: XYZ = [1, 1, 1], parent = this.root): Mesh<BufferGeometry, ShaderMaterial> {
    const object = new Mesh(geometry, material);
    object.position.set(...position);
    object.scale.set(...scale);
    object.frustumCulled = false;
    parent.add(object);
    return object;
  }

  crystal(position: XYZ, scale: XYZ, color = TEAL, parent = this.root): Mesh<BufferGeometry, ShaderMaterial> {
    return this.mesh(new IcosahedronGeometry(1, 0), this.material(color), position, scale, parent);
  }

  sphere(position: XYZ, scale: XYZ, color = TEAL, type: 'metal' | 'glass' | 'light' = 'metal', parent = this.root): Mesh<BufferGeometry, ShaderMaterial> {
    return this.mesh(new SphereGeometry(1, 24, 16), this.material(color, type), position, scale, parent);
  }

  ring(position: XYZ, radius: number, thickness: number, color = BRASS, parent = this.root): Mesh<BufferGeometry, ShaderMaterial> {
    return this.mesh(new TorusGeometry(radius, thickness, 6, 72), this.material(color), position, [1, 1, 1], parent);
  }

  wire(points: XYZ[], radius = 0.014, color = BRASS, parent = this.root, light = false): Mesh<BufferGeometry, ShaderMaterial> {
    const curve = new CatmullRomCurve3(points.map((p) => new Vector3(...p)));
    return this.mesh(new TubeGeometry(curve, Math.max(24, points.length * 10), radius, 6, false), this.material(color, light ? 'light' : 'metal'), [0, 0, 0], [1, 1, 1], parent);
  }

  spike(position: XYZ, radius: number, length: number, color = BRASS, parent = this.root): Mesh<BufferGeometry, ShaderMaterial> {
    return this.mesh(new ConeGeometry(radius, length, 6), this.material(color), position, [1, 1, 1], parent);
  }

  eye(position: XYZ, radius: number, parent = this.root, color = '#84e6bb', phase = 0): Group {
    const eye = new Group();
    eye.position.set(...position);
    parent.add(eye);
    this.sphere([0, 0, 0], [radius, radius * 0.95, radius * 0.55], '#020c0c', 'metal', eye);
    const rim = this.ring([0, 0, radius * 0.17], radius * 0.93, radius * 0.075, BRASS, eye);
    rim.scale.y = 0.95;
    const iris = new Group();
    iris.position.z = radius * 0.52;
    eye.add(iris);
    this.sphere([0, 0, 0], [radius * 0.43, radius * 0.58, radius * 0.22], color, 'light', iris);
    this.sphere([0, 0, radius * 0.2], [radius * 0.13, radius * 0.39, radius * 0.11], '#021010', 'metal', iris);
    this.sphere([-radius * 0.12, radius * 0.19, radius * 0.22], [radius * 0.1, radius * 0.1, radius * 0.06], '#f4e5b3', 'light', iris);
    this.animations.push((time, gaze) => {
      iris.position.x = gaze.x * radius * 0.24;
      iris.position.y = gaze.y * radius * 0.18;
      const blink = Math.pow(Math.max(0, Math.sin(time * 0.41 + phase + 4.3)), 36);
      eye.scale.y = 1 - blink * 0.88;
    });
    return eye;
  }

  tube(spine: Spine, radius: (u: number) => number, color = TEAL, type: 'metal' | 'glass' | 'light' = 'metal', parent = this.root, segments = 48): Tube {
    const radial = 8;
    const geometry = new BufferGeometry();
    const positions = new Float32Array((segments + 1) * (radial + 1) * 3);
    const normals = new Float32Array(positions.length);
    const uv = new Float32Array((segments + 1) * (radial + 1) * 2);
    const indices: number[] = [];
    for (let i = 0; i <= segments; i++) for (let j = 0; j <= radial; j++) {
      uv.set([i / segments, j / radial], (i * (radial + 1) + j) * 2);
      if (i < segments && j < radial) {
        const a = i * (radial + 1) + j;
        const b = a + radial + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new BufferAttribute(uv, 2));
    geometry.setIndex(indices);
    const mesh = this.mesh(geometry, this.material(color, type), [0, 0, 0], [1, 1, 1], parent);
    const center = new Vector3();
    const ahead = new Vector3();
    const tangent = new Vector3();
    const normal = new Vector3();
    const binormal = new Vector3();
    const update = (time: number) => {
      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        spine(u, time, center);
        spine(Math.min(1.001, u + 0.0008), time, ahead);
        tangent.subVectors(ahead, center).normalize();
        normal.crossVectors(tangent, Math.abs(tangent.z) > 0.9 ? up : forward).normalize();
        binormal.crossVectors(tangent, normal).normalize();
        const r = radius(u);
        for (let j = 0; j <= radial; j++) {
          const a = j / radial * TAU;
          const nx = normal.x * Math.cos(a) + binormal.x * Math.sin(a);
          const ny = normal.y * Math.cos(a) + binormal.y * Math.sin(a);
          const nz = normal.z * Math.cos(a) + binormal.z * Math.sin(a);
          const k = (i * (radial + 1) + j) * 3;
          positions[k] = center.x + nx * r; positions[k + 1] = center.y + ny * r; positions[k + 2] = center.z + nz * r;
          normals[k] = nx; normals[k + 1] = ny; normals[k + 2] = nz;
        }
      }
      geometry.getAttribute('position').needsUpdate = true;
      geometry.getAttribute('normal').needsUpdate = true;
    };
    update(0);
    return { mesh, update, at: spine };
  }

  finish(kind: BeastKind, animate?: Animate): BeastRig {
    return { root: this.root, kind, variation: 0.97 + this.seed / TAU * 0.055, materialList: this.materials,
      animate: (time, gaze, energy) => {
        this.uTime.value = time;
        this.uEnergy.value = energy;
        for (const step of this.animations) step(time, gaze, energy);
        animate?.(time, gaze, energy);
      },
      setFade: (fade) => { this.uFade.value = fade; },
      setEnergy: (energy) => { this.uEnergy.value = energy; },
    };
  }
}

function hydra(a: Atelier): BeastRig {
  const body = new Group();
  body.position.y = -0.8;
  a.root.add(body);
  a.sphere([0, 0, 0], [0.76, 0.6, 0.53], DARK, 'metal', body);
  const heart = a.crystal([0, 0.07, 0.5], [0.28, 0.34, 0.2], GOLD, body);
  for (let i = 0; i < 8; i++) {
    const angle = i / 8 * TAU;
    const plate = a.crystal([Math.cos(angle) * 0.61, Math.sin(angle) * 0.38, 0.14], [0.3, 0.43, 0.2], i % 3 ? TEAL : BRASS, body);
    plate.rotation.z = angle - Math.PI / 2;
  }
  const heads: { tube: Tube; head: Group; rings: Mesh<BufferGeometry, ShaderMaterial>[]; phase: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const lane = i - 3;
    const phase = i * 1.1 + a.seed;
    const spine: Spine = (u, time, out) => {
      const sway = Math.sin(time * 0.64 + phase + u * 3) * 0.12 * u;
      out.set(lane * 0.63 * Math.pow(u, 1.4) + Math.sin(u * Math.PI * 1.6 + phase) * 0.28 * Math.sin(u * Math.PI) + sway,
        -0.72 + u * (2.15 + (3 - Math.abs(lane)) * 0.23) + Math.sin(u * Math.PI * 2 + time * 0.45 + phase) * 0.15 * u,
        Math.cos(phase) * 0.18 + Math.sin(u * Math.PI * 1.5 + phase) * 0.35 + Math.sin(time * 0.48 + phase) * 0.1 * u);
    };
    const tube = a.tube(spine, (u) => 0.14 - u * 0.038, i % 2 ? VIOLET : TEAL);
    const head = new Group();
    a.root.add(head);
    const helmet = a.crystal([0, 0, 0], [0.27, 0.35, 0.22], i % 3 === 0 ? BRASS : TEAL, head);
    helmet.rotation.z = 0.3;
    a.sphere([0, -0.07, 0.19], [0.26, 0.17, 0.14], DARK, 'metal', head);
    a.eye([-0.12, 0.04, 0.23], 0.085, head, i % 2 ? '#e9b65c' : '#86e3b6', phase);
    a.eye([0.12, 0.04, 0.23], 0.085, head, i % 2 ? '#e9b65c' : '#86e3b6', phase);
    const hornL = a.spike([-0.2, 0.26, -0.03], 0.075, 0.44, BRASS, head);
    hornL.rotation.z = 0.34;
    const hornR = a.spike([0.2, 0.26, -0.03], 0.075, 0.44, BRASS, head);
    hornR.rotation.z = -0.34;
    a.wire([[-0.22, -0.06, 0.09], [-0.19, -0.21, 0.16], [0, -0.28, 0.19], [0.19, -0.21, 0.16], [0.22, -0.06, 0.09]], 0.013, GOLD, head);
    const rings = Array.from({ length: 6 }, () => a.ring([0, 0, 0], 0.143, 0.018, BRASS));
    heads.push({ tube, head, rings, phase });
  }
  const tails: Tube[] = [];
  for (let i = 0; i < 5; i++) {
    const phase = i * TAU / 5;
    tails.push(a.tube((u, time, out) => {
      const angle = phase + u * 1.8 + Math.sin(time * 0.6 + phase) * u * 0.18;
      const radius = 0.4 + u * 1.0;
      out.set(Math.cos(angle) * radius, -0.95 - u * 0.8 + Math.sin(u * Math.PI) * 0.15, Math.sin(angle) * radius * 0.53);
    }, (u) => 0.085 * (1 - u) + 0.01, i % 2 ? BRASS : TEAL));
  }
  const crest = a.ring([0, 0.35, -0.6], 1.8, 0.009, GOLD);
  crest.scale.y = 1.08;
  return a.finish('hydra', (time, gaze) => {
    heart.rotation.y = time * 0.28;
    crest.rotation.z = -time * 0.055;
    for (const { tube, head, rings, phase } of heads) {
      tube.update(time);
      tube.at(1, time, head.position);
      head.rotation.set(gaze.y * 0.13 + Math.sin(time * 0.4 + phase) * 0.08, gaze.x * 0.22 + Math.sin(time * 0.3 + phase) * 0.1, Math.sin(time * 0.53 + phase) * 0.08);
      rings.forEach((ring, j) => {
        const u = 0.12 + j * 0.14;
        tube.at(u, time, ring.position);
        tube.at(u + 0.001, time, next);
        point.subVectors(next, ring.position).normalize();
        ring.quaternion.setFromUnitVectors(forward, point);
        ring.scale.setScalar(1 - u * 0.25);
      });
    }
    tails.forEach((tail) => tail.update(time));
  });
}

function sentinel(a: Atelier): BeastRig {
  const torso = new Group();
  a.root.add(torso);
  const breast = a.mesh(new OctahedronGeometry(1, 0), a.material(TEAL, 'metal', 0.5), [0, 0.25, 0], [0.76, 1.05, 0.43], torso);
  breast.rotation.y = Math.PI / 4;
  a.crystal([0, 0.4, 0.4], [0.23, 0.32, 0.15], GOLD, torso);
  const seal = a.ring([0, 0.4, 0.47], 0.29, 0.014, BRASS, torso);
  for (let i = 0; i < 5; i++) {
    const rib = a.ring([0, 0.13 - i * 0.2, 0], 0.54 - i * 0.045, 0.027, i % 2 ? TEAL : BRASS, torso);
    rib.rotation.x = Math.PI / 2;
    rib.scale.y = 0.62;
  }
  const head = new Group();
  head.position.set(0, 1.42, 0.03);
  a.root.add(head);
  a.mesh(new OctahedronGeometry(1, 0), a.material(TEAL), [0, 0, 0], [0.43, 0.59, 0.36], head).rotation.y = Math.PI / 4;
  a.mesh(new BoxGeometry(0.64, 0.12, 0.12), a.material('#031c20'), [0, 0.03, 0.34], [1, 1, 1], head);
  a.eye([-0.16, 0.03, 0.39], 0.075, head, '#88e1c5', 0.4);
  a.eye([0.16, 0.03, 0.39], 0.075, head, '#88e1c5', 0.4);
  for (let i = -1; i <= 1; i++) a.spike([i * 0.19, 0.5 + (i === 0 ? 0.1 : 0), 0], 0.07, i === 0 ? 0.48 : 0.35, BRASS, head);
  const halo = a.ring([0, 1.15, -0.64], 0.99, 0.012, GOLD);
  const arms: { shoulder: Group; forearm: Group; hand: Group; sign: number }[] = [];
  for (const sign of [-1, 1]) {
    const shoulder = new Group();
    shoulder.position.set(sign * 0.79, 0.63, 0);
    a.root.add(shoulder);
    const pauldron = a.crystal([sign * 0.16, 0.07, 0], [0.51, 0.42, 0.36], BRASS, shoulder);
    pauldron.rotation.z = -sign * 0.45;
    a.sphere([sign * 0.17, -0.23, 0], [0.15, 0.15, 0.15], '#67c9b0', 'light', shoulder);
    a.mesh(new CylinderGeometry(0.19, 0.14, 0.64, 6), a.material(TEAL), [sign * 0.18, -0.59, 0], [1, 1, 1], shoulder);
    const forearm = new Group();
    forearm.position.set(sign * 0.18, -0.93, 0);
    shoulder.add(forearm);
    a.sphere([0, 0, 0], [0.12, 0.12, 0.12], '#e0b864', 'light', forearm);
    const plate = a.crystal([0, -0.38, 0.04], [0.25, 0.43, 0.19], TEAL, forearm);
    plate.rotation.y = sign * 0.4;
    const hand = new Group();
    hand.position.set(0, -0.8, 0.03);
    forearm.add(hand);
    a.crystal([0, 0, 0], [0.16, 0.19, 0.15], BRASS, hand);
    for (let i = 0; i < 3; i++) {
      a.wire([[i * 0.08 - 0.08, -0.1, 0.05], [i * 0.1 - 0.1, -0.28, 0.1], [i * 0.08 - 0.08, -0.34, 0.2]], 0.028, TEAL, hand);
    }
    arms.push({ shoulder, forearm, hand, sign });
  }
  const coat: Mesh<BufferGeometry, ShaderMaterial>[] = [];
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.19;
    const plate = a.mesh(new ConeGeometry(0.3, 1.57 - Math.abs(i - 3) * 0.09, 3), a.material(i % 2 ? DARK : TEAL),
      [x, -1.14, i % 2 ? -0.13 : 0.08], [0.74, 1, 0.35]);
    plate.rotation.z = Math.PI + (i - 3) * 0.08;
    coat.push(plate);
  }
  return a.finish('sentinel', (time, gaze) => {
    head.rotation.set(gaze.y * 0.12, gaze.x * 0.23 + Math.sin(time * 0.35) * 0.07, Math.sin(time * 0.3) * 0.035);
    torso.rotation.y = Math.sin(time * 0.42) * 0.045;
    seal.rotation.z = time * 0.21;
    halo.rotation.z = -time * 0.08;
    arms.forEach(({ shoulder, forearm, hand, sign }) => {
      shoulder.rotation.z = sign * (0.16 + Math.sin(time * 0.65 + sign) * 0.09);
      forearm.rotation.x = -0.18 + Math.sin(time * 0.73 + sign) * 0.12;
      hand.rotation.y = Math.sin(time * 0.8 + sign) * 0.14;
    });
    coat.forEach((plate, i) => { plate.rotation.x = Math.sin(time * 0.58 + i * 0.6) * 0.08; });
  });
}

function wingShape(lower: boolean): Shape {
  const shape = new Shape();
  shape.moveTo(0, 0);
  if (!lower) {
    shape.bezierCurveTo(-0.6, 0.35, -1.45, 1.75, -2.44, 1.44);
    shape.bezierCurveTo(-2.99, 1.03, -2.45, 0.36, -2.06, 0.14);
    shape.bezierCurveTo(-1.87, -0.34, -0.72, -0.39, 0, 0);
  } else {
    shape.bezierCurveTo(-0.48, -0.12, -1.87, -0.48, -1.7, -1.5);
    shape.bezierCurveTo(-1.46, -2.11, -0.99, -1.76, -0.6, -1.16);
    shape.bezierCurveTo(-0.44, -0.55, -0.15, -0.26, 0, 0);
  }
  return shape;
}

function moth(a: Atelier): BeastRig {
  const wings: { pivot: Group; side: number; lower: boolean }[] = [];
  for (const sign of [-1, 1]) for (const lower of [false, true]) {
    const pivot = new Group();
    pivot.position.set(sign * 0.1, lower ? -0.18 : 0.33, -0.12);
    pivot.scale.x = -sign;
    a.root.add(pivot);
    const shape = wingShape(lower);
    const geometry = new ShapeGeometry(shape, 48);
    const positions = geometry.getAttribute('position');
    const uv = geometry.getAttribute('uv');
    for (let i = 0; i < positions.count; i++) {
      uv.setXY(i, -positions.getX(i) / 3, (positions.getY(i) + 2.15) / 4);
      positions.setZ(i, Math.sin(-positions.getX(i) * 0.85) * 0.14);
    }
    geometry.computeVertexNormals();
    a.mesh(geometry, a.material(lower ? VIOLET : TEAL, 'glass'), [0, 0, 0], [1, 1, 1], pivot);
    const boundary = shape.getPoints(72).map((p): XYZ => [p.x, p.y, Math.sin(-p.x * 0.85) * 0.14]);
    a.wire(boundary, 0.013, BRASS, pivot);
    const veinEnds: XYZ[] = lower ? [[-0.67, -1.15, 0.12], [-1.14, -1.74, 0.13], [-1.57, -1.43, 0.14], [-1.54, -0.61, 0.14]]
      : [[-1.1, 0.97, 0.1], [-1.8, 1.46, 0.14], [-2.45, 1.21, 0.13], [-2.58, 0.64, 0.12], [-2.08, 0.18, 0.14], [-1.33, -0.12, 0.13]];
    veinEnds.forEach((end, i) => {
      a.wire([[0, 0, 0.02], [end[0] * 0.43, end[1] * 0.24 + (lower ? -0.15 : 0.1), 0.09], end], 0.009, i % 2 ? TEAL : BRASS, pivot, true);
    });
    if (!lower) {
      const eye = a.ring([-1.77, 0.69, 0.17], 0.32, 0.014, GOLD, pivot);
      eye.scale.set(0.78, 1.1, 1);
      a.sphere([-1.77, 0.69, 0.17], [0.16, 0.23, 0.035], '#284b4e', 'glass', pivot);
      a.crystal([-1.77, 0.69, 0.19], [0.058, 0.12, 0.06], GOLD, pivot);
    }
    wings.push({ pivot, side: sign, lower });
  }
  a.sphere([0, 0, 0], [0.21, 0.95, 0.19], DARK);
  for (let i = 0; i < 8; i++) {
    const ring = a.ring([0, 0.38 - i * 0.15, 0], 0.205 - i * 0.014, 0.022, i % 2 ? TEAL : BRASS);
    ring.rotation.x = Math.PI / 2;
  }
  const head = new Group();
  head.position.set(0, 0.89, 0.04);
  a.root.add(head);
  a.sphere([0, 0, 0], [0.33, 0.31, 0.26], TEAL, 'metal', head);
  a.eye([-0.2, 0.04, 0.22], 0.14, head, '#dfbd75', 0.7);
  a.eye([0.2, 0.04, 0.22], 0.14, head, '#dfbd75', 0.7);
  const antennae: Tube[] = [];
  for (const sign of [-1, 1]) {
    const antenna = a.tube((u, time, out) => {
      out.set(sign * (0.14 + u * 0.39 + Math.sin(u * 3) * 0.25), 0.95 + u * 1.08,
        Math.sin(u * 2.5 + time * 0.5) * 0.11);
    }, (u) => 0.032 - u * 0.021, BRASS);
    antennae.push(antenna);
    a.sphere([sign * 0.28, 0.4, 0.05], [0.1, 0.1, 0.1], GOLD, 'metal');
    for (let i = 0; i < 3; i++) {
      a.wire([[sign * 0.16, 0.05 - i * 0.19, 0.08], [sign * 0.52, -0.14 - i * 0.18, 0.15], [sign * 0.68, -0.55 - i * 0.18, 0.22]], 0.019, BRASS);
    }
  }
  return a.finish('moth', (time, gaze, energy) => {
    wings.forEach(({ pivot, side, lower }) => {
      pivot.rotation.y = side * (0.21 + Math.sin(time * (1.15 + energy * 0.25) + (lower ? 0.55 : 0)) * (lower ? 0.26 : 0.4));
      pivot.rotation.z = side * Math.sin(time * 0.55) * 0.025;
    });
    head.rotation.y = gaze.x * 0.15;
    head.rotation.x = gaze.y * 0.12;
    antennae.forEach((antenna) => antenna.update(time));
  });
}

function nautilus(a: Atelier): BeastRig {
  const shell = new Group();
  shell.position.set(0, 0.5, -0.1);
  a.root.add(shell);
  const spiral: Spine = (u, _time, out) => {
    const angle = u * TAU * 2.45 + 0.65;
    const r = 0.09 + Math.pow(u, 1.7) * 1.31;
    out.set(Math.cos(angle) * r, Math.sin(angle) * r, Math.sin(u * Math.PI) * 0.13);
  };
  const coil = a.tube(spiral, (u) => 0.055 + Math.pow(u, 1.7) * 0.24, TEAL, 'metal', shell, 160);
  for (let i = 0; i < 36; i++) {
    const u = 0.1 + i / 39 * 0.9;
    coil.at(u, 0, point);
    coil.at(u + 0.001, 0, next);
    next.sub(point).normalize();
    const rib = a.ring([point.x, point.y, point.z], 0.055 + Math.pow(u, 1.7) * 0.245, 0.014, i % 3 ? BRASS : GOLD, shell);
    rib.quaternion.setFromUnitVectors(forward, next);
  }
  const pearl = a.sphere([0, 0, 0.13], [0.13, 0.13, 0.13], '#a5e2ca', 'light', shell);
  const bell = new Group();
  bell.position.set(0, -0.48, 0.15);
  a.root.add(bell);
  a.mesh(new SphereGeometry(1, 40, 24, 0, TAU, 0, Math.PI / 2), a.material(TEAL, 'glass'), [0, 0, 0], [0.77, 0.6, 0.67], bell);
  const lip = a.ring([0, 0, 0], 0.71, 0.025, GOLD, bell);
  lip.rotation.x = Math.PI / 2;
  a.sphere([0, 0.08, 0], [0.33, 0.32, 0.3], DARK, 'metal', bell);
  a.eye([-0.2, 0.14, 0.33], 0.095, bell, '#b4ecdb', 1.3);
  a.eye([0.2, 0.14, 0.33], 0.095, bell, '#b4ecdb', 1.3);
  const tentacles: { tube: Tube; tip: Mesh<BufferGeometry, ShaderMaterial>; phase: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const phase = i / 12 * TAU;
    const length = 1.25 + (0.5 + 0.5 * Math.sin(i * 2.7)) * 0.9;
    const spine: Spine = (u, time, out) => {
      const swell = 0.42 + u * 0.39;
      out.set(Math.cos(phase) * swell + Math.sin(u * 7.3 - time * 0.84 + phase) * 0.25 * u,
        -0.48 - u * length + Math.sin(u * 5.3 + time * 0.52 + phase) * u * 0.11,
        0.1 + Math.sin(phase) * swell * 0.65 + Math.cos(u * 6.1 - time * 0.72 + phase) * 0.22 * u);
    };
    const tube = a.tube(spine, (u) => 0.034 * (1 - u) + 0.012, i % 3 === 0 ? GOLD : TEAL, i % 2 ? 'glass' : 'metal');
    const tip = a.sphere([0, 0, 0], [0.037, 0.065, 0.037], i % 3 ? '#7edec5' : '#e4bd6c', 'light');
    tentacles.push({ tube, tip, phase });
  }
  return a.finish('nautilus', (time, gaze) => {
    shell.rotation.set(Math.sin(time * 0.35) * 0.06, Math.sin(time * 0.28) * 0.09, Math.sin(time * 0.32) * 0.07);
    pearl.scale.setScalar(0.13 * (1 + Math.sin(time * 1.6) * 0.08));
    bell.scale.set(1 + Math.sin(time * 1.15) * 0.035, 1 - Math.sin(time * 1.15) * 0.05, 1);
    bell.rotation.y = gaze.x * 0.08;
    tentacles.forEach(({ tube, tip }) => { tube.update(time); tube.at(1, time, tip.position); });
  });
}

function golem(a: Atelier): BeastRig {
  const torso = new Group();
  torso.position.y = -0.02;
  a.root.add(torso);
  const breast = a.crystal([0, 0.08, 0], [0.91, 1.02, 0.6], TEAL, torso);
  breast.rotation.y = 0.2;
  const core = a.crystal([0, 0.24, 0.52], [0.24, 0.31, 0.17], GOLD, torso);
  for (let i = 0; i < 12; i++) {
    const angle = i / 12 * TAU;
    const rock = a.crystal([Math.cos(angle) * 0.72, Math.sin(angle) * 0.78, 0.04], [0.34, 0.35 + (i % 3) * 0.08, 0.38], i % 4 === 0 ? BRASS : i % 3 ? TEAL : DARK, torso);
    rock.rotation.set(i * 0.33, i * 0.7, angle);
  }
  const head = new Group();
  head.position.set(0, 1.2, 0.07);
  a.root.add(head);
  const skull = a.crystal([0, 0, 0], [0.55, 0.51, 0.48], TEAL, head);
  skull.rotation.set(0.15, 0.2, 0.17);
  a.mesh(new BoxGeometry(0.94, 0.15, 0.39), a.material(DARK), [0, 0.07, 0.36], [1, 1, 1], head);
  a.eye([-0.22, -0.02, 0.43], 0.115, head, '#e2b35d', 0.2);
  a.eye([0.22, -0.02, 0.43], 0.115, head, '#e2b35d', 0.2);
  a.crystal([0, -0.24, 0.33], [0.28, 0.16, 0.19], BRASS, head);
  const arms: { pivot: Group; elbow: Group; sign: number }[] = [];
  const feet: Group[] = [];
  for (const sign of [-1, 1]) {
    const pivot = new Group();
    pivot.position.set(sign * 0.99, 0.52, 0);
    a.root.add(pivot);
    a.crystal([sign * 0.18, 0, 0], [0.61, 0.56, 0.48], BRASS, pivot).rotation.z = sign * 0.3;
    a.sphere([sign * 0.22, -0.4, 0], [0.12, 0.12, 0.12], '#d3a76a', 'light', pivot);
    a.crystal([sign * 0.28, -0.54, 0], [0.35, 0.47, 0.37], TEAL, pivot);
    const elbow = new Group();
    elbow.position.set(sign * 0.32, -0.88, 0);
    pivot.add(elbow);
    a.crystal([0, -0.22, 0.06], [0.45, 0.41, 0.4], DARK, elbow);
    const fist = a.crystal([0, -0.61, 0.07], [0.43, 0.38, 0.4], TEAL, elbow);
    fist.rotation.y = 0.5;
    for (let i = 0; i < 4; i++) a.crystal([(i - 1.5) * 0.16, -0.69, 0.35], [0.105, 0.18, 0.15], i % 2 ? BRASS : TEAL, elbow);
    arms.push({ pivot, elbow, sign });
    const leg = new Group();
    leg.position.set(sign * 0.48, -0.88, 0.05);
    a.root.add(leg);
    a.crystal([0, -0.2, 0], [0.37, 0.46, 0.34], TEAL, leg);
    a.sphere([0, -0.52, 0], [0.1, 0.1, 0.1], '#bca868', 'light', leg);
    a.crystal([0, -0.75, 0.07], [0.31, 0.3, 0.31], DARK, leg);
    a.crystal([0, -1.01, 0.19], [0.44, 0.22, 0.47], BRASS, leg);
    feet.push(leg);
  }
  for (const sign of [-1, 1]) for (let i = 0; i < 3; i++) {
    const spike = a.crystal([sign * (0.48 + i * 0.19), 0.82 + i * 0.12, -0.17], [0.14, 0.48 - i * 0.06, 0.12], i % 2 ? BRASS : TEAL);
    spike.rotation.z = -sign * 0.45;
  }
  return a.finish('golem', (time, gaze) => {
    head.rotation.set(gaze.y * 0.08, gaze.x * 0.14 + Math.sin(time * 0.31) * 0.045, Math.sin(time * 0.3) * 0.025);
    torso.rotation.y = Math.sin(time * 0.45) * 0.05;
    core.rotation.z = Math.sin(time * 0.6) * 0.12;
    arms.forEach(({ pivot, elbow, sign }) => {
      pivot.rotation.z = sign * (0.08 + Math.sin(time * 0.56 + sign) * 0.07);
      elbow.rotation.x = -0.14 + Math.sin(time * 0.68 + sign) * 0.1;
    });
    feet.forEach((leg, i) => { leg.rotation.x = Math.sin(time * 0.58 + i * Math.PI) * 0.035; });
  });
}

function leafGeometry(length: number, width: number): BufferGeometry {
  const rows = 36;
  const columns = 8;
  const geometry = new BufferGeometry();
  const positions = new Float32Array((rows + 1) * (columns + 1) * 3);
  const uv = new Float32Array((rows + 1) * (columns + 1) * 2);
  const indices: number[] = [];
  for (let i = 0; i <= rows; i++) for (let j = 0; j <= columns; j++) {
    const u = i / rows;
    const side = j / columns * 2 - 1;
    const k = (i * (columns + 1) + j) * 3;
    const breadth = Math.pow(Math.sin(u * Math.PI), 0.85) * width;
    positions[k] = side * breadth + Math.sin(u * Math.PI) * length * 0.16;
    positions[k + 1] = u * length;
    positions[k + 2] = Math.sin(u * Math.PI) * (0.16 + Math.abs(side) * 0.18);
    uv.set([j / columns, u], (i * (columns + 1) + j) * 2);
    if (i < rows && j < columns) {
      const a = i * (columns + 1) + j;
      const b = a + columns + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function sprout(a: Atelier): BeastRig {
  const seed = new Group();
  seed.position.y = -0.27;
  a.root.add(seed);
  a.sphere([0, 0, 0], [0.47, 0.61, 0.39], TEAL, 'metal', seed);
  a.wire([[0, -0.55, 0.12], [0.06, -0.28, 0.37], [0.04, 0.16, 0.39], [0, 0.54, 0.08]], 0.018, GOLD, seed);
  a.eye([-0.19, 0.02, 0.35], 0.125, seed, '#ace7ba', 0.8);
  a.eye([0.19, 0.02, 0.35], 0.125, seed, '#ace7ba', 0.8);
  a.wire([[-0.12, -0.17, 0.36], [0, -0.21, 0.385], [0.12, -0.17, 0.36]], 0.009, BRASS, seed);
  const stem = a.tube((u, time, out) => {
    out.set(Math.sin(u * 2.1 + time * 0.35) * 0.12 * u, 0.2 + u * 0.8, -0.05 + Math.sin(u * 2) * 0.06);
  }, (u) => 0.047 - u * 0.023, BRASS);
  const leaves: { pivot: Group; phase: number }[] = [];
  [[0, 0.75, -0.05, -0.18, 1.0], [-0.02, 0.62, -0.02, 0.88, 0.79], [0.06, 0.58, -0.05, -0.92, 0.85]].forEach(([x, y, z, angle, size], i) => {
    const pivot = new Group();
    pivot.position.set(x, y, z);
    pivot.rotation.z = angle;
    a.root.add(pivot);
    a.mesh(leafGeometry(1.1 * size, 0.3 * size), a.material(i === 1 ? VIOLET : TEAL, 'glass'), [0, 0, 0], [1, 1, 1], pivot);
    a.wire([[0, 0, 0], [0.15 * size, 0.5 * size, 0.13], [0, 1.1 * size, 0]], 0.013, GOLD, pivot);
    for (const sign of [-1, 1]) {
      a.wire([[0, 0, 0], [sign * 0.23 * size + 0.12 * size, 0.45 * size, 0.27], [0, 1.1 * size, 0]], 0.007, TEAL, pivot, true);
    }
    a.sphere([0, 1.1 * size, 0], [0.04, 0.04, 0.04], '#e0c76f', 'light', pivot);
    leaves.push({ pivot, phase: angle });
  });
  const roots: Tube[] = [];
  for (let i = 0; i < 4; i++) roots.push(a.tube((u, time, out) => {
    const phase = i / 4 * TAU;
    out.set(Math.cos(phase) * u * 0.48 + Math.sin(u * 5 + time * 0.6 + phase) * 0.07 * u,
      -0.74 - u * 0.68, Math.sin(phase) * u * 0.3 + Math.cos(u * 4 + time * 0.4) * 0.06 * u);
  }, (u) => 0.025 * (1 - u) + 0.006, i % 2 ? BRASS : TEAL));
  return a.finish('sprout', (time, gaze) => {
    seed.rotation.y = gaze.x * 0.12;
    stem.update(time);
    roots.forEach((root) => root.update(time));
    leaves.forEach(({ pivot, phase }) => {
      pivot.rotation.y = Math.sin(time * 0.65 + phase) * 0.22;
      pivot.rotation.x = Math.sin(time * 0.8 + phase) * 0.1;
    });
  });
}

/** Identity perturbs pigment and phase only. Anatomy is an editorial emblem, never an inferred project score. */
export function createBeast(kind: BeastKind, identity: string): BeastRig {
  let hash = 2166136261;
  for (const c of identity) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  const atelier = new Atelier((hash >>> 0) / 4294967295 * TAU);
  const builders = { hydra, sentinel, moth, nautilus, golem, sprout };
  return builders[kind](atelier);
}

export function disposeBeast(rig: BeastRig): void {
  const geometries = new Set<BufferGeometry>();
  rig.root.traverse((object) => { if (object instanceof Mesh) geometries.add(object.geometry); });
  geometries.forEach((geometry) => geometry.dispose());
  rig.materialList.forEach((material) => material.dispose());
  rig.root.removeFromParent();
}
