import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ART } from '@/components/home/art';
import ArtBox, { artHtml } from '@/components/home/art/ArtBox';
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

  it('en producción, ArtBox da el mismo DOM que la pieza viva', () => {
    const live = (id: string) => renderToStaticMarkup(ArtBox({ id, locale: 'es', className: 'card-art' }));
    const before = process.env.NODE_ENV;
    const dev = Object.keys(ART).map(live);
    try {
      (process.env as Record<string, string>).NODE_ENV = 'production';
      expect(Object.keys(ART).map(live)).toEqual(dev);
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = before;
    }
  });
});
