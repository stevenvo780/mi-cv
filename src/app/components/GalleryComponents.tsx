'use client';
/**
 * GalleryComponents — shared product gallery primitives.
 * Used by:
 *   - LinktreeHome (home page)
 *   - /[locale]/[frente]/page.tsx (per-frente landing)
 *
 * Design thesis (2026-06-15):
 *   Every product cover (/brand/<slug>/og_product.png) is a complete, self-contained
 *   brand plate at 1200×630 (~1.91:1): it ALREADY carries the Greek name, the eyebrow,
 *   a one-line description, the URL/category and a glyph mark. So the IMAGE is the hero:
 *   we show it at its native ratio, full-bleed, with NO redundant text title on top —
 *   only a minimal status ribbon and a single live-link affordance.
 *
 *   Layout adapts to how many products a section has (count-driven density):
 *     · count === 1  → "showcase": one giant near-full-bleed banner (e.g. Enterprise/Prizma).
 *     · count 2–3    → "featured": wide plates, generous minmax, 1fr stretch.
 *     · count ≥ 4    → "grid": auto-fit minmax responsive plates; a `featured` product
 *                      spans 2 columns when there's room (giant-among-many).
 *
 *   The product name lives in the image's `alt` + an sr-only <h3> for a11y/SEO.
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
/* Layout modes — derived from how many products the section holds.    */
/* ------------------------------------------------------------------ */
export type GalleryLayout = 'showcase' | 'featured' | 'grid';

export function layoutForCount(count: number): GalleryLayout {
  if (count <= 1) return 'showcase';
  if (count <= 3) return 'featured';
  return 'grid';
}

/* ------------------------------------------------------------------ */
/* PRODUCT GALLERY CARD                                                 */
/* The cover image is the hero. No redundant text title.               */
/* ------------------------------------------------------------------ */
interface GalleryCardProps {
  producto: Producto;
  locale: Locale;
  accent: string;
  borderAlpha: string;
  bgAlpha: string;
  badgeColor: string;
  index: number;
  layout: GalleryLayout;
}

export function GalleryCard({
  producto: p,
  locale,
  accent,
  borderAlpha,
  bgAlpha,
  badgeColor,
  index,
  layout,
}: GalleryCardProps) {
  const cover = BRAND_COVER[p.id];
  const isFeatured = p.featured === true;
  // In a dense grid, the technical jewel / featured product earns a wide plate.
  const wide = layout === 'grid' && isFeatured;
  // The plate IS the card; if (rare) a cover is missing, render a text fallback.
  const hasCover = Boolean(cover);

  const liveLabel = locale === 'es' ? 'Ver en vivo' : 'View live';
  const soonLabel = locale === 'es' ? 'Próximamente' : 'Coming soon';
  const talkLabel = locale === 'es' ? 'Ponencia' : 'Talk';

  const inner = (
    <>
      {hasCover ? (
        <div className="gc-plate">
          <Image
            src={cover}
            alt={p.nombre}
            fill
            sizes={
              layout === 'showcase'
                ? '(max-width: 1120px) 100vw, 1120px'
                : layout === 'featured'
                ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 540px'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px'
            }
            style={{ objectFit: 'cover' }}
            priority={index < 3}
          />
          <div className="gc-veil" aria-hidden="true" />
        </div>
      ) : (
        // Fallback only if a cover is ever missing — keeps the name visible.
        <div className="gc-plate gc-plate--empty">
          <span className="gc-fallback-name">{p.nombre}</span>
        </div>
      )}

      {/* Name carried for screen readers / SEO — the image shows it visually. */}
      <h3 className="gc-sr-name">{p.nombre}</h3>

      {/* Minimal status ribbon (top-left). One line, only when it adds info. */}
      {(p.tipo === 'ponencia' || p.status === 'soon') && (
        <span className={`gc-ribbon ${p.status === 'soon' ? 'is-soon' : 'is-talk'}`}>
          {p.status === 'soon' ? soonLabel : talkLabel}
        </span>
      )}

      {/* Live affordance (bottom-right). Real link when standalone; visual cue
          when the whole card is already a link (grid/featured/showcase). */}
      {p.url && (
        <span className="gc-live" aria-hidden="true">
          {liveLabel}
          <span className="gc-live-arrow">↗</span>
        </span>
      )}
    </>
  );

  const className = [
    'reveal',
    'gc-card',
    `gc-${layout}`,
    wide ? 'gc-wide' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const style = {
    '--gc-accent': accent,
    '--gc-border': borderAlpha,
    '--gc-bg': bgAlpha,
    '--gc-badge': badgeColor,
    '--i': index,
  } as React.CSSProperties;

  // If the product is live, the whole plate is the link (max click target).
  if (p.url) {
    return (
      <a
        className={className}
        data-featured={isFeatured || undefined}
        style={style}
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${p.nombre} — ${liveLabel}`}
      >
        {inner}
      </a>
    );
  }

  return (
    <article
      className={className}
      data-featured={isFeatured || undefined}
      style={style}
      aria-label={`${p.nombre} — ${soonLabel}`}
    >
      {inner}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* GALLERY SECTION (one frente)                                         */
/* Layout is chosen from item count: 1 → showcase, 2–3 → featured,      */
/* ≥4 → responsive auto-fit grid.                                       */
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

export function GallerySection({
  frenteId,
  accent,
  borderAlpha,
  bgAlpha,
  badgeColor,
  locale,
  items,
  secNo,
  name,
  tagline,
}: GallerySectionProps) {
  const layout = layoutForCount(items.length);

  return (
    <div className="gs-section" id={`gallery-${frenteId}`} data-layout={layout}>
      <div className="gs-header reveal">
        <p className="gs-eyebrow" style={{ color: accent }}>
          <span className="brand-sec-no">{secNo}</span>
          &nbsp;&nbsp;{name}
        </p>
        <h3 className="gs-tagline">{tagline}</h3>
      </div>
      <div className={`gs-grid gs-grid--${layout}`}>
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
            layout={layout}
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

  /* ────────────────────────────────────────────────
     GRID — adaptive by density
     · grid     : auto-fit/minmax, plates stretch to fill (1fr)
     · featured : wide plates, generous min, 1fr stretch
     · showcase : single near-full-bleed banner
  ──────────────────────────────────────────────── */
  .gs-grid { display: grid; gap: 1.25rem; }

  /* Many products (≥4): compact-but-image-first responsive grid. */
  .gs-grid--grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
  /* Few products (2–3): wider plates, still adaptive. */
  .gs-grid--featured {
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
    gap: 1.5rem;
  }
  /* One product: single column — the showcase card takes the full width. */
  .gs-grid--showcase {
    grid-template-columns: 1fr;
  }
  /* Below the featured min-width, collapse to one column cleanly. */
  @media (max-width: 480px) {
    .gs-grid--grid,
    .gs-grid--featured { grid-template-columns: 1fr; }
  }

  /* ────────────────────────────────────────────────
     CARD — the plate IS the card. Image = hero.
  ──────────────────────────────────────────────── */
  .gc-card {
    position: relative;
    display: block;
    text-decoration: none;
    color: inherit;
    background: var(--bg-card);
    border: 1px solid var(--gc-border, var(--line));
    border-radius: var(--r-md);
    overflow: hidden;
    /* Native OG ratio (1200×630 ≈ 1.905) so the baked-in name reads fully. */
    aspect-ratio: 1200 / 630;
    transition:
      transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.32s ease,
      box-shadow 0.32s ease;
    will-change: transform;
  }
  /* In the dense grid, the featured plate spans 2 columns when room allows. */
  .gc-wide { grid-column: span 2; }
  @media (max-width: 660px) { .gc-wide { grid-column: span 1; } }

  /* Featured (non-grid) gets a permanent accent edge. */
  .gc-card[data-featured] { border-color: var(--gc-accent, var(--teal)); }

  /* Showcase: maximum protagonism — big radius, prominent default ring. */
  .gc-showcase {
    border-radius: var(--r-lg);
    border-color: var(--gc-accent, var(--teal));
    box-shadow: 0 18px 60px rgba(0,0,0,0.45);
  }

  /* ── The image plate ── */
  .gc-plate {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: var(--bg-2);
  }
  .gc-plate :global(img),
  .gc-plate img {
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    transform: scale(1.001); /* avoid 1px clip seam on zoom */
  }
  /* Soft veil only at the very edges so overlaid chips stay legible
     without washing out the baked-in artwork. */
  .gc-veil {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      linear-gradient(to bottom, rgba(11,20,23,0.0) 62%, rgba(11,20,23,0.42) 100%),
      radial-gradient(120% 80% at 50% 50%, rgba(11,20,23,0) 70%, rgba(11,20,23,0.18) 100%);
  }

  /* Fallback when a cover is missing (defensive — all 17 exist today). */
  .gc-plate--empty {
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(120% 120% at 30% 20%, var(--gc-bg, rgba(67,181,166,0.06)), transparent 70%),
      var(--bg-card-2);
  }
  .gc-fallback-name {
    font-size: clamp(1.2rem, 3vw, 2rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text);
    padding: 0 1rem;
    text-align: center;
  }

  /* Name kept for assistive tech / SEO; image renders it visually. */
  .gc-sr-name {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  /* ── Status ribbon (top-left), one line, minimal ── */
  .gc-ribbon {
    position: absolute;
    top: 0.85rem;
    left: 0.85rem;
    z-index: 2;
    font-family: var(--font-mono);
    font-size: 0.64rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.24rem 0.6rem;
    border-radius: 999px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    white-space: nowrap;
  }
  .gc-ribbon.is-soon {
    border: 1px solid rgba(207,106,60,0.45);
    background: rgba(207,106,60,0.18);
    color: var(--gold-light);
  }
  .gc-ribbon.is-talk {
    border: 1px solid rgba(224,168,94,0.45);
    background: rgba(224,168,94,0.16);
    color: var(--gold-light);
  }

  /* ── Live affordance (bottom-right) ── */
  .gc-live {
    position: absolute;
    right: 0.85rem;
    bottom: 0.85rem;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--text);
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    border: 1px solid var(--gc-border, var(--line));
    background: rgba(9,16,18,0.55);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.3s ease, transform 0.3s ease, background 0.3s ease, border-color 0.3s ease;
  }
  .gc-live-arrow {
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }
  /* Showcase is large enough to show the affordance at rest. */
  .gc-showcase .gc-live { opacity: 1; transform: none; }

  /* ────────────────────────────────────────────────
     HOVER / FOCUS micro-interactions
  ──────────────────────────────────────────────── */
  .gc-card:hover,
  .gc-card:focus-visible {
    transform: translateY(-6px);
    border-color: var(--gc-accent, var(--teal));
    box-shadow:
      0 22px 60px rgba(0,0,0,0.55),
      0 0 0 1px var(--gc-accent, var(--teal)),
      0 0 30px -8px var(--gc-bg, transparent);
  }
  .gc-showcase:hover,
  .gc-showcase:focus-visible {
    transform: translateY(-4px);
  }
  .gc-card:hover .gc-plate img,
  .gc-card:focus-visible .gc-plate img {
    transform: scale(1.06);
  }
  .gc-card:hover .gc-live,
  .gc-card:focus-visible .gc-live {
    opacity: 1;
    transform: none;
    border-color: var(--gc-accent, var(--teal));
    background: rgba(9,16,18,0.72);
  }
  .gc-card:hover .gc-live-arrow,
  .gc-card:focus-visible .gc-live-arrow {
    transform: translate(2px, -2px);
  }

  /* ────────────────────────────────────────────────
     STAGGERED ENTRANCE (rides the .reveal IntersectionObserver)
     .reveal hides + offsets; .is-visible plays it in with a per-card delay.
  ──────────────────────────────────────────────── */
  .gc-card.reveal {
    transition:
      opacity 0.6s ease,
      transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.32s ease,
      box-shadow 0.32s ease;
    transition-delay: calc(var(--i, 0) * 70ms);
  }
  .gc-card.reveal.is-visible { transform: translateY(0); }

  /* ────────────────────────────────────────────────
     REDUCED MOTION
  ──────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .gc-card,
    .gc-card.reveal,
    .gc-plate img,
    .gc-live,
    .gc-live-arrow {
      transition: none !important;
      transition-delay: 0ms !important;
    }
    .gc-card:hover,
    .gc-card:focus-visible { transform: none; }
    .gc-card:hover .gc-plate img,
    .gc-card:focus-visible .gc-plate img { transform: scale(1.001); }
    .gc-live { opacity: 1; transform: none; }
  }
`;
