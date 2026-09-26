import type { Locale } from '@/lib/site';

/** Lo que recibe cada pieza de arte. Si necesita datos (colecciones de un catálogo, por ejemplo), los importa de data. */
export interface ArtProps {
  locale: Locale;
}
