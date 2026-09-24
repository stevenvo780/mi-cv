import type { Locale } from '@/lib/site';

/** Copy del panel del asistente. Viaja en el chunk del panel (se descarga con el primer clic), no en la home. */
export interface AskCopy {
  kicker: string;
  title: string;
  intro: string;
  suggestionsLabel: string;
  suggestions: [string, string, string];
  placeholder: string;
  inputLabel: string;
  send: string;
  sending: string;
  close: string;
  you: string;
  assistant: string;
  counter: (n: number, max: number) => string;
  note: string;
  whatsapp: string;
  email: string;
  errors: { rate: string; down: string };
}

export const ASK_COPY: Record<Locale, AskCopy> = {
  es: {
    kicker: 'Asistente con IA · Claude',
    title: 'Pregúntame',
    intro: 'Un asistente responde por mí con lo que cuentan mis CV, este catálogo y mis servicios. Pregunta lo que quieras sobre mi trabajo.',
    suggestionsLabel: 'Para empezar',
    suggestions: [
      '¿Qué experiencia tiene Steven en backend e IA?',
      '¿Cómo une la filosofía con la ingeniería?',
      'Quiero contratarlo: ¿qué servicios ofrece?',
    ],
    placeholder: 'Escribe tu pregunta…',
    inputLabel: 'Tu pregunta',
    send: 'Enviar',
    sending: 'Respondiendo…',
    close: 'Cerrar el asistente',
    you: 'Tú',
    assistant: 'Asistente',
    counter: (n, max) => `${n} de ${max} caracteres`,
    note: 'Respuestas generadas con IA: pueden contener errores. Para algo definitivo, escríbeme.',
    whatsapp: 'WhatsApp',
    email: 'Correo',
    errors: {
      rate: 'Llegaste al límite de preguntas por ahora. Sigamos por WhatsApp o por correo.',
      down: 'No pude responder en este momento. Inténtalo de nuevo o escríbeme por WhatsApp o por correo.',
    },
  },
  en: {
    kicker: 'AI assistant · Claude',
    title: 'Ask me',
    intro: 'An assistant answers for me with what my CVs, this catalog and my services say. Ask anything about my work.',
    suggestionsLabel: 'To start',
    suggestions: [
      'What backend and AI experience does Steven have?',
      'How does he bring philosophy and engineering together?',
      'I want to hire him: what services does he offer?',
    ],
    placeholder: 'Type your question…',
    inputLabel: 'Your question',
    send: 'Send',
    sending: 'Answering…',
    close: 'Close the assistant',
    you: 'You',
    assistant: 'Assistant',
    counter: (n, max) => `${n} of ${max} characters`,
    note: 'AI-generated answers: they may contain mistakes. For anything definitive, write to me.',
    whatsapp: 'WhatsApp',
    email: 'Email',
    errors: {
      rate: 'You have reached the question limit for now. Let’s continue on WhatsApp or by email.',
      down: 'I could not answer right now. Try again, or write to me on WhatsApp or by email.',
    },
  },
};
