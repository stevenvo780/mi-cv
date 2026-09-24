import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import NotFoundView from '@/components/NotFoundView';

export const metadata: Metadata = { title: '404 · Mouseîon', robots: { index: false, follow: false } };
/** Barra del navegador en móvil con el fondo de NotFoundView (el mismo de la home). */
export const viewport: Viewport = { themeColor: '#05090b' };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body style={{ margin: 0 }}>
        <NotFoundView />
      </body>
    </html>
  );
}
