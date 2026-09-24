'use client';

import { useEffect } from 'react';

const GA_ID = 'G-E5NMYWLXER';
const EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
const IDLE_FALLBACK_MS = 5000;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type AnalyticsWindow = Pick<EventTarget, 'addEventListener' | 'removeEventListener'> & {
  requestIdleCallback?: (callback: () => void) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/**
 * Dispara `load` con la primera interacción (pointerdown, keydown, scroll,
 * touchstart) o, en su defecto, 5 s después de `load` vía requestIdleCallback
 * (setTimeout como reserva si el navegador no lo soporta) — para que los
 * visitantes que nunca interactúan (leen y cierran, crawlers/bots) también
 * cuenten. Devuelve la función de limpieza.
 */
export function scheduleAnalyticsLoad(win: AnalyticsWindow, doc: { readyState: DocumentReadyState }, load: () => void): () => void {
  let fired = false;
  const fire = () => {
    if (fired) return;
    fired = true;
    load();
  };
  EVENTS.forEach((e) => win.addEventListener(e, fire, { once: true, passive: true }));

  let idleHandle: number | undefined;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const runIdleFallback = () => {
    if (typeof win.requestIdleCallback === 'function') {
      idleHandle = win.requestIdleCallback(fire);
    } else {
      fire();
    }
  };
  const startFallbackTimer = () => {
    timeoutHandle = setTimeout(runIdleFallback, IDLE_FALLBACK_MS);
  };
  if (doc.readyState === 'complete') {
    startFallbackTimer();
  } else {
    win.addEventListener('load', startFallbackTimer, { once: true });
  }

  return () => {
    EVENTS.forEach((e) => win.removeEventListener(e, fire));
    win.removeEventListener('load', startFallbackTimer);
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
    if (idleHandle !== undefined && typeof win.cancelIdleCallback === 'function') win.cancelIdleCallback(idleHandle);
  };
}

/** GA con la primera interacción o, en su defecto, 5 s tras `load` (idle): así no suma TBT en la carga ni en Lighthouse. */
export default function Analytics() {
  useEffect(() => {
    const load = () => {
      if (window.gtag) return;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // gtag exige el objeto `arguments`, no un array
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, { page_path: window.location.pathname });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);
    };
    return scheduleAnalyticsLoad(window, document, load);
  }, []);
  return null;
}
