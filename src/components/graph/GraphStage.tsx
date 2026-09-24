'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSectionProgress } from '@/components/home/useSectionProgress';
import type { HomeCopy } from '@/content/home';
import type { GraphMeta, MetaNode } from '@/graph/codec';
import { GRAPH_ASSET } from '@/graph/generated/stats';
import { launchScene } from '@/graph/runtime/launch';
import { loadGraphBinary } from '@/graph/runtime/loader';
import { browserProbeEnv, offscreenWebGL2, probe3D } from '@/graph/runtime/probe';
import type { MainToWorker, SceneEvent } from '@/graph/runtime/protocol';
import { initialTier } from '@/graph/runtime/quality';
import type { Locale } from '@/lib/site';

type Phase = 'poster' | 'loading' | 'live' | 'reduced';
type Msg = Exclude<MainToWorker, { type: 'init' }>;
interface Tip {
  node: MetaNode;
  x: number;
  y: number;
}

/** Zonas donde el puntero pertenece al contenido y no al grafo. */
const CONTENT =
  'a, button, input, select, textarea, summary, label, [role="button"], .panel, .card, .cat, .cats-head, .sec-head, .hero-meta, .front-head, .contact-list, .stack-group, .figures, .search, .topbar, .footer, .graph-motion, .graph-explore';
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
 * sin él (o si el worker falla antes de pintar), en el hilo principal: lo decide `launchScene`. Los controles y el
 * tooltip van por portal a `.home`: `.stage` es aria-hidden (§4.8).
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
  /** La pausa vigente para quien arranque la escena más tarde (tras cargar three o al pasar del worker al hilo principal). */
  const motionRef = useRef(motion);
  // Solo se monta en cliente (la puerta lo importa tras un efecto): document existe.
  const [home] = useState(() => document.querySelector('.home'));
  const [motionSlot] = useState(() => document.getElementById('graph-motion-slot'));

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

  const start = useCallback(() => {
    const host = hostRef.current;
    if (!host || sendRef.current) return;
    setPhase('loading');
    fetch(GRAPH_ASSET.meta)
      .then((r) => r.json() as Promise<GraphMeta>)
      .then((m) => {
        metaRef.current = m.nodes;
      })
      .catch((err: unknown) => console.warn('[grafo] sin fichas de nodos:', err));
    const allowWorker = new URLSearchParams(window.location.search).get('worker') !== 'off';
    const link = launchScene({
      tier: initialTier({ width: window.innerWidth, mobile: window.matchMedia('(pointer: coarse)').matches, cores: navigator.hardwareConcurrency ?? 4 }),
      binUrl: new URL(GRAPH_ASSET.bin, window.location.href).toString(),
      size: () => {
        const rect = host.getBoundingClientRect();
        return { width: rect.width, height: rect.height, dpr: window.devicePixelRatio || 1 };
      },
      motion: () => motionRef.current,
      mountCanvas: () => {
        const canvas = document.createElement('canvas');
        canvas.className = 'stage-canvas';
        host.appendChild(canvas);
        return canvas;
      },
      clearHost: () => host.replaceChildren(),
      // Safari 16.4–16.x tiene OffscreenCanvas sin WebGL2: ahí va directo al hilo principal (spec §8).
      createWorker:
        allowWorker && typeof Worker !== 'undefined' && 'transferControlToOffscreen' in HTMLCanvasElement.prototype && offscreenWebGL2()
          ? () => new Worker(new URL('../../graph/worker/graph.worker.ts', import.meta.url), { type: 'module' })
          : null,
      loadScene: async () => {
        // Destructurado en la propia sentencia: webpack ve que solo se usa GraphScene, como en el worker, y los dos
        // comparten el mismo chunk de la escena. Con el namespace entero, el worker se llevaba su propia copia.
        const { GraphScene } = await import('@/graph/scene/GraphScene');
        return GraphScene;
      },
      loadGraph: (url) => loadGraphBinary(url),
      onEvent,
      onFail: teardown,
      warn: (message, detail) => console.warn(message, detail),
    });
    sendRef.current = link.send;
    disposeRef.current = link.dispose;
    emitScroll();
  }, [emitScroll, onEvent, teardown]);

  // Arranque: la sonda en idle (crea y suelta un contexto WebGL2). Con movimiento reducido, solo el botón.
  useEffect(() => {
    let cancelled = false;
    const decide = () => {
      if (cancelled) return;
      const env = browserProbeEnv();
      if (env.reducedMotion && env.override !== 'force') setPhase('reduced');
      else if (probe3D(env).ok) start();
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
      // Un nodo sin tarjeta propia (yo, empresa, herramienta, concepto) lleva al hero o al catálogo.
      const target =
        document.querySelector(`[data-node="${CSS.escape(node.id)}"]`) ?? document.getElementById(node.kind === 'self' ? 'hero-title' : 'frentes');
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
    motionRef.current = next;
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
      {(phase === 'live' || phase === 'loading') && (motionSlot ?? home)
        ? createPortal(
            <button type="button" className="graph-motion" aria-pressed={!motion} aria-label={t.pause} title={t.pause} onClick={toggleMotion} />,
            (motionSlot ?? home) as Element,
          )
        : null}
      {home
        ? createPortal(
            <>
              {phase === 'reduced' ? (
                <button
                  type="button"
                  className="graph-explore"
                  onClick={() => {
                    // A demanda y sin autoplay (§4.8): arranca en pausa.
                    setMotion(false);
                    motionRef.current = false;
                    document.documentElement.dataset.motion = 'paused';
                    start();
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
