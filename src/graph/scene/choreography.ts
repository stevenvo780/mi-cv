import type { LayoutName } from '../layout-names';
import { CAMERA0 } from '../camera0';

/** Orden de las secciones en el DOM (atributo data-section). */
export const SECTIONS = ['hero', 'metodo', 'trayectoria', 'frentes', 'prueba', 'contacto'] as const;
export type SectionId = (typeof SECTIONS)[number];

export const SECTION_LAYOUT: Record<SectionId, LayoutName> = {
  hero: 'red',
  metodo: 'hemisferios',
  trayectoria: 'helice',
  frentes: 'clusters',
  prueba: 'clusters',
  contacto: 'lemniscata',
};

export interface Pose {
  distance: number;
  yaw: number;
  pitch: number;
  /** Punto del grafo (espacio normalizado) que queda en el centro. */
  target: [number, number, number];
  /** Desplazamiento lateral del grafo en pantallas anchas (texto a la izquierda). */
  shiftX: number;
  /** Intensidad global de la escena (1 = plena). */
  dim: number;
}

export const SECTION_POSE: Record<SectionId, Pose> = {
  hero: { distance: CAMERA0.distance, yaw: CAMERA0.yaw, pitch: CAMERA0.pitch, target: [0, 0, 0], shiftX: 0, dim: 1 },
  metodo: { distance: 3.9, yaw: 0, pitch: -0.08, target: [0, 0, 0], shiftX: 0, dim: 0.8 },
  trayectoria: { distance: 3.2, yaw: 0.9, pitch: -0.32, target: [0, 0, 0], shiftX: 0.55, dim: 0.9 },
  frentes: { distance: 2.7, yaw: 0.35, pitch: -0.2, target: [0, 0, 0], shiftX: 0.6, dim: 0.9 },
  prueba: { distance: 4.9, yaw: 1.25, pitch: -0.3, target: [0, 0, 0], shiftX: 0, dim: 0.35 },
  contacto: { distance: 3.4, yaw: 0, pitch: 0, target: [0, 0, 0], shiftX: 0, dim: 1 },
};

export interface FrameContext {
  aspect: number;
  /** Centroides de los 4 frentes en la forma "clusters", en el orden de la sección Frentes. */
  clusterCenters: [number, number, number][];
  /** Altura mínima y máxima de las empresas en la forma "hélice". */
  helixSpan: [number, number];
}

export interface Frame {
  from: LayoutName;
  to: LayoutName;
  mix: number;
  pose: Pose;
}

export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: readonly number[], b: readonly number[], t: number): [number, number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

function sectionTarget(section: SectionId, progress: number, ctx: FrameContext): [number, number, number] {
  if (section === 'trayectoria') return [0, lerp(ctx.helixSpan[0], ctx.helixSpan[1], progress), 0];
  if (section === 'frentes') {
    const f = Math.min(progress * 4, 3.999);
    const k = Math.floor(f);
    const t = smoothstep(0.7, 1, f - k);
    const next = Math.min(k + 1, ctx.clusterCenters.length - 1);
    return t === 0 ? [...ctx.clusterCenters[k]] : lerp3(ctx.clusterCenters[k], ctx.clusterCenters[next], t);
  }
  return [0, 0, 0];
}

/**
 * Distancia de la pose al aspecto del escenario. Las de SECTION_POSE están pensadas para apaisado, donde manda el alto
 * (el fov de la cámara es vertical). En retrato manda el ancho, que es `aspect` veces el alto: la cámara se aleja
 * 1/aspect y el ancho visible queda como el alto visible con aspecto 1, así que la forma cabe a lo ancho como cabe a lo
 * alto (a 390 × 844, sin esto, la lemniscata de Contacto, los hemisferios de Método y la hélice de Trayectoria tocaban
 * los dos lados; lo comprueba e2e/graph3d.spec.ts). Frentes queda como en apaisado: de cerca, en el cluster activo.
 * El hero no se aleja: es la cámara del póster (CAMERA0), cuyo `slice` en retrato también recorta por los lados, y el
 * canvas tiene que coincidir con él al fundirse. El suelo de aspecto solo evita la distancia infinita de un escenario
 * sin ancho.
 */
function poseDistance(section: SectionId, aspect: number): number {
  const d = SECTION_POSE[section].distance;
  return section === 'hero' ? d : d / Math.min(Math.max(aspect, MIN_ASPECT), 1);
}
const MIN_ASPECT = 0.25;

/** `s` = índice de sección + progreso dentro de ella (0..1). Continuo en las fronteras. */
export function frameAt(s: number, ctx: FrameContext): Frame {
  const clamped = Math.min(Math.max(s, 0), SECTIONS.length - 1);
  const index = Math.min(Math.floor(clamped), SECTIONS.length - 1);
  const progress = clamped - index;
  const cur = SECTIONS[index];
  const next = SECTIONS[Math.min(index + 1, SECTIONS.length - 1)];
  const mix = next === cur ? 0 : smoothstep(0.55, 1, progress);
  const a = SECTION_POSE[cur];
  const b = SECTION_POSE[next];
  const target = lerp3(sectionTarget(cur, progress, ctx), sectionTarget(next, 0, ctx), mix);
  const pose: Pose = {
    distance: lerp(poseDistance(cur, ctx.aspect), poseDistance(next, ctx.aspect), mix),
    yaw: lerp(a.yaw, b.yaw, mix),
    pitch: lerp(a.pitch, b.pitch, mix),
    target: mix === 0 ? sectionTarget(cur, progress, ctx) : target,
    shiftX: ctx.aspect < 1.2 ? 0 : lerp(a.shiftX, b.shiftX, mix),
    dim: lerp(a.dim, b.dim, mix),
  };
  return { from: SECTION_LAYOUT[cur], to: SECTION_LAYOUT[next], mix, pose };
}
