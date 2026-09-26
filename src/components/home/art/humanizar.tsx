import type { CSSProperties } from 'react';
import { catalogoGrupos, catalogos } from '@/data/frentes';
import type { ArtProps } from './types';

/*
 * Humanizar: la ciudad de noche del catálogo (catalogo.humanizar.tech), vista en isométrico. Cada producto es un
 * módulo con su estación en la azotea; cada servicio, un agente que vuela entre ellos; por las líneas de metro
 * corren los pedidos (sodio) que llegan como factura (turquesa). Cifras y colecciones salen de data/frentes.
 */
const cat = catalogos.find((c) => c.id === 'humanizar');
const grupos = cat ? catalogoGrupos(cat) : [];
const cuenta = (k: string) => grupos.find((g) => g.kind === k)?.items.length ?? 0;
const PRODUCTOS = cuenta('producto');
const SERVICIOS = cuenta('servicio');
const TOTAL = PRODUCTOS + SERVICIOS;

// Alturas (en décimas de manzana) y retiro de cada solar: más altas al fondo, torres esbeltas, bloques bajos delante.
const ALTO = [8, 11, 6, 9, 5, 13, 7, 8, 4, 6, 3, 5];
const RETIRO = [0.22, 0.28, 0.19, 0.26, 0.18, 0.29, 0.22, 0.27, 0.17, 0.23, 0.16, 0.21];
// Ventanas: sodio casi todas, algunas frías.
const LUZ = [
  '#ffc65c',
  '#ffe3a3',
  '#ffc65c',
  '#9fe8df',
  '#ffe3a3',
  '#ffc65c',
  '#ffc65c',
  '#eef2fa',
  '#ffe3a3',
  '#ffc65c',
  '#9fe8df',
  '#ffc65c',
];
// Calles: índice del borde de celda; var(--R) y var(--C) son las avenidas del frente, que nada tapa.
type Calle = number | 'var(--R)' | 'var(--C)';
// Líneas del plano (sus colores en el sitio): Venta, Datos y reportes, Pedidos y despacho, Inventario,
// Clientes y cartera, Facturación.
const LINEAS: { v?: 1; r: Calle; c: string }[] = [
  { r: 1, c: '#ff6b57' },
  { r: 2, c: '#3fd6ff' },
  { v: 1, r: 1, c: '#b8f03c' },
  { v: 1, r: 2, c: '#b592ff' },
  { r: 'var(--R)', c: '#ff5fa8' },
  { v: 1, r: 'var(--C)', c: '#e9d8b0' },
];
// Pedidos en ruta: calle y duración (s); --s es la pose quieta (fracción del recorrido) y fija el desfase.
const PAQUETES: { v?: 1; r: Calle; d: number; s: number }[] = [
  { r: 'var(--R)', d: 9, s: 0.25 },
  { r: 'var(--R)', d: 9, s: 0.75 },
  { v: 1, r: 'var(--C)', d: 10, s: 0.45 },
  { v: 1, r: 'var(--C)', d: 10, s: 0.95 },
  { r: 1, d: 11, s: 0.6 },
  { r: 2, d: 12, s: 0.15 },
  { v: 1, r: 1, d: 12, s: 0.8 },
  { v: 1, r: 2, d: 11, s: 0.35 },
];
// Rutas de los agentes: las cuatro esquinas (x, y) de una vuelta por las calles, dentro de 0‥3 (vale en 4×3 y en 3×4)
// y lejos del fondo, para que el vuelo no se salga por arriba.
const RUTAS = [
  [1, 1, 3, 1, 3, 2, 1, 2],
  [0, 2, 2, 2, 2, 3, 0, 3],
  [3, 0, 3, 3, 2, 3, 2, 0],
];
const AGENTE = ['var(--art-a)', 'var(--art-b)', '#f2f5ff'];

const css = (o: Record<string, string | number>) => o as CSSProperties;

export default function Art({ locale }: ArtProps) {
  const pasos = Array.from({ length: TOTAL + 1 }, (_, i) => String(i).padStart(2, '0')).join('\n');
  return (
    <div className="art art-humanizar" aria-hidden="true">
      <div className="pl">
        {LINEAS.map((l, i) => (
          <i key={`l${i}`} className={l.v ? 'ln v' : 'ln'} style={css({ '--r': l.r, '--lc': l.c })} />
        ))}
        {Array.from({ length: PRODUCTOS }, (_, i) => (
          <div
            key={`b${i}`}
            className="b"
            data-k="producto"
            style={css({
              '--i': i,
              '--h': ALTO[i % 12],
              '--m': RETIRO[i % 12],
              '--w': LUZ[i % 12],
            })}
          >
            <b className="t" />
            <b className="s" />
            <b className="e" />
          </div>
        ))}
        {PAQUETES.map((p, i) => (
          <i
            key={`p${i}`}
            className={p.v ? 'p v' : 'p'}
            style={css({
              '--r': p.r,
              '--d': `${p.d}s`,
              '--dl': `${-p.s * p.d}s`,
              '--s': p.s,
              '--f': p.s > 0.5 ? 1 : 0,
            })}
          />
        ))}
        {Array.from({ length: SERVICIOS }, (_, j) => {
          const r = RUTAS[j % RUTAS.length];
          const v: Record<string, string | number> = {
            '--j': PRODUCTOS + j,
            '--ac': AGENTE[j % AGENTE.length],
            '--za': 12 - (j % 3),
            '--d': `${15 + j * 4}s`,
            '--dl': `${-j * 3}s`,
          };
          for (let k = 0; k < 4; k++) v[`--a${k}`] = `calc(${r[2 * k]} * var(--c)) calc(${r[2 * k + 1]} * var(--c))`;
          return (
            <div key={`a${j}`} className="ag" data-k="servicio" style={css(v)}>
              <b className="rg" />
              <b className="bm" />
              <b className="orb" />
            </div>
          );
        })}
      </div>
      <p className="hud">{locale === 'es' ? 'RED HUMANIZAR' : 'HUMANIZAR NETWORK'}</p>
      <p className="ct" style={css({ '--n': TOTAL })}>
        <span className="od">
          <i>{pasos}</i>
        </span>
        /{String(TOTAL).padStart(2, '0')}
      </p>
      <i className="cp" />
    </div>
  );
}
