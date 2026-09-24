import { Metadata } from 'next';
import { PORTRAIT } from '@/app/components/Portrait/portraitData';
import { OG_LOCALE, clampDescription, localeUrl, pageAlternates, toLocale } from '@/lib/site';
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
  const ogImage = `${localeUrl(locale)}/opengraph-image`;
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
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
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
