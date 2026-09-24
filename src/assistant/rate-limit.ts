/**
 * Límite de peticiones del asistente, en memoria de cada instancia de la función (Fluid Compute reutiliza instancias,
 * pero puede haber varias y un despliegue las reinicia): es una barrera contra el abuso casual y los bucles, no una
 * cuota exacta. Ventanas deslizantes por IP (8 cada 10 min y 40 al día) y un tope diario global por instancia, que
 * acota el gasto aunque alguien reparta las peticiones entre muchas IP.
 */
export interface RateLimits {
  windowMs: number;
  perWindow: number;
  dayMs: number;
  perDay: number;
  globalPerDay: number;
  /** IP distintas que se recuerdan; al pasarse se olvida la menos reciente. */
  maxClients: number;
}

export const DEFAULT_LIMITS: RateLimits = {
  windowMs: 10 * 60_000,
  perWindow: 8,
  dayMs: 24 * 60 * 60_000,
  perDay: 40,
  globalPerDay: 500,
  maxClients: 5000,
};

export type Verdict = { ok: true } | { ok: false; retryAfter: number };

export interface RateLimiter {
  /** Cuenta una petición de `key` en el instante `now` (ms), si cabe. */
  take(key: string, now: number): Verdict;
}

export function createRateLimiter(limits: RateLimits = DEFAULT_LIMITS): RateLimiter {
  const clients = new Map<string, number[]>();
  let global: number[] = [];
  // Segundos hasta que caduque el golpe más antiguo de una ventana llena (al menos 1).
  const wait = (oldest: number, span: number, now: number) => ({ ok: false as const, retryAfter: Math.max(1, Math.ceil((oldest + span - now) / 1000)) });
  return {
    take(key, now) {
      const dayStart = now - limits.dayMs;
      global = global.filter((t) => t > dayStart);
      const mine = (clients.get(key) ?? []).filter((t) => t > dayStart);
      const recent = mine.filter((t) => t > now - limits.windowMs);
      if (recent.length >= limits.perWindow) return wait(recent[0], limits.windowMs, now);
      if (mine.length >= limits.perDay) return wait(mine[0], limits.dayMs, now);
      if (global.length >= limits.globalPerDay) return wait(global[0], limits.dayMs, now);
      mine.push(now);
      global.push(now);
      // Reinsertar deja el Map en orden de uso: la primera clave es la menos reciente.
      clients.delete(key);
      clients.set(key, mine);
      if (clients.size > limits.maxClients) clients.delete(clients.keys().next().value!);
      return { ok: true };
    },
  };
}
