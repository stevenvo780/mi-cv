'use client';

/**
 * LinktreeHome — stevenvallejo.com: GALLERY + LINKTREE
 *
 * Structure:
 *   (0) Hero: GameOfLife bg + BrandLogo + name + identity + CTA
 *   (1) Gallery §01 Ingeniería   — 11 productos (grid-portrait)
 *   (2) Gallery §02 Filosofía   —  3 productos (Ágora banner + Paideía + Agón grid)
 *   (3) Gallery §03 Ciencias    —  2 productos (Kósmos + Estructuras, grid-portrait)
 *   (4) Gallery §04 Enterprise  —  1 producto (showcase)
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
import { productos, frentesMeta } from '@/data/frentes';
import { FRENTE_SECTIONS, GallerySection, GALLERY_CSS } from './GalleryComponents';

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

    galleryTitle: 'Portafolio de productos',
    gallerySub: 'Cada proyecto es una tesis: sobre lógica, sistemas complejos o software que genera caja.',

    links: {
      cvFilosofo:  { label: 'CV Filósofo',      sub: 'filosofo.stevenvallejo.com',    url: 'https://filosofo.stevenvallejo.com' },
      cvInfo:      { label: 'CV Informático',    sub: 'informatico.stevenvallejo.com', url: 'https://informatico.stevenvallejo.com' },
      prizma:      { label: 'Prizma',            sub: 'Suite corporativa · Prizma',    url: 'https://prizma.stevenvallejo.com' },
      agora:       { label: 'Ágora',             sub: 'agora.elenxos.com',             url: 'https://agora.elenxos.com' },
      services:    { label: 'Servicios',         sub: 'praxis.stevenvallejo.com',      url: 'https://praxis.stevenvallejo.com' },
      blog:        { label: 'Blog · Scholḗ',     sub: 'schole.stevenvallejo.com',      url: 'https://schole.stevenvallejo.com' },
      lore:        { label: 'Mi historia',       sub: '/lore',                         url: '/es/lore' },
    },

    social: [
      { label: 'GitHub', url: 'https://github.com/stevenvo780' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/steven-vallejo/' },
      { label: 'Instagram', url: 'https://www.instagram.com/stev_vallejo/' },
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

    galleryTitle: 'Product portfolio',
    gallerySub: 'Each project is a thesis: on logic, complex systems or software that drives revenue.',

    links: {
      cvFilosofo:  { label: 'CV Philosopher',       sub: 'filosofo.stevenvallejo.com',    url: 'https://filosofo.stevenvallejo.com' },
      cvInfo:      { label: 'CV Computer Scientist', sub: 'informatico.stevenvallejo.com', url: 'https://informatico.stevenvallejo.com' },
      prizma:      { label: 'Prizma',                sub: 'Corporate suite · Prizma',      url: 'https://prizma.stevenvallejo.com' },
      agora:       { label: 'Agora',                 sub: 'agora.elenxos.com',             url: 'https://agora.elenxos.com' },
      services:    { label: 'Services',              sub: 'praxis.stevenvallejo.com',      url: 'https://praxis.stevenvallejo.com' },
      blog:        { label: 'Blog · Scholḗ',         sub: 'schole.stevenvallejo.com',      url: 'https://schole.stevenvallejo.com' },
      lore:        { label: 'My story',              sub: '/lore',                         url: '/en/lore' },
    },

    social: [
      { label: 'GitHub', url: 'https://github.com/stevenvo780' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/steven-vallejo/' },
      { label: 'Instagram', url: 'https://www.instagram.com/stev_vallejo/' },
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

  // Group products by frente for gallery sections
  const productsByFrente = FRENTE_SECTIONS.map((fs) => ({
    ...fs,
    items: productos.filter((p) => p.frente === fs.id),
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
           The hero is the WHOLE upper strip of the page: it spans from the
           top edge down to where "Portafolio de productos" begins. The Conway
           Game of Life canvas fills this entire strip (not just a band), so
           the cellular automaton runs behind all of the intro content —
           name, tagline, lead and epigraph — ending exactly where the
           gallery starts.
        ──────────────────────────────────────────────── */
        .lt-hero {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          /* Tall enough that the automaton covers the full intro zone on every
             viewport; the content stays vertically centered within it. */
          min-height: 72vh;
          padding: 6rem 1.5rem 5rem;
        }
        /* Conway field — covers the ENTIRE hero strip, behind the content. */
        .lt-hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          /* Raised from 0.14 → 0.30 so the Conway automaton clearly reads
             behind the hero. Gold cells on dark are high-contrast, so the
             radial glow + bottom mask keep the centered name/CTA legible. */
          opacity: 0.3;
          pointer-events: none;
          overflow: hidden;
          /* Center the field both axes; the canvas below stretches to fill. */
          display: flex;
          align-items: center;
          justify-content: center;
          /* Fade the automaton out toward the bottom so the seam with the
             gallery is invisible and the lower text never fights the cells. */
          -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%);
          mask-image: linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%);
        }
        /* The GameOfLife component renders <section><canvas/></section> (or a
           loading <div> grid). Force the whole thing to fill .lt-hero-bg so
           the fixed-size grid stretches to cover the full hero strip instead
           of sitting as a short centered band. inline styles on the canvas
           need !important to be overridden. */
        .lt-hero-bg > section {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lt-hero-bg canvas {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          border: 0 !important;
          object-fit: cover;
        }
        /* Loading-state grid (pre-hydration random seed) — let it fill too so
           there is no visible jump when the canvas takes over. */
        .lt-hero-bg > section > div {
          width: 100%;
          height: 100%;
        }
        .lt-hero-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          /* Two layers: (1) a soft dark core that grounds the centered name/CTA
             against the now-brighter gold automaton without dimming the cells
             toward the edges; (2) the original teal/gold ambient tint. */
          background:
            radial-gradient(
              ellipse 46% 50% at 50% 46%,
              rgba(11,20,23,0.55) 0%,
              rgba(11,20,23,0.28) 45%,
              transparent 72%
            ),
            radial-gradient(
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
           GALLERY WRAPPER
        ──────────────────────────────────────────────── */
        .lt-gallery {
          padding: 4rem 1.25rem 2rem;
          max-width: 1120px;
          margin: 0 auto;
          width: 100%;
        }
        .lt-gallery-hd {
          text-align: center;
          margin-bottom: 3.5rem;
        }
        .lt-gallery-hd h2 {
          font-size: clamp(1.5rem, 4vw, 2.4rem);
          font-weight: 800;
          background: var(--grad-sig);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: var(--gold);
          margin: 0 0 0.65rem;
          letter-spacing: -0.025em;
        }
        .lt-gallery-hd p {
          color: var(--muted);
          font-size: 0.96rem;
          max-width: 54ch;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* ── Divider between gallery sections ── */
        .lt-gallery-divider {
          width: 100%;
          height: 1px;
          background: var(--line);
          margin: 3rem 0 0;
        }

        ${GALLERY_CSS}

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

        /* ── CONTACT CTA ── */
        .lt-contact-cta {
          max-width: 740px;
          margin: 1.8rem auto 0;
          padding: 1.2rem 1.25rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
          justify-content: center;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }
        .lt-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-decoration: none;
          padding: 0.6rem 1.35rem;
          border-radius: var(--r-sm, 6px);
          transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease, border-color 0.2s ease;
        }
        .lt-cta-btn:hover { transform: translateY(-2px); }
        .lt-cta-btn--wa {
          background: #25d366;
          color: #0b1417 !important;
          border: 1px solid #25d366;
        }
        .lt-cta-btn--wa:hover { background: #1ebe5d; border-color: #1ebe5d; }
        .lt-cta-btn--email {
          background: transparent;
          color: var(--teal-light, #6fd3c4) !important;
          border: 1px solid var(--teal, #43b5a6);
        }
        .lt-cta-btn--email:hover {
          background: rgba(67,181,166,0.1);
          border-color: var(--teal-light, #6fd3c4);
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

      {/* ─── GALLERY ───────────────────────────────────────────── */}
      <section aria-label={t.galleryTitle}>
        <div className="lt-gallery">
          <div className="lt-gallery-hd reveal">
            <h2>{t.galleryTitle}</h2>
            <p>{t.gallerySub}</p>
          </div>

          {productsByFrente.map((fs, idx) => (
            <React.Fragment key={fs.id}>
              {idx > 0 && <div className="lt-gallery-divider" aria-hidden="true" />}
              <GallerySection
                frenteId={fs.id}
                accent={fs.accent}
                borderAlpha={fs.borderAlpha}
                bgAlpha={fs.bgAlpha}
                badgeColor={fs.badgeColor}
                locale={locale}
                items={fs.items}
                secNo={fs.meta.secNo}
                name={fs.meta.nombre[locale]}
                tagline={fs.meta.tagline[locale]}
              />
            </React.Fragment>
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

      {/* ─── CONTACT CTA ────────────────────────────────────────── */}
      <div className="lt-contact-cta">
        <a
          href="https://wa.me/573046374368?text=Hola%20Steven%2C%20vi%20tu%20portafolio%20y%20quiero%20hablar%20contigo"
          target="_blank"
          rel="noopener noreferrer"
          className="lt-cta-btn lt-cta-btn--wa"
          aria-label={locale === 'es' ? 'Contactar por WhatsApp' : 'Contact via WhatsApp'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          WhatsApp
        </a>
        <a
          href="mailto:stevenvallejo780@gmail.com"
          className="lt-cta-btn lt-cta-btn--email"
          aria-label={locale === 'es' ? 'Enviar correo' : 'Send email'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          {locale === 'es' ? 'Correo' : 'Email'}
        </a>
      </div>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer className="lt-foot">
        <p className="lt-foot-note">{t.foot}</p>
        <p className="lt-foot-brand">{t.footBrand}</p>
      </footer>
    </main>
  );
}
