'use client';

import { useEffect, useState, type ComponentType } from 'react';
import type { HomeCopy } from '@/content/home';
import type { Locale } from '@/lib/site';

type Props = { locale: Locale; t: HomeCopy['graph'] };
type GateWindow = Pick<Window, 'addEventListener' | 'removeEventListener'> & Partial<Pick<Window, 'requestIdleCallback' | 'cancelIdleCallback'>>;

const EVENTS = ['pointermove', 'touchstart', 'scroll', 'keydown'];

/**
 * Llama a `go` con la primera interacción o, sin ella, con requestIdleCallback tras `load` (timeout 5 s; sin
 * requestIdleCallback, 200 ms después de `load`). El tope de 5 s (antes 1.5 s) deja fuera de la ventana FCP→TTI
 * de Lighthouse el chunk de GraphStage, sin quitar el póster de first paint (Opus hold). Spec §4.4, paso 2.
 */
export function whenGraphMayLoad(win: GateWindow, doc: { readyState: DocumentReadyState }, go: () => void): () => void {
  let idle: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stop = () => {
    EVENTS.forEach((e) => win.removeEventListener(e, fire));
    win.removeEventListener('load', onLoad);
    if (idle !== undefined) win.cancelIdleCallback?.(idle);
    clearTimeout(timer);
  };
  const fire = () => {
    stop();
    go();
  };
  const onLoad = () => {
    if (win.requestIdleCallback) idle = win.requestIdleCallback(fire, { timeout: 5000 });
    else timer = setTimeout(fire, 200);
  };
  EVENTS.forEach((e) => win.addEventListener(e, fire, { once: true, passive: true }));
  if (doc.readyState === 'complete') onLoad();
  else win.addEventListener('load', onLoad, { once: true });
  return stop;
}

/**
 * Puerta de la escena 3D (enmienda H1 del Plan 2, spec §5.1). Va en la ruta crítica, así que no importa nada más: ni la
 * sonda, ni el regulador, ni la coreografía. `import('./GraphStage')` solo sale tras el disparador, después de `load`
 * o con la primera interacción, y ese chunk y el worker cuentan en el presupuesto del 3D, no en el de la home.
 */
export default function GraphStageLazy(props: Props) {
  const [Scene, setScene] = useState<ComponentType<Props> | null>(null);
  useEffect(
    () =>
      whenGraphMayLoad(window, document, () => {
        // Si el chunk no llega, se queda el póster.
        import('./GraphStage').then((m) => setScene(() => m.default), () => {});
      }),
    [],
  );
  return Scene && <Scene {...props} />;
}
