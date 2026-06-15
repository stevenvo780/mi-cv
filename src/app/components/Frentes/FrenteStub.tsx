'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import {
  frentesMeta,
  productosPorFrente,
  type FrenteId,
} from '@/data/frentes';
import FrenteInformaticaReal from './FrenteInformatica';

type Locale = 'es' | 'en';

interface FrenteStubProps {
  frente: FrenteId;
}

/**
 * Minimal Phase-2 placeholder for a front section. Renders the canonical
 * eyebrow/heading/description from frentes.ts plus a quick list of its
 * products so the long-scroll shell is meaningful and compiles. The rich
 * per-front components (Cormorant + ParticleFlow for Filosofía, Lorenz for
 * Ciencias, graph for Informática, gold+rust + PRISMA for Enterprise) replace
 * this in Phase 3 — each consuming the same frentes.ts data.
 */
export default function FrenteStub({ frente }: FrenteStubProps) {
  const params = useParams();
  const locale: Locale = params.locale === 'es' ? 'es' : 'en';
  const meta = frentesMeta[frente];
  const items = productosPorFrente(frente);

  return (
    <section
      id={frente}
      style={{ position: 'relative', scrollMarginTop: '80px', padding: '4rem 0' }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="reveal">
          <div className="brand-eyebrow">
            <span className="brand-sec-no">{meta.secNo}</span> &nbsp;
            {meta.nombre[locale]}
          </div>
          <h2 className="brand-gradient-text" style={{ marginTop: '0.5rem' }}>
            {meta.tagline[locale]}
          </h2>
          <p style={{ maxWidth: '60ch' }}>{meta.descripcion[locale]}</p>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1.5rem' }}>
          {items.map((p) => (
            <li key={p.id} className="reveal" style={{ marginBottom: '0.4rem' }}>
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  {p.nombre}
                </a>
              ) : (
                <span>{p.nombre}</span>
              )}
              {p.subtitulo ? (
                <span style={{ color: 'var(--muted)', marginLeft: '0.5rem', fontSize: '0.85em' }}>
                  — {p.subtitulo[locale]}
                </span>
              ) : null}
              {p.badge ? (
                <span className="brand-chip" style={{ marginLeft: '0.6rem' }}>
                  {p.badge[locale]}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FrenteFilosofia() {
  return <FrenteStub frente="filosofia" />;
}
export function FrenteCiencias() {
  return <FrenteStub frente="ciencias" />;
}
export function FrenteInformatica() {
  return <FrenteInformaticaReal />;
}
/* FrenteEnterprise removed: enterprise frente merged into Ingeniería (informatica). */
