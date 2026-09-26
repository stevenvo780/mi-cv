import type { CSSProperties } from 'react';
import type { ArtProps } from './types';

/* Una semana de ejemplo (lunes a domingo; sábado y domingo en oro, como los filtros por día) y su cuenta de cobro:
   42 h × 42.500 COP/h = $1.785.000. En el total, d es la parada de cada rodillo (las cifras bajas dan más vueltas). */
const DIAS = [
  { es: 'L', en: 'M', h: 8 },
  { es: 'M', en: 'T', h: 7 },
  { es: 'M', en: 'W', h: 9 },
  { es: 'J', en: 'T', h: 6 },
  { es: 'V', en: 'F', h: 8 },
  { es: 'S', en: 'S', h: 4 },
  { es: 'D', en: 'S', h: 0 },
] as const;
const HOY = 3;
const TOTAL: (number | '$' | '.')[] = ['$', 1, '.', 7, 8, 15, '.', 20, 20, 20];
const RODILLO = '012345678901234567890';
/* Estrellas del icono de la app: gris, violeta, oro y verde azulado. */
const ASTROS = [
  [5, 5, '#a3a39b'],
  [94, 5.5, '#8d7cc0'],
  [4, 57, '#e0a85e'],
  [70, 58.5, '#43b5a6'],
] as const;

const css = (o: Record<string, string | number>) => o as CSSProperties;

/** Chrónos: el reloj (su isotipo de cuatro anillos) barre las horas, que caen en la semana y ruedan a la cuenta de cobro. */
export default function Art({ locale }: ArtProps) {
  return (
    <div className="art art-devkits-hours" aria-hidden="true">
      {ASTROS.map(([x, y, c], i) => (
        <i key={i} className="s" style={css({ '--x': x, '--y': y, '--c': c })} />
      ))}
      <div className="dl">
        <div className="tk" />
        <svg className="qf" viewBox="0 0 100 100" fill="none" stroke="#43b5a6" strokeWidth="3.2">
          <circle cx="49.2" cy="28" r="23.6" />
          <circle cx="28.3" cy="50.4" r="23.6" />
          <circle cx="71.7" cy="49.2" r="23.6" />
          <circle cx="50.8" cy="71.7" r="23.6" />
        </svg>
        <div className="sw" />
        <div className="hh" />
      </div>
      {[0, 1, 2].map((i) => (
        <i key={i} className="ch" style={css({ '--i': i })} />
      ))}
      <div className="bs">
        {DIAS.map((d, i) => (
          <span key={i} className={`b${i === HOY ? ' t' : ''}${i > 4 ? ' w' : ''}`} style={css({ '--i': i, '--h': d.h })}>
            <i>{d[locale]}</i>
          </span>
        ))}
      </div>
      <div className="iv">
        {DIAS.map((d, i) => (
          <i key={i} className={i > 4 ? 'r w' : 'r'} style={css({ '--i': i, '--h': d.h })} />
        ))}
        <div className="to">
          <small>COP</small>
          <b>
            {TOTAL.map((d, i) =>
              typeof d === 'number' ? (
                <span key={i} className="d" style={css({ '--d': d, '--i': i })}>
                  <span>{RODILLO}</span>
                </span>
              ) : (
                d
              ),
            )}
          </b>
        </div>
        <svg className="sg" viewBox="0 0 60 16">
          <path pathLength={1} d="M2 12C5 4 8 2 9 5s-3 9 0 8 4-8 7-8-1 7 2 7 3-5 5-5 0 4 2 4 4-3 6-3M35 13c7-2 15-3 23-2" />
        </svg>
        <i className="st">
          <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="#10b981" strokeWidth="3.2" strokeLinecap="round">
            <path d="m6.5 12.5 3.8 3.8 7.2-8" />
          </svg>
        </i>
      </div>
    </div>
  );
}
