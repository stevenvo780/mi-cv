import type { CSSProperties } from 'react';

// Nómos: la balanza de la ley sostiene el índice. En sus platillos, las dos fuentes (CO y DO, códigos ISO); al centro,
// la página de un texto legislativo («Art. 1», «Art. 2») que un haz de búsqueda recorre marcando coincidencias en
// dorado, como el <mark> del buscador del sitio. Activa: los documentos saltan de ambos platillos al índice y se
// encienden más marcas. En el SVG, px son unidades del viewBox: todo escala con la caja.
const v = (o: Record<string, number | string>) => o as CSSProperties;

// Renglones de la página (y, largo); los pares se trazan de derecha a izquierda para que las «palabras» no se alineen.
const RENGLONES: [number, number][] = [
  [42.5, 33],
  [46.5, 30],
  [50.5, 33],
  [54.5, 19],
  [68, 33],
  [72, 27],
  [76, 33],
  [80, 22],
];
const texto = RENGLONES.map(([y, l], i) => (i % 2 ? `M${63.5 + l} ${y}h-${l}` : `M63.5 ${y}h${l}`)).join('');

// Coincidencias: x, renglón, ancho (palabras enteras del trazo discontinuo, con 0.6 de margen) y si solo aparece al
// activar. --f es la fracción del barrido en que el haz la cruza; el CSS saca de ella la altura.
const MARCAS: [number, number, number, boolean][] = [
  [69.4, 46.5, 13.7, false],
  [82.4, 50.5, 9.2, true],
  [63.9, 54.5, 8.2, false],
  [73.9, 68, 13.7, false],
  [62.9, 72, 8.7, true],
  [69.4, 76, 12.7, true],
];

// Un platillo: el arco por donde salta al índice, las hojas que salen, las que esperan, cadenas y platillo, y su fuente.
function Platillo({ x, s, fuente }: { x: number; s: number; fuente: string }) {
  return (
    <g className="pan" style={v({ '--s': s })}>
      <path className="arc" d={`M${x} 39Q${x + s * 22} 15 ${x + s * 44} 35`} />
      {[0, 1, 2].map((i) => (
        <path key={i} className="fly" d={`M${x - 2.5} 35.8h3.4l1.6 1.6v4.9h-5z`} style={v({ '--i': i })} />
      ))}
      <path className="rs" d={`M${x - 6.7} 35.5l6.9-1 1.4 9.9-6.9 1zM${x - 0.4} 33.6l7 .9-1.2 9.9-7-.9z`} />
      <path d={`M${x} 16 ${x - 11} 44M${x} 16 ${x + 11} 44M${x - 12} 44h24a12 6.5 0 0 1-24 0z`} />
      <text x={x} y={49.5}>
        {fuente}
      </text>
    </g>
  );
}

export default function Art() {
  return (
    <svg className="art art-scrapekit" viewBox="0 0 160 100" aria-hidden="true">
      <defs>
        <linearGradient id="art-scrapekit-b" x2="0" y2="1">
          <stop offset="0" stopColor="#43b5a6" stopOpacity="0" />
          <stop offset=".5" stopColor="#43b5a6" stopOpacity=".42" />
          <stop offset="1" stopColor="#43b5a6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="art-scrapekit-p" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f1e8" />
          <stop offset="1" stopColor="#ddd3c3" />
        </linearGradient>
      </defs>
      <g className="sc">
        <path d="M80 11V91M69 94h22l-3-3H72z" />
        <circle cx="80" cy="9.5" r="1.7" />
        <g className="bm">
          <path d="M30 16H130" />
          <circle cx="80" cy="16" r="1.3" />
        </g>
      </g>
      <Platillo x={30} s={1} fuente="CO" />
      <Platillo x={130} s={-1} fuente="DO" />
      <g className="st">
        {/* Dos hojas debajo y la página: su caja (59, 28, 42 × 57) va en el CSS. */}
        <rect className="bk" style={v({ '--r': '-7deg' })} />
        <rect className="bk" style={v({ '--r': '5deg' })} />
        <rect className="pg" fill="url(#art-scrapekit-p)" />
        {MARCAS.map(([x, y, w, extra]) => (
          <rect key={y} className={extra ? 'm x' : 'm'} x={x} width={w} style={v({ '--f': ((y - 28) / 58).toFixed(3).slice(1) })} />
        ))}
        <path className="ln" d={texto} />
        <text className="ar" x="63.5" y="37.6">
          Art. 1
        </text>
        <text className="ar" x="63.5" y="63.4">
          Art. 2
        </text>
        <text className="ss" x="96.5" y="37.4">
          §
        </text>
        <g className="bb">
          <rect x="59" y="-5" width="42" height="10" fill="url(#art-scrapekit-b)" />
          <path d="M53 0H107" />
        </g>
      </g>
    </svg>
  );
}
