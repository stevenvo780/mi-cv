'use client';

/**
 * LinktreeHome — stevenvallejo.com: GALLERY + LINKTREE
 *
 * Structure:
 *   (0) Hero: GameOfLife bg + BrandLogo + name + identity + CTA
 *   (1) Gallery §01 Filosofía  — Paideía, Agón
 *   (2) Gallery §02 Ciencias   — Kósmos, Hinton, Áporía
 *   (3) Gallery §03 Ingeniería — Órganon, Daímon, Téchne, Koinonía,
 *                                Érgon, Chrónos, Xenía, Nómos, Apothḗke, Eikón
 *   (4) Linktree: Prizma, Blog·Scholḗ, Servicios, CVs, Ágora, Mi historia
 *   (5) Lore link + social chips + footer
 *
 * Brand: bg #0b1417, teal #43b5a6, gold #e0a85e, rust #cf6a3c
 * Animations: GameOfLife hero canvas, CSS reveal, prefers-reduced-motion honored
 */

import React from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { useReveal } from './Frentes/useReveal';
import { frentesMeta } from '@/data/frentes';
import { FRENTE_SECTIONS } from './GalleryComponents';

const GameOfLife = dynamic(() => import('./Matematica/GameOfLife'), { ssr: false });

type Locale = 'es' | 'en';

/* ------------------------------------------------------------------ */
/* STRINGS                                                              */
/* ------------------------------------------------------------------ */
const T = {
  es: {
    kicker: 'Mouseîon · stevenvallejo.com',
    name: 'Steven Vallejo Ortiz',
    tagline: 'Ingeniero de software · Filósofo',
    lead: 'Pensar antes de construir. Sistemas que sostienen lo que se dice que hacen.',
    epigraph: '«La abstracción no es alejarse del problema. Es verlo desde la altura exacta.»',
    ctaHire: 'Contratar servicios',
    loreLink: 'Mi historia →',
    lorePath: '/es/lore',

    frentesTitle: 'Frentes de trabajo',
    frentesSub: 'Cuatro registros: el código, la ciencia, la filosofía y la empresa.',
    exploreFrente: 'Explorar →',

    soonBadge: 'Próximamente',

    linktreeTitle: 'Accesos directos',
    linkCat1: 'Currículum',
    linkCat2: 'Plataformas',
    linkCat3: 'Servicios & Escritura',

    links: {
      cvFilosofo:  { label: 'CV Filósofo',      sub: 'filosofo.stevenvallejo.com',    url: 'https://filosofo.stevenvallejo.com' },
      cvInfo:      { label: 'CV Informático',    sub: 'informatico.stevenvallejo.com', url: 'https://informatico.stevenvallejo.com' },
      prizma:      { label: 'Prizma',            sub: 'Suite corporativa · Prizma',    url: 'https://prizma.stevenvallejo.com' },
      agora:       { label: 'Ágora',             sub: 'agora.elenxos.com',             url: 'https://agora.elenxos.com' },
      services:    { label: 'Servicios',         sub: 'services.stevenvallejo.com',    url: 'https://services.stevenvallejo.com' },
      blog:        { label: 'Blog · Scholḗ',     sub: 'blog.stevenvallejo.com',        url: 'https://blog.stevenvallejo.com' },
      lore:        { label: 'Mi historia',       sub: '/lore',                         url: '/es/lore' },
    },

    social: [
      { label: 'GitHub', url: 'https://github.com/stevenvo780' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/steven-vallejo/' },
    ],

    foot: 'Pensar antes de construir: ese es todo el método.',
    footBrand: 'Mouseîon · por Steven Vallejo',
  },
  en: {
    kicker: 'Mouseîon · stevenvallejo.com',
    name: 'Steven Vallejo Ortiz',
    tagline: 'Software engineer · Philosopher',
    lead: 'Think before you build. Systems that hold up what they say they do.',
    epigraph: '"Abstraction is not stepping away from the problem. It is seeing it from the exact height."',
    ctaHire: 'Hire me',
    loreLink: 'My story →',
    lorePath: '/en/lore',

    frentesTitle: 'Work fronts',
    frentesSub: 'Four registers: code, science, philosophy and business.',
    exploreFrente: 'Explore →',

    soonBadge: 'Coming soon',

    linktreeTitle: 'Quick access',
    linkCat1: 'Résumé',
    linkCat2: 'Platforms',
    linkCat3: 'Services & Writing',

    links: {
      cvFilosofo:  { label: 'CV Philosopher',       sub: 'filosofo.stevenvallejo.com',    url: 'https://filosofo.stevenvallejo.com' },
      cvInfo:      { label: 'CV Computer Scientist', sub: 'informatico.stevenvallejo.com', url: 'https://informatico.stevenvallejo.com' },
      prizma:      { label: 'Prizma',                sub: 'Corporate suite · Prizma',      url: 'https://prizma.stevenvallejo.com' },
      agora:       { label: 'Agora',                 sub: 'agora.elenxos.com',             url: 'https://agora.elenxos.com' },
      services:    { label: 'Services',              sub: 'services.stevenvallejo.com',    url: 'https://services.stevenvallejo.com' },
      blog:        { label: 'Blog · Scholḗ',         sub: 'blog.stevenvallejo.com',        url: 'https://blog.stevenvallejo.com' },
      lore:        { label: 'My story',              sub: '/lore',                         url: '/en/lore' },
    },

    social: [
      { label: 'GitHub', url: 'https://github.com/stevenvo780' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/steven-vallejo/' },
    ],

    foot: 'Think before you build: that is the whole method.',
    footBrand: 'Mouseîon · by Steven Vallejo',
  },
};

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                       */
/* ------------------------------------------------------------------ */
export default function LinktreeHome() {
  const params = useParams();
  const locale: Locale = params?.locale === 'es' ? 'es' : 'en';
  const t = T[locale];
  useReveal();

  // Frente cards for the home 2-level nav
  const frenteCards = FRENTE_SECTIONS.map((fs) => ({
    ...fs,
    meta: frentesMeta[fs.id],
  }));

  return (
    <main id="home" className="lt-root">
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── ROOT ── */
        .lt-root {
          min-height: 100dvh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
        }

        /* ────────────────────────────────────────────────
           HERO
        ──────────────────────────────────────────────── */
        .lt-hero {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 56vh;
          padding: 5.5rem 1.5rem 4.5rem;
        }
        .lt-hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.14;
          pointer-events: none;
          overflow: hidden;
        }
        .lt-hero-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: radial-gradient(
            ellipse 70% 60% at 50% 50%,
            rgba(67,181,166,0.07) 0%,
            rgba(224,168,94,0.04) 50%,
            transparent 75%
          );
        }
        .lt-hero-inner {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 640px;
          animation: brand-reveal 0.8s ease both;
        }
        .lt-hero-logo {
          margin-bottom: 1.4rem;
          display: inline-block;
          animation: brand-float 7s ease-in-out infinite;
        }
        .lt-hero-kicker {
          font-family: var(--font-mono);
          font-size: 0.70rem;
          text-transform: uppercase;
          letter-spacing: 0.26em;
          color: var(--teal);
          font-weight: 600;
          margin-bottom: 0.7rem;
        }
        .lt-hero-name {
          font-size: clamp(2rem, 6vw, 3.6rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin: 0 0 0.5rem;
          background: var(--grad-sig);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: var(--gold);
        }
        .lt-hero-tagline {
          font-family: var(--font-mono);
          font-size: clamp(0.8rem, 1.8vw, 0.92rem);
          color: var(--teal-light);
          letter-spacing: 0.08em;
          margin: 0 0 1rem;
        }
        .lt-hero-lead {
          font-size: clamp(1rem, 2.2vw, 1.15rem);
          color: var(--text-soft);
          line-height: 1.68;
          margin: 0 0 1.4rem;
          max-width: 52ch;
        }
        .lt-hero-epigraph {
          font-size: 0.94rem;
          font-style: italic;
          color: var(--muted);
          line-height: 1.55;
          padding-left: 1rem;
          border-left: 2px solid var(--teal-dim);
          text-align: left;
          margin: 0 auto 2rem;
          max-width: 46ch;
        }
        .lt-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-mono);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-decoration: none;
          color: var(--bg) !important;
          background: var(--gold);
          padding: 0.72rem 1.7rem;
          border-radius: var(--r-sm);
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .lt-hero-cta:hover {
          background: var(--gold-light);
          transform: translateY(-2px);
        }

        /* ────────────────────────────────────────────────
           FRENTE CARDS (home 2-level nav)
        ──────────────────────────────────────────────── */
        .lt-frentes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.1rem;
          padding: 2.5rem 1.25rem 3rem;
          max-width: 980px;
          margin: 0 auto;
          width: 100%;
        }
        @media (min-width: 640px) {
          .lt-frentes-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .ft-card {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding: 1.5rem 1.6rem 1.5rem;
          border-radius: var(--r-md);
          border: 1px solid var(--ft-border);
          background: var(--bg-card);
          text-decoration: none !important;
          transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.18s ease;
          min-height: 160px;
        }
        .ft-card:hover {
          border-color: var(--ft-accent);
          box-shadow: 0 10px 36px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.03);
          transform: translateY(-3px);
        }
        .ft-card-kicker {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          font-weight: 700;
          color: var(--ft-accent);
          margin: 0;
        }
        .ft-card-name {
          font-size: clamp(1.25rem, 3vw, 1.65rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text);
          margin: 0;
          line-height: 1.15;
        }
        .ft-card-tagline {
          font-size: 0.90rem;
          color: var(--muted);
          margin: 0;
          line-height: 1.55;
          flex: 1;
        }
        .ft-card-arrow {
          font-size: 1rem;
          color: var(--ft-accent);
          align-self: flex-end;
          transition: transform 0.18s ease;
        }
        .ft-card:hover .ft-card-arrow {
          transform: translate(3px, -3px);
        }


        /* ────────────────────────────────────────────────
           LORE LINK ROW
        ──────────────────────────────────────────────── */
        .lt-lore-row {
          max-width: 740px;
          margin: 2.5rem auto 0;
          padding: 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .lt-lore-line {
          flex: 1;
          height: 1px;
          background: var(--line);
        }
        .lt-lore-link {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          color: var(--teal-dim) !important;
          text-decoration: none !important;
          transition: color 0.2s ease;
          white-space: nowrap;
        }
        .lt-lore-link:hover {
          color: var(--teal) !important;
        }

        /* ── SOCIAL CHIPS ── */
        .lt-social {
          max-width: 740px;
          margin: 1.4rem auto 0;
          padding: 0 1.25rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .lt-social-chip {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          text-decoration: none;
          color: var(--text-soft) !important;
          border: 1px solid var(--line);
          background: transparent;
          padding: 0.28rem 0.8rem;
          border-radius: 999px;
          transition: border-color 0.2s ease, color 0.2s ease;
          letter-spacing: 0.03em;
        }
        .lt-social-chip:hover {
          border-color: var(--teal);
          color: var(--teal-light) !important;
        }

        /* ── FOOTER ── */
        .lt-foot {
          max-width: 740px;
          margin: 3rem auto 0;
          padding: 1.4rem 1.25rem 4rem;
          border-top: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .lt-foot-note {
          font-size: 0.87rem;
          font-style: italic;
          color: var(--muted);
          margin: 0;
          line-height: 1.5;
        }
        .lt-foot-brand {
          font-family: var(--font-mono);
          font-size: 0.70rem;
          letter-spacing: 0.10em;
          color: var(--teal-light);
          margin: 0;
        }

        /* ────────────────────────────────────────────────
           REDUCED MOTION
        ──────────────────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .lt-hero-logo { animation: none !important; }
          .lt-hero-inner { animation: none !important; }
          .ft-card,
          .ft-card-arrow,
          .lt-lore-link,
          .lt-social-chip,
          .lt-hero-cta { transition: none !important; }
        }
      ` }} />

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="lt-hero">
        <div className="lt-hero-bg" aria-hidden="true">
          <GameOfLife />
        </div>
        <div className="lt-hero-glow" aria-hidden="true" />
        <div className="lt-hero-inner">
          <div className="lt-hero-logo">
            <BrandLogo size={56} title={t.name} />
          </div>
          <p className="lt-hero-kicker">{t.kicker}</p>
          <h1 className="lt-hero-name">{t.name}</h1>
          <p className="lt-hero-tagline">{t.tagline}</p>
          <p className="lt-hero-lead">{t.lead}</p>
          <blockquote className="lt-hero-epigraph">{t.epigraph}</blockquote>
          <a
            href={t.links.services.url}
            target="_blank"
            rel="noopener noreferrer"
            className="lt-hero-cta"
          >
            {t.ctaHire}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      {/* ─── FRENTE CARDS (2-level nav) ─────────────────────────── */}
      <section aria-label={t.frentesTitle}>
        <div style={{ textAlign: 'center', padding: '3.5rem 1.25rem 0', maxWidth: '980px', margin: '0 auto', width: '100%' }} className="reveal">
          <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', fontWeight: 800, background: 'var(--grad-sig)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'var(--gold)', margin: '0 0 0.6rem', letterSpacing: '-0.025em' }}>
            {t.frentesTitle}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.96rem', maxWidth: '54ch', margin: '0 auto', lineHeight: 1.6 }}>
            {t.frentesSub}
          </p>
        </div>
        <div className="lt-frentes-grid">
          {frenteCards.map((fs) => (
            <Link
              key={fs.id}
              href={`/${locale}/${fs.id}`}
              className="ft-card reveal"
              style={{
                '--ft-accent': fs.accent,
                '--ft-border': fs.borderAlpha,
              } as React.CSSProperties}
            >
              <p className="ft-card-kicker">{fs.meta.secNo} · {fs.meta.nombre[locale]}</p>
              <h3 className="ft-card-name">{fs.meta.nombre[locale]}</h3>
              <p className="ft-card-tagline">{fs.meta.tagline[locale]}</p>
              <span className="ft-card-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── LORE LINK ─────────────────────────────────────────── */}
      <div className="lt-lore-row">
        <span className="lt-lore-line" aria-hidden="true" />
        <Link href={t.lorePath} className="lt-lore-link">
          {t.loreLink}
        </Link>
        <span className="lt-lore-line" aria-hidden="true" />
      </div>

      {/* ─── SOCIAL CHIPS ──────────────────────────────────────── */}
      <nav className="lt-social" aria-label={locale === 'es' ? 'Redes' : 'Social'}>
        {t.social.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="lt-social-chip"
          >
            {s.label} ↗
          </a>
        ))}
      </nav>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer className="lt-foot">
        <p className="lt-foot-note">{t.foot}</p>
        <p className="lt-foot-brand">{t.footBrand}</p>
      </footer>
    </main>
  );
}
