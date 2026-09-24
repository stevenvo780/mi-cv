import type { Metadata } from 'next';
import Contact from '@/components/home/Contact';
import Fronts from '@/components/home/Fronts';
import Hero from '@/components/home/Hero';
import HomeFooter from '@/components/home/HomeFooter';
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

// Enlaces entre grupos de rutas. La home y el portal cuelgan del mismo layout raíz, así que un next/link
// entre ellos navega en cliente y el documento conserva el CSS que ya tenía. Al volver a la home (por un
// enlace o con Atrás), el CSS del portal (bootstrap, globals.css, brand.css) sigue cargado, no tiene capa
// y gana siempre a `@layer home`. Por eso todo enlace de la home a /lore o a un frente, y del portal a la
// home, es un <a>: cada grupo se carga en su propio documento. next/link solo enlaza páginas del mismo
// grupo (p. ej. /es ↔ /en). Lo comprueba tests/components/route-groups.test.ts.

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
      <HomeFooter locale={locale} t={t} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
    </div>
  );
}
