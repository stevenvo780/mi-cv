import type { CSSProperties } from 'react';

// Apothḗke: una estantería axonométrica (CSS 3D). Cada hueco guarda cajas y, en el canto de su balda, una barra de
// nivel de stock; un haz de escáner la recorre. El hueco central de arriba está bajo mínimo (stock <= minStock, la
// condición con la que la app avisa): al activar la tarjeta sale un pedido, llega la reposición y el aviso se resuelve.
// Geometría en unidades del mundo (1 = 1cqw): x a lo largo, y hacia abajo, z hacia el espectador.
const v = (o: Record<string, number | string>) => o as CSSProperties;

// Cajas: x, balda (16, 4.5, −7), ancho y alto si no son los de siempre (9 × 8.5, en el CSS).
const CAJAS: [number, number, number?, number?][] = [
  [-31.5, 16],
  [-9.5, 16, 10, 6],
  [1.5, 16, 8],
  [12.5, 16],
  [22.5, 16, 9, 5.5],
  [22.5, 10.5, 9, 3.5],
  [-31.5, 4.5, 9, 7],
  [-21.5, 4.5, 9, 7],
  [-9.5, 4.5, 19],
  [12.5, 4.5],
  [22.5, 4.5],
  [-31.5, -7],
  [-21.5, -7, 9, 6],
  [-9.5, -7, 4.5, 3],
  [12.5, -7, 9, 7],
  [22.5, -7, 9, 7],
];
// Barras de nivel: x, balda, fracción de stock.
const NIVELES: [number, number, string][] = [
  [-31, 16, '.9'],
  [-9, 16, '.7'],
  [13, 16, '.85'],
  [-31, 4.5, '.75'],
  [-9, 4.5, '.6'],
  [13, 4.5, '.95'],
  [-31, -7, '.8'],
  [13, -7, '.7'],
];
const caja = (x: number, b: number, w = 9, h = 8.5) => v({ '--x': x, '--b': b, ...(w - 9 ? { '--w': w } : {}), ...(h - 8.5 ? { '--h': h } : {}) });

export default function Art() {
  return (
    <div className="art art-warehouse" aria-hidden="true">
      <div className="qm">
        <i className="qg" style={v({ '--w': 156, '--h': 104, '--x': -78, '--y': 19, '--z': 52 })} />
        <i className="qb" style={v({ '--w': 68, '--h': 35, '--x': -34, '--y': -18.5, '--z': -8 })} />
        <i className="qr" style={v({ '--w': 22, '--h': 16, '--x': -11, '--y': -7.05, '--z': 8 })} />
        <i className="qs" style={v({ '--w': 16, '--h': 38.5, '--x': -34, '--y': -19.5, '--z': 8 })} />
        {[16, 4.5, -7, -18.5].map((y) => (
          <i key={y} className="qf" style={v({ '--y': y })} />
        ))}
        {[-34, -12, 10, 32].map((x) => (
          <i key={x} className="qp" style={v({ '--x': x })} />
        ))}
        {CAJAS.map(([x, b, w, h]) => (
          <i key={`${x},${b}`} className="qc" style={caja(x, b, w, h)} />
        ))}
        <i className="qc qo" style={caja(-21.5, 16)} />
        <i className="qc qn" style={caja(1.5, -7)} />
        {NIVELES.map(([x, b, s]) => (
          <i key={`${x},${b}`} className="qv" style={v({ '--x': x, '--b': b, '--s': s })} />
        ))}
        <i className="qv ql" style={v({ '--x': -9, '--b': -7, '--s': '.18' })} />
        <i className="qz" style={v({ '--w': 19, '--h': 40, '--x': 0, '--y': -20.5, '--z': 10 })} />
      </div>
      <p className="qa">
        <span>● stock &gt; minStock</span>
        <span className="qx">▲ stock ≤ minStock</span>
      </p>
    </div>
  );
}
