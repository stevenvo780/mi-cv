'use client';

import { useEffect, useState, type ComponentType } from 'react';
import type { HomeCopy } from '@/content/home';
import {
  scheduleAfterLcp,
  type CancelSchedule,
  type ScheduleAfterLcpWindow,
} from '@/lib/schedule-after-lcp';
import type { Locale } from '@/lib/site';

type Props = { locale: Locale; t: HomeCopy['graph'] };
type GateWindow = ScheduleAfterLcpWindow & Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;

/**
 * Interacción explícita del usuario. No incluye `scroll`: Lighthouse (y otros labs)
 * desplazan la página durante el Render Delay del LCP y disparaban import('./GraphStage')
 * ~1.4 s, alargando LCP/TBT. Quien solo hace scroll recibe el grafo vía scheduleAfterLcp
 * (póster sigue en first paint — Opus hold). Spec §4.4 paso 2, enmienda tip WAVE3.
 */
const INTERACT_EVENTS = ['pointermove', 'touchstart', 'keydown'] as const;

/**
 * Llama a `go` con la primera interacción explícita, o tras el LCP (scheduleAfterLcp:
 * settle + idle; hard timeout 8 s si no hay entrada LCP). Sustituye el idle-tras-load
 * con timeout ciego (1.5–5 s), que no difería el chunk si el hilo quedaba idle pronto.
 */
export function whenGraphMayLoad(win: GateWindow, _doc: { readyState: DocumentReadyState }, go: () => void): () => void {
  let done = false;
  let cancelSchedule: CancelSchedule | undefined;

  const fire = () => {
    if (done) return;
    done = true;
    INTERACT_EVENTS.forEach((e) => win.removeEventListener(e, fire));
    cancelSchedule?.();
    go();
  };

  INTERACT_EVENTS.forEach((e) => win.addEventListener(e, fire, { once: true, passive: true }));
  cancelSchedule = scheduleAfterLcp(fire, { idleTimeoutMs: 2000, hardTimeoutMs: 8000, settleMs: 150 }, win);

  return () => {
    done = true;
    INTERACT_EVENTS.forEach((e) => win.removeEventListener(e, fire));
    cancelSchedule?.();
  };
}

/**
 * Puerta de la escena 3D (enmienda H1 del Plan 2, spec §5.1). Va en la ruta crítica, así que no importa nada más: ni la
 * sonda, ni el regulador, ni la coreografía. `import('./GraphStage')` solo sale tras el LCP (o interacción explícita),
 * y ese chunk y el worker cuentan en el presupuesto del 3D, no en el de la home.
 */
export default function GraphStageLazy(props: Props) {
  const [Scene, setScene] = useState<ComponentType<Props> | null>(null);
  useEffect(
    () =>
      whenGraphMayLoad(window as unknown as GateWindow, document, () => {
        // Si el chunk no llega, se queda el póster.
        import('./GraphStage').then((m) => setScene(() => m.default), () => {});
      }),
    [],
  );
  return Scene && <Scene {...props} />;
}
