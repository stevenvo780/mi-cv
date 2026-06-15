import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Not found',
  robots: { index: false, follow: false },
};

/**
 * App Router 404. Defined at the app root so Next.js never falls back to the
 * Pages-Router default error page (which imports <Html> and breaks the build).
 * Rendered inside the root layout's <html>/<body>.
 */
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1.5rem',
        gap: '1rem',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontSize: '0.78rem',
          color: 'var(--teal)',
          margin: 0,
        }}
      >
        404
      </p>
      <h1
        style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
          color: 'var(--text)',
          margin: 0,
        }}
      >
        Página no encontrada · Page not found
      </h1>
      <p style={{ color: 'var(--text-soft)', maxWidth: '46ch', margin: 0 }}>
        El recurso que buscas no existe o se movió. · The page you are looking
        for does not exist or has moved.
      </p>
      <Link
        href="/en"
        style={{
          marginTop: '0.5rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: '#0b1417',
          backgroundColor: 'var(--gold)',
          background: 'var(--grad)',
          padding: '0.6rem 1.3rem',
          borderRadius: '11px',
          textDecoration: 'none',
        }}
      >
        Volver al inicio · Back home
      </Link>
    </main>
  );
}
