'use client';

import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { MAX_ANSWER_CHARS, MAX_HISTORY_MESSAGES, MAX_QUESTION_CHARS } from '@/assistant/limits';
import { EMAIL, WHATSAPP_URL } from '@/lib/ecosystem';
import type { PanelProps } from './AssistantGate';
import { ASK_COPY } from './copy';
import { ASK_CSS } from './styles';

type Message = { role: 'user' | 'assistant'; content: string; failed?: 'rate' | 'down' };

/** URLs y correos de una respuesta, como enlaces; el resto, texto (React lo escapa). */
const LINK = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?"'»”)]|[\w.+-]+@[\w-]+\.[\w.-]*\w)/g;

function linkify(text: string): ReactNode[] {
  return text.split(LINK).map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    const href = part.includes('@') && !part.startsWith('http') ? `mailto:${part}` : part;
    return (
      <a key={i} href={href} target="_blank" rel="noopener">
        {part}
      </a>
    );
  });
}

/** El prompt pide texto plano; si aun así llega Markdown ligero, se quitan sus marcas. */
const plain = (text: string) => text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#{1,6}\s+/gm, '');

/**
 * Foco en el campo de la pregunta, salvo en pantallas táctiles: ahí abriría el teclado y taparía las sugerencias (el
 * <dialog> ya enfoca su primer control, el botón de cerrar).
 */
const focusInput = (el: HTMLTextAreaElement | null) => {
  if (!matchMedia('(pointer: coarse)').matches) el?.focus();
};

/**
 * Historial que viaja al endpoint: sin los turnos fallidos, con cada respuesta dentro del límite que acepta el endpoint
 * y solo lo último que cabe (empieza siempre por una pregunta).
 */
function history(messages: Message[]) {
  const ok = messages.filter((m) => !m.failed && m.content).map(({ role, content }) => ({ role, content: content.slice(0, MAX_ANSWER_CHARS) }));
  return ok.slice(-MAX_HISTORY_MESSAGES);
}

export default function AssistantPanel({ locale, opener, onClose }: PanelProps) {
  const c = ASK_COPY[locale];
  const open = opener !== null;
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      focusInput(input.current);
    } else if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const l = log.current;
    if (l) l.scrollTop = l.scrollHeight;
  }, [messages]);

  // Al cerrar, el foco vuelve al botón que abrió el panel; si era el del menú móvil (ya cerrado), a su <summary>.
  const handleClose = () => {
    onClose();
    const visible = opener && (opener.checkVisibility?.() ?? opener.getClientRects().length > 0);
    const target = visible ? opener : opener?.closest('details')?.querySelector('summary');
    target?.focus();
  };

  const patchLast = (update: (m: Message) => Message) => setMessages((all) => [...all.slice(0, -1), update(all[all.length - 1])]);

  async function ask(text: string) {
    const question = text.trim().slice(0, MAX_QUESTION_CHARS);
    if (!question || busy) return;
    const body = JSON.stringify({ messages: history([...messages, { role: 'user', content: question }]) });
    setDraft('');
    setBusy(true);
    setMessages((all) => [...all, { role: 'user', content: question }, { role: 'assistant', content: '' }]);
    try {
      const res = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      if (!res.ok || !res.body) throw new Error(res.status === 429 ? 'rate' : 'down');
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let received = '';
      for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
        received += chunk.value;
        const content = received;
        patchLast((m) => ({ ...m, content }));
      }
      if (!received.trim()) throw new Error('down');
    } catch (error) {
      const failed = error instanceof Error && error.message === 'rate' ? 'rate' : 'down';
      // La pregunta y su respuesta (vacía o a medias) salen del historial que se reenvía.
      setMessages((all) => [...all.slice(0, -2), { ...all[all.length - 2], failed }, { ...all[all.length - 1], failed }]);
    } finally {
      setBusy(false);
      focusInput(input.current);
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void ask(draft);
  };
  // Enter envía; Mayús+Enter salta de línea.
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void ask(draft);
    }
  };

  const contact = (
    <>
      <a href={WHATSAPP_URL} target="_blank" rel="noopener">
        {c.whatsapp}
      </a>{' '}
      ·{' '}
      <a href={`mailto:${EMAIL}`}>{c.email}</a>
    </>
  );

  return (
    <dialog
      ref={dialog}
      className="ask-dialog"
      aria-labelledby="ask-title"
      aria-describedby="ask-intro"
      onClose={handleClose}
      // Un clic en el fondo (fuera de .ask-sheet) llega al propio <dialog>: cierra.
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
    >
      <style>{ASK_CSS}</style>
      <div className="ask-sheet">
        <header className="ask-head">
          <svg className="ask-constellation" viewBox="0 0 120 40" aria-hidden="true">
            <path d="M8 30 34 12 58 24 84 8 112 22M34 12 46 34 58 24M84 8 96 32" />
            <circle cx="8" cy="30" r="2.2" />
            <circle cx="34" cy="12" r="3" />
            <circle cx="46" cy="34" r="1.8" />
            <circle className="gold" cx="58" cy="24" r="3.4" />
            <circle cx="84" cy="8" r="2.4" />
            <circle className="violet" cx="96" cy="32" r="2" />
            <circle cx="112" cy="22" r="2.6" />
          </svg>
          <p className="ask-kicker">{c.kicker}</p>
          <h2 id="ask-title" className="ask-title">
            {c.title}
          </h2>
          <button type="button" className="ask-close" aria-label={c.close} onClick={() => dialog.current?.close()} />
        </header>

        <div ref={log} className="ask-log" role="log" aria-live="polite" aria-busy={busy} aria-labelledby="ask-title">
          <p id="ask-intro" className="ask-intro">
            {c.intro}
          </p>
          {messages.length === 0 && (
            <div className="ask-suggest">
              <p className="ask-suggest-label">{c.suggestionsLabel}</p>
              <ul>
                {c.suggestions.map((s) => (
                  <li key={s}>
                    <button type="button" onClick={() => void ask(s)}>
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`ask-msg ask-${m.role}`} data-failed={m.failed}>
              <span className="sr-only">{m.role === 'user' ? c.you : c.assistant}: </span>
              {m.role === 'user' ? m.content : linkify(plain(m.content))}
              {m.role === 'assistant' && busy && i === messages.length - 1 && <span className="ask-caret" aria-hidden="true" />}
              {m.role === 'assistant' && m.failed && (
                <p className="ask-error">
                  {c.errors[m.failed]} {contact}
                </p>
              )}
            </div>
          ))}
        </div>

        <form className="ask-form" onSubmit={submit}>
          <label className="sr-only" htmlFor="ask-input">
            {c.inputLabel}
          </label>
          <textarea
            ref={input}
            id="ask-input"
            rows={2}
            maxLength={MAX_QUESTION_CHARS}
            placeholder={c.placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            aria-describedby="ask-count"
          />
          <button type="submit" className="ask-send" disabled={busy || !draft.trim()}>
            <span className="sr-only">{busy ? c.sending : c.send}</span>
          </button>
          <p id="ask-count" className="ask-count" aria-live="off">
            {c.counter(draft.length, MAX_QUESTION_CHARS)}
          </p>
        </form>
        <p className="ask-note">
          {c.note} {contact}
        </p>
      </div>
    </dialog>
  );
}
