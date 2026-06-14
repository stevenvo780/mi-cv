'use client';
/**
 * DashboardServicios — Section #05 "Servicios"
 *
 * Tabs/chips that filter the 6 services from src/data/servicios.ts by
 * category (ia / desarrollo / marca / todos). Client-side state only.
 * Grid of rich cards: title, 1-line description, price badge, CTA to
 * services.stevenvallejo.com. Fully bilingual ES/EN.
 *
 * Design: Cloud Atlas tokens. No canvas here — the ambient background
 * is a subtle radial gradient. prefers-reduced-motion respected via brand.css.
 */

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  servicios,
  servicioCategorias,
  SERVICIOS_URL,
  type ServicioCategoria,
  type Servicio,
} from '@/data/servicios';

type Locale = 'es' | 'en';
type FilterId = ServicioCategoria | 'todos';

/* ------------------------------------------------------------------ */
/* Service card                                                          */
/* ------------------------------------------------------------------ */
function ServicioCard({
  s,
  locale,
  index,
}: {
  s: Servicio;
  locale: Locale;
  index: number;
}) {
  return (
    <article
      className="brand-card reveal svc-card"
      style={{ '--card-i': index } as React.CSSProperties}
    >
      <div className="svc-card-body">
        <h3 className="svc-title">{s.titulo[locale]}</h3>
        <p className="svc-desc">{s.descripcion[locale]}</p>
      </div>
      <div className="svc-card-foot">
        <span className="svc-price brand-chip">{s.precio[locale]}</span>
        <a
          href={SERVICIOS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="svc-cta"
          aria-label={
            locale === 'es'
              ? `Ver servicio: ${s.titulo[locale]}`
              : `View service: ${s.titulo[locale]}`
          }
        >
          {locale === 'es' ? 'Contratar' : 'Hire'}
          <span aria-hidden="true" className="svc-arrow">↗</span>
        </a>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Main section                                                          */
/* ------------------------------------------------------------------ */
export default function DashboardServicios() {
  const params = useParams();
  const locale: Locale = params?.locale === 'es' ? 'es' : 'en';

  const [active, setActive] = useState<FilterId>('todos');

  const filtered =
    active === 'todos' ? servicios : servicios.filter((s) => s.categoria === active);

  const allLabel = locale === 'es' ? 'Todos' : 'All';

  return (
    <>
      <style>{`
        /* ── Section shell ── */
        #servicios {
          position: relative;
          scroll-margin-top: 80px;
          padding: 6rem 0 5rem;
          overflow: hidden;
        }
        #servicios::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 20% 50%, rgba(67,181,166,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 50% 45% at 80% 50%, rgba(224,168,94,0.04) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Eyebrow ── */
        .svc-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: var(--teal);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .svc-heading {
          font-size: clamp(1.9rem, 4vw, 3rem);
          font-weight: 700;
          line-height: 1.15;
          margin: 0 0 0.6rem;
        }

        .svc-subline {
          max-width: 58ch;
          color: var(--text-soft);
          line-height: 1.7;
          font-size: 1rem;
          margin: 0 0 2rem;
        }

        /* ── Filter tabs ── */
        .svc-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2.2rem;
        }

        .svc-filter-btn {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.38rem 0.9rem;
          border-radius: 999px;
          border: 1px solid var(--line-2);
          background: transparent;
          color: var(--text-soft);
          cursor: pointer;
          transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
        }
        .svc-filter-btn:hover {
          background: rgba(67,181,166,0.10);
          border-color: var(--teal);
          color: var(--teal-light);
        }
        .svc-filter-btn[aria-pressed="true"],
        .svc-filter-btn.is-active {
          background: rgba(67,181,166,0.15);
          border-color: var(--teal);
          color: var(--teal-light);
        }

        /* ── Grid ── */
        .svc-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.2rem;
          margin-bottom: 2.5rem;
        }
        @media (min-width: 640px) {
          .svc-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .svc-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* ── Card ── */
        .svc-card {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          border-color: rgba(67,181,166,0.14);
          min-height: 220px;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }
        .svc-card:hover {
          border-color: rgba(67,181,166,0.35);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(67,181,166,0.08);
          transform: translateY(-2px);
        }

        .svc-card-body {
          flex: 1;
        }

        .svc-title {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 0.6rem;
          line-height: 1.3;
        }

        .svc-desc {
          color: var(--text-soft);
          font-size: 0.9rem;
          line-height: 1.65;
          margin: 0;
        }

        .svc-card-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-top: 1.2rem;
          flex-wrap: wrap;
        }

        .svc-price {
          background: rgba(67,181,166,0.10);
          border-color: rgba(67,181,166,0.28);
          color: var(--teal-light);
          font-size: 0.72rem;
          flex-shrink: 0;
        }

        .svc-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-decoration: none !important;
          color: var(--bg) !important;
          background: var(--teal);
          padding: 0.38rem 0.85rem;
          border-radius: var(--r-sm);
          transition: background 0.18s ease, transform 0.15s ease;
          flex-shrink: 0;
        }
        .svc-cta:hover {
          background: var(--teal-light);
          transform: translateY(-1px);
          color: var(--bg) !important;
        }

        .svc-arrow {
          font-size: 0.85em;
          transition: transform 0.15s ease;
        }
        .svc-cta:hover .svc-arrow {
          transform: translate(2px, -2px);
        }

        /* ── CTA row ── */
        .svc-cta-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          padding-top: 0.5rem;
        }

        .svc-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-mono);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-decoration: none !important;
          color: var(--bg) !important;
          background: var(--grad-sig);
          padding: 0.65rem 1.5rem;
          border-radius: var(--r-sm);
          transition: opacity 0.18s ease, transform 0.15s ease;
        }
        .svc-cta-primary:hover {
          opacity: 0.88;
          transform: translateY(-1px);
          color: var(--bg) !important;
        }

        .svc-cta-note {
          font-family: var(--font-mono);
          font-size: 0.76rem;
          color: var(--muted);
          letter-spacing: 0.03em;
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .svc-card,
          .svc-filter-btn,
          .svc-cta,
          .svc-cta-primary,
          .svc-arrow {
            transition: none !important;
          }
        }
      `}</style>

      <section id="servicios">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* ── Header ── */}
          <div className="reveal">
            <div className="svc-eyebrow">
              <span className="brand-sec-no">05</span>
              &nbsp;&nbsp;{locale === 'es' ? 'Servicios' : 'Services'}
            </div>
            <h2 className="svc-heading brand-gradient-text">
              {locale === 'es' ? 'Qué puedo hacer por ti' : 'What I can do for you'}
            </h2>
            <p className="svc-subline">
              {locale === 'es'
                ? 'Soluciones cerradas, precio fijo, entrega real. Trabajo directamente contigo — sin intermediarios.'
                : 'Closed-scope solutions, fixed price, real delivery. I work directly with you — no middlemen.'}
            </p>

            {/* ── Filter chips ── */}
            <div
              className="svc-filters"
              role="group"
              aria-label={locale === 'es' ? 'Filtrar por categoría' : 'Filter by category'}
            >
              <button
                type="button"
                className={`svc-filter-btn${active === 'todos' ? ' is-active' : ''}`}
                aria-pressed={active === 'todos'}
                onClick={() => setActive('todos')}
              >
                {allLabel}
              </button>
              {servicioCategorias.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`svc-filter-btn${active === cat.id ? ' is-active' : ''}`}
                  aria-pressed={active === cat.id}
                  onClick={() => setActive(cat.id)}
                >
                  {cat.label[locale]}
                </button>
              ))}
            </div>
          </div>

          {/* ── Service cards grid ── */}
          <div className="svc-grid">
            {filtered.map((s, i) => (
              <ServicioCard key={s.id} s={s} locale={locale} index={i} />
            ))}
          </div>

          {/* ── Bottom CTA ── */}
          <div className="svc-cta-row reveal">
            <a
              href={SERVICIOS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="svc-cta-primary"
            >
              {locale === 'es' ? 'Ver todos los servicios' : 'See all services'}
              <span aria-hidden="true">↗</span>
            </a>
            <span className="svc-cta-note">
              services.stevenvallejo.com
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
