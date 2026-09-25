import type { Viewport } from 'next';
import '@/styles/home.css';
import { HOME_FONT_VARIABLES } from './fonts';

/** Barra del navegador en móvil con el fondo de la home (--ink-0). */
export const viewport: Viewport = { themeColor: '#05090b' };

// Las variables de las fuentes de la home van en este contenedor y no en <html>: así su CSS viaja en el mismo
// chunk que home.css y el portal no las ve.
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <div className={HOME_FONT_VARIABLES}>{children}</div>;
}
