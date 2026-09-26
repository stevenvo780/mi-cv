'use client';

import { useEffect } from 'react';

/**
 * La hoja del arte, pedida al hidratar: después del LCP y sin bloquear nada. Hasta que llega, el arte no se maqueta
 * (display: none en home.css), así que tampoco pide sus fuentes; las cajas tienen su tamaño fijado y nada se mueve al
 * aparecer. Sin JS, la trae el <noscript>.
 */
export default function ArtStyles({ href }: { href: string }) {
  useEffect(() => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.append(link);
  }, [href]);
  return (
    <noscript>
      <link rel="stylesheet" href={href} />
    </noscript>
  );
}
