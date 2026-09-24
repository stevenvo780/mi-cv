'use client';

import { useEffect, useState, type ComponentType } from 'react';
import type { Locale } from '@/lib/site';

/** `opener`: el botón que abrió el panel; null, panel cerrado. */
export type PanelProps = { locale: Locale; opener: HTMLElement | null; onClose: () => void };

/**
 * Puerta del asistente. Va en la ruta crítica de la home, cuyo margen de JS es de unos cientos de bytes (spec §5.1),
 * así que solo escucha: los botones [data-ask] de la barra y del menú móvil son HTML del servidor, y el panel (su
 * código, su CSS y su copy) se importa con el primer clic. Ni precarga al pasar el puntero: cada byte de aquí es JS
 * que la home descarga antes de `load`.
 */
export default function AssistantGate({ locale }: { locale: Locale }) {
  const [Panel, setPanel] = useState<ComponentType<PanelProps> | null>(null);
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const open = (e: MouseEvent) => {
      const button = (e.target as Element).closest?.<HTMLElement>('[data-ask]');
      if (!button) return;
      setOpener(button);
      import('./AssistantPanel').then((m) => setPanel(() => m.default), () => {});
    };
    document.addEventListener('click', open);
    return () => document.removeEventListener('click', open);
  }, []);
  return Panel && <Panel locale={locale} opener={opener} onClose={() => setOpener(null)} />;
}
