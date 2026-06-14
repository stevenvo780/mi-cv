'use client';
/**
 * FrenteFilosofia — Section #01 of the brand portal.
 *
 * Layout:
 *   - Full-bleed section with ParticleFlow (ethereal variant, slow + gold tones)
 *     mounted only while in viewport via CanvasViewport.
 *   - Header: eyebrow (mono) + Cormorant h2 + intro paragraph in text-soft.
 *   - Cross-links (filosofo.stevenvallejo.com, blog) as small chips.
 *   - Rich product grid: 3 cards (Clavis featured, Ponencia secondary, DebateSuite).
 *
 * Typography: Cormorant Garamond (--font-serif) for h2 + card names.
 * Sub-accent: --acc-filosofia = var(--gold) throughout.
 * Animations: CSS only (transform/opacity); canvas via CanvasViewport.
 */

import React, { useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  frentesMeta,
  frenteLinks,
  productosPorFrente,
  type Producto,
} from '@/data/frentes';
import CanvasViewport from './CanvasViewport';

type Locale = 'es' | 'en';

/* ------------------------------------------------------------------ */
/* Ethereal ParticleFlow: slow drift, gold+teal palette, low opacity   */
/* ------------------------------------------------------------------ */
function ParticleFlowEthereal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let alive = true;

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const w = canvas!.offsetWidth || window.innerWidth;
      const h = canvas!.offsetHeight || window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const W = () => canvas!.width / dpr;
    const H = () => canvas!.height / dpr;

    /* Slow-moving particles with sinusoidal drift */
    interface Particle {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      phase: number;
      freq: number;
      color: string;
    }

    const COLORS = [
      'rgba(224,168,94,0.70)',  /* gold */
      'rgba(240,200,135,0.55)', /* gold-light */
      'rgba(67,181,166,0.45)',  /* teal */
      'rgba(111,211,196,0.35)', /* teal-light */
      'rgba(207,106,60,0.30)',  /* rust */
    ];

    const COUNT = 90;
    const particles: Particle[] = [];

    function mkParticle(): Particle {
      return {
        x: Math.random() * W(),
        y: Math.random() * H(),
        r: 1.5 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        phase: Math.random() * Math.PI * 2,
        freq: 0.004 + Math.random() * 0.006,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    }

    for (let i = 0; i < COUNT; i++) particles.push(mkParticle());

    let t = 0;

    function draw() {
      if (!alive) return;
      const w = W();
      const h = H();

      /* Soft fade trail instead of full clear — ethereal effect */
      ctx!.fillStyle = 'rgba(11,20,23,0.18)';
      ctx!.fillRect(0, 0, w, h);

      t += 1;

      for (const p of particles) {
        /* Sinusoidal drift: gentle wandering */
        p.x += p.vx + Math.sin(t * p.freq + p.phase) * 0.18;
        p.y += p.vy + Math.cos(t * p.freq + p.phase * 1.3) * 0.14;

        /* Wrap-around with a soft margin */
        if (p.x < -8) p.x = w + 8;
        else if (p.x > w + 8) p.x = -8;
        if (p.y < -8) p.y = h + 8;
        else if (p.y > h + 8) p.y = -8;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.fill();
      }

      /* Draw faint connection lines between nearby particles (max 80px) */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(224,168,94,${0.06 * (1 - dist / 80)})`;
            ctx!.lineWidth = 0.6;
            ctx!.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Product card                                                         */
/* ------------------------------------------------------------------ */
interface CardProps {
  producto: Producto;
  locale: Locale;
  index: number;
}

function FilosofiaCard({ producto: p, locale, index }: CardProps) {
  const delay = `${index * 0.11}s`;
  const isFeatured = p.featured === true;
  const isSecondary = p.secondary === true;

  return (
    <article
      className="reveal brand-card filosofia-card"
      data-featured={isFeatured || undefined}
      data-secondary={isSecondary || undefined}
      style={{ animationDelay: delay, '--card-delay': delay } as React.CSSProperties}
    >
      {/* Top bar: badge + status pill */}
      <div className="fc-topbar">
        {p.badge && (
          <span className="brand-chip filosofia-chip">
            {p.badge[locale]}
          </span>
        )}
        {p.status === 'soon' && (
          <span className="fc-soon-pill">
            {locale === 'es' ? 'Próximamente' : 'Coming soon'}
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="fc-name">
        {p.nombre}
        {isFeatured && (
          <span className="fc-featured-mark" aria-label={locale === 'es' ? 'Destacado' : 'Featured'}>
            ★
          </span>
        )}
      </h3>

      {/* Description */}
      <p className="fc-desc">{p.descripcion[locale]}</p>

      {/* Footer: CTA + repo */}
      <div className="fc-footer">
        {p.url && (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="fc-cta"
          >
            {locale === 'es' ? 'Ver en vivo' : 'View live'}
            <span className="fc-arrow" aria-hidden="true">↗</span>
          </a>
        )}
        {p.repo && (
          <a
            href={p.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="fc-repo"
            aria-label={locale === 'es' ? 'Ver repositorio' : 'View repository'}
          >
            GitHub
          </a>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Main section                                                         */
/* ------------------------------------------------------------------ */
export default function FrenteFilosofia() {
  const params = useParams();
  const locale: Locale = params?.locale === 'es' ? 'es' : 'en';

  const meta = frentesMeta['filosofia'];
  const items = productosPorFrente('filosofia');
  const links = frenteLinks['filosofia'] ?? [];

  return (
    <>
      {/* ── Scoped styles (no extra file, no CSS Modules needed) ── */}
      <style>{`
        /* ── Section shell ── */
        #filosofia {
          position: relative;
          scroll-margin-top: 80px;
          padding: 6rem 0 5rem;
          overflow: hidden;
          background: linear-gradient(
            180deg,
            var(--bg) 0%,
            var(--bg-2) 60%,
            var(--bg) 100%
          );
        }

        /* Subtle gold glow behind the header */
        #filosofia::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 70% 50% at 50% 0%,
            rgba(224,168,94,0.06) 0%,
            transparent 70%
          );
          pointer-events: none;
          z-index: 0;
        }

        /* ── Header ── */
        .filosofia-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: var(--gold);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .filosofia-title {
          font-family: var(--font-serif);
          font-size: clamp(2.2rem, 5vw, 3.6rem);
          font-weight: 600;
          line-height: 1.12;
          color: var(--text);
          margin: 0 0 1rem;
          /* gold underline accent */
          position: relative;
          display: inline-block;
        }
        .filosofia-title::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 2.8rem;
          height: 2px;
          background: var(--grad-sig);
          border-radius: 2px;
        }

        .filosofia-intro {
          max-width: 62ch;
          color: var(--text-soft);
          line-height: 1.72;
          font-size: 1.05rem;
          margin: 1.5rem 0 0;
        }

        /* ── Cross-links chip row ── */
        .filosofia-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.8rem;
        }
        .filosofia-link-chip {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          text-decoration: none;
          color: var(--gold);
          border: 1px solid rgba(224,168,94,0.28);
          background: rgba(224,168,94,0.06);
          padding: 0.24rem 0.7rem;
          border-radius: 999px;
          letter-spacing: 0.04em;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .filosofia-link-chip:hover {
          background: rgba(224,168,94,0.14);
          border-color: rgba(224,168,94,0.55);
        }

        /* ── Cards grid ── */
        .filosofia-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.4rem;
          margin-top: 3rem;
        }

        /* Featured card spans 2 cols on wider screens */
        @media (min-width: 768px) {
          .filosofia-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .filosofia-card[data-featured] {
            grid-column: span 2;
          }
        }

        /* ── Individual card ── */
        .filosofia-card {
          padding: 1.6rem;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          border-color: rgba(224,168,94,0.14);
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }
        .filosofia-card:hover {
          border-color: rgba(224,168,94,0.38);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(224,168,94,0.08);
          transform: translateY(-3px);
        }

        /* Secondary card: slightly dimmed */
        .filosofia-card[data-secondary] {
          opacity: 0.88;
        }
        .filosofia-card[data-secondary]:hover {
          opacity: 1;
        }

        /* ── Card internals ── */
        .fc-topbar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filosofia-chip {
          background: rgba(224,168,94,0.10);
          border-color: rgba(224,168,94,0.28);
          color: var(--gold-light);
        }

        .fc-soon-pill {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--rust);
          border: 1px solid rgba(207,106,60,0.30);
          background: rgba(207,106,60,0.08);
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          letter-spacing: 0.04em;
        }

        .fc-name {
          font-family: var(--font-serif);
          font-size: 1.45rem;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          line-height: 1.2;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .fc-featured-mark {
          font-size: 0.8rem;
          color: var(--gold);
          flex-shrink: 0;
          line-height: 1;
        }

        .fc-desc {
          color: var(--text-soft);
          font-size: 0.92rem;
          line-height: 1.65;
          margin: 0;
          flex: 1;
        }

        .fc-footer {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-top: 0.2rem;
          flex-wrap: wrap;
        }

        .fc-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-decoration: none;
          color: var(--bg);
          background: var(--gold);
          padding: 0.45rem 1rem;
          border-radius: var(--r-sm);
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .fc-cta:hover {
          background: var(--gold-light);
          transform: translateY(-1px);
        }

        .fc-arrow {
          font-size: 0.9em;
          transition: transform 0.15s ease;
        }
        .fc-cta:hover .fc-arrow {
          transform: translate(2px, -2px);
        }

        .fc-repo {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--muted);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color 0.2s ease, border-color 0.2s ease;
          letter-spacing: 0.04em;
        }
        .fc-repo:hover {
          color: var(--gold);
          border-bottom-color: rgba(224,168,94,0.45);
        }

        /* ── Reduced motion: flatten transitions inside this section ── */
        @media (prefers-reduced-motion: reduce) {
          .filosofia-card,
          .filosofia-link-chip,
          .fc-cta,
          .fc-repo,
          .fc-arrow {
            transition: none !important;
          }
        }
      `}</style>

      <section id="filosofia">
        {/* Background canvas — paused when off-screen */}
        <CanvasViewport opacity={0.13}>
          <ParticleFlowEthereal />
        </CanvasViewport>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* ── Header ── */}
          <div className="reveal">
            <div className="filosofia-eyebrow">
              <span className="brand-sec-no">{meta.secNo}</span>
              &nbsp;&nbsp;{meta.nombre[locale]}
            </div>
            <h2 className="filosofia-title">
              {meta.tagline[locale]}
            </h2>
            <p className="filosofia-intro">
              {meta.descripcion[locale]}
            </p>

            {/* Cross-links */}
            {links.length > 0 && (
              <div className="filosofia-links" aria-label={locale === 'es' ? 'Portales relacionados' : 'Related portals'}>
                {links.map((lk) => (
                  <a
                    key={lk.url}
                    href={lk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="filosofia-link-chip"
                  >
                    {lk.label[locale]} ↗
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ── Product cards ── */}
          <div className="filosofia-grid">
            {items.map((p, i) => (
              <FilosofiaCard
                key={p.id}
                producto={p}
                locale={locale}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
