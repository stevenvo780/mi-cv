'use client';
/**
 * GalleryComponents — shared product gallery primitives.
 * Used by:
 *   - LinktreeHome (home page)
 *   - /[locale]/[frente]/page.tsx (per-frente landing)
 */

import React from 'react';
import Image from 'next/image';
import { type Producto, type FrenteId } from '@/data/frentes';

export type Locale = 'es' | 'en';

/* ------------------------------------------------------------------ */
/* Brand image map: product id → /brand/<slug>/og_product.png         */
/* ------------------------------------------------------------------ */
export const BRAND_COVER: Record<string, string> = {
  clavis:                             '/brand/paideia/og_product.png',
  debatesuite:                        '/brand/agon/og_product.png',
  'estructuras-preontologicas':       '/brand/estructuras-preontologicas/og_product.png',
  hinton:                             '/brand/hinton/og_product.png',
  complexlab:                         '/brand/kosmos/og_product.png',
  aporia:                             '/brand/aporia/og_product.png',
  'nlp-to-logic':                     '/brand/organon/og_product.png',
  stevenai:                           '/brand/daimon/og_product.png',
  stevendevbox:                       '/brand/techne/og_product.png',
  communityos:                        '/brand/koinonia/og_product.png',
  devkits:                            '/brand/ergon/og_product.png',
  'devkits-hours':                    '/brand/chronos/og_product.png',
  'devkits-crm':                      '/brand/xenia/og_product.png',
  scrapekit:                          '/brand/nomos/og_product.png',
  warehouse:                          '/brand/apotheke/og_product.png',
  eikon:                              '/brand/eikon/og_product.png',
  prizma:                             '/brand/prizma/og_product.png',
};

/* ------------------------------------------------------------------ */
/* Frente accent palette                                               */
/* ------------------------------------------------------------------ */
// Ordered descending by product count: informatica(10) > filosofia(4) > ciencias(2) > enterprise(1)
export const FRENTE_SECTIONS: Array<{
  id: FrenteId;
  accent: string;
  borderAlpha: string;
  bgAlpha: string;
  badgeColor: string;
}> = [
  { id: 'informatica', accent: '#43b5a6', borderAlpha: 'rgba(67,181,166,0.28)',  bgAlpha: 'rgba(67,181,166,0.06)',  badgeColor: 'var(--teal)' },
  { id: 'filosofia',   accent: '#e0a85e', borderAlpha: 'rgba(224,168,94,0.28)',  bgAlpha: 'rgba(224,168,94,0.06)',  badgeColor: 'var(--gold)' },
  { id: 'ciencias',    accent: '#6fd3c4', borderAlpha: 'rgba(111,211,196,0.28)', bgAlpha: 'rgba(111,211,196,0.06)', badgeColor: 'var(--teal-light)' },
  { id: 'enterprise',  accent: '#cf6a3c', borderAlpha: 'rgba(207,106,60,0.28)',  bgAlpha: 'rgba(207,106,60,0.06)',  badgeColor: 'var(--rust)' },
];

/* ------------------------------------------------------------------ */
/* PRODUCT GALLERY CARD                                                 */
/* ------------------------------------------------------------------ */
interface GalleryCardProps {
  producto: Producto;
  locale: Locale;
  accent: string;
  borderAlpha: string;
  bgAlpha: string;
  badgeColor: string;
  index: number;
}

export function GalleryCard({ producto: p, locale, accent, borderAlpha, bgAlpha, badgeColor, index }: GalleryCardProps) {
  const cover = BRAND_COVER[p.id];
  const isFeatured = p.featured === true;

  return (
    <article
      className="reveal gc-card"
      data-featured={isFeatured || undefined}
      style={{
        '--gc-accent': accent,
        '--gc-border': borderAlpha,
        '--gc-bg': bgAlpha,
        '--gc-badge': badgeColor,
        animationDelay: `${index * 80}ms`,
      } as React.CSSProperties}
    >
      {/* Cover image */}
      {cover && (
        <div className="gc-cover" aria-hidden="true">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            priority={index < 3}
          />
          <div className="gc-cover-fade" />
        </div>
      )}

      <div className="gc-body">
        <h3 className="gc-name">{p.nombre}</h3>

        {p.subtitulo && (
          <p className="gc-sub">{p.subtitulo[locale]}</p>
        )}

        {/* Badge + tipo + status */}
        <div className="gc-chips">
          {p.tipo === 'ponencia' && (
            <span className="gc-ponencia">
              {locale === 'es' ? 'Ponencia' : 'Talk'}
            </span>
          )}
          {p.badge && (
            <span className="gc-badge">{p.badge[locale]}</span>
          )}
          {p.status === 'soon' && (
            <span className="gc-soon">
              {locale === 'es' ? 'Próximamente' : 'Coming soon'}
            </span>
          )}
        </div>

        {/* CTA */}
        {p.url && (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="gc-cta"
            aria-label={`${p.nombre} — ${locale === 'es' ? 'Ver en vivo' : 'View live'}`}
          >
            {locale === 'es' ? 'Ver en vivo' : 'View live'}
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* GALLERY SECTION (one frente)                                         */
/* ------------------------------------------------------------------ */
interface GallerySectionProps {
  frenteId: FrenteId;
  accent: string;
  borderAlpha: string;
  bgAlpha: string;
  badgeColor: string;
  locale: Locale;
  items: Producto[];
  secNo: string;
  name: string;
  tagline: string;
}

export function GallerySection({ frenteId, accent, borderAlpha, bgAlpha, badgeColor, locale, items, secNo, name, tagline }: GallerySectionProps) {
  return (
    <div className="gs-section" id={`gallery-${frenteId}`}>
      <div className="gs-header reveal">
        <p className="gs-eyebrow" style={{ color: accent }}>
          <span className="brand-sec-no">{secNo}</span>
          &nbsp;&nbsp;{name}
        </p>
        <h3 className="gs-tagline">{tagline}</h3>
      </div>
      <div className="gs-grid">
        {items.map((p, i) => (
          <GalleryCard
            key={p.id}
            producto={p}
            locale={locale}
            accent={accent}
            borderAlpha={borderAlpha}
            bgAlpha={bgAlpha}
            badgeColor={badgeColor}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared gallery CSS (inject via <style> in consuming components)     */
/* ------------------------------------------------------------------ */
export const GALLERY_CSS = `
  /* ────────────────────────────────────────────────
     GALLERY SECTION
  ──────────────────────────────────────────────── */
  .gs-section { padding: 2.4rem 0 0; }
  .gs-header { margin-bottom: 1.6rem; }
  .gs-eyebrow {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-weight: 600;
    margin: 0 0 0.4rem;
  }
  .gs-tagline {
    font-size: clamp(1.1rem, 2.5vw, 1.55rem);
    font-weight: 700;
    color: var(--text);
    margin: 0;
    line-height: 1.25;
    letter-spacing: -0.015em;
  }
  .gs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.25rem;
  }
  @media (min-width: 640px) { .gs-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 900px) { .gs-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1100px) { .gs-grid { grid-template-columns: repeat(4, 1fr); } }

  /* ────────────────────────────────────────────────
     GALLERY CARD
  ──────────────────────────────────────────────── */
  .gc-card {
    position: relative;
    background: var(--bg-card);
    border: 1px solid var(--gc-border, var(--line));
    border-radius: var(--r-md);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
    min-height: 280px;
  }
  .gc-card:hover {
    transform: translateY(-4px);
    border-color: var(--gc-accent, var(--teal));
    box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--gc-bg, transparent);
  }
  .gc-card[data-featured] { border-color: var(--gc-accent, var(--teal)); }

  .gc-cover {
    position: relative;
    width: 100%;
    height: 150px;
    flex-shrink: 0;
    overflow: hidden;
    background: var(--bg-2);
  }
  .gc-cover-fade {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(11,20,23,0) 0%, rgba(11,20,23,0.55) 100%);
    z-index: 1;
  }
  .gc-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    padding: 1rem 1.1rem 1.2rem;
  }
  .gc-name {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
    margin: 0;
    line-height: 1.25;
  }
  .gc-sub {
    font-family: var(--font-mono);
    font-size: 0.70rem;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin: 0;
    line-height: 1.4;
  }
  .gc-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: auto;
    padding-top: 0.35rem;
  }
  .gc-badge {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    padding: 0.18rem 0.52rem;
    border-radius: 999px;
    border: 1px solid var(--gc-border, var(--line));
    background: var(--gc-bg, transparent);
    color: var(--gc-accent, var(--text-soft));
    letter-spacing: 0.03em;
    white-space: nowrap;
  }
  .gc-soon {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    padding: 0.18rem 0.52rem;
    border-radius: 999px;
    border: 1px solid rgba(207,106,60,0.30);
    background: rgba(207,106,60,0.08);
    color: var(--rust);
    letter-spacing: 0.03em;
    white-space: nowrap;
  }
  .gc-ponencia {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    padding: 0.18rem 0.52rem;
    border-radius: 999px;
    border: 1px solid rgba(224,168,94,0.40);
    background: rgba(224,168,94,0.10);
    color: var(--gold);
    letter-spacing: 0.03em;
    white-space: nowrap;
    font-weight: 600;
  }
  .gc-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-family: var(--font-mono);
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-decoration: none;
    color: var(--gc-accent, var(--teal));
    margin-top: 0.5rem;
    padding: 0.36rem 0.85rem;
    border: 1px solid var(--gc-border, var(--line));
    border-radius: var(--r-sm);
    background: var(--gc-bg, transparent);
    transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
    align-self: flex-start;
  }
  .gc-cta:hover {
    background: var(--gc-accent, var(--teal));
    color: var(--bg) !important;
    border-color: var(--gc-accent, var(--teal));
  }
  @media (prefers-reduced-motion: reduce) {
    .gc-card, .gc-cta { transition: none !important; }
  }
`;
