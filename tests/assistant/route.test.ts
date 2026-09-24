import { readFileSync } from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { INSTRUCTIONS, PROFILE_PATH, systemPrompt } from '@/assistant/prompt';

// El SDK de Anthropic, simulado entero: ni una llamada sale a la red y la clave es de mentira.
const sdk = vi.hoisted(() => ({ create: vi.fn(), options: [] as unknown[] }));
vi.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error {
    status?: number;
  }
  class Anthropic {
    static APIError = APIError;
    messages = { create: sdk.create };
    constructor(options: unknown) {
      sdk.options.push(options);
    }
  }
  return { default: Anthropic, APIError };
});

type Route = typeof import('@/app/api/assistant/route');
let route: Route;

beforeAll(async () => {
  vi.stubEnv('VERCEL_ENV', '');
  route = await import('@/app/api/assistant/route');
});

beforeEach(() => {
  sdk.create.mockReset();
  sdk.create.mockImplementation(async () =>
    Object.assign(
      (async function* () {
        yield { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Vive en Medellín.' } };
      })(),
      { controller: new AbortController() },
    ),
  );
});

const ask = (ip: string) =>
  route.POST(
    new Request('http://localhost:3210/api/assistant', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3210', 'x-forwarded-for': ip },
      body: JSON.stringify({ messages: [{ role: 'user', content: '¿Dónde vive Steven?' }] }),
    }),
  );

describe('route /api/assistant', () => {
  it('es Node.js, con maxDuration, y solo exporta POST', () => {
    expect(route.runtime).toBe('nodejs');
    expect(route.maxDuration).toBeGreaterThan(0);
    expect(Object.keys(route).sort()).toEqual(['POST', 'maxDuration', 'runtime']);
  });

  it('sin ANTHROPIC_API_KEY responde 503 sin crear el cliente', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    const res = await ask('192.0.2.1');
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'unavailable' });
    expect(sdk.create).not.toHaveBeenCalled();
  });

  it('con la clave, llama al SDK con el system prompt completo (instrucciones + perfil) cacheado', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-de-prueba');
    const res = await ask('192.0.2.2');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Vive en Medellín.');
    expect(sdk.options.at(-1)).toMatchObject({ apiKey: 'sk-ant-de-prueba', maxRetries: 1 });
    const [params] = sdk.create.mock.calls[0];
    expect(params.model).toBe('claude-sonnet-5');
    expect(params.system).toEqual([{ type: 'text', text: systemPrompt(), cache_control: { type: 'ephemeral' } }]);
  });
});

describe('system prompt del asistente', () => {
  const profile = readFileSync(PROFILE_PATH, 'utf8');

  it('lleva las instrucciones y el perfil entero, sin nada variable', () => {
    const prompt = systemPrompt();
    expect(prompt.startsWith(INSTRUCTIONS)).toBe(true);
    expect(prompt).toContain(`<perfil>\n${profile.trim()}\n</perfil>`);
    // Nada que cambie entre peticiones: la caché de prompts depende de un prefijo idéntico.
    expect(systemPrompt()).toBe(prompt);
  });

  it('las instrucciones fijan idioma, fuente única, contacto, contratación y tema', () => {
    expect(INSTRUCTIONS).toMatch(/idioma en que escribe el visitante/);
    expect(INSTRUCTIONS).toMatch(/usa únicamente hechos del perfil/);
    expect(INSTRUCTIONS).toContain('https://wa.me/573023954534');
    expect(INSTRUCTIONS).toContain('stevenvallejo780@gmail.com');
    expect(INSTRUCTIONS).toContain('https://praxis.stevenvallejo.com');
    expect(INSTRUCTIONS).toMatch(/solo hablas de Steven/);
  });

  it('el perfil generado cubre CV, catálogo, servicios y ecosistema, y supera el mínimo cacheable', () => {
    for (const fact of [
      'CV informático completo',
      'CV filosófico',
      'Finca Directa',
      'Universidad de Antioquia',
      'Catálogo de trabajos',
      'https://praxis.stevenvallejo.com',
      'https://schole.stevenvallejo.com',
      'https://informatico.stevenvallejo.com',
      'https://filosofo.stevenvallejo.com',
    ]) {
      expect(profile, fact).toContain(fact);
    }
    // Sonnet 5 solo cachea prefijos de 1 024 tokens o más; el perfil ronda los 18 000.
    expect(profile.length).toBeGreaterThan(20_000);
    expect(profile).not.toMatch(/sk-ant-|ANTHROPIC_API_KEY/);
  });

  it('next.config incluye el perfil en la traza de la función', () => {
    expect(readFileSync('next.config.mjs', 'utf8')).toMatch(/outputFileTracingIncludes:\s*\{\s*'\/api\/assistant':\s*\['\.\/src\/assistant\/profile\.md'\]/);
  });
});
