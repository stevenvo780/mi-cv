import { Metadata } from 'next';
import { PORTRAIT } from '@/app/components/Portrait/portraitData';
import LorePageClient from './LorePageClient';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale === 'es' ? 'es' : 'en';
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

export default function LorePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale === 'es' ? 'es' : 'en';
  return <LorePageClient locale={locale} />;
}
