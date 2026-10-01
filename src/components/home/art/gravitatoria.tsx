/* Gravitatoria: comercios que se encuentran e intercambian en una red municipal.
   El mapa es abstracto; cada actor tiene un local propio, nunca un nodo de infraestructura. */
const SHOPS = [
  [154, 73, 's back'],
  [82, 106, 's teal'],
  [238, 101, 's'],
  [48, 150, 's gold'],
  [105, 167, 's back'],
  [255, 161, 's teal'],
  [153, 144, 's main'],
] as const;

export default function Art() {
  return (
    <div className="art art-gravitatoria" aria-hidden="true">
      <svg viewBox="0 0 320 200">
      <defs>
        <linearGradient id="art-gravitatoria-g" x2=".3" y2="1">
          <stop stopColor="#236fb6" />
          <stop offset="1" stopColor="#0b3c70" />
        </linearGradient>
        <path id="art-gravitatoria-m" d="M29 129l27-24 25-8 18-26 37-8 25 8 24-13 30 16 19 2 33 22 24 29-16 21 9 15-35 16-34-3-30 14-34-11-30 6-26-19-23-1z" />
        <g id="art-gravitatoria-s">
          <ellipse cy="3" rx="21" ry="7" fill="#031d41" opacity=".4" />
          <path d="M-21 0 0-9 21 0 0 9z" fill="#256fab" stroke="#7bd4f7" strokeWidth=".65" />
          <path d="M14-25l7-4V-4l-7 4z" fill="#76b5d6" />
          <path d="M-14-25h28V0h-28z" fill="#e2f5ff" />
          <path d="m-14-25 7-4h28l-7 4z" fill="#fff" />
          <path d="M-16-19h31l3 7h-36z" fill="var(--shop)" />
          <path d="m-10-19-2 7m10-7-1 7m9-7 1 7m7-7 2 7" stroke="#ebf8ff" strokeWidth="3.3" />
          <path d="M-10-8H0v7h-10zM5-8h6v8H5z" fill="var(--shop)" />
          <path d="M-5-23h10M-8-5h6" stroke="var(--shop)" />
        </g>
        <g id="art-gravitatoria-e">
          <circle r="4.2" fill="#ffd588" stroke="#fff3cb" strokeWidth=".5" />
          <path d="M-2.5-1h5L1-2.5M2.5 1h-5L-1 2.5" stroke="#835c22" strokeWidth=".7" />
        </g>
      </defs>
      <ellipse className="orbit" cx="160" cy="130" rx="150" ry="59" />
      <path className="stars" d="M31 56h0m22-25h0m59 5h0m93-9h0m66 31h0m22 34h0M21 107h0m10 66h0m256 10h0" />
      <use className="depth" href="#art-gravitatoria-m" y="7" />
      <use className="map" href="#art-gravitatoria-m" />
      <path className="district" d="m42 129 49-20 16-35m-16 35 40 22 5 41m-5-41 46-21 30 17 34-19m-64 2 8-44m-8 44 13 37 61 13M59 143l40-4 9 31" />
      <g className="coverage">
        <ellipse cx="153" cy="137" rx="70" ry="30" />
        <ellipse cx="153" cy="137" rx="88" ry="39" />
      </g>
      <path className="link" d="M82 106Q101 55 153 144Q202 57 238 101M48 150Q80 107 153 144Q216 112 255 161M154 73Q117 83 82 106M238 101Q224 137 255 161" />
      <path className="link fine" d="M154 73Q184 63 238 101M48 150Q72 174 105 167Q125 126 197 117Q230 125 255 161" />
      {SHOPS.map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <use className={c} href="#art-gravitatoria-s" />
        </g>
      ))}
      <use className="exchange e1" href="#art-gravitatoria-e" />
      <use className="exchange e2" href="#art-gravitatoria-e" />
      <use className="exchange e3" href="#art-gravitatoria-e" />
      <path className="spark" d="M153 101v7m-3.5-3.5h7M259 121v5m-2.5-2.5h5" />
      </svg>
    </div>
  );
}
