'use client';

import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';
import { useReveal } from '@/app/components/Frentes/useReveal';
import {
  GallerySection,
  FRENTE_SECTIONS,
  GALLERY_CSS,
} from '@/app/components/GalleryComponents';
import {
  productos,
  frentesMeta,
  type FrenteId,
} from '@/data/frentes';

type Locale = 'es' | 'en';

interface FrentePageClientProps {
  locale: Locale;
  frenteId: FrenteId;
}

export default function FrentePageClient({ locale, frenteId }: FrentePageClientProps) {
  const meta = frentesMeta[frenteId];
  const section = FRENTE_SECTIONS.find((s) => s.id === frenteId)!;
  const items = productos.filter((p) => p.frente === frenteId);

  useReveal();

  const homeHref = `/${locale}`;

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: `
        ${GALLERY_CSS}

        /* ── PAGE WRAP ── */
        .fp-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 1.25rem;
        }

        /* ── HERO ── */
        .fp-hero {
          padding: 5rem 0 3rem;
          border-bottom: 1px solid var(--line);
        }
        .fp-back {
          font-family: var(--font-mono);
          font-size: 0.74rem;
          letter-spacing: 0.12em;
          text-decoration: none !important;
          color: var(--teal-dim) !important;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 2rem;
          transition: color 0.2s ease;
        }
        .fp-back:hover { color: var(--teal) !important; }
        .fp-logo { margin-bottom: 1.2rem; display: inline-block; }
        .fp-kicker {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          font-weight: 700;
          margin-bottom: 0.7rem;
          color: var(--fp-accent);
        }
        .fp-title {
          font-size: clamp(2rem, 6vw, 3.6rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.04;
          margin: 0 0 0.8rem;
          background: var(--grad-sig);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: var(--gold);
        }
        .fp-tagline {
          font-size: clamp(1rem, 2.4vw, 1.2rem);
          color: var(--text-soft);
          line-height: 1.7;
          max-width: 64ch;
          margin: 0;
        }

        /* ── GALLERY WRAPPER ── */
        .fp-gallery {
          padding: 3rem 0 5rem;
        }
        .fp-gallery-divider {
          width: 100%;
          height: 1px;
          background: var(--line);
          margin: 2.5rem 0 0;
        }

        /* ── FOOTER ── */
        .fp-foot {
          padding: 2.5rem 0 5rem;
          border-top: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .fp-home-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-decoration: none !important;
          color: var(--bg) !important;
          background: var(--teal);
          padding: 0.6rem 1.3rem;
          border-radius: var(--r-sm);
          transition: background 0.2s ease, transform 0.15s ease;
          width: fit-content;
        }
        .fp-home-link:hover {
          background: var(--teal-light);
          transform: translateY(-1px);
        }
        .fp-foot-brand {
          font-family: var(--font-mono);
          font-size: 0.70rem;
          letter-spacing: 0.10em;
          color: var(--teal-light);
          margin: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .fp-back, .fp-home-link { transition: none !important; }
        }
      ` }} />

      <div
        className="fp-wrap"
        style={{ '--fp-accent': section.accent } as React.CSSProperties}
      >
        {/* ── HERO ── */}
        <div className="fp-hero reveal">
          <Link href={homeHref} className="fp-back">
            ← {locale === 'es' ? 'Volver al inicio' : 'Back to home'}
          </Link>
          <div className="fp-logo">
            <BrandLogo size={38} title="Mouseîon" />
          </div>
          <p className="fp-kicker">
            {meta.secNo} · Mouseîon
          </p>
          <h1 className="fp-title">{meta.nombre[locale]}</h1>
          <p className="fp-tagline">{meta.descripcion[locale]}</p>
        </div>

        {/* ── GALLERY ── */}
        <div className="fp-gallery">
          <GallerySection
            frenteId={frenteId}
            accent={section.accent}
            borderAlpha={section.borderAlpha}
            bgAlpha={section.bgAlpha}
            badgeColor={section.badgeColor}
            locale={locale}
            items={items}
            secNo={meta.secNo}
            name={meta.nombre[locale]}
            tagline={meta.tagline[locale]}
          />
        </div>

        {/* ── FOOTER ── */}
        <footer className="fp-foot reveal">
          <Link href={homeHref} className="fp-home-link">
            ← {locale === 'es' ? 'Volver al inicio' : 'Back to home'}
          </Link>
          <p className="fp-foot-brand">
            {locale === 'es' ? 'Mouseîon · por Steven Vallejo' : 'Mouseîon · by Steven Vallejo'}
          </p>
        </footer>
      </div>
    </main>
  );
}
