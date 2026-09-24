import type { Viewport } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@/styles/globals.css';
import '@/styles/brand.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import CustomNavbar from '@/app/components/Navbar';

config.autoAddCss = false;

/** Barra del navegador en móvil con el fondo del portal (globals.css), no con el de la home. */
export const viewport: Viewport = { themeColor: '#0b1417' };

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomNavbar />
      {children}
    </>
  );
}
