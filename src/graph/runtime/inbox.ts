import type { MainToWorker } from './protocol';

type Msg = Exclude<MainToWorker, { type: 'init' }>;

/**
 * Buzón de una escena que aún no está lista. GraphScene no admite resize ni focusNode antes de init (sus datos aún no
 * existen), así que hasta `open()` los mensajes se guardan, solo el último de cada tipo (un resize viejo no pisa al
 * nuevo). `open()` los aplica y desde entonces cada mensaje pasa directo. Lo usan el worker y el fallback en el hilo
 * principal.
 */
export function createInbox(apply: (m: Msg) => void) {
  const queued = new Map<Msg['type'], Msg>();
  let open = false;
  return {
    push(m: Msg) {
      if (open) apply(m);
      else queued.set(m.type, m);
    },
    open() {
      for (const m of queued.values()) apply(m);
      queued.clear();
      open = true;
    },
  };
}
