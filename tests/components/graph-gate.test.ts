import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { whenGraphMayLoad } from '@/components/graph/GraphStageLazy';

type Listener = () => void;

/**
 * `window` de mentira para la puerta del grafo (enmienda H1 del Plan 2, spec §4.4 paso 2): la escena se importa con la
 * primera interacción (pointermove, touchstart, scroll, keydown) o con requestIdleCallback tras `load` (timeout
 * 5 s), nunca antes.
 */
function fakeWindow(opts: { withIdleCallback?: boolean } = {}) {
  const listeners = new Map<string, Set<Listener>>();
  let idle: { cb: () => void; timeout?: number } | null = null;
  const win = {
    addEventListener: vi.fn((type: string, listener: Listener) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: Listener) => {
      listeners.get(type)?.delete(listener);
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
  };
  const emit = (type: string) => [...(listeners.get(type) ?? [])].forEach((l) => l());
  const listening = () => [...listeners].filter(([, set]) => set.size > 0).map(([type]) => type).sort();
  const runIdle = () => idle?.cb();
  return { win, emit, listening, runIdle, idle: () => idle };
}

describe('whenGraphMayLoad (puerta de GraphStage)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('antes de load y sin interacción no importa nada', () => {
    const { win } = fakeWindow();
    const go = vi.fn();
    whenGraphMayLoad(win as never, { readyState: 'loading' }, go);
    vi.advanceTimersByTime(60_000);
    expect(go).not.toHaveBeenCalled();
    expect(win.requestIdleCallback).not.toHaveBeenCalled();
  });

  it.each(['pointermove', 'touchstart', 'scroll', 'keydown'])('%s dispara la importación una sola vez', (type) => {
    const { win, emit, listening } = fakeWindow();
    const go = vi.fn();
    whenGraphMayLoad(win as never, { readyState: 'loading' }, go);
    emit(type);
    emit('keydown');
    emit('load');
    expect(go).toHaveBeenCalledTimes(1);
    // Disparada, no deja listeners colgando.
    expect(listening()).toEqual([]);
  });

  it('tras load, espera a requestIdleCallback con timeout de 5 s', () => {
    const { win, emit, runIdle, idle } = fakeWindow();
    const go = vi.fn();
    whenGraphMayLoad(win as never, { readyState: 'interactive' }, go);
    emit('load');
    expect(idle()?.timeout).toBe(5000);
    expect(go).not.toHaveBeenCalled();
    runIdle();
    expect(go).toHaveBeenCalledTimes(1);
  });

  it('si el documento ya cargó, pide el idle al montarse', () => {
    const { win, runIdle } = fakeWindow();
    const go = vi.fn();
    whenGraphMayLoad(win as never, { readyState: 'complete' }, go);
    expect(win.requestIdleCallback).toHaveBeenCalledTimes(1);
    runIdle();
    expect(go).toHaveBeenCalledTimes(1);
  });

  it('una interacción antes del idle cancela el idle y no importa dos veces', () => {
    const { win, emit, runIdle } = fakeWindow();
    const go = vi.fn();
    whenGraphMayLoad(win as never, { readyState: 'complete' }, go);
    emit('pointermove');
    expect(win.cancelIdleCallback).toHaveBeenCalledWith(7);
    runIdle();
    expect(go).toHaveBeenCalledTimes(1);
  });

  it('sin requestIdleCallback (Safari), usa un setTimeout corto tras load', () => {
    const { win } = fakeWindow({ withIdleCallback: false });
    const go = vi.fn();
    whenGraphMayLoad(win as never, { readyState: 'complete' }, go);
    expect(go).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(go).toHaveBeenCalledTimes(1);
  });

  it('la limpieza (desmontaje) quita los listeners y cancela el idle pendiente', () => {
    const { win, emit, runIdle, listening } = fakeWindow();
    const go = vi.fn();
    const stop = whenGraphMayLoad(win as never, { readyState: 'complete' }, go);
    stop();
    expect(listening()).toEqual([]);
    expect(win.cancelIdleCallback).toHaveBeenCalledWith(7);
    emit('scroll');
    runIdle();
    expect(go).not.toHaveBeenCalled();
  });
});
