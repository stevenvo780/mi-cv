import type { DecodedGraph } from '../codec';
import type { GraphScene } from '../scene/GraphScene';
import { dispatch } from './dispatch';
import { createInbox } from './inbox';
import type { MainToWorker, SceneEvent } from './protocol';
import type { Tier } from './quality';

type Msg = Exclude<MainToWorker, { type: 'init' }>;
type Size = { width: number; height: number; dpr: number };
type SceneClass = new (emit: (e: SceneEvent) => void) => GraphScene;

export interface LaunchOptions {
  tier: Tier;
  binUrl: string;
  /** Tamaño vigente del escenario. Se lee al arrancar cada vía, no al pedir el arranque. */
  size(): Size;
  /** Preferencia de movimiento vigente (la pausa del usuario). Se lee al arrancar cada vía. */
  motion(): boolean;
  /** Crea un canvas `.stage-canvas` dentro del escenario y lo devuelve. */
  mountCanvas(): HTMLCanvasElement;
  /** Vacía el escenario (el canvas transferido al worker no se puede reutilizar). */
  clearHost(): void;
  /** Crea el worker de la escena, o null si no se puede usar (sin Worker, sin OffscreenCanvas con WebGL2, `?worker=off`). */
  createWorker: (() => Worker) | null;
  /** `import()` del chunk de GraphScene (three): solo lo pide el hilo principal. */
  loadScene(): Promise<SceneClass>;
  loadGraph(url: string): Promise<DecodedGraph>;
  onEvent(e: SceneEvent): void;
  /** Ninguna vía pudo arrancar la escena: se vuelve al póster. */
  onFail(): void;
  warn(message: string, detail: unknown): void;
}

export interface SceneLink {
  send(m: Msg): void;
  dispose(): void;
}

/**
 * Arranca la escena (spec §4.4, paso 3): en un worker con OffscreenCanvas y, sin él, GraphScene en el hilo principal.
 * `send` funciona desde el primer momento en las dos vías: lo que llega antes de que la escena esté lista espera en un
 * buzón (el del worker o uno propio aquí). Si el worker falla antes de `ready` (OffscreenCanvas sin WebGL2, chunk que no
 * carga, init que lanza) o por `onerror`, se pasa al hilo principal con el estado vigente: la pausa, el tamaño y el
 * último mensaje de cada tipo se repiten en la escena nueva. Un fallo en el hilo principal avisa en consola y llama a
 * `onFail`.
 */
export function launchScene(o: LaunchOptions): SceneLink {
  /** Último mensaje de cada tipo: se repite si hay que cambiar del worker al hilo principal. */
  const latest = new Map<Msg['type'], Msg>();
  let current: SceneLink = { send: () => {}, dispose: () => {} };
  let disposed = false;

  const startMain = () => {
    const canvas = o.mountCanvas();
    let scene: GraphScene | null = null;
    let gone = false;
    const inbox = createInbox((m) => scene && dispatch(scene, m));
    for (const m of latest.values()) inbox.push(m);
    current = {
      send: inbox.push,
      dispose: () => {
        gone = true;
        scene?.dispose();
      },
    };
    Promise.all([o.loadScene(), o.loadGraph(o.binUrl)])
      .then(async ([Scene, graph]) => {
        if (gone) return;
        const s = new Scene(o.onEvent);
        scene = s;
        await s.init({ canvas, graph, tier: o.tier, motion: o.motion(), ...o.size() });
        if (!gone) inbox.open();
      })
      .catch((err: unknown) => {
        if (gone) return;
        o.warn('[grafo] fallback sin escena:', err);
        o.onFail();
      });
  };

  const fallBack = (reason: string, detail: unknown) => {
    current.dispose();
    o.clearHost();
    o.warn(reason, detail);
    startMain();
  };

  const startWorker = (createWorker: () => Worker) => {
    const canvas = o.mountCanvas();
    let worker: Worker | undefined;
    try {
      const w = createWorker();
      worker = w;
      const offscreen = canvas.transferControlToOffscreen();
      let ready = false;
      let dead = false;
      current = {
        send: (m) => w.postMessage(m),
        dispose: () => {
          dead = true;
          w.terminate();
        },
      };
      w.onmessage = (ev: MessageEvent<SceneEvent>) => {
        if (dead) return;
        const e = ev.data;
        // Un error antes de ready es un worker que no puede pintar: se prueba el hilo principal en vez del póster.
        if (e.type === 'error' && !ready) fallBack('[grafo] el worker falló, uso el hilo principal:', e.message);
        else {
          if (e.type === 'ready') ready = true;
          o.onEvent(e);
        }
      };
      w.onerror = (ev) => {
        ev.preventDefault();
        // Un chunk que no carga llega como Event sin `message`: entonces se registra el evento entero.
        if (!dead) fallBack('[grafo] el worker falló, uso el hilo principal:', ev.message || ev);
      };
      const init: MainToWorker = { type: 'init', canvas: offscreen, binUrl: o.binUrl, tier: o.tier, motion: o.motion(), ...o.size() };
      w.postMessage(init, [offscreen]);
    } catch (err) {
      // Enmienda H8: el worker creado no queda huérfano si falla la transferencia o el postMessage.
      worker?.terminate();
      current = { send: () => {}, dispose: () => {} };
      o.clearHost();
      o.warn('[grafo] worker no disponible, uso el hilo principal:', err);
      startMain();
    }
  };

  if (o.createWorker) startWorker(o.createWorker);
  else startMain();

  return {
    send(m) {
      if (disposed) return;
      latest.set(m.type, m);
      current.send(m);
    },
    dispose() {
      disposed = true;
      current.dispose();
    },
  };
}
