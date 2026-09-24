import { Fragment } from 'react';

/**
 * 404 bilingüe (ES · EN), sin JS. Lo usan el 404 de [locale] y el global, y ninguno recibe el locale de la URL
 * (el de [locale] no recibe params), así que cada texto declara su propio `lang`.
 */
const TEXT = {
  es: { title: 'Esta página no existe', lead: 'El enlace está roto o la página se movió.', back: 'Volver al inicio' },
  en: { title: 'This page does not exist', lead: 'The link is broken or the page has moved.', back: 'Back to home' },
} as const;

const SEP = <span aria-hidden="true"> · </span>;

export default function NotFoundView() {
  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'grid',
        placeContent: 'center',
        gap: '1rem',
        textAlign: 'center',
        padding: '4rem 1.5rem',
        background: '#05090b',
        color: '#e8e0d4',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      <p style={{ fontFamily: 'var(--font-jetbrains), monospace', letterSpacing: '0.2em', color: '#43b5a6', margin: 0 }}>404</p>
      <h1 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontWeight: 500, fontSize: 'clamp(2.2rem, 6vw, 4rem)', lineHeight: 1.1, margin: 0 }}>
        <span lang="es">{TEXT.es.title}</span>
        <br />
        <span lang="en" style={{ color: '#c9c2b6' }}>
          {TEXT.en.title}
        </span>
      </h1>
      <p style={{ color: '#c9c2b6', margin: 0 }}>
        <span lang="es">{TEXT.es.lead}</span>
        {SEP}
        <span lang="en">{TEXT.en.lead}</span>
      </p>
      {/* <a> y no next/link: este 404 va en el árbol RSC de todas las páginas de [locale] y arrastraría
          next/link al JS de la home (spec §5). */}
      <p style={{ margin: 0 }}>
        {(['es', 'en'] as const).map((lang, i) => (
          <Fragment key={lang}>
            {i > 0 ? SEP : null}
            <a href={`/${lang}`} hrefLang={lang} lang={lang} style={{ color: '#e0a85e' }}>
              {TEXT[lang].back}
            </a>
          </Fragment>
        ))}
      </p>
    </main>
  );
}
