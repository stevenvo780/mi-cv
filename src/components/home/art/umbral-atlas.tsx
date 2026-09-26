import type { CSSProperties } from 'react';

/* Umbral: una puerta en un muro, y por ella llegan las escenas del atlas como planos que cruzan el umbral hacia quien
   mira. Cinco planos, uno por área: KS12 (Lorenz, física), KS03 (el campo del corredor, sistemas), KS04 (Vida,
   autómatas), KS05 (curvas de complejidad, matemáticas) y KS23 (extrapolación, cómputo: la red se ajusta a la recta
   dentro de la zona de entrenamiento y se aparta fuera). Los colores salen de la paleta del sitio por clase
   (umbral-atlas.css). */
const v = (i: number) => ({ '--i': i }) as CSSProperties;

// Atractor de Lorenz (σ = 10, ρ = 28, β = 8/3), integrado con RK4 y proyectado en el plano x–z con la misma escala (2)
// en los dos ejes: la mariposa canónica, algo más alta que ancha.
const LORENZ =
  'M83 81l-4 3-5-1-5-6-5-9-6-14-4-15-1-11 2-5 3-1 4 3 14 15 9 13 7 17 4 3 3 0 3-3 7-12 5-16 0-7-1-3-1-1-2 0-6 5-7 9-5 10-2 8-1 8 2 6 4 2 3-1 4-4 8-14 6-20 0-8 0-5-3-1-5 3-14 16-6 13-5 21-3 3-2 1-4-1-4-5-9-15-6-22-1-9 1-5 2-3 4 2 13 13 10 15 8 20 1 2 3 1 3-1 3-4 7-12 5-18 1-7-1-4-1-1-3 0-6 6-9 11-5 10-2 10 0 10 2 7 1 2 3 0 4-1 4-5 5-7 4-10 4-12 3-12 1-9-1-6-3-1-4 2-13 13-11 15-8 18-3 2-3 0-3-3-6-11-5-16-1-6 1-4 2 0 2 0 5 5 7 8 5 9 2 8 0 8-2 5-3 2-3-1-4-3-7-12-6-19-1-7 1-5 1-2 2 0 4 2 8 9 7 10 6 14 3 25 1 3 3 1 5-2 5-6 6-9 4-10 5-15 3-14 1-12-1-6-1-1-3 0-9 7-18 21-11 17-3 3-2 0-3-2-4-7-4-11 1-7 2 0 3 3 7 10 2 10 0 4-2 1-3 0-2-2-5-8-4-12 1-7 2 0 4 3 5 6 3 6 2 10-1 4-2 2-2 0-3-2-6-10-4-13 0-5 1-3 3 0 4 4 5 6 4 8 2 6 0 5-1 5-2 2-3 0-3-3-6-10-4-15-1-6 1-4 3 0 5 4 6 8 5 8 2 8 0 6-1 6-3 2-3 0-4-3-7-13-5-18-1-7 1-4 2-1 2 1 7 6 7 10 5 10 3 9 0 10-2 6-3 3-4-1-5-5-4-6-5-10-6-22-1-10 1-6 2-1 4 1 13 14 10 15 8 18 3 3 4-1 3-2 7-12 5-18 0-7-1-3-3-1-5 4-6 8-5 8-5 13 0 12';

export default function Art() {
  return (
    <div className="art art-umbral-atlas" aria-hidden="true">
      <i className="st">
        <i className="vo" />
        <i className="fb" />
        <svg className="pl" viewBox="0 0 80 50" style={v(0)}>
          <path className="g" d={LORENZ} strokeWidth="1.2" transform="scale(.5)" />
        </svg>
        <svg className="pl" viewBox="0 0 80 50" style={v(1)}>
          <path className="f" d="M40 24 73 36 40 48 7 36z" />
          <path className="c" d="M22 37l2-15 2 15zM31 33l2-19 2 19zM41 38l2-24 2 24zM50 34l2-17 2 17zM36 43l2-14 2 14zM57 39l2-12 2 12z" fill="currentColor" />
        </svg>
        <svg className="pl" viewBox="0 0 80 50" style={v(2)}>
          <path
            d="M20 14h3M24 18h3M16 22h3m1 0h3m1 0h3M48 26h3m1 0h3m1 0h3M60 38h3m1 0h3M60 42h3m1 0h3M32 34h3m1 0h3M28 38h3m9 0h3M32 42h3m1 0h3"
            strokeWidth="3"
            strokeLinecap="butt"
          />
        </svg>
        <svg className="pl" viewBox="0 0 80 50" style={v(3)}>
          <path className="m" d="M8 12v32h66" opacity=".5" />
          <path className="m" d="M8 44q12-8 66-10" />
          <path className="v" d="M8 44 74 28" />
          <path className="e" d="M8 44q42-10 66-24" />
          <path d="M8 44q48-4 60-32" />
          <path className="r" d="M8 44c42 0 48-8 52-32" />
          <path className="g" d="M8 44c30 0 38-6 42-32" />
        </svg>
        <svg className="pl" viewBox="0 0 80 50" style={v(4)}>
          <path className="c" d="M8 12h32v32H8z" fill="currentColor" fillOpacity=".06" stroke="none" />
          <path className="m" d="M40 12v32" strokeDasharray="1.5 1.5" />
          <path className="g" d="M10 40 72 10" />
          <path className="e" d="M10 40 40 25.5q16-7.7 32-8" />
          <path className="c" d="M12 39h0m6-3h0m6-3h0m6-3h0m6-3h0" strokeWidth="2.4" />
        </svg>
        <i style={v(0)} />
        <i style={v(1)} />
        <i style={v(2)} />
        <i style={v(3)} />
        <i style={v(4)} />
        <i style={v(5)} />
        <i style={v(6)} />
        <i style={v(7)} />
        <i className="dr" />
        <i className="ff" />
      </i>
    </div>
  );
}
