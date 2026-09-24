import { describe, expect, it } from 'vitest';
import { HOME } from '@/content/home';

describe('copy de la home', () => {
  for (const locale of ['es', 'en'] as const) {
    it(`${locale}: título ≤ 60 y descripción ≤ 155, sin cifras sueltas`, () => {
      const { meta } = HOME[locale];
      expect(meta.title.length).toBeLessThanOrEqual(60);
      expect(meta.description.length).toBeLessThanOrEqual(155);
      expect(meta.description).not.toMatch(/\d/);
    });
  }
});
