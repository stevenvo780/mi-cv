import { describe, expect, it } from 'vitest';
import { COMMIT_STAR_CAP, commitConstellation, commitStarUnit } from '@/activity/projects/constellation';

describe('counted commit constellation', () => {
  it('renders exactly one nucleus for each real commit up to the cap, and none for zero', () => {
    for (const count of [0, 1, 5, 595, 1717, COMMIT_STAR_CAP]) {
      const plan = commitConstellation(count, 1717, 'cauce-v3');
      expect(plan.stars).toHaveLength(count);
      expect(plan.renderedCount).toBe(count);
      expect(plan.unit).toBe(1);
      expect(plan.stars.every((star) => star.weight === 1)).toBe(true);
    }
  });

  it('keeps grouping bounded and publishes the exact represented weight above the cap', () => {
    for (const count of [20_001, 81_937, 1_000_003]) {
      const plan = commitConstellation(count, count, 'argos');
      expect(plan.renderedCount).toBeLessThanOrEqual(COMMIT_STAR_CAP);
      expect(plan.unit).toBe(commitStarUnit(count));
      expect(plan.unit).toBeGreaterThan(1);
      expect(plan.stars.reduce((sum, star) => sum + star.weight, 0)).toBe(count);
      expect(plan.stars.every((star) => star.weight >= 1 && star.weight <= plan.unit)).toBe(true);
    }
  });

  it('never loses density when activity crosses the grouping threshold', () => {
    const atCap = commitConstellation(COMMIT_STAR_CAP, COMMIT_STAR_CAP, 'argos');
    const above = commitConstellation(COMMIT_STAR_CAP + 1, COMMIT_STAR_CAP + 1, 'argos');
    expect(above.renderedCount).toBe(atCap.renderedCount);
    expect(above.unit).toBe(2);
    expect(above.stars.filter((star) => star.weight === 2)).toHaveLength(1);
    expect(above.stars.filter((star) => star.weight === 1)).toHaveLength(COMMIT_STAR_CAP - 1);
    const placements = (stars: typeof above.stars) => stars.map((star) => [star.x, star.y, star.z, star.size, star.phase, star.color]);
    expect(placements(above.stars)).toEqual(placements(atCap.stars));
  });

  it('preserves the real count ratio and square-root radial change within each anatomy', () => {
    const large = commitConstellation(1600, 1600, 'cauce-v3');
    const medium = commitConstellation(400, 1600, 'cauce-v3');
    const small = commitConstellation(16, 1600, 'cauce-v3');
    expect([large.ratio, medium.ratio, small.ratio]).toEqual([1, .25, .01]);
    expect(medium.renderedCount / small.renderedCount).toBe(25);
    expect(large.radius - medium.radius).toBeCloseTo(.54);
    expect(medium.radius - small.radius).toBeCloseTo(.432);
  });

  it('keeps an identity/count prefix stable across count changes at the same ratio', () => {
    const first = commitConstellation(30, 30, 'specorganon');
    const extended = commitConstellation(300, 300, 'specorganon');
    expect(extended.stars.slice(0, 30)).toEqual(first.stars);
    expect(commitConstellation(30, 30, 'specorganon')).toEqual(first);
    expect(commitConstellation(30, 30, 'clavis').stars).not.toEqual(first.stars);
  });

  it('places isolated companion stars outside the silhouette and bounds the whole volume', () => {
    for (const kind of ['hydra', 'sentinel', 'moth', 'nautilus', 'golem', 'sprout'] as const) {
      const small = commitConstellation(5, 1717, 'published-identity', kind);
      expect(small.stars.every((star) => Math.hypot(star.x, (star.y + .13) / .88) >= 2.88)).toBe(true);
      expect(small.stars.every((star) => star.y < 0)).toBe(true);
      expect(small.stars[0].x).toBeGreaterThan(2.3);
      expect(small.stars[0].y).toBeLessThan(-1.35);
      expect(small.stars[0].z).toBeGreaterThan(-1);
      const large = commitConstellation(1717, 1717, 'published-identity', kind);
      for (const star of large.stars) {
        expect(Math.abs(star.x)).toBeLessThan(3.4);
        expect(Math.abs(star.y)).toBeLessThan(3.1);
        expect(star.z).toBeLessThan(-.65);
        expect(star.z).toBeGreaterThan(-2.3);
        expect(star.size).toBeGreaterThan(.06);
        expect([star.x, star.y, star.z, star.size, star.phase].every(Number.isFinite)).toBe(true);
      }
    }
  });

  it('keeps the isolated first six outside the golem hands, stable across count and maximum changes', () => {
    const isolated = commitConstellation(6, 1717, 'reel-forge', 'golem');
    const dense = commitConstellation(1717, 1717, 'reel-forge', 'golem');
    const leader = commitConstellation(6, 6, 'reel-forge', 'golem');
    expect(dense.stars.slice(0, 6)).toEqual(isolated.stars);
    expect(leader.stars).toEqual(isolated.stars);
    const moon = isolated.stars[0];
    // Conservative mobile perspective: its right-hand projection clears the wide hand silhouette.
    const cameraDistance = 11.5;
    expect(moon.x / (cameraDistance - moon.z)).toBeGreaterThan(1.9 / (cameraDistance - .5));
    expect(moon.y).toBeLessThan(-1.35);
  });

  it('does not invent stars from malformed or absent counts', () => {
    for (const value of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(commitConstellation(value, 1717, 'cauce-v3').stars).toEqual([]);
      expect(commitStarUnit(value)).toBe(1);
    }
    expect(commitConstellation(3, 0, 'cauce-v3').ratio).toBe(1);
  });
});
