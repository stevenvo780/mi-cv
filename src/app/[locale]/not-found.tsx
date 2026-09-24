import type { Metadata } from 'next';
import NotFoundView from '@/components/NotFoundView';

export const metadata: Metadata = { title: '404', robots: { index: false, follow: false } };

export default function LocaleNotFound() {
  return <NotFoundView locale="en" />;
}
