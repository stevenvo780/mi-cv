'use client';
/**
 * /[locale]/lore — Mi historia / My story
 *
 * Todo el contenido narrativo biográfico que antes vivía en Portrait/PortalShell.
 * La home (linktree) solo enlaza aquí con un link discreto.
 *
 * Estructura:
 *   Hero breve (nombre + Cormorant epigraph)
 *   Secciones narrativas (las 7 de portraitData.ts)
 *   Footer con link de vuelta a home
 */

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';
import { useReveal } from '@/app/components/Frentes/useReveal';
import { PORTRAIT, type Locale } from '@/app/components/Portrait/portraitData';

export default function LorePage() {
  const params = useParams();
  const locale: Locale = params?.locale === 'es' ? 'es' : 'en';
  const t = PORTRAIT[locale];
  useReveal();

  const homeHref = `/${locale}`;

  return (
    <main>
      {/* ─── STYLES ─────────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Wrap */
        .lore-wrap {
          max-width: 820px;
          margin: 0 auto;
          padding: 0 1.25rem;
        }

        /* ── HERO ── */
        .lore-hero {
          padding: 5rem 0 3.5rem;
          border-bottom: 1px solid var(--line);
        }
        .lore-back {
          font-family: var(--font-mono);
          font-size: 0.74rem;
          letter-spacing: 0.12em;
          text-decoration: none !important;
          color: var(--teal-dim) !important;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 2.4rem;
          transition: color 0.2s ease;
        }
        .lore-back:hover {
          color: var(--teal) !important;
        }
        .lore-logo {
          margin-bottom: 1.5rem;
          display: inline-block;
        }
        .lore-hero-kicker {
          font-family: var(--font-mono);
          font-size: 0.74rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: var(--gold);
          font-weight: 600;
          margin-bottom: 0.9rem;
        }
        .lore-hero-title {
          font-size: clamp(2rem, 6vw, 3.8rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.04;
          margin: 0 0 1rem;
          color: var(--text);
        }
        .lore-hero-title em {
          font-style: normal;
          background: var(--grad-sig);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: var(--gold);
        }
        .lore-hero-lead {
          font-size: clamp(1.05rem, 2.4vw, 1.22rem);
          color: var(--text-soft);
          line-height: 1.76;
          max-width: 66ch;
          margin: 0 0 1.6rem;
        }
        .lore-body-of-work {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          letter-spacing: 0.02em;
          color: var(--teal-light);
          line-height: 1.6;
          max-width: 62ch;
          margin: 0 0 1.8rem;
        }
        .lore-epigraph {
          font-family: var(--font-serif);
          font-size: clamp(1.1rem, 2.6vw, 1.5rem);
          font-style: italic;
          color: var(--text-soft);
          line-height: 1.5;
          padding-left: 1.4rem;
          border-left: 3px solid var(--teal);
          max-width: 60ch;
          margin: 0;
        }

        /* ── SECTIONS ── */
        .lore-section {
          padding: 3.4rem 0;
          border-bottom: 1px solid var(--line);
        }
        .lore-section-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem 2.5rem;
        }
        @media (min-width: 760px) {
          .lore-section-grid {
            grid-template-columns: 160px 1fr;
          }
        }
        .lore-kicker {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--teal);
          font-weight: 700;
          padding-top: 0.4rem;
        }
        .lore-section-title {
          font-family: var(--font-serif);
          font-size: clamp(1.5rem, 3.4vw, 2.2rem);
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--text);
          margin: 0 0 1.2rem;
          line-height: 1.12;
        }
        .lore-para {
          font-size: 1.04rem;
          color: var(--text-soft);
          line-height: 1.82;
          margin: 0 0 1.1rem;
        }
        .lore-question {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          font-style: italic;
          color: var(--gold);
          line-height: 1.6;
          margin: 1.6rem 0 0;
          padding-left: 1rem;
          border-left: 2px solid rgba(224,168,94,0.45);
        }

        /* ── CLOSING FOOTER ── */
        .lore-foot {
          padding: 3.5rem 0 6rem;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .lore-foot-note {
          font-size: 0.92rem;
          font-style: italic;
          color: var(--muted);
          margin: 0;
        }
        .lore-foot-brand {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.10em;
          color: var(--teal-light);
          margin: 0;
        }
        .lore-home-link {
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
        .lore-home-link:hover {
          background: var(--teal-light);
          transform: translateY(-1px);
        }

        /* ── REDUCED MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          .lore-back,
          .lore-home-link { transition: none !important; }
        }
      ` }} />

      <div className="lore-wrap">
        {/* ── HERO ── */}
        <div className="lore-hero reveal">
          <Link href={homeHref} className="lore-back">
            ← {locale === 'es' ? 'Volver al inicio' : 'Back to home'}
          </Link>
          <div className="lore-logo">
            <BrandLogo size={40} title="Steven Vallejo" />
          </div>
          <p className="lore-hero-kicker">
            {locale === 'es' ? 'Mi historia · Abstracción' : 'My story · Abstraction'}
          </p>
          <h1 className="lore-hero-title">
            <em>{t.heroTitle}</em>
          </h1>
          <p className="lore-hero-lead">{t.heroLead}</p>
          <p className="lore-body-of-work">{t.bodyOfWork}</p>
          <blockquote className="lore-epigraph">{t.epigraph}</blockquote>
        </div>

        {/* ── NARRATIVE SECTIONS ── */}
        {t.sections.map((s) => (
          <section className="lore-section reveal" key={s.title}>
            <div className="lore-section-grid">
              <div className="lore-kicker">{s.kicker}</div>
              <div>
                <h2 className="lore-section-title">{s.title}</h2>
                {s.body.map((p, i) => (
                  <p className="lore-para" key={i}>{p}</p>
                ))}
                <p className="lore-question">{s.question}</p>
              </div>
            </div>
          </section>
        ))}

        {/* ── CLOSING FOOTER ── */}
        <footer className="lore-foot reveal">
          <Link href={homeHref} className="lore-home-link">
            ← {locale === 'es' ? 'Volver al inicio' : 'Back to home'}
          </Link>
          <p className="lore-foot-note">{t.footNote}</p>
          <p className="lore-foot-brand">
            {locale === 'es' ? 'Mouseîon · por Steven Vallejo' : 'Mouseîon · by Steven Vallejo'}
          </p>
        </footer>
      </div>
    </main>
  );
}
