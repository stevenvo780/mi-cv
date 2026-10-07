import { describe, expect, it } from 'vitest';
import { projectDominance } from '@/activity/projects/dominance';

describe('project dominance', () => {
  it('preserves the actual relative difference instead of compressing large counts', () => {
    const leader = projectDominance(1700, 1700);
    const medium = projectDominance(425, 1700);
    const small = projectDominance(17, 1700);
    expect(leader).toEqual({ ratio: 1, tier: 'apex' });
    expect(medium).toEqual({ ratio: .25, tier: 'colossus' });
    expect(small).toEqual({ ratio: .01, tier: 'spark' });
    expect(medium.ratio / small.ratio).toBe(25);
  });

  it('gives tied leaders the same status and recalibrates to the current period', () => {
    const counts = [100, 100, 60];
    const maximum = Math.max(...counts);
    expect(counts.map((count) => projectDominance(count, maximum).tier)).toEqual(['apex', 'apex', 'titan']);
    expect(projectDominance(60, 100)).toEqual({ ratio: .6, tier: 'titan' });
    expect(projectDominance(60, 600)).toEqual({ ratio: .1, tier: 'creature' });
  });

  it('does not crown projects when the record has no activity', () => {
    expect(projectDominance(0, 0)).toEqual({ ratio: 0, tier: 'dormant' });
    expect(projectDominance(0, 50)).toEqual({ ratio: 0, tier: 'dormant' });
  });
});
