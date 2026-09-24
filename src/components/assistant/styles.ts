/**
 * CSS del panel del asistente, como texto que el propio panel pinta en un <style>. Así viaja dentro de su chunk (se pide
 * con el primer clic en «Pregúntame») y no en home.css, que bloquea el render. No va en un .css importado: un import de
 * CSS en un chunk diferido obliga a webpack a meter su cargador de hojas (mini-css-extract) en el runtime, que es JS de
 * la ruta crítica de la home (≈ 400 B gz; spec §5.1). Misma capa y mismos tokens que la home (el <dialog> cuelga de
 * .home).
 */
export const ASK_CSS = `@layer home {
  html:has(.home .ask-dialog[open]) {
    overflow: hidden;
  }

  .home .ask-dialog {
    position: fixed;
    inset: 1rem 1rem 1rem auto;
    width: min(30rem, calc(100vw - 2rem));
    height: auto;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 22px;
    background: transparent;
    color: var(--text);
    overflow: visible;
  }
  .home .ask-dialog::backdrop {
    background: rgb(5 9 11 / 0.62);
    backdrop-filter: blur(6px);
  }
  .home .ask-sheet {
    position: relative;
    display: grid;
    grid-template-rows: auto 1fr auto auto;
    height: 100%;
    overflow: hidden;
    border: 1px solid var(--line-strong);
    border-radius: inherit;
    background:
      radial-gradient(120% 55% at 100% 0%, rgb(67 181 166 / 0.17), transparent 62%),
      radial-gradient(90% 45% at 0% 100%, rgb(224 168 94 / 0.12), transparent 60%),
      var(--ink-1);
    box-shadow:
      0 40px 120px -30px rgb(0 0 0 / 0.9),
      0 0 0 1px rgb(67 181 166 / 0.06) inset;
  }
  @media (prefers-reduced-motion: no-preference) {
    .home .ask-dialog[open] .ask-sheet {
      animation: ask-in 0.5s var(--ease-out) both;
    }
    .home .ask-dialog[open]::backdrop {
      animation: ask-fade 0.4s ease-out both;
    }
  }
  @keyframes ask-in {
    from {
      opacity: 0;
      transform: translateX(2.5rem) scale(0.98);
    }
  }
  @keyframes ask-fade {
    from {
      opacity: 0;
    }
  }

  /* ── Cabecera ── */
  .home .ask-head {
    position: relative;
    display: grid;
    gap: 0.35rem;
    padding: 1.4rem 4rem 1.1rem 1.5rem;
    border-bottom: 1px solid var(--line);
  }
  .home .ask-constellation {
    width: 7.5rem;
    height: 2.5rem;
    margin-bottom: 0.35rem;
    overflow: visible;
  }
  .home .ask-constellation path {
    fill: none;
    stroke: rgb(111 211 196 / 0.35);
    stroke-width: 0.8;
  }
  .home .ask-constellation circle {
    fill: var(--teal-2);
    filter: drop-shadow(0 0 4px rgb(111 211 196 / 0.8));
  }
  .home .ask-constellation .gold {
    fill: var(--gold-2);
    filter: drop-shadow(0 0 5px rgb(240 200 135 / 0.9));
  }
  .home .ask-constellation .violet {
    fill: var(--violet);
  }
  @media (prefers-reduced-motion: no-preference) {
    .home .ask-constellation circle {
      animation: ask-pulse 3.2s ease-in-out infinite;
    }
    .home .ask-constellation circle:nth-of-type(2n) {
      animation-delay: -1.6s;
    }
    .home .ask-constellation circle:nth-of-type(3n) {
      animation-delay: -0.8s;
    }
  }
  @keyframes ask-pulse {
    50% {
      opacity: 0.35;
    }
  }
  .home .ask-kicker {
    font-family: var(--f-mono);
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--teal-2);
  }
  .home .ask-title {
    font-family: var(--f-display);
    font-size: clamp(2.2rem, 5vw, 2.9rem);
    line-height: 0.95;
    letter-spacing: -0.02em;
    color: var(--text-strong);
  }
  .home .ask-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    background: rgb(5 9 11 / 0.5);
    color: var(--text-soft);
    cursor: pointer;
    transition:
      color 0.3s,
      border-color 0.3s;
  }
  .home .ask-close::before {
    content: '';
    width: 0.9rem;
    height: 0.9rem;
    background: currentColor;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M2 2l12 12M14 2L2 14' stroke='%23000' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E") center / contain no-repeat;
  }
  .home .ask-close:hover {
    color: var(--text-strong);
    border-color: var(--gold);
  }

  /* ── Conversación ── */
  .home .ask-log {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 0;
    padding: 1.25rem 1.5rem;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--line-strong) transparent;
  }
  .home .ask-intro {
    font-size: 0.98rem;
    line-height: 1.55;
    color: var(--text-soft);
    text-wrap: pretty;
  }
  .home .ask-suggest {
    display: grid;
    gap: 0.6rem;
    margin-top: 0.25rem;
  }
  .home .ask-suggest-label {
    font-family: var(--f-mono);
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .home .ask-suggest ul {
    display: grid;
    gap: 0.5rem;
  }
  .home .ask-suggest button {
    display: block;
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid var(--line-strong);
    border-radius: 14px;
    background: rgb(5 9 11 / 0.45);
    color: var(--text-strong);
    font: inherit;
    font-size: 0.92rem;
    line-height: 1.4;
    text-align: left;
    cursor: pointer;
    transition:
      border-color 0.3s,
      transform 0.4s var(--ease-out),
      background-color 0.3s;
  }
  .home .ask-suggest button:hover {
    border-color: color-mix(in oklab, var(--gold) 60%, transparent);
    background: rgb(224 168 94 / 0.06);
    transform: translateX(3px);
  }
  .home .ask-msg {
    max-width: 100%;
    font-size: 0.95rem;
    line-height: 1.6;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .home .ask-user {
    align-self: flex-end;
    max-width: 85%;
    padding: 0.7rem 1rem;
    border: 1px solid color-mix(in oklab, var(--teal) 45%, transparent);
    border-radius: 16px 16px 4px 16px;
    background: rgb(67 181 166 / 0.1);
    color: var(--text-strong);
  }
  .home .ask-assistant {
    padding-left: 1rem;
    border-left: 2px solid transparent;
    border-image: linear-gradient(var(--teal), var(--gold)) 1;
    color: var(--text);
  }
  .home .ask-assistant a {
    color: var(--gold-2);
  }
  .home .ask-msg[data-failed] {
    opacity: 0.85;
  }
  .home .ask-error {
    margin-top: 0.4rem;
    white-space: normal;
    color: var(--gold-2);
  }
  .home .ask-error a,
  .home .ask-note a {
    color: var(--text-strong);
  }
  .home .ask-caret {
    display: inline-block;
    width: 0.55em;
    height: 1.05em;
    margin-left: 0.15em;
    vertical-align: -0.15em;
    border-radius: 2px;
    background: linear-gradient(var(--teal-2), var(--gold-2));
  }
  @media (prefers-reduced-motion: no-preference) {
    .home .ask-caret {
      animation: ask-blink 1s steps(2, start) infinite;
    }
  }
  @keyframes ask-blink {
    to {
      visibility: hidden;
    }
  }

  /* ── Redacción ── */
  .home .ask-form {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 0.35rem 0.6rem;
    padding: 0.9rem 1.25rem 0.4rem;
    border-top: 1px solid var(--line);
  }
  .home .ask-form textarea {
    width: 100%;
    min-height: 3rem;
    max-height: 9rem;
    padding: 0.75rem 1rem;
    resize: none;
    field-sizing: content;
    border: 1px solid var(--line-strong);
    border-radius: 16px;
    background: rgb(5 9 11 / 0.6);
    color: var(--text-strong);
    font: inherit;
    font-size: 0.95rem;
    line-height: 1.45;
  }
  .home .ask-form textarea::placeholder {
    color: var(--muted);
  }
  .home .ask-form textarea:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
  }
  .home .ask-send {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--teal-2), var(--gold-2));
    color: var(--ink-0);
    cursor: pointer;
    transition:
      transform 0.4s var(--ease-out),
      opacity 0.3s;
  }
  .home .ask-send::before {
    content: '';
    width: 1.1rem;
    height: 1.1rem;
    background: currentColor;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M8 13V3M3.5 7.5 8 3l4.5 4.5' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
  }
  .home .ask-send:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  .home .ask-send:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .home .ask-count {
    grid-column: 1;
    padding-left: 0.4rem;
    font-family: var(--f-mono);
    font-size: 0.66rem;
    letter-spacing: 0.06em;
    color: var(--muted);
  }
  .home .ask-note {
    padding: 0.2rem 1.5rem 1.1rem;
    font-size: 0.78rem;
    line-height: 1.5;
    color: var(--muted);
  }

  /* Móvil: hoja inferior a casi toda la altura. */
  @media (max-width: 640px) {
    .home .ask-dialog {
      inset: auto 0 0 0;
      width: 100%;
      height: min(92svh, 100%);
      border-radius: 22px 22px 0 0;
    }
    .home .ask-head {
      padding: 1.1rem 3.75rem 0.9rem 1.15rem;
    }
    .home .ask-log {
      padding: 1rem 1.15rem;
    }
    .home .ask-form {
      padding: 0.75rem 1rem 0.35rem;
    }
    .home .ask-note {
      padding: 0.15rem 1.15rem calc(0.9rem + env(safe-area-inset-bottom));
    }
    @media (prefers-reduced-motion: no-preference) {
      .home .ask-dialog[open] .ask-sheet {
        animation-name: ask-up;
      }
    }
  }
  @keyframes ask-up {
    from {
      opacity: 0;
      transform: translateY(3rem);
    }
  }
}
`;
