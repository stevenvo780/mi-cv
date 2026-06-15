'use client';
/**
 * FrenteCiencias — Section #02 "Ciencias"
 * Sub-accent palette: teal-light (#6fd3c4) + violet (#8d7cc0)
 * Background animation: LorenzAttractor reteñido (teal→violet→gold, no HSL rainbow)
 * Products from frentes.ts filtered to frente === 'ciencias':
 *   - ComplexLab (featured) — 16 repos · 22 páginas
 *   - Redes Neuronales · Hinton (secondary) — Deck
 */
import React, { useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { frentesMeta, productosPorFrente, type Producto } from '@/data/frentes';
import CanvasViewport from './CanvasViewport';

type Locale = 'es' | 'en';

/* ─── Lorenz canvas reteñido ─────────────────────────────────── */

/**
 * Maps a normalised value [0, 1] to a CSS hex color blending through the
 * three brand stops: teal-light → violet → gold.
 * All arithmetic in integer RGB so no HSL / oklch needed.
 */
function brandColor(t: number): string {
  // Stop 0 (#6fd3c4, teal-light), Stop 0.5 (#8d7cc0, violet), Stop 1 (#e0a85e, gold)
  const stops: [number, number, number][] = [
    [0x6f, 0xd3, 0xc4], // teal-light
    [0x8d, 0x7c, 0xc0], // violet
    [0xe0, 0xa8, 0x5e], // gold
  ];
  const clamped = Math.min(1, Math.max(0, t));
  let r: number, g: number, b: number;
  if (clamped <= 0.5) {
    const u = clamped / 0.5;
    r = Math.round(stops[0][0] + u * (stops[1][0] - stops[0][0]));
    g = Math.round(stops[0][1] + u * (stops[1][1] - stops[0][1]));
    b = Math.round(stops[0][2] + u * (stops[1][2] - stops[0][2]));
  } else {
    const u = (clamped - 0.5) / 0.5;
    r = Math.round(stops[1][0] + u * (stops[2][0] - stops[1][0]));
    g = Math.round(stops[1][1] + u * (stops[2][1] - stops[1][1]));
    b = Math.round(stops[1][2] + u * (stops[2][2] - stops[1][2]));
  }
  return `rgb(${r},${g},${b})`;
}

function LorenzBrand() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef({
    x: 0.1, y: 0, z: 0,
    points: 0,
    sigma: 10, rho: 28, beta: 8 / 3,
  });

  const start = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.parentElement?.clientWidth ?? window.innerWidth;
    const H = canvas.parentElement?.clientHeight ?? window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const s = stateRef.current;
    s.x = 0.1; s.y = 0; s.z = 0; s.points = 0;
    ctx.clearRect(0, 0, W, H);

    const maxRange = 30;
    const scaleX = Math.min(W, H) / (maxRange * 2);
    const scaleZ = Math.min(W, H) / (maxRange * 3);
    const centerX = W / 2;
    // Lorenz z ranges roughly 0–50; keep attractor vertically centered
    const centerY = H * 0.48;

    let prevScreenX = centerX + s.x * scaleX;
    let prevScreenY = centerY + s.z * scaleZ;

    ctx.lineWidth = 0.9;

    function tick() {
      const { sigma, rho, beta } = stateRef.current;
      const dt = 0.008;
      // Integrate a batch of 6 sub-steps per frame for density without jank
      for (let i = 0; i < 6; i++) {
        const dx = sigma * (s.y - s.x) * dt;
        const dy = (s.x * (rho - s.z) - s.y) * dt;
        const dz = (s.x * s.y - beta * s.z) * dt;
        s.x += dx; s.y += dy; s.z += dz;
        s.points++;

        const sx = centerX + s.x * scaleX;
        const sy = centerY + (s.z - 25) * scaleZ; // shift so center of z≈25 lands mid-canvas

        // t ∈ [0,1] cycling every 5000 points → repeated colour sweep
        const t = (s.points % 5000) / 5000;
        ctx!.strokeStyle = brandColor(t);
        ctx!.globalAlpha = 0.75;
        ctx!.beginPath();
        ctx!.moveTo(prevScreenX, prevScreenY);
        ctx!.lineTo(sx, sy);
        ctx!.stroke();

        prevScreenX = sx;
        prevScreenY = sy;
      }

      if (s.points < 12000) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Cycle: randomise params slightly and restart
        stateRef.current.sigma = 8 + Math.random() * 14;
        stateRef.current.rho   = 20 + Math.random() * 20;
        stateRef.current.beta  = 2 + Math.random() * 2;
        // Fade out then restart
        ctx!.globalAlpha = 1;
        rafRef.current = requestAnimationFrame(() => {
          ctx!.clearRect(0, 0, W, H);
          stateRef.current.points = 0;
          stateRef.current.x = 0.1 + Math.random() * 0.2;
          stateRef.current.y = 0;
          stateRef.current.z = Math.random() * 10;
          prevScreenX = centerX + stateRef.current.x * scaleX;
          prevScreenY = centerY;
          tick();
        });
      }
    }

    tick();
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [start]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}

/* ─── Product card ───────────────────────────────────────────── */

interface CardProps {
  producto: Producto;
  locale: Locale;
}

function CienciasCard({ producto, locale }: CardProps) {
  const isFeatured = producto.featured === true;
  const isSecondary = producto.secondary === true;

  return (
    <div
      className={`brand-card reveal${isFeatured ? ' ciencias-card--featured' : ''}${isSecondary ? ' ciencias-card--secondary' : ''}`}
      style={{
        padding: isFeatured ? '1.75rem' : '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        borderColor: isFeatured ? 'rgba(111, 211, 196, 0.30)' : undefined,
      }}
    >
      {/* Oscilloscope scan-line accent — decorative */}
      {isFeatured && (
        <span
          aria-hidden="true"
          className="ciencias-scanline"
        />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
        <h3
          style={{
            margin: 0,
            fontSize: isFeatured ? '1.15rem' : '1rem',
            color: 'var(--teal-light)',
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            lineHeight: 1.25,
          }}
        >
          {producto.nombre}
        </h3>
        {produto_status_badge(producto, locale)}
      </div>

      {/* What it is (one-liner) */}
      {producto.subtitulo && (
        <p
          style={{
            margin: '-0.3rem 0 0.55rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            letterSpacing: '0.04em',
            color: 'var(--teal-light)',
            lineHeight: 1.4,
          }}
        >
          {producto.subtitulo[locale]}
        </p>
      )}

      {/* Badge / metric chips */}
      {producto.badge && (
        <div style={{ marginBottom: '0.55rem' }}>
          <span
            className="brand-chip"
            style={{
              color: isFeatured ? 'var(--teal-light)' : 'var(--violet-light)',
              borderColor: isFeatured ? 'rgba(111,211,196,0.35)' : 'rgba(141,124,192,0.45)',
              background: isFeatured
                ? 'rgba(111,211,196,0.07)'
                : 'rgba(141,124,192,0.10)',
            }}
          >
            {produto_metric_icon(producto.id)}{producto.badge[locale]}
          </span>
        </div>
      )}

      {/* Description */}
      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--text-soft)',
          lineHeight: 1.6,
          margin: '0 0 0.9rem',
        }}
      >
        {produto_desc_prefix(producto, locale)}
        {producto.descripcion[locale]}
      </p>

      {/* CTA row */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {producto.url && (
          <a
            href={producto.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.38rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              border: '1.5px solid var(--teal-light)',
              color: 'var(--teal-light)',
              background: 'rgba(111,211,196,0.07)',
              transition: 'background 0.18s ease, color 0.18s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(111,211,196,0.18)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--bg)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(111,211,196,0.07)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--teal-light)';
            }}
          >
            {locale === 'es' ? 'Ver en vivo' : 'View live'} ↗
          </a>
        )}
        {producto.repo && (
          <a
            href={producto.repo}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.38rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.80rem',
              fontFamily: 'var(--font-mono)',
              textDecoration: 'none',
              border: '1.5px solid rgba(141,124,192,0.50)',
              color: 'var(--violet-light)',
              background: 'rgba(141,124,192,0.10)',
              transition: 'background 0.18s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(141,124,192,0.22)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(141,124,192,0.07)';
            }}
          >
            {locale === 'es' ? 'Repo' : 'Repo'} ↗
          </a>
        )}
      </div>
    </div>
  );
}

/* Small helpers to keep JSX above clean */

function produto_status_badge(p: Producto, locale: Locale) {
  if (p.status === 'soon') {
    return (
      <span
        className="brand-chip"
        style={{ color: 'var(--gold)', borderColor: 'rgba(224,168,94,0.30)', background: 'rgba(224,168,94,0.07)', marginLeft: 'auto' }}
      >
        {locale === 'es' ? 'Próximamente' : 'Coming soon'}
      </span>
    );
  }
  return null;
}

/** Small mono icon prefix per product — optional flavor */
function produto_metric_icon(id: string): string {
  if (id === 'complexlab') return '◈ ';
  if (id === 'hinton') return '⟡ ';
  return '';
}

/** Optional contextual prefix sentence rendered before description */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function produto_desc_prefix(_p: Producto, _locale: Locale): React.ReactNode {
  return null;
}

/* ─── Section ────────────────────────────────────────────────── */

export default function FrenteCiencias() {
  const params = useParams();
  const locale: Locale = params.locale === 'es' ? 'es' : 'en';

  const meta = frentesMeta['ciencias'];
  const items = productosPorFrente('ciencias');

  // Separate featured vs secondary for layout purposes
  const featured = items.filter((p) => p.featured);
  const secondary = items.filter((p) => p.secondary);
  const standard = items.filter((p) => !p.featured && !p.secondary);
  // Ordered: featured first, then secondary, then rest
  const ordered = [...featured, ...standard, ...secondary];

  return (
    <>
      {/* Scoped styles via dangerouslySetInnerHTML (raw CSS, no JSX text
          encoding) to keep SSR/CSR byte-identical and avoid hydration warnings. */}
      <style dangerouslySetInnerHTML={{ __html: `
        #ciencias {
          position: relative;
          scroll-margin-top: 80px;
          padding: 5rem 0 4rem;
          background: linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 60%, var(--bg) 100%);
          isolation: isolate;
        }

        /* Horizontal scan-line rule above section */
        #ciencias::before {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            var(--teal-light) 30%,
            var(--violet) 70%,
            transparent 100%
          );
          opacity: 0.4;
        }

        /* Featured card left-border accent */
        .ciencias-card--featured {
          border-left: 3px solid var(--teal-light) !important;
          background: var(--bg-card-2) !important;
        }
        .ciencias-card--featured::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(
            ellipse 60% 50% at 90% 10%,
            rgba(111, 211, 196, 0.05),
            transparent 70%
          );
          pointer-events: none;
        }

        /* Secondary card — subtler violet accent */
        .ciencias-card--secondary {
          border-left: 3px solid var(--violet) !important;
          opacity: 0.92;
        }

        /* Oscilloscope scan-line moving element */
        .ciencias-scanline {
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent,
            var(--teal-light) 50%,
            transparent
          );
          opacity: 0;
          animation: ciencias-scan 4s ease-in-out infinite;
        }
        @keyframes ciencias-scan {
          0%, 100% { opacity: 0; top: 0; }
          10%       { opacity: 0.7; }
          90%       { opacity: 0.4; }
          95%       { opacity: 0; top: 100%; }
        }

        /* Reduced motion: kill scan */
        @media (prefers-reduced-motion: reduce) {
          .ciencias-scanline { animation: none !important; opacity: 0 !important; }
        }

        /* Header metrics bar */
        .ciencias-metrics {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--line);
        }
        .ciencias-metric {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .ciencias-metric__value {
          font-family: var(--font-mono);
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--teal-light);
          line-height: 1;
        }
        .ciencias-metric__label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
        }

        /* Cards grid */
        .ciencias-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
          gap: 1.25rem;
          margin-top: 2.5rem;
        }

        /* Featured card spans two columns on wide screens */
        @media (min-width: 900px) {
          .ciencias-grid {
            grid-template-columns: 3fr 2fr;
          }
        }
      ` }} />

      <section id="ciencias">
        {/* Background Lorenz — mounted/unmounted by CanvasViewport */}
        <CanvasViewport opacity={0.13}>
          <LorenzBrand />
        </CanvasViewport>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Section header */}
          <div className="reveal">
            <div className="brand-eyebrow">
              <span className="brand-sec-no">{meta.secNo}</span>
              &nbsp;—&nbsp;
              <span style={{ color: 'var(--teal-light)' }}>{meta.nombre[locale]}</span>
            </div>

            <h2
              style={{
                marginTop: '0.5rem',
                fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 800,
                color: 'var(--teal-light)',
                lineHeight: 1.15,
              }}
            >
              {meta.tagline[locale]}
            </h2>

            <p
              style={{
                maxWidth: '62ch',
                color: 'var(--text-soft)',
                lineHeight: 1.7,
                marginTop: '0.75rem',
              }}
            >
              {meta.descripcion[locale]}
            </p>

            {/* Metrics bar — oscilloscope flavor */}
            <div className="ciencias-metrics" aria-label={locale === 'es' ? 'Métricas del frente Ciencias' : 'Sciences front metrics'}>
              <div className="ciencias-metric">
                <span className="ciencias-metric__value">16</span>
                <span className="ciencias-metric__label">
                  {locale === 'es' ? 'repos' : 'repos'}
                </span>
              </div>
              <div className="ciencias-metric">
                <span className="ciencias-metric__value">22</span>
                <span className="ciencias-metric__label">
                  {locale === 'es' ? 'pág. SSG' : 'SSG pages'}
                </span>
              </div>
              <div className="ciencias-metric">
                <span className="ciencias-metric__value" style={{ color: 'var(--violet)' }}>
                  {locale === 'es' ? '∞' : '∞'}
                </span>
                <span className="ciencias-metric__label">
                  {locale === 'es' ? 'simulaciones' : 'simulations'}
                </span>
              </div>
            </div>
          </div>

          {/* Product cards grid */}
          <div className="ciencias-grid">
            {ordered.map((p) => (
              <CienciasCard key={p.id} producto={p} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
