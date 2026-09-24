'use client';

import { useCallback, useEffect, useRef } from 'react';
import { SECTIONS } from '@/graph/scene/choreography';

type Box = { top: number; height: number };

/**
 * Scroll continuo s = índice de la sección bajo el centro de la pantalla + progreso dentro de ella, en [0, 1).
 * `boxes` va en el orden de SECTIONS; null es una sección que no está en el DOM.
 */
export function sectionProgress(boxes: ReadonlyArray<Box | null>, mid: number): number {
  let s = 0;
  boxes.forEach((r, i) => {
    if (r && r.top <= mid) s = i + Math.min(Math.max((mid - r.top) / Math.max(r.height, 1), 0), 1 - 1e-6);
  });
  return s;
}

/**
 * Progreso de scroll de la home para la coreografía (spec §4.5): se recalcula con scroll pasivo y resize, agrupado por
 * rAF. Devuelve una función que fuerza un recálculo inmediato (p. ej. en cuanto la escena puede recibirlo).
 */
export function useSectionProgress(onChange: (s: number) => void): () => void {
  const callback = useRef(onChange);
  const compute = useRef<() => void>(() => {});

  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let frame = 0;
    const run = () => {
      frame = 0;
      const boxes = SECTIONS.map((id) => document.querySelector<HTMLElement>(`[data-section="${id}"]`)?.getBoundingClientRect() ?? null);
      callback.current(sectionProgress(boxes, window.innerHeight / 2));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };
    compute.current = run;
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return useCallback(() => compute.current(), []);
}
