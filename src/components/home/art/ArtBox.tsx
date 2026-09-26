import type { Locale } from '@/lib/site';
import ArtSlot from './ArtSlot';
import { ART } from './index';

/**
 * La caja de una pieza de arte (.card-art de una tarjeta, .cat-art de una escena). En producción, ArtSlot con el HTML
 * que `npm run art:build` pintó en el prebuild: React no recorre esos cientos de nodos al hidratar y el arte no se repite
 * en la carga RSC del documento; el DOM es el mismo. En desarrollo y en las pruebas pinta la pieza viva, para que editar
 * una pieza se vea al momento.
 */
export default function ArtBox({ id, locale, className }: { id: string; locale: Locale; className: string }) {
  if (process.env.NODE_ENV === 'production') return <ArtSlot id={id} locale={locale} className={className} />;
  const Art = ART[id];
  return <div className={className}>{Art ? <Art locale={locale} /> : null}</div>;
}
