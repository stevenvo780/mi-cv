import { describe, expect, it } from 'vitest';
import { buildArtifacts } from '@/graph/artifacts';

describe('buildArtifacts', () => {
  it('es determinista byte a byte', () => {
    const a = buildArtifacts();
    const b = buildArtifacts();
    expect(Buffer.from(a.bin).equals(Buffer.from(b.bin))).toBe(true);
    expect(JSON.stringify(a.meta)).toBe(JSON.stringify(b.meta));
    expect(a.posterSvg).toBe(b.posterSvg);
    expect(a.hash).toBe(b.hash);
    expect(a.hash).toMatch(/^[0-9a-f]{10}$/);
  });
});
