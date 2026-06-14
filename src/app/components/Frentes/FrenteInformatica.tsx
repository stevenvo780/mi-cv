'use client';
/**
 * FrenteInformatica — Section #informatica (Phase 3)
 *
 * Background: pure Canvas 2D node graph (no vis-network dep), mounted/unmounted
 * via CanvasViewport so rAF is cancelled off-screen.
 * Cards: terminal/IDE aesthetic — mono prompt, teal accents, stack chips,
 * "featured" jewel card, live + repo buttons.
 * Locale: reads from URL params (es/en). All text from frentes.ts.
 * A11y: canvas aria-hidden; focusable links; WCAG AA color.
 * Motion: CSS transform/opacity only; keyframes brand-reveal; respects
 *   prefers-reduced-motion via brand.css.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import CanvasViewport from './CanvasViewport';
import { useReveal } from './useReveal';
import {
  frentesMeta,
  productosPorFrente,
  type Producto,
} from '@/data/frentes';

type Locale = 'es' | 'en';

/* ------------------------------------------------------------------ */
/* Node graph canvas — lightweight, CPU-first, no external deps        */
/* ------------------------------------------------------------------ */

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

function NodeGraphCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const run = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    /* Size to parent — avoid layout read every frame */
    const parent = canvas.parentElement;
    const W = parent ? parent.offsetWidth : 800;
    const H = parent ? parent.offsetHeight : 480;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    /* Build nodes */
    const COUNT = 38;
    const LINK_DIST = 180;
    const nodes: Node[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: 2 + Math.random() * 2.5,
    }));

    /* Teal palette */
    const COL_NODE = '#43b5a6';
    const COL_NODE_HI = '#6fd3c4';
    const COL_EDGE = 'rgba(67,181,166,0.22)';

    function tick() {
      ctx.clearRect(0, 0, W, H);

      /* Move */
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      /* Edges */
      ctx.strokeStyle = COL_EDGE;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.55;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      /* Nodes */
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.r > 3.5 ? COL_NODE_HI : COL_NODE;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const cleanup = run();
    return cleanup;
  }, [run]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Stack chip sets per product                                         */
/* ------------------------------------------------------------------ */
const STACK: Record<string, string[]> = {
  'nlp-to-logic': ['TypeScript', 'SAT/CDCL', 'Next.js', 'Vercel'],
  stevenai:       ['RAG', 'GGUF', 'MCP', 'OCR', 'Python'],
  stevendevbox:   ['OSS', 'Bash', 'Electron', 'Go'],
  communityos:    ['Next.js 15', 'NestJS', 'Neon', 'Firebase'],
};

/* ------------------------------------------------------------------ */
/* Single product card                                                 */
/* ------------------------------------------------------------------ */
function ProductCard({ p, locale }: { p: Producto; locale: Locale }) {
  const chips = STACK[p.id] ?? [];
  const isFeatured = p.featured === true;

  return (
    <article
      className="brand-card info-card"
      style={{
        position: 'relative',
        padding: isFeatured ? '1.6rem 1.8rem' : '1.3rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        borderColor: isFeatured ? 'var(--line-2)' : undefined,
        boxShadow: isFeatured
          ? '0 0 0 1px rgba(67,181,166,0.28), 0 8px 32px rgba(0,0,0,0.45)'
          : undefined,
      }}
    >
      {/* Terminal prompt header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: 'var(--teal)',
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          {isFeatured ? '▶' : '$'}
        </span>
        <h3
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: isFeatured ? '1.08rem' : '0.95rem',
            fontWeight: 700,
            color: isFeatured ? 'var(--teal-light)' : 'var(--text)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {p.nombre}
        </h3>
        {isFeatured && (
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--teal)',
              border: '1px solid var(--line-2)',
              borderRadius: '4px',
              padding: '0.1rem 0.45rem',
              flexShrink: 0,
            }}
          >
            featured
          </span>
        )}
      </header>

      {/* Description */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.88rem',
          color: 'var(--text-soft)',
          lineHeight: 1.6,
          margin: 0,
          flex: 1,
        }}
      >
        {p.descripcion[locale]}
      </p>

      {/* Badge + stack chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {p.badge && (
          <span
            className="brand-chip"
            style={{
              background: 'rgba(67,181,166,0.14)',
              borderColor: 'var(--teal-dim)',
              color: 'var(--teal-light)',
            }}
          >
            {p.badge[locale]}
          </span>
        )}
        {chips.map((c) => (
          <span key={c} className="brand-chip">
            {c}
          </span>
        ))}
      </div>

      {/* CTA row */}
      <footer
        style={{
          display: 'flex',
          gap: '0.6rem',
          flexWrap: 'wrap',
          marginTop: '0.25rem',
        }}
      >
        {p.url && (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              padding: '0.38rem 0.9rem',
              borderRadius: 'var(--r-sm)',
              background: 'var(--teal)',
              color: 'var(--bg)',
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '0.04em',
              transition: 'background 0.18s ease, transform 0.18s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                'var(--teal-light)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                'var(--teal)';
            }}
          >
            {'↗ '}
            {locale === 'es' ? 'Ver en vivo' : 'View live'}
          </a>
        )}
        {p.repo && (
          <a
            href={p.repo}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              padding: '0.38rem 0.9rem',
              borderRadius: 'var(--r-sm)',
              background: 'transparent',
              border: '1px solid var(--line-2)',
              color: 'var(--teal)',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.04em',
              transition: 'border-color 0.18s ease, color 0.18s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.color = 'var(--teal-light)';
              el.style.borderColor = 'var(--teal)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.color = 'var(--teal)';
              el.style.borderColor = 'var(--line-2)';
            }}
          >
            {'⌥ '}
            {locale === 'es' ? 'Repo' : 'Repo'}
          </a>
        )}
      </footer>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
export default function FrenteInformatica() {
  const params = useParams();
  const locale: Locale = params.locale === 'es' ? 'es' : 'en';
  useReveal();

  const meta = frentesMeta.informatica;
  const items = productosPorFrente('informatica');

  /* Sort: featured first, then by id order */
  const sorted = [...items].sort((a, b) =>
    a.featured && !b.featured ? -1 : !a.featured && b.featured ? 1 : 0
  );

  return (
    <section
      id="informatica"
      style={{
        position: 'relative',
        scrollMarginTop: '80px',
        padding: '5rem 0 6rem',
        background:
          'linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 50%, var(--bg) 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Background node-graph canvas — mounted only in viewport */}
      <CanvasViewport opacity={0.18}>
        <NodeGraphCanvas />
      </CanvasViewport>

      {/* Subtle horizontal rule at top */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'var(--line-2)',
          opacity: 0.5,
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section header */}
        <div className="reveal" style={{ maxWidth: '56ch', marginBottom: '3rem' }}>
          <div className="brand-eyebrow" style={{ marginBottom: '0.6rem' }}>
            <span className="brand-sec-no">{meta.secNo}</span>
            &nbsp;&nbsp;
            {meta.nombre[locale]}
          </div>

          <h2
            className="brand-gradient-text"
            style={{
              fontSize: 'clamp(1.65rem, 4vw, 2.6rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              margin: '0 0 1rem',
              letterSpacing: '-0.02em',
            }}
          >
            {meta.tagline[locale]}
          </h2>

          <p
            style={{
              color: 'var(--text-soft)',
              fontSize: '1rem',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {meta.descripcion[locale]}
          </p>
        </div>

        {/* Inline style block for grid — avoids module-css dep */}
        <style>{`
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
            gap: 1.25rem;
          }
          @media (min-width: 768px) {
            .info-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (min-width: 1100px) {
            .info-grid {
              grid-template-columns: repeat(3, 1fr);
            }
            .info-card.info-featured {
              grid-column: span 2;
            }
          }
          .info-card {
            animation: brand-reveal 0.45s ease both;
          }
        `}</style>

        {/* Cards grid */}
        <div className="info-grid">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className={`reveal ${p.featured ? 'info-featured' : ''}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <ProductCard p={p} locale={locale} />
            </div>
          ))}
        </div>

        {/* Cross-links footer */}
        <div
          className="reveal"
          style={{
            marginTop: '2.8rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <a
            href="https://informatico.stevenvallejo.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--muted)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '1px',
              transition: 'color 0.18s ease, border-color 0.18s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.color = 'var(--teal)';
              el.style.borderColor = 'var(--teal)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.color = 'var(--muted)';
              el.style.borderColor = 'var(--line)';
            }}
          >
            {locale === 'es' ? '→ CV Informático' : '→ Engineering CV'}
          </a>
          <a
            href="https://portafolio-gamma-roan.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--muted)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '1px',
              transition: 'color 0.18s ease, border-color 0.18s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.color = 'var(--teal)';
              el.style.borderColor = 'var(--teal)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.color = 'var(--muted)';
              el.style.borderColor = 'var(--line)';
            }}
          >
            {locale === 'es' ? '→ Hub · Portafolio' : '→ Hub · Portfolio'}
          </a>
        </div>
      </div>
    </section>
  );
}
