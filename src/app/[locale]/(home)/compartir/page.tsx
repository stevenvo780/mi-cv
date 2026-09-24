import type { Metadata } from 'next';
import BrandLogo from '@/app/components/BrandLogo';
import ShareHub from '@/components/share/ShareHub';
import { SHARE_COPY } from '@/lib/shareLinks';
import { OG_LOCALE, ogImage, pageAlternates, toLocale } from '@/lib/site';
import '@/styles/share.css';

export const dynamic = 'error';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const copy = SHARE_COPY[locale];
  const alternates = pageAlternates(locale, '/compartir');
  const image = ogImage(locale);
  return {
    title: { absolute: copy.title },
    description: copy.description,
    alternates,
    openGraph: {
      type: 'profile',
      title: copy.title,
      description: copy.description,
      url: alternates.canonical,
      siteName: 'Mouseîon',
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[locale === 'es' ? 'en' : 'es']],
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: copy.title, description: copy.description, images: [{ url: image.url, alt: image.alt }] },
  };
}

export default async function SharePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const other = locale === 'es' ? 'en' : 'es';
  const copy = SHARE_COPY[locale];

  return (
    <div className="home share-page">
      <a className="skip" href="#contenido">{copy.skip}</a>
      <header className="share-topbar">
        <a href={`/${locale}`} className="share-brand" aria-label="Mouseîon · Steven Vallejo Ortiz">
          <BrandLogo size={36} />
          <span>Mouseîon</span>
        </a>
        <nav className="share-topnav" aria-label={locale === 'es' ? 'Navegación' : 'Navigation'}>
          <a href={`/${locale}`} className="share-back"><span aria-hidden="true">↖</span> {copy.back}</a>
          <a href={`/${other}/compartir`} hrefLang={other} lang={other} className="share-language">{copy.language}</a>
        </nav>
      </header>

      <main id="contenido" className="share-main">
        <div className="share-intro">
          <div className="share-kicker"><span className="share-kicker-star" aria-hidden="true">✦</span>{copy.eyebrow}</div>
          <h1>{copy.heading}</h1>
          <p>{copy.introduction}</p>
        </div>
        <ShareHub locale={locale} />
      </main>

      <footer className="share-footer">
        <span aria-hidden="true">∞</span>
        <p>{copy.footer}</p>
        <span>stevenvallejo.com</span>
      </footer>
    </div>
  );
}
