import type { Metadata, Viewport } from 'next';
import NotFoundView from '@/components/NotFoundView';

export const metadata: Metadata = { title: '404', robots: { index: false, follow: false } };
/** Barra del navegador en móvil con el fondo de NotFoundView (el mismo de la home). */
export const viewport: Viewport = { themeColor: '#05090b' };

export default function LocaleNotFound() {
  return <NotFoundView />;
}
