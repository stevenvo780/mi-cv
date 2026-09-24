import { Metadata } from 'next';
import { PORTRAIT } from '@/app/components/Portrait/portraitData';
import { OG_LOCALE, clampDescription, pageAlternates, toLocale } from '@/lib/site';
import LorePageClient from './LorePageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const title = locale === 'es' ? 'Mi historia' : 'My story';
  const description = clampDescription(PORTRAIT[locale].heroLead);
  const alternates = pageAlternates(locale, '/lore');
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: alternates.canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === 'es' ? 'en' : 'es'],
      siteName: 'Mouseîon',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function LorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = toLocale(raw);
  return <LorePageClient locale={locale} />;
}
