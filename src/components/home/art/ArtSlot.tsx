'use client';

import type { Locale } from '@/lib/site';

/**
 * La caja con el HTML de una pieza, ya pintado. En el servidor lo lee de html.ts; en el navegador la rama desaparece
 * (Next fija `typeof window` al compilar) y la caja va vacía: al hidratar, React no toca el contenido de un
 * dangerouslySetInnerHTML y conserva el que llegó en el documento. Así el arte viaja una sola vez, en el HTML, y no
 * también en la carga RSC ni en el JS. Vale porque a la home solo se llega por documento (<a>, nunca next/link: ver
 * src/app/[locale]/(home)/page.tsx), así que React nunca la pinta desde cero en el cliente.
 */
export default function ArtSlot({ id, locale, className }: { id: string; locale: Locale; className: string }) {
  const html =
    typeof window === 'undefined'
      ? // eslint-disable-next-line @typescript-eslint/no-require-imports
        ((require('./html') as typeof import('./html')).artHtml(id, locale) ?? '')
      : '';
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} suppressHydrationWarning />;
}
