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
 *   Layout adapts to how many products a section has (count-driven density),
 *   with a per-product BANNER override layered on top:
 *     · banner:true  → that product renders as a full-width SHOWCASE BANNER at the
 *                      TOP of its section (horizontal og_product cover, big radius),
 *                      even when the section also has grid cards below. A section can
 *                      therefore MIX: one (or more) banner(s) on top + a portrait grid
 *                      underneath. Used by Ágora in Filosofía (the "big" one).
 *     · count === 1  → "showcase": one giant near-full-bleed HORIZONTAL banner
 *                      (Enterprise/Prizma) using the hi-res landscape cover.
 *     · count ≥ 2    → "grid": fixed 2-column grid of UNIFORM, taller PORTRAIT cards
 *                      (Ingeniería/Filosofía/Ciencias). Every card is the same size —
 *                      no featured span, no half-height items. Uses portrait.png so the
 *                      baked-in name/logo reads larger and clearer. The horizontal
 *                      "featured" layout was retired: the owner found the baked-in text
 *                      on side-by-side landscape plates hard to read, so every multi-
 *                      product section now reads its portrait art in a uniform grid.
 *
 *   The product name lives in the image's `alt` + an sr-only <h3> for a11y/SEO.
 */

import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { type Producto, type FrenteId } from '@/data/frentes';
import { type FieldVariant } from './SectionBackgrounds';

// Decorative ambient background — client-only, never blocks paint.
const SectionField = dynamic(() => import('./SectionBackgrounds'), { ssr: false });

export type Locale = 'es' | 'en';

/* ------------------------------------------------------------------ */
/* Decorative background variant per frente (subject-driven mapping):  */
/*   §01 informatica → circuit lattice (engineering = circuitry)       */
/*   §02 filosofia   → orbiting constellation (dialectic links)        */
/*   §03 ciencias    → curl-noise flow field (advected tracers, full-bleed) */
/*   §04 enterprise  → prism refracting a spectral fan (Prizma)        */
/* Each is SUBTLE, behind the cards (z-index 0), reduced-motion aware. */
/* ------------------------------------------------------------------ */
export const FRENTE_FIELD: Record<FrenteId, { variant: FieldVariant; opacity: number }> = {
  // Opacities tuned per animation's intrinsic contrast so each field reads
  // clearly in the lateral margins without ever fighting the cards:
  //  · circuit  — sparse hairline lattice, lowest per-pixel ink → highest layer α
  //  · prism    — faint spectral rays on dark → high α
  //  · constellation — medium-density gold web → mid α
  //  · flowfield — additive teal filaments on dark, full-width → mid α
  informatica: { variant: 'circuit', opacity: 0.4 },
  filosofia: { variant: 'constellation', opacity: 0.36 },
  ciencias: { variant: 'flowfield', opacity: 0.4 },
  enterprise: { variant: 'prism', opacity: 0.38 },
};

/* ------------------------------------------------------------------ */
/* Brand image map: product id → /brand/<slug>/og_product.png         */
/* All covers are 2400×1260 (@2x Retina). Native ratio 1200/630       */
/* ≈ 1.905:1 is kept so the card's aspect-ratio CSS still applies.    */
/* ------------------------------------------------------------------ */
export const BRAND_COVER: Record<string, string> = {
  clavis:                             '/brand/paideia/og_product.png',
  debatesuite:                        '/brand/agon/og_product.png',
  'estructuras-preontologicas':       '/brand/estructuras-preontologicas/og_product.png',
  complexlab:                         '/brand/kosmos/og_product.png',
  aporia:                             '/brand/aporia/og_product.png',
  'nlp-to-logic':                     '/brand/organon/og_product.png',
  stevenai:                           '/brand/daimon/og_product.png',
  stevendevbox:                       '/brand/techne/og_product.png',
  communityos:                        '/brand/koinonia/og_product.png',
  agora:                              '/brand/agora/og_product.png',
  devkits:                            '/brand/ergon/og_product.png',
  'devkits-hours':                    '/brand/chronos/og_product.png',
  'devkits-crm':                      '/brand/xenia/og_product.png',
  scrapekit:                          '/brand/nomos/og_product.png',
  warehouse:                          '/brand/apotheke/og_product.png',
  eikon:                              '/brand/eikon/og_product.png',
  prizma:                             '/brand/prizma/og_product.png',
};

/* ------------------------------------------------------------------ */
/* Portrait variant map: product id → /brand/<slug>/portrait.png      */
/* 1080×1350 (4:5) — every product that lands in a count≥2 grid:       */
/* Ingeniería (12), Filosofía (2) and Ciencias (2). Each grid card     */
/* reads its OWN portrait. Generated by eikon/render_hires.py.         */
/* ------------------------------------------------------------------ */
export const BRAND_COVER_PORTRAIT: Record<string, string> = {
  // Filosofía grid (count 2): Paideía + Agón, uniform portrait cards.
  clavis:                         '/brand/paideia/portrait.png',
  debatesuite:                    '/brand/agon/portrait.png',
  // Ciencias grid (count 2): Kósmos (complexlab) + Estructuras Preontológicas.
  // Now a uniform portrait grid (the horizontal featured layout was retired),
  // so both read their 4:5 portrait art instead of the landscape cover.
  complexlab:                     '/brand/kosmos/portrait.png',
  'estructuras-preontologicas':   '/brand/estructuras-preontologicas/portrait.png',
  // NOTE: 'agora' is intentionally ABSENT here. Ágora now lives in Filosofía
  // and renders as a full-width SHOWCASE BANNER (banner:true) using its
  // HORIZONTAL cover BRAND_COVER['agora'] (/brand/agora/og_product.png), never
  // the 4:5 portrait — so it must not appear in the portrait grid map.
  // Ingeniería grid (count 11).
  'nlp-to-logic':                 '/brand/organon/portrait.png',
  aporia:                         '/brand/aporia/portrait.png',
  stevenai:       '/brand/daimon/portrait.png',
  stevendevbox:   '/brand/techne/portrait.png',
  communityos:    '/brand/koinonia/portrait.png',
  devkits:        '/brand/ergon/portrait.png',
  'devkits-hours': '/brand/chronos/portrait.png',
  'devkits-crm':  '/brand/xenia/portrait.png',
  scrapekit:      '/brand/nomos/portrait.png',
  warehouse:      '/brand/apotheke/portrait.png',
  eikon:          '/brand/eikon/portrait.png',
};

/* ------------------------------------------------------------------ */
/* Frente accent palette                                               */
/* ------------------------------------------------------------------ */
// Ordered descending by product count: informatica(11) > filosofia(3) > ciencias(2) > enterprise(1)
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
/*   1     → showcase  (horizontal cover banner — Enterprise)          */
/*   2+    → grid      (uniform 2-col PORTRAIT cards —                  */
/*                      Ing./Filosofía/Ciencias)                       */
/* ------------------------------------------------------------------ */
export type GalleryLayout = 'showcase' | 'grid';

export function layoutForCount(count: number): GalleryLayout {
  // Single product → full-bleed horizontal showcase (Enterprise).
  // Two or more → uniform portrait grid (Ingeniería/Filosofía/Ciencias).
  if (count <= 1) return 'showcase';
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
  // `featured` only styles the standalone showcase card now. In the uniform grid
  // every plate is identical, so a featured flag must NOT add an accent edge there.
  const isFeatured = p.featured === true && layout !== 'grid';
  // In the grid (≥2), every card is a UNIFORM PORTRAIT plate — no featured span,
  // no half-height items. Prefer the 4:5 portrait art; fall back to the landscape
  // cover only if a portrait wasn't generated for this product.
  const cover =
    layout === 'grid'
      ? BRAND_COVER_PORTRAIT[p.id] ?? BRAND_COVER[p.id]
      : BRAND_COVER[p.id];
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
            // Brand covers and portraits are PNG assets with baked-in text —
            // skip Next.js re-compression so no JPEG artefacts degrade the type.
            // Portrait PNGs are 2160x2700 @2x; og_product PNGs 2400x1260 @2x —
            // already sharp at every viewport size we serve.
            unoptimized
            sizes={
              layout === 'showcase'
                ? '(max-width: 1120px) 100vw, 1120px'
                : // grid: 2-col portrait cards — retina needs ~1080px each column
                  '(max-width: 560px) 100vw, (max-width: 1280px) 50vw, 640px'
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

  const className = ['reveal', 'gc-card', `gc-${layout}`]
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
/* Layout is chosen from item count: 1 → showcase, ≥2 → uniform         */
/* 2-column portrait grid.                                              */
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
  // Split a section into BANNER products (rendered as full-width showcase
  // banners stacked on top) and the REST (rendered in the normal layout below).
  // A product flagged banner:true always gets the wide horizontal plate, even
  // when the section also holds grid cards (e.g. Ágora over Paideía + Agón in
  // Filosofía). Sections with no banner flag (Ing./Ciencias/Enterprise) keep
  // their original count-driven behavior unchanged.
  const banners = items.filter((p) => p.banner === true);
  const rest = items.filter((p) => p.banner !== true);
  // The grid/showcase mode is derived from how many NON-banner products remain.
  const restLayout = layoutForCount(rest.length);
  // For data-layout / styling hooks: 'mixed' when a banner coexists with a grid.
  const sectionLayout =
    banners.length > 0 && rest.length > 0 ? 'mixed' : restLayout;
  const field = FRENTE_FIELD[frenteId];

  return (
    <div
      className="gs-section"
      id={`gallery-${frenteId}`}
      data-layout={sectionLayout}
    >
      {/* Decorative ambient field — sits behind the cards (z-index 0). */}
      {field && (
        <SectionField
          variant={field.variant}
          opacity={field.opacity}
          className="gs-field"
        />
      )}
      <div className="gs-content">
        <div className="gs-header reveal">
          <p className="gs-eyebrow" style={{ color: accent }}>
            <span className="brand-sec-no">{secNo}</span>
            &nbsp;&nbsp;{name}
          </p>
          <h3 className="gs-tagline">{tagline}</h3>
        </div>

        {/* Banner row(s): each flagged product as a full-width horizontal
            showcase, ABOVE the grid. */}
        {banners.length > 0 && (
          <div className="gs-grid gs-grid--showcase gs-banners">
            {banners.map((p, i) => (
              <GalleryCard
                key={p.id}
                producto={p}
                locale={locale}
                accent={accent}
                borderAlpha={borderAlpha}
                bgAlpha={bgAlpha}
                badgeColor={badgeColor}
                index={i}
                layout="showcase"
              />
            ))}
          </div>
        )}

        {/* The remaining products in their normal layout (grid or showcase). */}
        {rest.length > 0 && (
          <div className={`gs-grid gs-grid--${restLayout}`}>
            {rest.map((p, i) => (
              <GalleryCard
                key={p.id}
                producto={p}
                locale={locale}
                accent={accent}
                borderAlpha={borderAlpha}
                bgAlpha={bgAlpha}
                badgeColor={badgeColor}
                // Offset reveal index so banner + grid stagger continues smoothly.
                index={banners.length + i}
                layout={restLayout}
              />
            ))}
          </div>
        )}
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

  /*
   * Full-bleed technique: break out of the centered max-width wrapper by
   * expanding gs-section to 100vw and pulling it back to the viewport edge.
   * The parent wrapper (.lt-gallery / .fp-wrap) must NOT have overflow:hidden —
   * overflow-x:clip is set on <html> in brand.css to swallow any sub-pixel gap
   * without blocking scroll-linked effects or position:sticky.
   */
  .gs-section {
    position: relative;
    width: 100vw;
    left: 50%;
    margin-left: -50vw;
    padding: 3.4rem 0 3.4rem;
    isolation: isolate; /* own stacking context: field can't leak over siblings */
  }

  /* ── Decorative ambient field (canvas) ──
     Fills the entire .gs-section (which IS 100vw). The cards sit centered in a
     ~1120px column, so the field has to stay BRIGHT in the lateral margins —
     that's the only place it shows. The previous radial mask did the opposite:
     it kept the centre solid (hidden behind the cards) and faded the sides
     (where the margins are). Now we feather ONLY the top/bottom seams with
     adjacent sections, and keep the field at full strength across the whole
     width so it reads in the side gutters and around short sections. */
  .gs-section .section-field {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    /* Vertical seam-feather only: solid through the body, soft top & bottom. */
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      #000 14%,
      #000 86%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      #000 14%,
      #000 86%,
      transparent 100%
    );
  }
  .gs-section .section-field-canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  /*
   * Re-center the content inside the full-bleed gs-section.
   * Matches the outer wrapper's max-width so cards stay at the same position.
   */
  .gs-content {
    position: relative;
    z-index: 1;
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 1.25rem;
  }

  @media (max-width: 640px) {
    /* On phones the radial already covers the narrower viewport well — no
       extra override needed. Padding stays 1.25rem via gs-content above. */
  }

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
     GRID — two modes by product count
     · grid     : FIXED 2 columns, every card identical (portrait 4:5)
     · showcase : single near-full-bleed landscape banner (Enterprise)
  ──────────────────────────────────────────────── */
  .gs-grid { display: grid; gap: 1.25rem; }

  /* Many products (≥2): strict 2-column grid. Equal-width columns (1fr) +
     a fixed portrait aspect-ratio on every card ⇒ identical card size.
     No featured span, no half-height. */
  .gs-grid--grid {
    grid-template-columns: repeat(2, 1fr);
    align-items: start;
    gap: 1.5rem;
  }
  /* One product: single column — the showcase card takes the full width. */
  .gs-grid--showcase {
    grid-template-columns: 1fr;
  }
  /* Banner row sitting ON TOP of a portrait grid (mixed section, e.g. Filosofía:
     Ágora banner over Paideía + Agón). Space it from the grid below; multiple
     banners stack with the same gap. */
  .gs-banners { margin-bottom: 1.5rem; }
  .gs-banners + .gs-grid--grid { margin-top: 0; }
  /* Collapse to a single column on phones. */
  @media (max-width: 560px) {
    .gs-grid--grid { grid-template-columns: 1fr; gap: 1.25rem; }
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
    /* Default = native OG landscape ratio (1200×630 ≈ 1.905). Only the
       single-product showcase banner keeps it; the grid overrides to 4:5
       portrait below. */
    aspect-ratio: 1200 / 630;
    transition:
      transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.32s ease,
      box-shadow 0.32s ease;
    will-change: transform;
  }

  /* Grid cards are UNIFORM PORTRAIT plates (4:5 = 1080×1350). Equal 1fr
     columns + this fixed aspect-ratio guarantee every card is the same size. */
  .gc-grid {
    aspect-ratio: 1080 / 1350;
  }

  /* A featured standalone card (only the showcase today) gets an accent edge.
     Grid cards never carry data-featured, so they stay uniform. */
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
