'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import Portrait from '@/app/components/Portrait';
import FrenteFilosofia from './FrenteFilosofia';
import FrenteCiencias from './FrenteCiencias';
import { FrenteInformatica } from './FrenteStub';
import FrenteEnterprise from './FrenteEnterprise';
import DashboardServicios from './DashboardServicios';
import { useReveal } from './useReveal';

type Locale = 'es' | 'en';

/**
 * Long-scroll portal shell. Order per portal-marca-4-frentes.md:
 *   hero (Portrait + GameOfLife) → #filosofia → #ciencias → #informatica
 *   → #enterprise → #servicios → #blog → #contacto.
 * The hero/narrative lives inside Portrait.
 * Reveals are wired by a single IntersectionObserver (useReveal).
 */
export default function PortalShell() {
  const params = useParams();
  const locale: Locale = params?.locale === 'es' ? 'es' : 'en';
  useReveal();

  return (
    <main id="home">
      {/* (0) Hero narrativo "Abstracción" — Portrait + GameOfLife. */}
      <Portrait />

      {/* (1–4) Frentes-dashboard */}
      <FrenteFilosofia />
      <FrenteCiencias />
      <FrenteInformatica />
      <FrenteEnterprise />

      {/* (5) Dashboard de servicios */}
      <DashboardServicios />

      {/* (6) Blog card — codigo-con-criterio */}
      <section id="blog" style={{ scrollMarginTop: '80px', padding: '5rem 0 4rem' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          #blog {
            position: relative;
            overflow: hidden;
          }
          #blog::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(
              ellipse 60% 45% at 50% 50%,
              rgba(224,168,94,0.05) 0%,
              transparent 65%
            );
            pointer-events: none;
            z-index: 0;
          }
          .blog-card {
            position: relative;
            z-index: 1;
            max-width: 740px;
            padding: 2.6rem 2.8rem;
            border-radius: var(--r-lg);
            background: var(--bg-card);
            border: 1px solid rgba(224,168,94,0.18);
            box-shadow: 0 12px 48px rgba(0,0,0,0.35);
          }
          .blog-card-kicker {
            font-family: var(--font-mono);
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.20em;
            color: var(--gold);
            font-weight: 600;
            margin-bottom: 0.9rem;
          }
          .blog-card-title {
            font-size: clamp(1.7rem, 3.5vw, 2.5rem);
            font-weight: 700;
            line-height: 1.2;
            margin: 0 0 0.9rem;
            background: var(--grad-sig);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            /* readable solid fallback (gold) instead of transparent */
            color: var(--gold);
          }
          .blog-card-lead {
            color: var(--text-soft);
            font-size: 1rem;
            line-height: 1.72;
            max-width: 54ch;
            margin: 0 0 1.8rem;
          }
          .blog-card-cta {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            font-family: var(--font-mono);
            font-size: 0.8rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-decoration: none !important;
            color: var(--bg) !important;
            background: var(--gold);
            padding: 0.65rem 1.4rem;
            border-radius: var(--r-sm);
            transition: background 0.2s ease, transform 0.15s ease;
          }
          .blog-card-cta:hover {
            background: var(--gold-light);
            transform: translateY(-1px);
            color: var(--bg) !important;
          }
          @media (prefers-reduced-motion: reduce) {
            .blog-card-cta { transition: none !important; }
          }
        ` }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="blog-card reveal">
            <div className="blog-card-kicker">
              {locale === 'es' ? 'Blog · Código con criterio' : 'Blog · Code with judgment'}
            </div>
            <h2 className="blog-card-title">
              {locale === 'es' ? 'Abstracción — el blog' : 'Abstraction — the blog'}
            </h2>
            <p className="blog-card-lead">
              {locale === 'es'
                ? 'Filosofía aplicada a la máquina. Ensayos sobre cómo pensamos, cómo decidimos y cómo construimos inteligencia. Escribo en el cruce, para quien ya tiene las dos bases.'
                : 'Philosophy applied to the machine. Essays on how we think, how we decide and how we build intelligence. I write at the intersection, for the reader who already has both grounds.'}
            </p>
            <a
              href="https://blog.stevenvallejo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="blog-card-cta"
            >
              {locale === 'es' ? 'Leer el blog' : 'Read the blog'}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* (7) Contacto — closing anchor */}
      <section
        id="contacto"
        style={{ scrollMarginTop: '80px', padding: '3rem 0 6rem' }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .close-line {
            display: block;
            width: 2px;
            height: 48px;
            background: var(--grad-sig);
            border-radius: 2px;
            margin: 0 0 2rem;
            opacity: 0.6;
          }
          .close-tagline {
            font-family: var(--font-mono);
            font-size: 0.78rem;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--teal);
            margin: 0 0 0.5rem;
          }
          .close-name {
            font-size: clamp(1.5rem, 3vw, 2.2rem);
            font-weight: 700;
            color: var(--text);
            margin: 0 0 0.5rem;
            line-height: 1.2;
          }
          .close-sub {
            color: var(--muted);
            font-size: 0.92rem;
            margin: 0 0 1.8rem;
          }
          .close-links {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
          }
          .close-link {
            font-family: var(--font-mono);
            font-size: 0.76rem;
            letter-spacing: 0.06em;
            color: var(--text-soft) !important;
            text-decoration: none !important;
            border: 1px solid var(--line);
            background: transparent;
            padding: 0.35rem 0.9rem;
            border-radius: 999px;
            transition: border-color 0.2s ease, color 0.2s ease;
          }
          .close-link:hover {
            border-color: var(--teal);
            color: var(--teal-light) !important;
          }
          .close-foot {
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--line);
          }
          .close-foot-note {
            font-family: var(--font-mono);
            font-size: 0.72rem;
            color: var(--muted);
            letter-spacing: 0.04em;
            margin: 0;
          }
          @media (prefers-reduced-motion: reduce) {
            .close-link { transition: none !important; }
          }
        ` }} />
        <div className="container">
          <div className="reveal">
            <span className="close-line" aria-hidden="true" />
            <p className="close-tagline">
              {locale === 'es' ? 'Hablemos' : "Let's talk"}
            </p>
            <h2 className="close-name">Steven Vallejo Ortiz</h2>
            <p className="close-sub">
              {locale === 'es'
                ? 'Ingeniero de software · Filósofo · Colombia'
                : 'Software engineer · Philosopher · Colombia'}
            </p>
            <nav
              className="close-links"
              aria-label={locale === 'es' ? 'Contacto y redes' : 'Contact and social'}
            >
              <a
                href="https://services.stevenvallejo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="close-link"
              >
                {locale === 'es' ? 'Contratar servicios' : 'Hire me'} ↗
              </a>
              <a
                href="https://github.com/stevenvo780"
                target="_blank"
                rel="noopener noreferrer"
                className="close-link"
              >
                GitHub ↗
              </a>
              <a
                href="https://www.linkedin.com/in/steven-vallejo/"
                target="_blank"
                rel="noopener noreferrer"
                className="close-link"
              >
                LinkedIn ↗
              </a>
              <a
                href="https://blog.stevenvallejo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="close-link"
              >
                Blog ↗
              </a>
              <a
                href="https://informatico.stevenvallejo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="close-link"
              >
                {locale === 'es' ? 'Hoja de vida' : 'Résumé'} ↗
              </a>
            </nav>

            <div className="close-foot">
              <p className="close-foot-note">
                {locale === 'es'
                  ? 'Pensar antes de construir: ese es todo el método.'
                  : 'Think before you build: that is the whole method.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
