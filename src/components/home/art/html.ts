import type { Locale } from '@/lib/site';
import { ART_HTML } from './generated';

/** El HTML de la pieza <id> que pintó `npm run art:build`. */
export function artHtml(id: string, locale: Locale): string | undefined {
  const html = ART_HTML[id];
  return typeof html === 'string' ? html : html?.[locale];
}
