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

const css = (o: Record<string, string | number>) => o as CSSProperties;

/** Chrónos: el reloj (su isotipo de cuatro anillos) barre las horas, que caen en la semana y ruedan a la cuenta de cobro. */
export default function Art({ locale }: ArtProps) {
  return (
    <div className="art art-devkits-hours" aria-hidden="true">
      <div className="dl">
        {/* Esfera: doce marcas (las cuatro mayores en verde azulado), el isotipo de Chrónos y el horario a las 10:10. */}
        <svg className="qf" viewBox="0 0 100 100" fill="none" strokeWidth="4.5">
          <circle cx="50" cy="50" r="45" stroke="#e8e0d470" pathLength={240} strokeDasharray="1.2 18.8" strokeDashoffset=".6" />
          <circle cx="50" cy="50" r="45" stroke="#6fd3c4" pathLength={240} strokeDasharray="2.4 57.6" strokeDashoffset="1.2" />
          <g stroke="#43b5a699" strokeWidth="2.1">
            <circle cx="49.5" cy="35.9" r="15.1" />
            <circle cx="36.1" cy="50.3" r="15.1" />
            <circle cx="63.9" cy="49.5" r="15.1" />
            <circle cx="50.5" cy="63.9" r="15.1" />
          </g>
          <path d="M50 50 29.5 35.7" stroke="#e8e0d4" strokeWidth="3.4" strokeLinecap="round" />
        </svg>
        <div className="sw" />
      </div>
      {[0, 1, 2].map((i) => (
        <i key={i} className="ch" style={css({ '--i': i })} />
      ))}
      <div className="bs">
        {DIAS.map((d, i) => (
          <span key={i} className={`b${i === HOY ? ' t' : ''}${i > 4 ? ' w' : ''}`} style={css({ '--i': i, '--h': d.h })}>
            <span>{d[locale]}</span>
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
        <i className="st">
          <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="#10b981" strokeWidth="3.2" strokeLinecap="round">
            <path d="m6.5 12.5 3.8 3.8 7.2-8" />
          </svg>
        </i>
      </div>
    </div>
  );
}
