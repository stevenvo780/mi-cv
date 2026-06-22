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
import dynamic from 'next/dynamic';
import { type Producto, type FrenteId } from '@/data/frentes';
import { type FieldVariant } from './SectionBackgrounds';
import { BRAND_METADATA } from '@/data/brandMetadata';


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

  const liveLabel = locale === 'es' ? 'Ver en vivo' : 'View live';
  const soonLabel = locale === 'es' ? 'Próximamente' : 'Coming soon';
  const talkLabel = locale === 'es' ? 'Ponencia' : 'Talk';

  // Load Eikon brand metadata
  const meta = BRAND_METADATA[p.id];
  const brandMeta = meta || {
    nombre_producto: p.nombre,
    nombre_corporativo: p.frente === 'enterprise' ? 'Prizma' : 'Pinakothḗke',
    simbolo: '◈',
    paleta: {
      bg: '#0b1417',
      primario: '#0b1417',
      acento: accent,
      acento_2: '#8d7cc0',
      acento_3: '#A3E4D7',
      texto: '#e8e0d4',
      texto_muted: '#8fa3a8',
      surface: '#131e22',
    },
    gradiente_hero: 'linear-gradient(135deg, #e0a85e 0%, #c0522a 40%, #43b5a6 100%)',
    gradiente_bg: 'radial-gradient(ellipse at 50% 18%, #1a2830 0%, #0b1417 62%)',
    tagline: p.subtitulo ? p.subtitulo[locale] : '',
    titulo: p.nombre,
    subtitulo: p.subtitulo ? p.subtitulo[locale] : '',
    copy: p.descripcion[locale],
    has_logo: false,
    logo_path: null,
  };

  const isShowcase = layout === 'showcase';

  const inner = isShowcase ? (
    <div className="gc-showcase-container">
      {/* Background radial gradient */}
      <div className="gc-card-bg" style={{ background: brandMeta.gradiente_bg }} />
      <div className="gc-card-noise" />
      <div className="gc-card-orb gc-card-orb-1" style={{ background: brandMeta.paleta.acento }} />
      <div className="gc-card-orb gc-card-orb-2" style={{ background: brandMeta.paleta.acento_2 }} />
      
      {/* Landscape layout contents */}
      <div className="gc-showcase-layout">
        <section className="gc-showcase-brand">
          <div className="gc-showcase-kicker-wrap">
            <span className="gc-showcase-kicker-line" style={{ background: brandMeta.gradiente_hero }}></span>
            <span className="gc-showcase-kicker-text" style={{ color: brandMeta.paleta.acento }}>
              {brandMeta.nombre_corporativo.toUpperCase()}
            </span>
          </div>
          <div className="gc-showcase-title-block">
            <h4 className="gc-showcase-title" style={{ background: brandMeta.gradiente_hero, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties}>
              {p.nombre}
            </h4>
            {brandMeta.subtitulo && (
              <p className="gc-showcase-tagline">{brandMeta.subtitulo}</p>
            )}
          </div>
        </section>
        
        <div className="gc-showcase-divider" style={{ borderLeftColor: 'rgba(232, 224, 212, 0.1)' }}></div>

        <section className="gc-showcase-content">
          <div className="gc-showcase-accent-line" style={{ background: brandMeta.gradiente_hero }}></div>
          <p className="gc-showcase-desc">
            {p.descripcion[locale]}
          </p>
          <div className="gc-showcase-footer">
            <span className="gc-showcase-url" style={{ color: brandMeta.paleta.acento }}>
              {p.url ? p.url.replace(/^https?:\/\//, '') : brandMeta.tagline}
            </span>
            {p.badge && (
              <span className="gc-showcase-badge" style={{ color: brandMeta.paleta.acento }}>
                {p.badge[locale]}
              </span>
            )}
          </div>
        </section>

        {/* Big visual glyph mark in background or on right side */}
        <div className="gc-showcase-symbol-wrap" style={{ borderLeftColor: 'rgba(255,255,255,0.08)' }}>
          {brandMeta.has_logo && brandMeta.logo_path ? (
            <img src={brandMeta.logo_path} className="gc-showcase-logo-img" alt={p.nombre} />
          ) : (
            <span className="gc-showcase-symbol-text" style={{ background: brandMeta.gradiente_hero, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties}>
              {brandMeta.simbolo}
            </span>
          )}
        </div>
      </div>

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
    </div>
  ) : (
    <div className="gc-grid-container">
      {/* Background radial gradient */}
      <div className="gc-card-bg" style={{ background: brandMeta.gradiente_bg }} />
      <div className="gc-card-noise" />
      <div className="gc-card-orb gc-card-orb-1" style={{ background: brandMeta.paleta.acento }} />
      <div className="gc-card-orb gc-card-orb-2" style={{ background: brandMeta.paleta.acento_2 }} />

      {/* Plate outline container */}
      <div className="gc-grid-plate" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        {/* Top-right watermark symbol */}
        <span
          className="gc-grid-watermark"
          style={{
            color: brandMeta.paleta.acento,
            ...(p.id === 'eikon' ? {
              fontSize: '12rem',
              top: '-1.5rem',
              right: '-1.0rem',
              opacity: 0.08
            } : {})
          }}
        >
          {brandMeta.simbolo}
        </span>

        {/* Top row */}
        <div className="gc-grid-header">
          <div className="gc-grid-eyebrow">
            <span className="gc-grid-frente" style={{ color: brandMeta.paleta.acento }}>
              {p.frente === 'filosofia' ? 'Filosofía' :
               p.frente === 'ciencias' ? 'Ciencias' :
               p.frente === 'informatica' ? 'Ingeniería' : 'Enterprise'}
            </span>
            <span className="gc-grid-casa">{brandMeta.nombre_corporativo}</span>
          </div>
          <div className="gc-grid-chip">
            {brandMeta.has_logo && brandMeta.logo_path ? (
              <img src={brandMeta.logo_path} className="gc-grid-chip-logo" alt={p.nombre} />
            ) : (
              <span
                className="gc-grid-chip-symbol"
                style={{
                  background: brandMeta.gradiente_hero,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  ...(p.id === 'eikon' ? { fontSize: '1.65rem' } : {})
                } as React.CSSProperties}
              >
                {brandMeta.simbolo}
              </span>
            )}
          </div>
        </div>

        {/* Body area */}
        <div className="gc-grid-body">
          <h4 className="gc-grid-title" style={{ background: brandMeta.gradiente_hero, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties}>
            {p.nombre}
          </h4>
          <div className="gc-grid-accent-line" style={{ background: brandMeta.gradiente_hero }}></div>
          <p className="gc-grid-desc">
            {p.descripcion[locale]}
          </p>
        </div>

        {/* Footer area */}
        <div className="gc-grid-footer" style={{ borderTopColor: 'rgba(255, 255, 255, 0.08)' }}>
          <span className="gc-grid-url" style={{ color: brandMeta.paleta.acento }}>
            {p.url ? p.url.replace(/^https?:\/\//, '') : brandMeta.tagline}
          </span>
          {p.badge && (
            <span className="gc-grid-badge">
              {p.badge[locale]}
            </span>
          )}
        </div>
      </div>

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
    </div>
  );

  const className = ['reveal', 'gc-card', `gc-${layout}`]
    .filter(Boolean)
    .join(' ');

  const style = {
    '--gc-accent': brandMeta.paleta.acento,
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
          <h3 className="gs-eyebrow" style={{ color: accent }}>
            <span className="brand-sec-no">{secNo}</span>
            &nbsp;&nbsp;{name}
          </h3>
          <p className="gs-tagline">{tagline}</p>
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
            {rest.map((p, i) => {
              const isLastAndOdd = rest.length % 2 !== 0 && i === rest.length - 1;
              return (
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
                  layout={isLastAndOdd ? 'showcase' : restLayout}
                />
              );
            })}
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
  /* Force any auto-reaccommodated showcase cards in grid to take full width (12 cols equivalent) */
  .gs-grid--grid > .gc-showcase {
    grid-column: span 2;
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
     CARD — the plate IS the card. Responsive HTML.
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

  /* ── Card BG & Ambient watermarks ── */
  .gc-card-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    transition: opacity 0.5s ease;
  }
  .gc-card-noise {
    position: absolute;
    inset: 0;
    z-index: 1;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260' viewBox='0 0 260 260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='260' height='260' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
    background-size: 260px 260px;
    mix-blend-mode: soft-light;
    pointer-events: none;
  }
  .gc-card-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(75px);
    opacity: 0.11;
    pointer-events: none;
    z-index: 1;
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease;
  }
  .gc-card-orb-1 {
    width: 60%;
    height: 60%;
    top: -20%;
    right: -10%;
  }
  .gc-card-orb-2 {
    width: 50%;
    height: 50%;
    bottom: -15%;
    left: 10%;
  }

  /* ────────────────────────────────────────────────
     PORTRAIT CARD (GRID)
     aspect-ratio 4:5
  ──────────────────────────────────────────────── */
  .gc-grid-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .gc-grid-plate {
    position: absolute;
    inset: 0.9rem;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(11,20,23,0.18) 0%, rgba(11,20,23,0.55) 60%, rgba(11,20,23,0.85) 100%);
    display: flex;
    flex-direction: column;
    padding: 1.25rem 1.25rem 1.1rem;
    z-index: 2;
    overflow: hidden;
    transition: border-color 0.32s ease, background 0.32s ease;
  }
  .gc-grid-plate::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--gc-accent);
    opacity: 0.9;
  }
  
  .gc-grid-watermark {
    position: absolute;
    top: -1.2rem;
    right: -0.8rem;
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 12rem;
    font-weight: 700;
    line-height: 1;
    opacity: 0.055;
    pointer-events: none;
    user-select: none;
    z-index: 1;
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease;
  }
  
  .gc-grid-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.8rem;
    z-index: 2;
  }
  .gc-grid-eyebrow {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .gc-grid-frente {
    font-family: var(--font-jetbrains), monospace;
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .gc-grid-casa {
    font-family: var(--font-jetbrains), monospace;
    font-size: 0.52rem;
    color: var(--text-muted, #8fa3a8);
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }
  .gc-grid-chip {
    flex-shrink: 0;
    width: 2.3rem;
    height: 2.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 6px;
    background: rgba(255,255,255,0.03);
    transition: transform 0.4s ease, border-color 0.4s ease;
  }
  .gc-grid-chip-logo {
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
    filter: brightness(1.05);
  }
  .gc-grid-chip-symbol {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.35rem;
    font-weight: 700;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: #fff;
  }

  .gc-grid-body {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0.4rem 0;
    z-index: 2;
  }
  .gc-grid-title {
    font-family: var(--font-cormorant), Georgia, serif;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.015em;
    font-size: clamp(1.7rem, 4vw, 2.3rem);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: #fff;
    padding-bottom: 0.08em;
  }
  .gc-grid-accent-line {
    width: 2.2rem;
    height: 3px;
    border-radius: 1px;
    margin-top: 0.4rem;
  }
  .gc-grid-desc {
    font-size: clamp(0.70rem, 2vw, 0.80rem);
    font-weight: 300;
    line-height: 1.45;
    color: var(--text, #e8e0d4);
    opacity: 0.88;
    margin-top: 0.75rem;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-height: 5.8rem;
  }

  .gc-grid-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    padding-top: 0.6rem;
    border-top: 1px solid rgba(255,255,255,0.08);
    z-index: 2;
  }
  .gc-grid-url {
    font-family: var(--font-jetbrains), monospace;
    font-size: 0.62rem;
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  .gc-grid-badge {
    font-family: var(--font-jetbrains), monospace;
    font-size: 0.52rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted, #8fa3a8);
  }

  /* ────────────────────────────────────────────────
     LANDSCAPE CARD (SHOWCASE BANNER)
     aspect-ratio 1200 / 630
  ──────────────────────────────────────────────── */
  .gc-showcase-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .gc-showcase-layout {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 1px 1.2fr 0.8fr;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 2.2rem 2.8rem;
    gap: 1.5rem;
  }
  
  .gc-showcase-brand {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .gc-showcase-kicker-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .gc-showcase-kicker-line {
    width: 1.2rem;
    height: 2px;
    border-radius: 1px;
  }
  .gc-showcase-kicker-text {
    font-family: var(--font-jetbrains), monospace;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.2em;
  }
  .gc-showcase-title-block {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .gc-showcase-title {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(2.0rem, 5vw, 3.2rem);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.015em;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: #fff;
    padding-bottom: 0.05em;
  }
  .gc-showcase-tagline {
    font-family: var(--font-inter), sans-serif;
    font-size: clamp(0.85rem, 2vw, 1.0rem);
    color: var(--text-muted, #8fa3a8);
    line-height: 1.35;
    font-weight: 300;
  }

  .gc-showcase-divider {
    height: 55%;
    border-left: 1px solid rgba(255,255,255,0.08);
  }

  .gc-showcase-content {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    padding-right: 0.5rem;
  }
  .gc-showcase-accent-line {
    width: 1.8rem;
    height: 3px;
    border-radius: 1px;
  }
  .gc-showcase-desc {
    font-size: clamp(0.78rem, 2vw, 0.88rem);
    line-height: 1.5;
    color: var(--text, #e8e0d4);
    opacity: 0.9;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .gc-showcase-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    margin-top: 0.4rem;
  }
  .gc-showcase-url {
    font-family: var(--font-jetbrains), monospace;
    font-size: 0.70rem;
    font-weight: 600;
  }
  .gc-showcase-badge {
    font-family: var(--font-jetbrains), monospace;
    font-size: 0.58rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1px solid currentColor;
    border-radius: 99px;
    padding: 0.12rem 0.5rem;
    opacity: 0.85;
    background: rgba(11,20,23,0.3);
  }

  .gc-showcase-symbol-wrap {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 1.5rem;
    border-left: 1px solid rgba(255,255,255,0.08);
  }
  .gc-showcase-logo-img {
    max-width: 90%;
    max-height: 80%;
    object-fit: contain;
  }
  .gc-showcase-symbol-text {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 7.5rem;
    font-weight: 700;
    line-height: 1;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: #fff;
  }

  /* ────────────────────────────────────────────────
     RESPONSIVE BREAKPOINTS FOR DYNAMIC HTML CARDS
  ──────────────────────────────────────────────── */
  @media (max-width: 900px) {
    .gc-showcase-layout {
      grid-template-columns: 1.2fr 1px 1.5fr;
      padding: 1.8rem 2.2rem;
    }
    .gc-showcase-symbol-wrap {
      display: none;
    }
  }

  @media (max-width: 680px) {
    /* Showcase layouts collapse to vertical stacked flex layout on small viewports */
    .gc-showcase-layout {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: stretch;
      padding: 1.4rem;
      gap: 0.8rem;
    }
    .gc-showcase-divider {
      display: none;
    }
    .gc-showcase-brand {
      gap: 0.4rem;
    }
    .gc-showcase-content {
      gap: 0.5rem;
    }
    .gc-showcase-accent-line {
      display: none;
    }
    .gc-showcase-desc {
      -webkit-line-clamp: 3;
    }
  }

  @media (max-width: 480px) {
    .gc-grid-plate {
      inset: 0.5rem;
      padding: 0.9rem;
    }
    .gc-grid-watermark {
      font-size: 8rem;
      top: -1rem;
      right: -0.5rem;
    }
    .gc-grid-chip {
      width: 2rem;
      height: 2rem;
    }
    .gc-grid-chip-symbol {
      font-size: 1.1rem;
    }
    .gc-grid-title {
      font-size: clamp(1.4rem, 4vw, 1.8rem);
    }
    .gc-grid-desc {
      -webkit-line-clamp: 4;
      margin-top: 0.5rem;
      font-size: 0.7rem;
    }
  }

  /* ── Status ribbon (top-left), one line, minimal ── */
  .gc-ribbon {
    position: absolute;
    top: 0.85rem;
    left: 0.85rem;
    z-index: 5;
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
    z-index: 5;
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
      0 0 30px -8px var(--gc-border, transparent);
  }
  .gc-showcase:hover,
  .gc-showcase:focus-visible {
    transform: translateY(-4px);
  }
  
  /* Micro-interactions inside card on hover */
  .gc-card:hover .gc-grid-chip,
  .gc-card:focus-visible .gc-grid-chip {
    transform: scale(1.06);
    border-color: var(--gc-accent);
  }
  .gc-card:hover .gc-grid-watermark,
  .gc-card:focus-visible .gc-grid-watermark {
    transform: scale(1.05) translate(-2px, 2px);
    opacity: 0.08;
  }
  .gc-card:hover .gc-card-orb-1,
  .gc-card:focus-visible .gc-card-orb-1 {
    transform: scale(1.15) translate(-5%, -5%);
    opacity: 0.16;
  }
  .gc-card:hover .gc-card-orb-2,
  .gc-card:focus-visible .gc-card-orb-2 {
    transform: scale(1.15) translate(5%, 5%);
    opacity: 0.16;
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
    .gc-grid-plate,
    .gc-grid-chip,
    .gc-grid-watermark,
    .gc-card-orb,
    .gc-live,
    .gc-live-arrow {
      transition: none !important;
      transition-delay: 0ms !important;
    }
    .gc-card:hover,
    .gc-card:focus-visible { transform: none; }
    .gc-card:hover .gc-grid-chip,
    .gc-card:hover .gc-grid-watermark,
    .gc-card:hover .gc-card-orb { transform: none; }
    .gc-live { opacity: 1; transform: none; }
  }
`;
