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
import Image from 'next/image';
import BrandLogo from './BrandLogo';
import { useReveal } from './Frentes/useReveal';
import { productos, frentesMeta, type Producto, type FrenteId } from '@/data/frentes';

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
    visitLive: 'Ver en vivo',

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

    galleryTitle: 'Product portfolio',
    gallerySub: 'Each project is a thesis: on logic, complex systems or software that drives revenue.',
    visitLive: 'View live',

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
/* Brand image map: product id → /brand/<slug>/og_product.png         */
/* ------------------------------------------------------------------ */
const BRAND_COVER: Record<string, string> = {
  clavis:          '/brand/paideia/og_product.png',
  debatesuite:     '/brand/agon/og_product.png',
  complexlab:      '/brand/kosmos/og_product.png',
  hinton:          '/brand/hinton/og_product.png',
  'nlp-to-logic':  '/brand/organon/og_product.png',
  stevenai:        '/brand/daimon/og_product.png',
  stevendevbox:    '/brand/techne/og_product.png',
  communityos:     '/brand/koinonia/og_product.png',
  devkits:         '/brand/ergon/og_product.png',
  'devkits-hours': '/brand/chronos/og_product.png',
  'devkits-crm':   '/brand/xenia/og_product.png',
  scrapekit:       '/brand/nomos/og_product.png',
  warehouse:       '/brand/apotheke/og_product.png',
  prizma:          '/brand/prizma/og_product.png',
};

/* (mapa WORDMARK eliminado: el cover og_product ya incluye el lockup de marca; era redundante) */

/* ------------------------------------------------------------------ */
/* Frente order + accent colors for gallery sections                   */
/* ------------------------------------------------------------------ */
const FRENTE_SECTIONS: Array<{
  id: FrenteId;
  accent: string;
  borderAlpha: string;
  bgAlpha: string;
  badgeColor: string;
}> = [
  { id: 'informatica',accent: '#43b5a6', borderAlpha: 'rgba(67,181,166,0.28)',  bgAlpha: 'rgba(67,181,166,0.06)',  badgeColor: 'var(--teal)' },
  { id: 'ciencias',   accent: '#6fd3c4', borderAlpha: 'rgba(111,211,196,0.28)', bgAlpha: 'rgba(111,211,196,0.06)', badgeColor: 'var(--teal-light)' },
  { id: 'filosofia',  accent: '#e0a85e', borderAlpha: 'rgba(224,168,94,0.28)', bgAlpha: 'rgba(224,168,94,0.06)', badgeColor: 'var(--gold)' },
  { id: 'enterprise', accent: '#cf6a3c', borderAlpha: 'rgba(207,106,60,0.28)',  bgAlpha: 'rgba(207,106,60,0.06)',  badgeColor: 'var(--rust)' },
];

/* ------------------------------------------------------------------ */
/* PRODUCT GALLERY CARD                                                 */
/* ------------------------------------------------------------------ */
interface GalleryCardProps {
  producto: Producto;
  locale: Locale;
  accent: string;
  borderAlpha: string;
  bgAlpha: string;
  badgeColor: string;
  index: number;
}

function GalleryCard({ producto: p, locale, accent, borderAlpha, bgAlpha, badgeColor, index }: GalleryCardProps) {
  const cover = BRAND_COVER[p.id];
  const isFeatured = p.featured === true;

  return (
    <article
      className="reveal gc-card"
      data-featured={isFeatured || undefined}
      style={{
        '--gc-accent': accent,
        '--gc-border': borderAlpha,
        '--gc-bg': bgAlpha,
        '--gc-badge': badgeColor,
        animationDelay: `${index * 80}ms`,
      } as React.CSSProperties}
    >
      {/* Cover image */}
      {cover && (
        <div className="gc-cover" aria-hidden="true">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            priority={index < 3}
          />
          {/* Gradient overlay so text is readable */}
          <div className="gc-cover-fade" />
        </div>
      )}

      <div className="gc-body">
        {/* El cover (og_product) ya incluye el wordmark de marca; solo mostramos el nombre en texto si NO hay cover. */}
        {!cover && (
          <h3 className="gc-name">{p.nombre}</h3>
        )}

        {/* One-liner subtitle */}
        {p.subtitulo && (
          <p className="gc-sub">{p.subtitulo[locale]}</p>
        )}

        {/* Badge + status */}
        <div className="gc-chips">
          {p.badge && (
            <span className="gc-badge">{p.badge[locale]}</span>
          )}
          {p.status === 'soon' && (
            <span className="gc-soon">
              {locale === 'es' ? 'Próximamente' : 'Coming soon'}
            </span>
          )}
        </div>

        {/* CTA */}
        {p.url && (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="gc-cta"
            aria-label={`${p.nombre} — ${locale === 'es' ? 'Ver en vivo' : 'View live'}`}
          >
            {locale === 'es' ? 'Ver en vivo' : 'View live'}
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* GALLERY SECTION (one frente)                                         */
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

function GallerySection({ frenteId, accent, borderAlpha, bgAlpha, badgeColor, locale, items, secNo, name, tagline }: GallerySectionProps) {
  return (
    <div className="gs-section" id={`gallery-${frenteId}`}>
      <div className="gs-header reveal">
        <p className="gs-eyebrow" style={{ color: accent }}>
          <span className="brand-sec-no">{secNo}</span>
          &nbsp;&nbsp;{name}
        </p>
        <h3 className="gs-tagline">{tagline}</h3>
      </div>
      <div className="gs-grid">
        {items.map((p, i) => (
          <GalleryCard
            key={p.id}
            producto={p}
            locale={locale}
            accent={accent}
            borderAlpha={borderAlpha}
            bgAlpha={bgAlpha}
            badgeColor={badgeColor}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

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

        /* ────────────────────────────────────────────────
           GALLERY SECTION (one frente)
        ──────────────────────────────────────────────── */
        .gs-section {
          padding: 2.4rem 0 0;
        }
        .gs-header {
          margin-bottom: 1.6rem;
        }
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

        /* ── Product grid ── */
        .gs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.25rem;
        }
        @media (min-width: 640px) {
          .gs-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 900px) {
          .gs-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1100px) {
          .gs-grid { grid-template-columns: repeat(4, 1fr); }
        }

        /* ────────────────────────────────────────────────
           GALLERY CARD
        ──────────────────────────────────────────────── */
        .gc-card {
          position: relative;
          background: var(--bg-card);
          border: 1px solid var(--gc-border, var(--line));
          border-radius: var(--r-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          min-height: 280px;
        }
        .gc-card:hover {
          transform: translateY(-4px);
          border-color: var(--gc-accent, var(--teal));
          box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--gc-bg, transparent);
        }
        .gc-card[data-featured] {
          border-color: var(--gc-accent, var(--teal));
        }

        /* Cover image area */
        .gc-cover {
          position: relative;
          width: 100%;
          height: 150px;
          flex-shrink: 0;
          overflow: hidden;
          background: var(--bg-2);
        }
        .gc-cover-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(11,20,23,0) 0%,
            rgba(11,20,23,0.55) 100%
          );
          z-index: 1;
        }

        /* Card body */
        .gc-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          padding: 1rem 1.1rem 1.2rem;
        }

        /* Wordmark */
        .gc-wordmark-wrap {
          display: flex;
          align-items: center;
          height: 34px;
        }

        /* Fallback name */
        .gc-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text);
          margin: 0;
          line-height: 1.25;
        }

        /* Sub one-liner */
        .gc-sub {
          font-family: var(--font-mono);
          font-size: 0.70rem;
          letter-spacing: 0.04em;
          color: var(--muted);
          margin: 0;
          line-height: 1.4;
        }

        /* Chips row */
        .gc-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: auto;
          padding-top: 0.35rem;
        }
        .gc-badge {
          font-family: var(--font-mono);
          font-size: 0.66rem;
          padding: 0.18rem 0.52rem;
          border-radius: 999px;
          border: 1px solid var(--gc-border, var(--line));
          background: var(--gc-bg, transparent);
          color: var(--gc-accent, var(--text-soft));
          letter-spacing: 0.03em;
          white-space: nowrap;
        }
        .gc-soon {
          font-family: var(--font-mono);
          font-size: 0.66rem;
          padding: 0.18rem 0.52rem;
          border-radius: 999px;
          border: 1px solid rgba(207,106,60,0.30);
          background: rgba(207,106,60,0.08);
          color: var(--rust);
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        /* CTA link */
        .gc-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-family: var(--font-mono);
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-decoration: none;
          color: var(--gc-accent, var(--teal));
          margin-top: 0.5rem;
          padding: 0.36rem 0.85rem;
          border: 1px solid var(--gc-border, var(--line));
          border-radius: var(--r-sm);
          background: var(--gc-bg, transparent);
          transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
          align-self: flex-start;
        }
        .gc-cta:hover {
          background: var(--gc-accent, var(--teal));
          color: var(--bg) !important;
          border-color: var(--gc-accent, var(--teal));
        }

        /* ────────────────────────────────────────────────
           LINKTREE SECTION
        ──────────────────────────────────────────────── */
        .lt-section {
          max-width: 740px;
          margin: 0 auto;
          padding: 0 1.25rem 1rem;
          width: 100%;
        }
        .lt-section-hd {
          padding: 3.5rem 1.25rem 0;
          max-width: 740px;
          margin: 0 auto;
          width: 100%;
        }
        .lt-section-hd h2 {
          font-size: clamp(1.2rem, 3vw, 1.7rem);
          font-weight: 700;
          color: var(--text);
          margin: 0 0 0.35rem;
          letter-spacing: -0.015em;
        }
        .lt-section-hd p {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--muted);
          margin: 0 0 0.5rem;
          letter-spacing: 0.04em;
        }
        .lt-section-hd hr {
          border: none;
          border-top: 1px solid var(--line);
          margin: 1rem 0 0;
        }

        .lt-cat-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: var(--muted);
          margin: 2rem 0 0.7rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid var(--line);
        }

        /* Hub cards */
        .hub-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1.1rem;
          border-radius: var(--r-md);
          border: 1px solid var(--hub-border);
          background: var(--bg-card);
          text-decoration: none !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.18s ease, background 0.2s ease;
          margin-bottom: 0.55rem;
        }
        .hub-card:hover {
          border-color: var(--hub-hover);
          box-shadow: 0 6px 28px rgba(0,0,0,0.38);
          background: var(--bg-card-2);
          transform: translateY(-2px);
        }
        .hub-dot {
          flex-shrink: 0;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--hub-dot);
          box-shadow: 0 0 7px var(--hub-dot);
          opacity: 0.75;
        }
        .hub-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.12rem;
        }
        .hub-label {
          font-size: 0.96rem;
          font-weight: 700;
          color: var(--hub-text) !important;
          line-height: 1.2;
        }
        .hub-sub {
          font-family: var(--font-mono);
          font-size: 0.70rem;
          color: var(--muted);
          letter-spacing: 0.02em;
          line-height: 1.3;
        }
        .hub-arrow {
          font-size: 1rem;
          color: var(--muted);
          flex-shrink: 0;
          transition: transform 0.15s ease, color 0.15s ease;
        }
        .hub-card:hover .hub-arrow {
          color: var(--hub-text);
          transform: translate(2px, -2px);
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
          .gc-card,
          .hub-card,
          .hub-arrow,
          .lt-lore-link,
          .lt-social-chip,
          .lt-hero-cta,
          .gc-cta { transition: none !important; }
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

      {/* Accesos directos (CVs · Servicios · Blog) movidos a la barra superior (navbar). */}

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
