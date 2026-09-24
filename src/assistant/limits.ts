/**
 * Límites del asistente, compartidos por el endpoint (src/app/api/assistant/route.ts, que los hace cumplir) y el panel
 * (que no deja pasarlos). El endpoint es público y cada llamada la paga Steven: estos números acotan el gasto.
 */

/** Caracteres de una pregunta del visitante. */
export const MAX_QUESTION_CHARS = 800;

/** Turnos de historial por petición: 8 preguntas y las 7 respuestas entre ellas (la última es siempre una pregunta). */
export const MAX_TURNS = 8;
export const MAX_HISTORY_MESSAGES = MAX_TURNS * 2 - 1;

/** Caracteres de una respuesta anterior reenviada en el historial (max_tokens ≈ 700 da unos 3 000). */
export const MAX_ANSWER_CHARS = 4000;

/** Tokens de salida por respuesta. */
export const MAX_OUTPUT_TOKENS = 700;
