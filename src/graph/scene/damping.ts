/** Amortiguación exponencial independiente del frame rate (spec §3.4): `1 - exp(-λ·dt)` del camino por frame. */
export const damp = (current: number, target: number, lambda: number, dt: number) => current + (target - current) * (1 - Math.exp(-lambda * dt));

/** Magnitudes que GraphScene amortigua cada frame: scroll, pose de la cámara, resaltado y paralaje. */
export interface Damped {
  s: number;
  distance: number;
  yaw: number;
  pitch: number;
  tx: number;
  ty: number;
  tz: number;
  shiftX: number;
  dim: number;
  hoverActive: number;
  parallaxX: number;
  parallaxY: number;
}

/** La pose de la cámara (la parte de `Damped` que sale de la coreografía o del foco). */
export const POSE_KEYS = ['distance', 'yaw', 'pitch', 'tx', 'ty', 'tz', 'shiftX', 'dim'] as const satisfies readonly (keyof Damped)[];

export const DAMPED_KEYS = ['s', ...POSE_KEYS, 'hoverActive', 'parallaxX', 'parallaxY'] as const satisfies readonly (keyof Damped)[];

const EPS = 1e-3;

/**
 * true mientras alguna magnitud amortiguada siga a más de 1e-3 de su objetivo. Con el movimiento en pausa, el bucle
 * deja de pintar cuando esto es false: si faltara alguna (yaw, tx, tz…), la cámara se quedaría a medio camino.
 */
export function settling(current: Readonly<Damped>, target: Readonly<Damped>): boolean {
  for (const k of DAMPED_KEYS) if (Math.abs(current[k] - target[k]) > EPS) return true;
  return false;
}
