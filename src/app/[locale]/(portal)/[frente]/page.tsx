import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { frentesMeta, type FrenteId } from '@/data/frentes';
import { OG_LOCALE, clampDescription, ogImage, pageAlternates, shareTitle, toLocale } from '@/lib/site';
import FrentePageClient from './FrentePageClient';

const VALID_FRENTES: FrenteId[] = ['filosofia', 'ciencias', 'informatica', 'enterprise'];

export const dynamicParams = false;

export function generateStaticParams() {
  return VALID_FRENTES.map((frente) => ({ frente }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; frente: string }>;
}): Promise<Metadata> {
  const { locale: raw, frente } = await params;
  const locale = toLocale(raw);
  if (!VALID_FRENTES.includes(frente as FrenteId)) return {};
  const meta = frentesMeta[frente as FrenteId];
  const title = meta.nombre[locale];
  const description = clampDescription(meta.descripcion[locale]);
  const alternates = pageAlternates(locale, `/${frente}`);
  const image = ogImage(locale);
  return {
    title,
    description,
    alternates,
    openGraph: {
      title: shareTitle(title),
      description,
      type: 'website',
      url: alternates.canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === 'es' ? 'en' : 'es'],
      siteName: 'Mouseîon',
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: shareTitle(title), description, images: [{ url: image.url, alt: image.alt }] },
  };
}

export default async function FrentePage({
  params,
}: {
  params: Promise<{ locale: string; frente: string }>;
}) {
  const { locale: raw, frente: rawFrente } = await params;
  const locale = toLocale(raw);
  const frente = rawFrente as FrenteId;

  if (!VALID_FRENTES.includes(frente)) {
    notFound();
  }

  return <FrentePageClient locale={locale} frenteId={frente} />;
}
