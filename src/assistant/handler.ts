import Anthropic from '@anthropic-ai/sdk';
import { MAX_ANSWER_CHARS, MAX_HISTORY_MESSAGES, MAX_OUTPUT_TOKENS, MAX_QUESTION_CHARS } from './limits';
import type { RateLimiter } from './rate-limit';

/** Claude Sonnet 5: rápido y capaz; basta para responder sobre un perfil que va entero en el system prompt. */
export const MODEL = 'claude-sonnet-5';

/** Cuerpo máximo de una petición: 15 mensajes de hasta 4 000 caracteres caben con holgura. */
export const MAX_BODY_BYTES = 96 * 1024;

/** Orígenes de producción desde los que la home llama al asistente. */
const PRODUCTION_ORIGINS = new Set(['https://www.stevenvallejo.com', 'https://stevenvallejo.com']);

export type Env = Partial<Record<'VERCEL_ENV' | 'VERCEL_URL' | 'VERCEL_BRANCH_URL', string>>;

export interface AssistantDeps {
  /** Cliente del SDK. Lanza si falta la clave (ANTHROPIC_API_KEY): el endpoint responde 503 sin llamar a nadie. */
  client: () => Pick<Anthropic, 'messages'>;
  limiter: RateLimiter;
  now: () => number;
  system: () => string;
  env: Env;
}

type ErrorCode = 'forbidden' | 'unsupported' | 'too_large' | 'bad_request' | 'rate_limited' | 'unavailable';

/** Errores genéricos: un código y nada más (ni la causa ni lo que respondió la API). */
function fail(status: number, error: ErrorCode, headers: Record<string, string> = {}) {
  return Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

/** Origen de la petición: la cabecera Origin o, si el navegador no la manda, el de Referer. */
export function requestOrigin(request: Request): string | null {
  const origin = request.headers.get('origin');
  if (origin !== null) return origin;
  const referer = request.headers.get('referer');
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

/**
 * Solo la propia home: www.stevenvallejo.com (y el apex), la URL de la propia preview en Vercel y, fuera de producción,
 * localhost. No sustituye al límite por IP (un cliente que no es un navegador puede fijar Origin), pero impide que otra
 * web use el endpoint desde el navegador de sus visitantes.
 */
export function isAllowedOrigin(origin: string | null, env: Env): boolean {
  if (!origin) return false;
  if (PRODUCTION_ORIGINS.has(origin)) return true;
  if (env.VERCEL_ENV === 'preview' && [env.VERCEL_URL, env.VERCEL_BRANCH_URL].some((host) => host && origin === `https://${host}`)) return true;
  if (env.VERCEL_ENV === 'production') return false;
  try {
    const url = new URL(origin);
    return url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
  } catch {
    return false;
  }
}

/** IP del visitante: Vercel reescribe x-forwarded-for (no deja pasar la que mande el cliente). */
export function clientKey(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'anon';
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * `{ messages }`: de 1 a 15 mensajes que alternan pregunta y respuesta, empiezan y terminan en pregunta, con texto no
 * vacío y dentro de su límite (800 caracteres una pregunta, 4 000 una respuesta anterior). Cualquier otra forma, null.
 */
export function parseMessages(raw: string): Anthropic.MessageParam[] | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(data) || !Array.isArray(data.messages)) return null;
  const list: unknown[] = data.messages;
  if (list.length === 0 || list.length > MAX_HISTORY_MESSAGES || list.length % 2 === 0) return null;
  const out: Anthropic.MessageParam[] = [];
  for (const [i, m] of list.entries()) {
    const role = i % 2 === 0 ? 'user' : 'assistant';
    if (!isRecord(m) || m.role !== role || typeof m.content !== 'string') return null;
    const content = m.content.trim();
    if (!content || content.length > (role === 'user' ? MAX_QUESTION_CHARS : MAX_ANSWER_CHARS)) return null;
    out.push({ role, content });
  }
  return out;
}

function logError(error: unknown) {
  // Solo el tipo y el estado: ni la clave ni el contenido de la conversación van a los logs.
  const detail = error instanceof Anthropic.APIError ? `${error.name} ${error.status ?? ''}` : error instanceof Error ? error.name : typeof error;
  console.error(`[assistant] ${detail}`);
}

/**
 * POST /api/assistant. Comprueba origen, tipo, tamaño y forma; cuenta la petición en el límite por IP; y devuelve la
 * respuesta de Claude en streaming como texto plano (UTF-8), trozo a trozo. Si la conexión del visitante se corta, se
 * aborta también la llamada a la API.
 */
export function createAssistantHandler(deps: AssistantDeps) {
  return async function POST(request: Request): Promise<Response> {
    if (!isAllowedOrigin(requestOrigin(request), deps.env)) return fail(403, 'forbidden');
    if (!/^application\/json\b/i.test(request.headers.get('content-type') ?? '')) return fail(415, 'unsupported');
    if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return fail(413, 'too_large');
    let raw: string;
    try {
      raw = await request.text();
    } catch {
      return fail(400, 'bad_request');
    }
    if (raw.length > MAX_BODY_BYTES) return fail(413, 'too_large');
    const messages = parseMessages(raw);
    if (!messages) return fail(400, 'bad_request');

    const verdict = deps.limiter.take(clientKey(request), deps.now());
    if (!verdict.ok) return fail(429, 'rate_limited', { 'Retry-After': String(verdict.retryAfter) });

    let client: Pick<Anthropic, 'messages'>;
    let system: string;
    try {
      client = deps.client();
      system = deps.system();
    } catch (error) {
      logError(error);
      return fail(503, 'unavailable');
    }

    let stream: AsyncIterable<Anthropic.RawMessageStreamEvent> & { controller: AbortController };
    try {
      stream = await client.messages.create(
        {
          model: MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          stream: true,
          // Sin razonamiento visible ni oculto: respuestas cortas sobre un texto dado, y todo max_tokens para la respuesta.
          thinking: { type: 'disabled' },
          output_config: { effort: 'low' },
          // El perfil pesa miles de tokens y no cambia: se cachea y cada pregunta lo lee a una décima parte del precio.
          system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
          messages,
        },
        { signal: request.signal },
      );
    } catch (error) {
      logError(error);
      return fail(502, 'unavailable');
    }

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') controller.enqueue(encoder.encode(event.delta.text));
          }
          controller.close();
        } catch (error) {
          // Si el visitante cerró la conexión, el corte es esperado: ni log ni error.
          if (request.signal.aborted) return;
          logError(error);
          controller.error(new Error('unavailable'));
        }
      },
      cancel() {
        stream.controller.abort();
      },
    });
    return new Response(body, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
  };
}
