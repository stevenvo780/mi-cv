import type { BeastKind } from './model';

export const COMMIT_STAR_CAP = 20_000;
export interface CommitStar {
  x: number;
  y: number;
  z: number;
  /** Diameter in world coordinates. */
  size: number;
  phase: number;
  color: string;
  /** One real commit below the cap; explicit grouping above it. */
  weight: number;
}
export interface CommitConstellation {
  commits: number;
  maximumCommits: number;
  ratio: number;
  unit: number;
  renderedCount: number;
  radius: number;
  stars: CommitStar[];
}

const TAU = Math.PI * 2;
const countOf = (value: number) => Number.isSafeInteger(value) && value > 0 ? value : 0;
export function commitStarUnit(commits: number): number {
  return Math.max(1, Math.ceil(countOf(commits) / COMMIT_STAR_CAP));
}
function seedOf(identity: string): number {
  let seed = 2166136261;
  for (let i = 0; i < identity.length; i++) seed = Math.imul(seed ^ identity.charCodeAt(i), 16777619);
  return seed >>> 0;
}
function sample(seed: number, index: number, salt: number): number {
  let value = (seed ^ Math.imul(index + 1, 0x9e3779b1) ^ salt) >>> 0;
  value = Math.imul(value ^ value >>> 16, 0x21f0aaad);
  value = Math.imul(value ^ value >>> 15, 0x735a2d97);
  return ((value ^ value >>> 15) >>> 0) / 4294967296;
}
function reverseBits(index: number): number {
  let fraction = 0, divisor = .5;
  while (index > 0) { fraction += (index % 2) * divisor; index = Math.floor(index / 2); divisor *= .5; }
  return fraction;
}

/** Shared by WebGL and its SVG fallback. Nothing in this field is a decorative data point. */
export function commitConstellation(commits: number, maximumCommits: number, identity: string, kind: BeastKind = 'hydra'): CommitConstellation {
  const count = countOf(commits);
  const maximum = Math.max(count, countOf(maximumCommits));
  const ratio = maximum > 0 ? count / maximum : 0;
  const unit = commitStarUnit(count);
  const renderedCount = Math.min(count, COMMIT_STAR_CAP);
  const baseWeight = renderedCount > 0 ? Math.floor(count / renderedCount) : 0;
  const remainder = renderedCount > 0 ? count % renderedCount : 0;
  const inner = kind === 'moth' ? 2.13 : kind === 'sprout' ? 1.73 : 1.97;
  const radius = inner + .12 + Math.sqrt(ratio) * 1.08;
  const seed = seedOf(identity);
  const orientation = (sample(seed, 0, 13) - .5) * .38;
  const companions = [-.57, -2.57, -1.12, -2.02, -.1, -3.03];
  const stars: CommitStar[] = [];
  for (let index = 0; index < renderedCount; index++) {
    const radial = reverseBits(Math.floor(index / 4) + 1);
    const phase = sample(seed, index, 73);
    const jitter = sample(seed, index, 187);
    const companion = index < companions.length;
    const r = companion ? 2.88 + sample(seed, index, 233) * .06
      : inner + .055 + radial * (radius - inner - .055);
    // The first few commits are isolated moons in unobstructed lower/side regions.
    const angle = companion ? companions[index] + orientation * .35
      : index % 4 * TAU / 4 + (radial - .5) * 2.7 - .75 + orientation + (jitter - .5) * .2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r * .88 - .13;
    const z = companion ? -.88 + (sample(seed, index, 419) - .5) * .12
      : -1.48 + y * .12 + (sample(seed, index, 419) - .5) * .65;
    stars.push({ x, y, z,
      size: .064 + sample(seed, index, 977) * .027,
      phase, color: phase < .48 ? '#73d7c1' : phase < .8 ? '#e9c678' : '#f4eed6',
      weight: baseWeight + (index < remainder ? 1 : 0) });
  }
  return { commits: count, maximumCommits: maximum, ratio, unit, renderedCount, radius, stars };
}
