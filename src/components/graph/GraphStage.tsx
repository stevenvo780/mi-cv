'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSectionProgress } from '@/components/home/useSectionProgress';
import type { HomeCopy } from '@/content/home';
import type { GraphMeta, MetaNode } from '@/graph/codec';
import { GRAPH_ASSET } from '@/graph/generated/stats';
import { dispatch } from '@/graph/runtime/dispatch';
import { createInbox } from '@/graph/runtime/inbox';
import { loadGraphBinary } from '@/graph/runtime/loader';
import { browserProbeEnv, probe3D } from '@/graph/runtime/probe';
import type { MainToWorker, SceneEvent } from '@/graph/runtime/protocol';
import { initialTier, type Tier } from '@/graph/runtime/quality';
import type { Locale } from '@/lib/site';

type Phase = 'poster' | 'loading' | 'live' | 'reduced';
type Msg = Exclude<MainToWorker, { type: 'init' }>;
interface Tip {
  node: MetaNode;
  x: number;
  y: number;
}
interface Common {
  width: number;
  height: number;
  dpr: number;
  tier: Tier;
  motion: boolean;
}

/** Zonas donde el puntero pertenece al contenido y no al grafo. */
const CONTENT =
  'a, button, input, select, textarea, summary, label, [role="button"], .panel, .card, .sec-head, .hero-meta, .front-head, .contact-list, .stack-group, .figures, .search, .topbar, .footer, .graph-motion, .graph-explore';
const MOTION_KEY = 'mouseion:motion';

/** El escenario (`.stage`) que contiene la isla: su `data-state="live"` funde el póster con el canvas (home.css). */
const stageOf = (host: HTMLElement | null) => host?.closest<HTMLElement>('.stage') ?? null;

function readMotionPreference(): boolean {
  try {
    return window.localStorage.getItem(MOTION_KEY) !== 'paused';
  } catch {
    return true;
  }
}

/**
 * Isla del grafo 3D (spec §4.4). La monta la puerta GraphStageLazy tras la primera interacción o el idle después de
 * `load` (el disparador del paso 2 ya ocurrió): aquí, en idle, la sonda de GPU decide entre la escena, el botón
 * «Explorar en 3D» (movimiento reducido) o quedarse en el póster. La escena corre en un worker con OffscreenCanvas y,
 * sin él, en el hilo principal. Los controles y el tooltip van por portal a `.home`: `.stage` es aria-hidden (§4.8).
 *
 * Parámetros de URL para pruebas: `?gl=force` se salta la sonda, `?gl=off` la desactiva y `?worker=off` fuerza el
 * fallback en el hilo principal.
 */
export default function GraphStage({ locale, t }: { locale: Locale; t: HomeCopy['graph'] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<((m: Msg) => void) | null>(null);
  const disposeRef = useRef<(() => void) | null>(null);
  const metaRef = useRef<MetaNode[] | null>(null);
  const tipRef = useRef<Tip | null>(null);
  const [phase, setPhase] = useState<Phase>('poster');
  const [tip, setTip] = useState<Tip | null>(null);
  const [motion, setMotion] = useState(readMotionPreference);
  // Solo se monta en cliente (la puerta lo importa tras un efecto): document existe.
  const [home] = useState(() => document.querySelector('.home'));

  // Refleja la preferencia guardada en <html> (pausa también las animaciones CSS).
  useEffect(() => {
    if (!motion) document.documentElement.dataset.motion = 'paused';
  }, [motion]);

  const send = useCallback((m: Msg) => sendRef.current?.(m), []);
  const emitScroll = useSectionProgress(useCallback((s: number) => send({ type: 'scroll', s }), [send]));

  const teardown = useCallback(() => {
    disposeRef.current?.();
    disposeRef.current = null;
    sendRef.current = null;
    hostRef.current?.replaceChildren();
    stageOf(hostRef.current)?.removeAttribute('data-state');
    tipRef.current = null;
    setTip(null);
    setPhase('poster');
  }, []);

  const onEvent = useCallback(
    (e: SceneEvent) => {
      switch (e.type) {
        case 'ready':
          stageOf(hostRef.current)?.setAttribute('data-state', 'live');
          setPhase('live');
          break;
        case 'hover': {
          const node = metaRef.current?.[e.index];
          if (!node) return;
          tipRef.current = { node, x: e.x, y: e.y };
          setTip(tipRef.current);
          break;
        }
        case 'hover-end':
          tipRef.current = null;
          setTip(null);
          break;
        case 'error':
          console.warn('[grafo] escena desactivada:', e.message);
          teardown();
          break;
        case 'tier':
          break;
      }
    },
    [teardown],
  );

  /** Fallback sin OffscreenCanvas con WebGL: la escena en el hilo principal, con el mismo buzón que el worker. */
  const startMain = useCallback(
    async (host: HTMLDivElement, common: Common, binUrl: string) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'stage-canvas';
      host.appendChild(canvas);
      const { GraphScene } = await import('@/graph/scene/GraphScene');
      const scene = new GraphScene(onEvent);
      const inbox = createInbox((m) => dispatch(scene, m));
      sendRef.current = inbox.push;
      disposeRef.current = () => scene.dispose();
      await scene.init({ canvas, graph: await loadGraphBinary(binUrl), ...common });
      inbox.open();
      emitScroll();
    },
    [emitScroll, onEvent],
  );

  const start = useCallback(
    async (motionOn: boolean) => {
      const host = hostRef.current;
      if (!host || sendRef.current) return;
      setPhase('loading');
      fetch(GRAPH_ASSET.meta)
        .then((r) => r.json() as Promise<GraphMeta>)
        .then((m) => {
          metaRef.current = m.nodes;
        })
        .catch((err: unknown) => console.warn('[grafo] sin fichas de nodos:', err));
      const rect = host.getBoundingClientRect();
      const common: Common = {
        width: rect.width,
        height: rect.height,
        dpr: window.devicePixelRatio || 1,
        tier: initialTier({ width: window.innerWidth, mobile: window.matchMedia('(pointer: coarse)').matches, cores: navigator.hardwareConcurrency ?? 4 }),
        motion: motionOn,
      };
      const binUrl = new URL(GRAPH_ASSET.bin, window.location.href).toString();
      const allowWorker = new URLSearchParams(window.location.search).get('worker') !== 'off';
      const probeCanvas = document.createElement('canvas');
      if (allowWorker && typeof Worker !== 'undefined' && 'transferControlToOffscreen' in probeCanvas) {
        // Enmienda H8: fuera del try, para terminarlo en el catch si algo falla después de crearlo
        // (transferControlToOffscreen, postMessage). Los cierres usan la constante `w`: TS no estrecha un `let`
        // dentro de un callback.
        let worker: Worker | undefined;
        try {
          const canvas = probeCanvas;
          canvas.className = 'stage-canvas';
          host.appendChild(canvas);
          const w = new Worker(new URL('../../graph/worker/graph.worker.ts', import.meta.url), { type: 'module' });
          worker = w;
          const offscreen = canvas.transferControlToOffscreen();
          w.onmessage = (ev: MessageEvent<SceneEvent>) => onEvent(ev.data);
          w.onerror = (ev) => {
            ev.preventDefault();
            w.terminate();
            host.replaceChildren();
            sendRef.current = null;
            void startMain(host, common, binUrl).catch(teardown);
          };
          const init: MainToWorker = { type: 'init', canvas: offscreen, binUrl, ...common };
          w.postMessage(init, [offscreen]);
          sendRef.current = (m) => w.postMessage(m);
          disposeRef.current = () => w.terminate();
          emitScroll();
          return;
        } catch (err) {
          worker?.terminate();
          console.warn('[grafo] worker no disponible, uso el hilo principal:', err);
          host.replaceChildren();
        }
      }
      await startMain(host, common, binUrl).catch(teardown);
    },
    [emitScroll, onEvent, startMain, teardown],
  );

  // Arranque: la sonda en idle (crea y suelta un contexto WebGL2). Con movimiento reducido, solo el botón.
  useEffect(() => {
    let cancelled = false;
    const decide = () => {
      if (cancelled) return;
      const env = browserProbeEnv();
      if (env.reducedMotion && env.override !== 'force') setPhase('reduced');
      else if (probe3D(env).ok) void start(readMotionPreference());
    };
    const ric = 'requestIdleCallback' in window;
    const handle = ric ? window.requestIdleCallback(decide, { timeout: 1500 }) : window.setTimeout(decide, 200);
    return () => {
      cancelled = true;
      if (ric) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      disposeRef.current?.();
    };
  }, [start]);

  const activate = useCallback(
    (node: MetaNode) => {
      if (node.kind === 'producto' && node.url) {
        window.open(node.url, '_blank', 'noopener');
        return;
      }
      if (node.kind === 'frente' && node.frente) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- los frentes son del grupo (portal): documento propio, sin navegación en cliente (ver la nota de (home)/page.tsx)
        window.location.assign(`/${locale}/${node.frente}`);
        return;
      }
      const target =
        document.querySelector(`[data-node="${CSS.escape(node.id)}"]`) ??
        document.getElementById(node.kind === 'self' ? 'metodo' : node.kind === 'empresa' ? 'trayectoria' : 'prueba');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    },
    [locale],
  );

  // Puente de eventos mientras el 3D está vivo.
  useEffect(() => {
    if (phase !== 'live' && phase !== 'loading') return;
    const host = hostRef.current;
    if (!host) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    const flush = () => {
      frame = 0;
      if (!last) return;
      const r = host.getBoundingClientRect();
      const target = last.target instanceof Element ? last.target : null;
      send({
        type: 'pointer',
        x: ((last.clientX - r.left) / r.width) * 2 - 1,
        y: -(((last.clientY - r.top) / r.height) * 2 - 1),
        inside: !target?.closest(CONTENT),
      });
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(flush);
    };
    const onLeave = () => send({ type: 'pointer', x: 0, y: 0, inside: false });
    const onClick = (e: MouseEvent) => {
      const current = tipRef.current;
      if (!current || (e.target instanceof Element && e.target.closest(CONTENT))) return;
      activate(current.node);
    };
    const onFocusIn = (e: FocusEvent) => {
      const id = e.target instanceof Element ? e.target.closest('[data-node]')?.getAttribute('data-node') : null;
      const index = id ? (metaRef.current?.findIndex((n) => n.id === id) ?? -1) : -1;
      send({ type: 'focus', index: index >= 0 ? index : null });
    };
    const onFocusOut = () => send({ type: 'focus', index: null });
    const onVisibility = () => send({ type: 'visible', visible: !document.hidden });
    const observer = new ResizeObserver(([entry]) =>
      send({ type: 'resize', width: entry.contentRect.width, height: entry.contentRect.height, dpr: window.devicePixelRatio || 1 }),
    );
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('click', onClick);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    document.addEventListener('visibilitychange', onVisibility);
    observer.observe(host);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('click', onClick);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
    };
  }, [phase, send, activate]);

  const toggleMotion = () => {
    const next = !motion;
    setMotion(next);
    try {
      window.localStorage.setItem(MOTION_KEY, next ? 'on' : 'paused');
    } catch {
      // almacenamiento no disponible: la preferencia vale solo para esta visita
    }
    if (next) delete document.documentElement.dataset.motion;
    else document.documentElement.dataset.motion = 'paused';
    send({ type: 'motion', on: next });
  };

  const actionable = tip && ((tip.node.kind === 'producto' && tip.node.url) || tip.node.kind !== 'producto');

  return (
    <>
      <div ref={hostRef} className="stage-host" aria-hidden="true" />
      {home
        ? createPortal(
            <>
              {phase === 'live' || phase === 'loading' ? (
                <button type="button" className="graph-motion" aria-pressed={!motion} onClick={toggleMotion}>
                  {t.pause}
                </button>
              ) : null}
              {phase === 'reduced' ? (
                <button
                  type="button"
                  className="graph-explore"
                  onClick={() => {
                    setMotion(false);
                    document.documentElement.dataset.motion = 'paused';
                    void start(false);
                  }}
                >
                  {t.explore}
                </button>
              ) : null}
              {tip ? (
                <div className="graph-tip" role="tooltip" style={{ transform: `translate(${Math.round(tip.x)}px, ${Math.round(tip.y)}px)` }}>
                  <p className="graph-tip-kind">{t.kinds[tip.node.kind]}</p>
                  <p className="graph-tip-label">{tip.node.label[locale]}</p>
                  {tip.node.role ? <p className="graph-tip-role">{tip.node.role[locale]}</p> : null}
                  {tip.node.year ? (
                    <p className="graph-tip-years">
                      {tip.node.year} — {tip.node.yearEnd ?? t.present}
                    </p>
                  ) : null}
                  {actionable ? <p className="graph-tip-hint">{t.openHint}</p> : null}
                </div>
              ) : null}
            </>,
            home,
          )
        : null}
    </>
  );
}
