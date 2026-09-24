import Anthropic from '@anthropic-ai/sdk';
import { createAssistantHandler } from '@/assistant/handler';
import { systemPrompt } from '@/assistant/prompt';
import { createRateLimiter } from '@/assistant/rate-limit';

// Node.js (no Edge): el SDK de Anthropic y la lectura del perfil desde el disco.
export const runtime = 'nodejs';
// Una respuesta de 700 tokens en streaming tarda segundos; 30 s cubren los reintentos del SDK.
export const maxDuration = 30;

let client: Anthropic | undefined;

/**
 * Asistente de la home: responde preguntas sobre el perfil de Steven con Claude Sonnet 5. La clave vive en Vercel
 * (ANTHROPIC_API_KEY, production y preview); sin ella, el endpoint responde 503. Solo POST: Next contesta 405 al resto.
 */
export const POST = createAssistantHandler({
  client: () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY no está definida');
    client ??= new Anthropic({ apiKey, maxRetries: 1, timeout: 25_000 });
    return client;
  },
  limiter: createRateLimiter(),
  now: Date.now,
  system: systemPrompt,
  env: { VERCEL_ENV: process.env.VERCEL_ENV, VERCEL_URL: process.env.VERCEL_URL, VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL },
});
