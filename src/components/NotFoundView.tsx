import Link from 'next/link';

export default function NotFoundView({ locale }: { locale: 'es' | 'en' }) {
  const t =
    locale === 'es'
      ? { title: 'Esta página no existe', lead: 'El enlace está roto o la página se movió.', back: 'Volver al inicio' }
      : { title: 'This page does not exist', lead: 'The link is broken or the page has moved.', back: 'Back to home' };
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
      <h1 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 500, fontSize: 'clamp(2.2rem, 6vw, 4rem)', margin: 0 }}>{t.title}</h1>
      <p style={{ color: '#c9c2b6', margin: 0 }}>{t.lead}</p>
      <Link href={`/${locale}`} style={{ color: '#e0a85e' }}>
        {t.back}
      </Link>
    </main>
  );
}
