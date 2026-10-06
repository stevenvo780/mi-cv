import type { Metadata } from 'next';
import BrandLogo from '@/app/components/BrandLogo';
import ActivityObservatory from '@/components/activity/ActivityObservatory';
import { ACTIVITY } from '@/content/activity';
import { OG_LOCALE, ogImage, pageAlternates, shareTitle, toLocale } from '@/lib/site';
import '@/styles/activity.css';

export const dynamic = 'error';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { meta } = ACTIVITY[locale];
  const alternates = pageAlternates(locale, '/actividad');
  const title = shareTitle(meta.title);
  return {
    title: meta.title,
    description: meta.description,
    alternates,
    openGraph: { title, description: meta.description, url: alternates.canonical, locale: OG_LOCALE[locale], images: [ogImage(locale)] },
    twitter: { card: 'summary_large_image', title, description: meta.description, images: [ogImage(locale)] },
  };
}

export default async function ActivityPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const other = locale === 'es' ? 'en' : 'es';
  const t = ACTIVITY[locale];
  return (
    <div className="home activity-page">
      <a className="skip" href="#actividad">{t.nav.skip}</a>
      <header className="activity-nav">
        <a href={`/${locale}`} className="activity-brand" aria-label={t.nav.back}>
          <BrandLogo size={26} /><span>Mouseîon</span>
        </a>
        <nav aria-label={t.nav.current}>
          <a className="activity-home-link" href={`/${locale}`}><span aria-hidden="true">↖</span> {t.nav.back}</a>
          <a className="activity-current" href={`/${locale}/actividad`} aria-current="page">{t.nav.current}</a>
        </nav>
        <a className="activity-language" href={`/${other}/actividad`} hrefLang={other} lang={other}>{t.nav.language}</a>
      </header>
      <main id="actividad">
        <ActivityObservatory locale={locale} />
        <section className="activity-privacy" aria-labelledby="activity-privacy-title">
          <p className="activity-eyebrow">{t.privacyEyebrow}</p>
          <h2 id="activity-privacy-title">{t.privacyTitle.split('\n').map((line) => <span key={line}>{line}</span>)}</h2>
          <div><p>{t.privacyBody}</p><p className="activity-measurement">{t.measurement}</p></div>
        </section>
      </main>
      <footer className="activity-footer"><a href={`/${locale}`}>Mouseîon · Steven Vallejo Ortiz</a><p>{t.footer}</p><span aria-hidden="true">✳</span></footer>
    </div>
  );
}
