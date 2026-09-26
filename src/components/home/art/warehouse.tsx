import type { CSSProperties } from 'react';

// Apothḗke: una estantería axonométrica (CSS 3D). Cada hueco guarda cajas y, en el canto de su balda, una barra de
// nivel de stock; un haz de escáner la recorre. El hueco central de arriba está bajo mínimo (stock <= minStock, la
// condición con la que la app avisa): al activar la tarjeta sale un pedido, llega la reposición y el aviso se resuelve.
// Geometría en unidades del mundo (1 = 1cqw): x a lo largo, y hacia abajo, z hacia el espectador.
const v = (o: Record<string, number>) => o as CSSProperties;

// Cajas: x, y de la balda (16, 4.5, −7), ancho, alto.
const CAJAS: [number, number, number, number][] = [
  [-31.5, 16, 9, 8.5],
  [-9.5, 16, 10, 6],
  [1.5, 16, 8, 8.5],
  [12.5, 16, 9, 8.5],
  [22.5, 16, 9, 5.5],
  [22.5, 10.5, 9, 3.5],
  [-31.5, 4.5, 9, 7],
  [-21.5, 4.5, 9, 7],
  [-9.5, 4.5, 19, 8.5],
  [12.5, 4.5, 9, 8.5],
  [22.5, 4.5, 9, 8.5],
  [-31.5, -7, 9, 8.5],
  [-21.5, -7, 9, 6],
  [-9.5, -7, 8, 4.5],
  [12.5, -7, 9, 7],
  [22.5, -7, 9, 7],
];
// Barras de nivel: x, y de la balda, fracción de stock.
const NIVELES: [number, number, number][] = [
  [-31, 16, 0.9],
  [-9, 16, 0.7],
  [13, 16, 0.85],
  [-31, 4.5, 0.75],
  [-9, 4.5, 0.6],
  [13, 4.5, 0.95],
  [-31, -7, 0.8],
  [13, -7, 0.7],
];
const caja = (x: number, y: number, w: number, h: number) => v({ '--x': x, '--y': y - h, '--w': w, '--h': h });

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
        {CAJAS.map(([x, y, w, h]) => (
          <i key={`${x},${y}`} className="qc" style={caja(x, y, w, h)} />
        ))}
        <i className="qc qo" style={caja(-21.5, 16, 9, 8.5)} />
        <i className="qc qn" style={caja(1.5, -7, 9, 8.5)} />
        {NIVELES.map(([x, y, s]) => (
          <i key={`${x},${y}`} className="qv" style={v({ '--x': x, '--y': y + 0.45, '--s': s })} />
        ))}
        <i className="qv ql" style={v({ '--x': -9, '--y': -6.55, '--s': 0.18 })} />
        <i className="qz" style={v({ '--w': 19, '--h': 40, '--x': 0, '--y': -20.5, '--z': 10 })} />
      </div>
      <p className="qa">
        <span>● stock &gt; minStock</span>
        <span className="qx">▲ stock ≤ minStock</span>
      </p>
    </div>
  );
}
