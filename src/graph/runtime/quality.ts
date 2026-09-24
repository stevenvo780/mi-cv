export type Tier = 1 | 2 | 3;

export interface TierConfig {
  /** Tope de devicePixelRatio. */
  maxDpr: number;
  /** Nodos decorativos. */
  decor: number;
  /** Bloom real (postprocessing). Sin él, halo aditivo en el propio shader. */
  bloom: boolean;
}

export const TIERS: Record<Tier, TierConfig> = {
  1: { maxDpr: 1, decor: 1500, bloom: false },
  2: { maxDpr: 1.5, decor: 4000, bloom: true },
  3: { maxDpr: 2, decor: 8000, bloom: true },
};

export function initialTier(env: { width: number; mobile: boolean; cores: number }): Tier {
  if (env.mobile || env.width < 900) return 1;
  if (env.cores >= 8 && env.width >= 1280) return 3;
  return 2;
}

const WINDOW = 90;
const SLOW_MS = 20;
const FAST_MS = 10;
const FAST_HOLD_MS = 5000;

/**
 * Regulador (spec §4.4): mediana del tiempo de frame por ventanas de 90 frames; baja de nivel si > 20 ms y sube si
 * < 10 ms sostenido durante 5 s.
 * - El tiempo de frame se mide de dos formas. El intervalo entre frames incluye la GPU (que va asíncrona) y cualquier
 *   atasco, pero nunca baja del refresco de la pantalla (16.7 ms a 60 Hz): decide la bajada. El coste del frame
 *   (update y envío del render) sí baja de 10 ms: decide la subida, siempre que el intervalo no sea lento.
 * - Ese coste se mide en CPU y no ve la GPU, así que una subida puede no aguantar. Cada bajada desde un nivel duplica la
 *   espera para volver a él (5 s, 10 s, 20 s…): sin eso, un equipo limitado por la GPU oscilaría entre dos niveles.
 */
export class QualityGovernor {
  private work: number[] = [];
  private intervals: number[] = [];
  private fastSince: number | null = null;
  /** Bajadas desde cada nivel. */
  private readonly drops: Record<Tier, number> = { 1: 0, 2: 0, 3: 0 };

  constructor(
    public tier: Tier,
    private readonly ceiling: Tier = tier,
  ) {}

  /** `workMs`: coste del frame. `intervalMs`: tiempo desde el frame anterior (si falta, el mismo coste). */
  sample(workMs: number, now: number, intervalMs = workMs): Tier | null {
    this.work.push(workMs);
    this.intervals.push(intervalMs);
    if (this.work.length < WINDOW) return null;
    const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[WINDOW >> 1];
    const work = median(this.work);
    const interval = median(this.intervals);
    this.work = [];
    this.intervals = [];
    if (interval > SLOW_MS) {
      this.fastSince = null;
      if (this.tier > 1) {
        this.drops[this.tier]++;
        this.tier = (this.tier - 1) as Tier;
        return this.tier;
      }
      return null;
    }
    if (work < FAST_MS) {
      this.fastSince ??= now;
      if (this.tier < this.ceiling) {
        const next = (this.tier + 1) as Tier;
        const hold = FAST_HOLD_MS * 2 ** Math.max(this.drops[next] - 1, 0);
        if (now - this.fastSince >= hold) {
          this.tier = next;
          this.fastSince = null;
          return this.tier;
        }
      }
      return null;
    }
    this.fastSince = null;
    return null;
  }
}
