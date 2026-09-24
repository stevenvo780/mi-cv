import { Metadata } from 'next';
import { PORTRAIT } from '@/app/components/Portrait/portraitData';
import { OG_LOCALE, clampDescription, ogImage, pageAlternates, shareTitle, toLocale } from '@/lib/site';
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
  const image = ogImage(locale);
  return {
    title,
    description,
    alternates,
    openGraph: {
      title: shareTitle(title),
      description,
      type: 'profile',
      url: alternates.canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === 'es' ? 'en' : 'es'],
      siteName: 'Mouseîon',
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: shareTitle(title), description, images: [{ url: image.url, alt: image.alt }] },
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
