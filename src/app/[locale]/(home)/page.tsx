import type { Metadata } from 'next';
import Contact from '@/components/home/Contact';
import Fronts from '@/components/home/Fronts';
import Hero from '@/components/home/Hero';
import HomeHeader from '@/components/home/HomeHeader';
import Method from '@/components/home/Method';
import Path from '@/components/home/Path';
import Proof from '@/components/home/Proof';
import Stage from '@/components/home/Stage';
import { HOME } from '@/content/home';
import { DATA_DATE } from '@/graph/generated/stats';
import { buildHomeJsonLd, serializeJsonLd } from '@/lib/jsonld';
import { OG_LOCALE, pageAlternates, toLocale } from '@/lib/site';

export const dynamic = 'error';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { meta } = HOME[locale];
  const alternates = pageAlternates(locale);
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates,
    openGraph: {
      type: 'profile',
      title: meta.title,
      description: meta.description,
      url: alternates.canonical,
      siteName: 'Mouseîon',
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[locale === 'es' ? 'en' : 'es']],
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const t = HOME[locale];
  const jsonLd = buildHomeJsonLd(locale, { jobTitle: t.meta.jobTitle, description: t.meta.description, knowsAbout: t.meta.knowsAbout }, DATA_DATE);
  return (
    <div className="home">
      <a className="skip" href="#contenido">
        {t.nav.skip}
      </a>
      <HomeHeader locale={locale} t={t} />
      <main id="contenido">
        <Stage />
        <Hero locale={locale} t={t} />
        <Method t={t} />
        <Path locale={locale} t={t} />
        <Fronts locale={locale} t={t} />
        <Proof locale={locale} t={t} />
        <Contact locale={locale} t={t} />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
    </div>
  );
}
