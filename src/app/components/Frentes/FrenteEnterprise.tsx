'use client';
/**
 * FrenteEnterprise — Phase 3 rich component for the #enterprise section.
 *
 * Visual identity: EL MÁS BRILLANTE.
 *   - Sub-accents: --gold + --rust (var(--acc-enterprise) / var(--acc-enterprise-2))
 *   - Background: double radial gold/rust ambient + ParticleFlow canvas
 *     (mounted/unmounted by CanvasViewport, paused when off-screen).
 *   - PRISMA: full-width featured card, animated gradient border, CSS halo pulse.
 *   - Shimmer sweep: CSS anim-shimmer class on each card overlay.
 *   - Business model badges on DevKits/*,  ScrapeKit, Warehouse.
 *   - All animations: transform/opacity only (CPU-first, no GPU obligation).
 *   - Respects prefers-reduced-motion (brand.css global rule).
 *
 * Data: reads from src/data/frentes.ts, frente === 'enterprise'.
 * Products rendered (6, own deployments only):
 *   PRISMA (featured/soon), DevKits (live), DevKits Hours (live),
 *   DevKits CRM (live), ScrapeKit Colombia (live), Warehouse (live).
 *   (Graf/Humanizar removed: only live URL was a client/NDA deployment.)
 */

import React, { useRef } from 'react';
import { useParams } from 'next/navigation';
import { frentesMeta, productosPorFrente, type Producto } from '@/data/frentes';
import CanvasViewport from './CanvasViewport';
import ParticleFlow from '@/app/components/Matematica/ParticleFlow';

type Locale = 'es' | 'en';

/* ------------------------------------------------------------------ */
/* PRISMA card — full-width, animated gradient border, pulsing halo    */
/* ------------------------------------------------------------------ */
function PrismaCard({ locale }: { locale: Locale }) {
  const p: Producto = productosPorFrente('enterprise').find(
    (x) => x.id === 'prisma'
  )!;

  return (
    <div
      className="reveal"
      style={{
        position: 'relative',
        borderRadius: 'var(--r-lg)',
        padding: '2px',           /* border "width" (gradient sits here) */
        background: 'var(--grad-sig-anim)',
        backgroundSize: '200% 100%',
        animation: 'brand-grad-shift 6s linear infinite alternate',
        marginBottom: '2rem',
      }}
    >
      {/* Pulsing halo — pure opacity/scale, no GPU */}
      <div
        aria-hidden="true"
        className="anim-pulse"
        style={{
          position: 'absolute',
          inset: '-12px',
          borderRadius: 'calc(var(--r-lg) + 12px)',
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(224,168,94,0.22) 0%, rgba(207,106,60,0.12) 50%, transparent 72%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Inner card surface */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: 'calc(var(--r-lg) - 2px)',
          background: 'var(--bg-card)',
          padding: '2.5rem 2rem',
          overflow: 'hidden',
        }}
      >
        {/* Shimmer sweep */}
        <div
          aria-hidden="true"
          className="anim-shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <span
              className="brand-eyebrow"
              style={{ color: 'var(--gold)', letterSpacing: '0.22em' }}
            >
              {locale === 'es' ? 'Insignia · Próximamente' : 'Flagship · Coming soon'}
            </span>
            <span
              className="brand-chip"
              style={{
                background: 'rgba(224,168,94,0.12)',
                borderColor: 'rgba(224,168,94,0.4)',
                color: 'var(--gold-light)',
              }}
            >
              {p.badge?.[locale]}
            </span>
          </div>

          <h3
            className="brand-gradient-text"
            style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', margin: '0 0 0.75rem' }}
          >
            {p.nombre}
          </h3>

          <p
            style={{
              maxWidth: '66ch',
              color: 'var(--text-soft)',
              fontSize: '1rem',
              lineHeight: '1.65',
            }}
          >
            {p.descripcion[locale]}
          </p>

          <p
            style={{
              marginTop: '1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--muted)',
              letterSpacing: '0.04em',
            }}
          >
            {locale === 'es'
              ? 'Reserva tu lugar ahora — lanzamiento privado'
              : 'Reserve your spot now — private launch'}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Regular product card                                                 */
/* ------------------------------------------------------------------ */
function ProductCard({
  product,
  locale,
}: {
  product: Producto;
  locale: Locale;
}) {
  /* Graf/Humanizar: live URL but mark it clearly as client heritage */
  const isGraf = product.id === 'graf';
  const isSoon = product.status === 'soon';

  /* Which products carry a business-model badge visually amplified */
  const modelBadgeIds = ['devkits', 'devkits-hours', 'devkits-crm', 'scrapekit', 'warehouse'];
  const hasModelBadge = modelBadgeIds.includes(product.id);

  return (
    <div
      className="brand-card reveal h-100"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        borderColor: isGraf ? 'rgba(207,106,60,0.3)' : undefined,
      }}
    >
      {/* Shimmer sweep overlay */}
      <div
        aria-hidden="true"
        className="anim-shimmer"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
        }}
      />

      {/* Gold top-accent line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '1.5rem',
          right: '1.5rem',
          height: '2px',
          background: isGraf
            ? 'var(--rust)'
            : 'linear-gradient(90deg, var(--gold) 0%, var(--rust) 100%)',
          opacity: 0.6,
          borderRadius: '0 0 2px 2px',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: isGraf ? 'var(--rust)' : 'var(--gold-light)',
              margin: 0,
              flex: '1 1 auto',
            }}
          >
            {product.nombre}
          </h3>

          {isSoon && (
            <span
              className="brand-chip"
              style={{
                background: 'rgba(224,168,94,0.12)',
                borderColor: 'rgba(224,168,94,0.35)',
                color: 'var(--gold)',
              }}
            >
              {product.badge?.[locale]}
            </span>
          )}
        </div>

        {/* What it is (one-liner) */}
        {product.subtitulo && (
          <span
            className="brand-eyebrow"
            style={{
              color: 'var(--gold-light)',
              fontSize: '0.72rem',
              letterSpacing: '0.04em',
              textTransform: 'none',
            }}
          >
            {product.subtitulo[locale]}
          </span>
        )}

        {/* Heritage tag for Graf */}
        {isGraf && (
          <span
            className="brand-eyebrow"
            style={{ color: 'var(--rust)', fontSize: '0.7rem' }}
          >
            {locale === 'es' ? 'Legado · Caso de estudio' : 'Heritage · Case study'}
          </span>
        )}

        {/* Description */}
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-soft)',
            lineHeight: '1.6',
            margin: 0,
            flex: 1,
          }}
        >
          {product.descripcion[locale]}
        </p>

        {/* Business-model badge */}
        {hasModelBadge && product.badge && (
          <span
            className="brand-chip"
            style={{
              alignSelf: 'flex-start',
              background: 'rgba(207,106,60,0.12)',
              borderColor: 'rgba(207,106,60,0.4)',
              /* gold-light (AA on the warm chip bg) — rust failed AA at 4.0 */
              color: 'var(--gold-light)',
            }}
          >
            {product.badge[locale]}
          </span>
        )}

        {/* Action row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.6rem',
            marginTop: 'auto',
            paddingTop: '0.75rem',
          }}
        >
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: isGraf ? 'var(--rust)' : 'var(--gold)',
                textDecoration: 'none',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                border: `1px solid ${isGraf ? 'rgba(207,106,60,0.45)' : 'rgba(224,168,94,0.45)'}`,
                transition: 'background 0.18s, color 0.18s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = isGraf
                  ? 'rgba(207,106,60,0.14)'
                  : 'rgba(224,168,94,0.14)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
              }}
            >
              {locale === 'es' ? 'Ver en vivo' : 'View live'}{' '}
              <span aria-hidden="true">↗</span>
            </a>
          )}

          {product.repo && (
            <a
              href={product.repo}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--muted)',
                textDecoration: 'none',
              }}
            >
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section background — double radial ambient                           */
/* ------------------------------------------------------------------ */
function EnterpriseAmbient() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Gold radial — top-left */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '55%',
          paddingBottom: '55%',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at center, rgba(224,168,94,0.10) 0%, transparent 70%)',
        }}
      />
      {/* Rust radial — bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: '-5%',
          right: '-5%',
          width: '50%',
          paddingBottom: '50%',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at center, rgba(207,106,60,0.09) 0%, transparent 68%)',
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main export                                                          */
/* ------------------------------------------------------------------ */
export default function FrenteEnterprise() {
  const params = useParams();
  const locale: Locale = params.locale === 'es' ? 'es' : 'en';
  const meta = frentesMeta['enterprise'];
  const sectionRef = useRef<HTMLElement>(null);

  /* Separate PRISMA from the rest; keep insertion order for the grid */
  const allProducts = productosPorFrente('enterprise');
  const prisma = allProducts.find((p) => p.id === 'prisma');
  const gridProducts = allProducts.filter((p) => p.id !== 'prisma');

  return (
    <section
      id="enterprise"
      ref={sectionRef}
      style={{ position: 'relative', scrollMarginTop: '80px', padding: '5rem 0 6rem' }}
    >
      {/* ── Ambient double-radial (pure CSS, no GPU) ── */}
      <EnterpriseAmbient />

      {/* ── ParticleFlow canvas — mounted only while in viewport ── */}
      <CanvasViewport opacity={0.10}>
        <ParticleFlow />
      </CanvasViewport>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Section header ── */}
        <div className="reveal" style={{ marginBottom: '2.5rem', maxWidth: '72ch' }}>
          <div className="brand-eyebrow" style={{ color: 'var(--gold)' }}>
            <span
              className="brand-sec-no"
              style={{ color: 'var(--gold)' }}
            >
              {meta.secNo}
            </span>{' '}
            &nbsp;{meta.nombre[locale]}
          </div>

          <h2
            className="brand-gradient-text"
            style={{
              marginTop: '0.5rem',
              fontSize: 'clamp(1.75rem, 4vw, 2.8rem)',
              lineHeight: 1.15,
            }}
          >
            {meta.tagline[locale]}
          </h2>

          <p
            style={{
              marginTop: '0.75rem',
              color: 'var(--text-soft)',
              fontSize: '1rem',
              lineHeight: '1.65',
            }}
          >
            {meta.descripcion[locale]}
          </p>
        </div>

        {/* ── PRISMA — flagship full-width card ── */}
        {prisma && <PrismaCard locale={locale} />}

        {/* ── Grid: remaining 6 products ── */}
        <div
          className="row g-3"
          style={{ marginTop: '0.25rem' }}
        >
          {gridProducts.map((p) => (
            <div
              key={p.id}
              className="col-12 col-md-6 col-lg-4"
            >
              <ProductCard product={p} locale={locale} />
            </div>
          ))}
        </div>

        {/* ── Section closing line ── */}
        <div
          className="reveal"
          style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--muted)',
            }}
          >
            {locale === 'es'
              ? 'Suite completa disponible · contacto directo'
              : 'Full suite available · direct contact'}
          </span>
          <a
            href="mailto:stevenvallejo780@gmail.com"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--gold)',
              textDecoration: 'none',
              padding: '0.3rem 0.8rem',
              borderRadius: '999px',
              border: '1px solid rgba(224,168,94,0.35)',
            }}
          >
            {locale === 'es' ? 'Hablemos' : "Let's talk"} ↗
          </a>
        </div>
      </div>
    </section>
  );
}
