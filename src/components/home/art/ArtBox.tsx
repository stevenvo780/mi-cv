import type { Locale } from '@/lib/site';
import { ART_HTML } from './generated';
import { ART } from './index';

export function artHtml(id: string, locale: Locale): string | undefined {
  const html = ART_HTML[id];
  return typeof html === 'string' ? html : html?.[locale];
}

/**
 * La caja de una pieza de arte (.card-art de una tarjeta, .cat-art de una escena). En producción lleva el HTML que
 * `npm run art:build` pintó en el prebuild: React no recorre esos cientos de nodos al hidratar ni los repite uno a uno en
 * la carga RSC del documento, y el DOM es el mismo. En desarrollo y en las pruebas pinta la pieza viva, para que editar
 * una pieza se vea al momento.
 */
export default function ArtBox({ id, locale, className }: { id: string; locale: Locale; className: string }) {
  if (process.env.NODE_ENV === 'production') {
    const html = artHtml(id, locale);
    return html ? <div className={className} dangerouslySetInnerHTML={{ __html: html }} /> : <div className={className} />;
  }
  const Art = ART[id];
  return <div className={className}>{Art ? <Art locale={locale} /> : null}</div>;
}
