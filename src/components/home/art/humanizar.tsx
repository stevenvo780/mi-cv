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

// Rejilla de solares según el número de productos (4 × 3 con 12; en retrato se gira a 3 × 4).
const COLS = Math.max(1, Math.ceil(Math.sqrt((PRODUCTOS * 4) / 3)));
const FILAS = Math.max(1, Math.ceil(PRODUCTOS / COLS));
const LADO = Math.min(COLS, FILAS);

// Alturas (en décimas de manzana): más altas al fondo, torres esbeltas, bloques bajos delante. El retiro de cada solar
// sale de su altura (en la hoja).
const ALTO = [8, 11, 6, 9, 5, 13, 7, 8, 4, 6, 3, 5];
// Ventanas: sodio casi todas (el de la hoja, sin marcado: 0), algunas más claras o frías.
const LUZ = [0, '#ffe3a3', 0, '#9fe8df', '#ffe3a3', 0, 0, '#eef2fa', '#ffe3a3', 0, '#9fe8df', 0];
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
// Pedidos en ruta: calle, duración (s) y --s, la pose quieta (fracción del recorrido, sin el cero), que también fija
// el desfase. Casi todos van por las dos avenidas del frente, donde se ven enteros: esa calle y su duración (10 s la
// del frente, 11 s la del este) las pone la hoja.
const PAQUETES: { v?: 1; r?: Calle; d?: number; s: string }[] = [
  { s: '.2' },
  { s: '.53' },
  { s: '.87' },
  { v: 1, s: '.1' },
  { v: 1, s: '.43' },
  { v: 1, s: '.76' },
  { r: 2, d: 12, s: '.3' },
  { v: 1, r: 1, d: 12, s: '.65' },
];
// Rutas de los agentes: una vuelta por las calles entre dos esquinas opuestas (x, y) → (X, Y), dentro de 0‥3 (vale en
// 4×3 y en 3×4) y lejos del fondo, para que el vuelo no se salga por arriba.
const RUTAS = [
  [1, 1, 3, 2],
  [0, 2, 2, 3],
  [3, 0, 2, 3],
];
const AGENTE = ['var(--art-a)', 'var(--art-b)', '#f2f5ff'];

const css = (o: Record<string, string | number | undefined>) => o as CSSProperties;

export default function Art({ locale }: ArtProps) {
  // El contador reposa en los productos y, al pasar, suma los servicios.
  const pasos = Array.from({ length: SERVICIOS + 1 }, (_, i) => String(PRODUCTOS + i).padStart(2, '0')).join('\n');
  return (
    <div className="art art-humanizar" aria-hidden="true" style={css({ '--gc': COLS, '--gr': FILAS })}>
      <div className="pl">
        {/* Sin clases donde basta la etiqueta: líneas <i>, pedidos <u>; en cada módulo, azotea <b>, fachada sur <i> y
            fachada este <s>; en cada agente, anillo <i> y destello <b>. */}
        {LINEAS.map((l, i) => (
          <i key={`l${i}`} className={l.v && 'v'} style={css({ '--r': l.r, '--lc': l.c })} />
        ))}
        {Array.from({ length: PRODUCTOS }, (_, i) => (
          <div
            key={`b${i}`}
            className="b"
            data-k="producto"
            style={css({ '--i': i, '--h': ALTO[i % 12], ...(LUZ[i % 12] && { '--w': LUZ[i % 12] }) })}
          >
            <b />
            <i />
            <s />
          </div>
        ))}
        {PAQUETES.map((p, i) => (
          <u key={`p${i}`} className={p.v && 'v'} style={css({ '--r': p.r, '--d': p.d, '--s': p.s })} />
        ))}
        {Array.from({ length: SERVICIOS }, (_, k) => {
          const [x, y, X, Y] = RUTAS[k % RUTAS.length].map((n) => Math.min(n, LADO));
          return (
            <div
              key={`a${k}`}
              className="ag"
              data-k="servicio"
              style={css({ '--j': PRODUCTOS + k, '--k': k, '--ac': AGENTE[k % AGENTE.length], '--x': x, '--y': y, '--X': X, '--Y': Y })}
            >
              <i />
              <b />
            </div>
          );
        })}
      </div>
      <p className="hud">{locale === 'es' ? 'RED HUMANIZAR' : 'HUMANIZAR NETWORK'}</p>
      <p className="ct" style={css({ '--n': SERVICIOS, '--j': PRODUCTOS })}>
        <span className="od">
          <i>{pasos}</i>
        </span>
        /{String(TOTAL).padStart(2, '0')}
      </p>
      <i className="cp" />
    </div>
  );
}
