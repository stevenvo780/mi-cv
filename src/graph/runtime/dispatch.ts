import type { GraphScene } from '../scene/GraphScene';
import type { MainToWorker } from './protocol';

/** Aplica un mensaje del hilo principal a la escena. Lo comparten el worker y el fallback en el hilo principal. */
export function dispatch(scene: GraphScene, msg: Exclude<MainToWorker, { type: 'init' }>): void {
  switch (msg.type) {
    case 'resize':
      scene.resize(msg.width, msg.height, msg.dpr);
      break;
    case 'pointer':
      scene.setPointer(msg.x, msg.y, msg.inside);
      break;
    case 'scroll':
      scene.setScroll(msg.s);
      break;
    case 'motion':
      scene.setMotion(msg.on);
      break;
    case 'focus':
      scene.focusNode(msg.index);
      break;
    case 'visible':
      scene.setVisible(msg.visible);
      break;
    case 'dispose':
      scene.dispose();
      break;
    default: {
      // Si el protocolo gana una variante sin su caso, esto deja de compilar. En ejecución, un mensaje que no es
      // del protocolo se ignora.
      const _exhaustive: never = msg;
      return _exhaustive;
    }
  }
}
