import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import NotFoundView from '@/components/NotFoundView';

export const metadata: Metadata = { title: '404 · Mouseîon', robots: { index: false, follow: false } };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body style={{ margin: 0 }}>
        <NotFoundView locale="en" />
      </body>
    </html>
  );
}
