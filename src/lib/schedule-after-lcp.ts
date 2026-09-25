/**
 * Programa trabajo pesado (p. ej. WebGL del grafo) después del LCP para que el h1
 * pinte sin competir por el hilo principal. Patrón kosmos/complexlab: esperar una
 * entrada real de largest-contentful-paint (o un hard timeout), luego idle.
 *
 * Por qué no basta requestIdleCallback tras `load` con timeout 1.5–5 s:
 * el tope es un máximo, no un retraso — si el hilo queda idle pronto (o Lighthouse
 * dispara `scroll`), el chunk del grafo arranca ~1.4 s y alarga Render Delay / TBT.
 */

export type CancelSchedule = () => void;

export type ScheduleAfterLcpOptions = {
  /** Tope del idle tras el LCP (ms). */
  idleTimeoutMs?: number;
  /** Suelo absoluto si no hay LCP API / pestaña en segundo plano (ms). */
  hardTimeoutMs?: number;
  /** Espera corta tras la primera entrada LCP antes de pedir idle (ms). */
  settleMs?: number;
};

export type ScheduleAfterLcpWindow = {
  setTimeout: (cb: () => void, ms: number) => number;
  clearTimeout: (id: number) => void;
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
  PerformanceObserver?: new (callback: PerformanceObserverCallback) => PerformanceObserver;
  performance?: Pick<Performance, 'getEntriesByType'>;
};

function browserWindow(): ScheduleAfterLcpWindow {
  return window as unknown as ScheduleAfterLcpWindow;
}

export function scheduleAfterLcp(
  task: () => void,
  options: ScheduleAfterLcpOptions = {},
  win: ScheduleAfterLcpWindow = typeof window !== 'undefined' ? browserWindow() : (undefined as never),
): CancelSchedule {
  const idleTimeoutMs = options.idleTimeoutMs ?? 2000;
  const hardTimeoutMs = options.hardTimeoutMs ?? 8000;
  const settleMs = options.settleMs ?? 150;

  let cancelled = false;
  let idleId: number | undefined;
  let settleTimer: number | undefined;
  let observer: PerformanceObserver | undefined;
  let ran = false;
  let sawLcp = false;

  const clearSoftTimers = () => {
    if (settleTimer !== undefined) win.clearTimeout(settleTimer);
    settleTimer = undefined;
    if (idleId !== undefined) {
      win.cancelIdleCallback?.(idleId);
      idleId = undefined;
    }
  };

  const run = (fromHardTimeout = false) => {
    if (cancelled || ran) return;
    if (!sawLcp && !fromHardTimeout) return;
    ran = true;
    observer?.disconnect();
    clearSoftTimers();

    const start = () => {
      if (cancelled) return;
      task();
    };

    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(start, { timeout: idleTimeoutMs });
    } else {
      settleTimer = win.setTimeout(start, Math.min(400, idleTimeoutMs));
    }
  };

  const afterLcp = () => {
    if (cancelled || ran) return;
    sawLcp = true;
    settleTimer = win.setTimeout(() => run(false), settleMs);
  };

  try {
    const existing = win.performance?.getEntriesByType?.('largest-contentful-paint') ?? [];
    if (existing.length > 0) {
      afterLcp();
    } else if (typeof win.PerformanceObserver === 'function') {
      observer = new win.PerformanceObserver((list) => {
        if (list.getEntries().length > 0) afterLcp();
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    }
  } catch {
    // Sin API LCP: solo escapa el hard timeout.
  }

  const hardTimer = win.setTimeout(() => run(true), hardTimeoutMs);

  return () => {
    cancelled = true;
    observer?.disconnect();
    clearSoftTimers();
    win.clearTimeout(hardTimer);
  };
}
