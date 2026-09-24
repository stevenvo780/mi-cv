import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { scheduleAnalyticsLoad } from '@/components/Analytics';

type Listener = () => void;

/** `window` de mentira: sin DOM real, solo el registro de listeners que necesita `scheduleAnalyticsLoad`. */
function fakeWindow(opts: { withIdleCallback?: boolean } = {}) {
  const listeners = new Map<string, Set<Listener>>();
  const win = {
    addEventListener: vi.fn((type: string, listener: Listener) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: Listener) => {
      listeners.get(type)?.delete(listener);
    }),
    requestIdleCallback: opts.withIdleCallback === false ? undefined : vi.fn((cb: () => void) => (cb(), 1)),
    cancelIdleCallback: vi.fn(),
  };
  const emit = (type: string) => listeners.get(type)?.forEach((l) => l());
  const has = (type: string) => (listeners.get(type)?.size ?? 0) > 0;
  return { win, emit, has };
}

describe('scheduleAnalyticsLoad', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('dispara load en la primera interacción registrada (pointerdown, keydown, scroll, touchstart)', () => {
    const { win, emit } = fakeWindow();
    const load = vi.fn();
    scheduleAnalyticsLoad(win as never, { readyState: 'complete' }, load);
    emit('scroll');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('no dispara load dos veces si llegan varias interacciones', () => {
    const { win, emit } = fakeWindow();
    const load = vi.fn();
    scheduleAnalyticsLoad(win as never, { readyState: 'complete' }, load);
    emit('pointerdown');
    emit('keydown');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('sin interacción, dispara load a los 5s de load vía requestIdleCallback si el documento ya cargó', () => {
    const { win } = fakeWindow();
    const load = vi.fn();
    scheduleAnalyticsLoad(win as never, { readyState: 'complete' }, load);
    expect(load).not.toHaveBeenCalled();
    vi.advanceTimersByTime(4999);
    expect(load).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(load).toHaveBeenCalledTimes(1);
    expect(win.requestIdleCallback).toHaveBeenCalledTimes(1);
  });

  it('sin interacción y con el documento aún cargando, espera al evento load antes de contar los 5s', () => {
    const { win, emit } = fakeWindow();
    const load = vi.fn();
    scheduleAnalyticsLoad(win as never, { readyState: 'loading' }, load);
    vi.advanceTimersByTime(10000);
    expect(load).not.toHaveBeenCalled();
    emit('load');
    vi.advanceTimersByTime(4999);
    expect(load).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('usa setTimeout como reserva si el navegador no soporta requestIdleCallback', () => {
    const { win } = fakeWindow({ withIdleCallback: false });
    const load = vi.fn();
    scheduleAnalyticsLoad(win as never, { readyState: 'complete' }, load);
    vi.advanceTimersByTime(5000);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('la interacción antes de los 5s evita el disparo por idle', () => {
    const { win, emit } = fakeWindow();
    const load = vi.fn();
    scheduleAnalyticsLoad(win as never, { readyState: 'complete' }, load);
    emit('touchstart');
    vi.advanceTimersByTime(5000);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('la limpieza retira los listeners y cancela el temporizador de idle pendiente', () => {
    const { win, emit } = fakeWindow();
    const load = vi.fn();
    const cleanup = scheduleAnalyticsLoad(win as never, { readyState: 'complete' }, load);
    cleanup();
    emit('scroll');
    vi.advanceTimersByTime(5000);
    expect(load).not.toHaveBeenCalled();
  });
});
