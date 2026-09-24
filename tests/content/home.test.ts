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

  // Erratas que la home muestra en primer plano (revisión final del Plan 1, M22).
  it('Método (about.json) escribe «simbólica» con tilde', () => {
    expect(HOME.es.method.paragraphs.join(' ')).toContain('La lógica simbólica');
    expect(HOME.es.method.paragraphs.join(' ')).not.toMatch(/simbolica/);
  });
  it('Trayectoria en inglés: «platforms that bill», con un verbo que no queda colgando', () => {
    expect(HOME.en.path.lead).toContain('platforms that bill,');
    expect(HOME.en.path.lead).not.toMatch(/invoice/);
  });
});
