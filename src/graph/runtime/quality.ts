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

/** Mediana del tiempo de frame por ventanas de 90 frames: baja si > 20 ms, sube si < 10 ms durante 5 s. */
export class QualityGovernor {
  private samples: number[] = [];
  private fastSince: number | null = null;

  constructor(
    public tier: Tier,
    private readonly ceiling: Tier = tier,
  ) {}

  sample(frameMs: number, now: number): Tier | null {
    this.samples.push(frameMs);
    if (this.samples.length < WINDOW) return null;
    const median = [...this.samples].sort((a, b) => a - b)[WINDOW >> 1];
    this.samples = [];
    if (median > SLOW_MS) {
      this.fastSince = null;
      if (this.tier > 1) {
        this.tier = (this.tier - 1) as Tier;
        return this.tier;
      }
      return null;
    }
    if (median < FAST_MS) {
      this.fastSince ??= now;
      if (now - this.fastSince >= FAST_HOLD_MS && this.tier < this.ceiling) {
        this.tier = (this.tier + 1) as Tier;
        this.fastSince = null;
        return this.tier;
      }
      return null;
    }
    this.fastSince = null;
    return null;
  }
}
