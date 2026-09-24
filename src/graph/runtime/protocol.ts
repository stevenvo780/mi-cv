import type { Tier } from './quality';

/** Mensajes del hilo principal a la escena (worker o fallback). `s` = scroll continuo: índice de sección + progreso. */
export type MainToWorker =
  | { type: 'init'; canvas: OffscreenCanvas; width: number; height: number; dpr: number; tier: Tier; motion: boolean; binUrl: string }
  | { type: 'resize'; width: number; height: number; dpr: number }
  | { type: 'pointer'; x: number; y: number; inside: boolean }
  | { type: 'scroll'; s: number }
  | { type: 'motion'; on: boolean }
  | { type: 'focus'; index: number | null }
  | { type: 'visible'; visible: boolean }
  | { type: 'dispose' };

/** Eventos de la escena. Las coordenadas x/y son píxeles CSS relativos al escenario. */
export type SceneEvent =
  | { type: 'ready' }
  | { type: 'hover'; index: number; x: number; y: number }
  | { type: 'hover-end' }
  | { type: 'tier'; tier: Tier }
  | { type: 'error'; message: string };

export type WorkerToMain = SceneEvent;
