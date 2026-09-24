import { Metadata } from 'next';
import { PORTRAIT } from '@/app/components/Portrait/portraitData';
import LorePageClient from './LorePageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = raw === 'es' ? 'es' : 'en';
  const t = PORTRAIT[locale];
  const title = `${locale === 'es' ? 'Mi historia' : 'My story'} | Mouseîon · Steven Vallejo`;
  const description = t.heroLead;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://stevenvallejo.com/${locale}/lore`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = raw === 'es' ? 'es' : 'en';
  return <LorePageClient locale={locale} />;
}
