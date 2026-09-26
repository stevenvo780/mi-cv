import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ART } from '@/components/home/art';
import ArtBox from '@/components/home/art/ArtBox';
import ArtSlot from '@/components/home/art/ArtSlot';
import { artHtml } from '@/components/home/art/html';
import { ART_HTML } from '@/components/home/art/generated';
import { LOCALES } from '@/lib/site';

describe('arte de la home: el HTML pintado en el prebuild', () => {
  it('está al día con cada pieza en cada idioma (si falla: npm run art:build)', () => {
    expect(Object.keys(ART_HTML).sort()).toEqual(Object.keys(ART).sort());
    for (const id of Object.keys(ART)) {
      for (const locale of LOCALES) {
        expect(artHtml(id, locale), `${id} (${locale})`).toBe(renderToStaticMarkup(createElement(ART[id], { locale })));
      }
    }
  });

  // En producción ArtBox delega en ArtSlot, cuyo HTML sale de html.ts (un require que resuelve webpack al compilar):
  // que el DOM servido sea ese, una sola vez y conservado al hidratar, lo comprueba e2e/home.spec.ts.
  it('en producción, ArtBox delega en ArtSlot con la misma caja', () => {
    const before = process.env.NODE_ENV;
    try {
      (process.env as Record<string, string>).NODE_ENV = 'production';
      const el = ArtBox({ id: 'agora', locale: 'en', className: 'card-art' });
      expect(el.type).toBe(ArtSlot);
      expect(el.props).toEqual({ id: 'agora', locale: 'en', className: 'card-art' });
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = before;
    }
  });
});
