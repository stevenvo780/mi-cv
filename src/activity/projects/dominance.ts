export type DominionTier = 'apex' | 'titan' | 'colossus' | 'creature' | 'spark' | 'dormant';

/** A shared, linear scale for the selected period, separate from the creature's kinetic pulse. */
export function projectDominance(count: number, maximum: number): { ratio: number; tier: DominionTier } {
  const ratio = maximum > 0 ? Math.min(1, Math.max(0, count / maximum)) : 0;
  const tier: DominionTier = ratio === 0 ? 'dormant'
    : ratio === 1 ? 'apex'
    : ratio >= .55 ? 'titan'
    : ratio >= .25 ? 'colossus'
    : ratio >= .05 ? 'creature' : 'spark';
  return { ratio, tier };
}
