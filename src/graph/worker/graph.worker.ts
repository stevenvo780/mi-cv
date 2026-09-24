import { GraphScene } from '../scene/GraphScene';
import { dispatch } from '../runtime/dispatch';
import { createInbox } from '../runtime/inbox';
import { loadGraphBinary } from '../runtime/loader';
import type { MainToWorker, WorkerToMain } from '../runtime/protocol';

/**
 * Worker de la escena 3D (spec §4.4): recibe el OffscreenCanvas transferido y reenvía los mensajes a GraphScene.
 * Lo que llega antes de que la escena esté lista (antes del init, mientras carga el binario o mientras compila) espera
 * en el buzón, que se abre al terminar init: nunca llega un resize ni un focusNode a una escena sin iniciar. Si la carga
 * o init fallan, el buzón no se abre y el hilo principal recibe `error`.
 */
type WorkerScope = {
  postMessage(message: WorkerToMain): void;
  onmessage: ((event: MessageEvent<MainToWorker>) => void) | null;
};
const scope = self as unknown as WorkerScope;

let scene: GraphScene | null = null;
const inbox = createInbox((m) => scene && dispatch(scene, m));

scope.onmessage = (event) => {
  const msg = event.data;
  if (msg.type !== 'init') {
    inbox.push(msg);
    return;
  }
  const s = new GraphScene((e) => scope.postMessage(e));
  scene = s;
  loadGraphBinary(msg.binUrl)
    .then((graph) => s.init({ canvas: msg.canvas, width: msg.width, height: msg.height, dpr: msg.dpr, tier: msg.tier, motion: msg.motion, graph }))
    .then(() => inbox.open())
    .catch((err: unknown) => scope.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) }));
};
