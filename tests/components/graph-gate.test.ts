import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { whenGraphMayLoad } from '@/components/graph/GraphStageLazy';

type Listener = () => void;

/**
 * `window` de mentira para la puerta del grafo (spec §4.4 paso 2 + tip WAVE3):
 * interacción explícita (pointermove, touchstart, keydown) o scheduleAfterLcp
 * (entrada LCP → settle → idle; hard timeout 8 s). Sin `scroll` (LH lo dispara
 * en medio del Render Delay).
 */
function fakeWindow(opts: { withIdleCallback?: boolean; withLcpApi?: boolean } = {}) {
  const listeners = new Map<string, Set<Listener>>();
  let idle: { cb: () => void; timeout?: number } | null = null;
  let observerCb: ((list: { getEntries: () => PerformanceEntry[] }) => void) | null = null;
  const timers = new Map<number, { cb: () => void; ms: number }>();
  let nextTimerId = 1;
  let now = 0;

  const win = {
    addEventListener: vi.fn((type: string, listener: Listener) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: Listener) => {
      listeners.get(type)?.delete(listener);
    }),
    setTimeout: vi.fn((cb: () => void, ms: number) => {
      const id = nextTimerId++;
      timers.set(id, { cb, ms: now + ms });
      return id;
    }),
    clearTimeout: vi.fn((id: number) => {
      timers.delete(id);
    }),
    requestIdleCallback:
      opts.withIdleCallback === false
        ? undefined
        : vi.fn((cb: () => void, o?: { timeout?: number }) => {
            idle = { cb, timeout: o?.timeout };
            return 7;
          }),
    cancelIdleCallback: vi.fn(() => {
      idle = null;
    }),
    PerformanceObserver:
      opts.withLcpApi === false
        ? undefined
        : (vi.fn(function MockPO(this: unknown, cb: typeof observerCb) {
            observerCb = cb;
            return {
              observe: vi.fn(),
              disconnect: vi.fn(),
            };
          }) as unknown as typeof PerformanceObserver),
    performance: {
      getEntriesByType: vi.fn(() => [] as PerformanceEntry[]),
    },
  };

  const emit = (type: string) => [...(listeners.get(type) ?? [])].forEach((l) => l());
  const listening = () => [...listeners].filter(([, set]) => set.size > 0).map(([type]) => type).sort();
  const runIdle = () => {
    const cb = idle?.cb;
    idle = null;
    cb?.();
  };
  const advance = (ms: number) => {
    now += ms;
    for (const [id, t] of [...timers]) {
      if (t.ms <= now) {
        timers.delete(id);
        t.cb();
      }
    }
  };
  const emitLcp = () => {
    observerCb?.({ getEntries: () => [{ entryType: 'largest-contentful-paint' } as PerformanceEntry] });
  };

  return { win, emit, listening, runIdle, idle: () => idle, advance, emitLcp, timers: () => timers };
}

describe('whenGraphMayLoad (puerta de GraphStage)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('sin interacción ni LCP no importa nada antes del hard timeout', () => {
    const { win, advance } = fakeWindow();
    const go = vi.fn();
    whenGraphMayLoad(win as never, { readyState: 'complete' }, go);
    advance(7_999);
    expect(go).not.toHaveBeenCalled();
  });

  it.each(['pointermove', 'touchstart', 'keydown'] as const)('%s dispara la importación una sola vez', (type) => {
    const { win, emit, listening } = fakeWindow();
    const go = vi.fn();
    whenGraphMayLoad(win as never, { readyState: 'loading' }, go);
    emit(type);
    emit('keydown');
    expect(go).toHaveBeenCalledTimes(1);
    expect(listening()).toEqual([]);
  });

  it('scroll ya no dispara la importación (evita el scroll sintético de Lighthouse)', () => {
    const { win, emit } = fakeWindow();
    const go = vi.fn();
    whenGraphMayLoad(win as never, { readyState: 'complete' }, go);
    emit('scroll');
    expect(go).not.toHaveBeenCalled();
  });

  it('tras una entrada LCP, espera settle + idle y entonces importa', () => {
    const { win, emitLcp, advance, runIdle, idle } = fakeWindow();
    const go = vi.fn();
    whenGraphMayLoad(win as never, { readyState: 'complete' }, go);
    emitLcp();
    expect(go).not.toHaveBeenCalled();
    advance(150);
    expect(idle()?.timeout).toBe(2000);
    expect(go).not.toHaveBeenCalled();
    runIdle();
    expect(go).toHaveBeenCalledTimes(1);
  });

  it('hard timeout 8 s importa sin entrada LCP', () => {
    const { win, advance, runIdle, idle } = fakeWindow();
    const go = vi.fn();
    whenGraphMayLoad(win as never, { readyState: 'complete' }, go);
    advance(8000);
    // hard path también pasa por idle cuando hay requestIdleCallback
    expect(idle()?.timeout).toBe(2000);
    runIdle();
    expect(go).toHaveBeenCalledTimes(1);
  });

  it('una interacción antes del idle tras LCP cancela el schedule y no importa dos veces', () => {
    const { win, emit, emitLcp, advance, runIdle } = fakeWindow();
    const go = vi.fn();
    whenGraphMayLoad(win as never, { readyState: 'complete' }, go);
    emitLcp();
    advance(150);
    emit('pointermove');
    expect(go).toHaveBeenCalledTimes(1);
    runIdle();
    expect(go).toHaveBeenCalledTimes(1);
  });

  it('sin requestIdleCallback, tras LCP usa setTimeout corto', () => {
    const { win, emitLcp, advance } = fakeWindow({ withIdleCallback: false });
    const go = vi.fn();
    whenGraphMayLoad(win as never, { readyState: 'complete' }, go);
    emitLcp();
    advance(150);
    expect(go).not.toHaveBeenCalled();
    advance(400);
    expect(go).toHaveBeenCalledTimes(1);
  });

  it('la limpieza (desmontaje) quita los listeners y cancela el schedule pendiente', () => {
    const { win, emit, emitLcp, advance, runIdle, listening } = fakeWindow();
    const go = vi.fn();
    const stop = whenGraphMayLoad(win as never, { readyState: 'complete' }, go);
    stop();
    expect(listening()).toEqual([]);
    emit('keydown');
    emitLcp();
    advance(8000);
    runIdle();
    expect(go).not.toHaveBeenCalled();
  });
});
