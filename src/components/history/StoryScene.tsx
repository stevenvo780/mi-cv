import './StoryScene.css';

type StorySceneProps = { id: string; compact?: boolean };
type Point = [number, number];

const pair = ([x, y]: Point) => `${Math.round(x)},${Math.round(y)}`;

// Geometry and surface lighting are evaluated on the server, without a client runtime.
function ribbonPoint(t: number, edge = 0, depth = 0): Point {
  const dx = -302 * Math.sin(t);
  const dy = 294 * Math.cos(t * 2);
  const normal = Math.hypot(dx, dy);
  const width = 29 + 11 * Math.sin(t + .7);
  return [450 + 302 * Math.cos(t) - dy / normal * width * edge - depth * 12, 321 + 147 * Math.sin(t * 2) + dx / normal * width * edge + depth * 15];
}

function ribbonCurve(start: number, end: number, edge: number, depth = 0, move = true) {
  const step = (end - start) / 12;
  const tangent = (t: number): Point => {
    const a = ribbonPoint(t - .001, edge, depth);
    const b = ribbonPoint(t + .001, edge, depth);
    return [(b[0] - a[0]) / .002, (b[1] - a[1]) / .002];
  };
  return `${move ? 'M' : 'L'}${pair(ribbonPoint(start, edge, depth))}` + Array.from({ length: 12 }, (_, i) => {
    const t = start + i * step;
    const next = t + step;
    const a = ribbonPoint(t, edge, depth);
    const b = ribbonPoint(next, edge, depth);
    const da = tangent(t);
    const db = tangent(next);
    return `C${pair([a[0] + da[0] * step / 3, a[1] + da[1] * step / 3])} ${pair([b[0] - db[0] * step / 3, b[1] - db[1] * step / 3])} ${pair(b)}`;
  }).join('');
}

function ribbonHalf(start: number, back: boolean) {
  const end = start + Math.PI;
  const face = `${ribbonCurve(start, end, -1)}${ribbonCurve(end, start, 1, 0, false)}Z`;
  const side = `${ribbonCurve(start, end, 1)}${ribbonCurve(end, start, 1, 1, false)}Z`;
  const edges = [-1, 1].map(edge => ribbonCurve(start, end, edge));
  return { face, side, edges, back };
}

const halves = [ribbonHalf(Math.PI, true), ribbonHalf(0, false)];

export default function StoryScene({ id, compact = false }: StorySceneProps) {
  const prefix = `story-${id}`;
  const ref = (name: string) => `url(#${prefix}-${name})`;

  return (
    <div className={`story-scene${compact ? ' story-compact' : ''}`} aria-hidden="true" data-story-scene>
      <svg viewBox="0 0 900 650" fill="none" focusable="false">
        <defs>
          <radialGradient id={`${prefix}-aura`}>
            <stop stopColor="#43b5a6" stopOpacity=".22" />
            <stop offset=".55" stopColor="#43b5a6" stopOpacity=".07" />
            <stop offset="1" stopColor="#43b5a6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${prefix}-warm`}>
            <stop stopColor="#e0a85e" stopOpacity=".2" />
            <stop offset="1" stopColor="#e0a85e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${prefix}-edge`} x1="130" y1="280" x2="765" y2="370" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2b786d" />
            <stop offset=".24" stopColor="#84d7c8" />
            <stop offset=".49" stopColor="#e8e0d4" />
            <stop offset=".78" stopColor="#e0a85e" />
            <stop offset="1" stopColor="#926036" />
          </linearGradient>
          <linearGradient id={`${prefix}-rim`} x1="150" y1="170" x2="740" y2="490" gradientUnits="userSpaceOnUse">
            <stop stopColor="#143a36" />
            <stop offset=".35" stopColor="#22685d" />
            <stop offset=".51" stopColor="#6f705b" />
            <stop offset=".8" stopColor="#72502e" />
            <stop offset="1" stopColor="#261b15" />
          </linearGradient>
          <linearGradient id={`${prefix}-metal`} x1="205" y1="160" x2="705" y2="470" gradientUnits="userSpaceOnUse">
            <stop stopColor="#103b35" />
            <stop offset=".16" stopColor="#286f61" />
            <stop offset=".3" stopColor="#77bcaa" />
            <stop offset=".36" stopColor="#c7e1cd" />
            <stop offset=".41" stopColor="#5b9280" />
            <stop offset=".49" stopColor="#234b3d" />
            <stop offset=".58" stopColor="#66816a" />
            <stop offset=".7" stopColor="#c9b78b" />
            <stop offset=".75" stopColor="#eee0bc" />
            <stop offset=".82" stopColor="#ac8a59" />
            <stop offset="1" stopColor="#51351e" />
          </linearGradient>
          <radialGradient id={`${prefix}-sheen`} cx="407" cy="201" r="320" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f5f1d9" stopOpacity=".46" />
            <stop offset=".32" stopColor="#d7f2e4" stopOpacity=".2" />
            <stop offset=".7" stopColor="#e8e0d4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${prefix}-shadow`}>
            <stop stopColor="#000" stopOpacity=".8" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="260" cy="310" rx="285" ry="265" fill={ref('aura')} />
        <ellipse cx="655" cy="305" rx="270" ry="250" fill={ref('warm')} />
        <ellipse className="story-shadow" cx="450" cy="553" rx="328" ry="43" fill={ref('shadow')} />
        <g className="story-stage" stroke="#43b5a6" strokeWidth=".7" opacity=".2">
          <ellipse cx="450" cy="556" rx="318" ry="31" />
          <ellipse cx="450" cy="556" rx="259" ry="22" />
          <path d="M141 556H758M450 525V587M282 530L248 580M618 530L652 580M184 541L156 571M716 541L744 571" />
        </g>
        <g className="story-field" stroke="#43b5a6" strokeWidth=".6">
          <path d="M92 298C83 102 304 94 450 190C618 300 819 156 816 320C814 500 604 538 450 450C300 366 90 515 92 298Z" opacity=".3" />
          <path d="M60 311C63 80 314 57 459 157C651 290 852 124 850 322C848 547 594 576 437 477C273 374 58 559 60 311Z" opacity=".14" strokeDasharray="2 9" />
        </g>

        <g className="story-engineering" stroke="#43b5a6" strokeWidth="1">
          <path d="M122 296L154 215L229 180L302 223L330 310L288 401L211 436L135 391Z M122 296L229 180L330 310L211 436Z M154 215L288 401L135 391L302 223L211 436M122 296L330 310M154 215L211 436M229 180L288 401" opacity=".58" />
          <path d="M122 296L211 310L229 180M211 310L288 401M211 310L302 223M211 310L135 391" opacity=".28" />
          {[[122, 296], [154, 215], [229, 180], [302, 223], [330, 310], [288, 401], [211, 436], [135, 391]].map(([cx, cy], index) => (
            <circle key={index} cx={cx} cy={cy} r={index % 3 === 0 ? 4 : 2.5} fill="#84d7c8" stroke="#05090b" strokeWidth="1.8" />
          ))}
          <path d="M196 294L211 284L226 294V316L211 327L196 316Z" fill="#43b5a6" fillOpacity=".1" />
        </g>

        <g className="story-philosophy" stroke="#e0a85e" strokeWidth="1">
          <g className="story-orbit-one">
            <ellipse cx="688" cy="308" rx="133" ry="77" transform="rotate(-37 688 308)" opacity=".6" />
            <circle cx="793" cy="229" r="4" fill="#e8e0d4" stroke="none" />
          </g>
          <g className="story-orbit-two">
            <ellipse cx="688" cy="308" rx="98" ry="146" transform="rotate(31 688 308)" opacity=".35" />
            <circle cx="649" cy="170" r="3" fill="#e0a85e" stroke="none" />
          </g>
          <ellipse cx="688" cy="308" rx="143" ry="121" transform="rotate(-16 688 308)" strokeDasharray="1 10" opacity=".3" />
          <path d="M618 164L763 452M548 348L827 270" opacity=".17" />
          <circle cx="688" cy="308" r="13" fill="#e0a85e" fillOpacity=".07" />
          <circle cx="688" cy="308" r="3" fill="#e8e0d4" stroke="none" />
        </g>

        <g className="story-sculpture" strokeLinejoin="round" strokeLinecap="round">
          {halves.map(({ face, side, edges, back }) => (
            <g key={String(back)} className={back ? 'story-ribbon-back' : 'story-ribbon-front'}>
              <path d={face} fill="#020706" transform="translate(4 9)" opacity={back ? '.15' : '.45'} />
              <path d={side} fill={ref('rim')} />
              <path d={face} fill={ref('metal')} />
              <path d={face} fill={ref('sheen')} />
              <path d={edges[1]} stroke={ref('edge')} strokeWidth="1.3" opacity=".58" />
              <path d={edges[0]} stroke={ref('edge')} strokeWidth="2" opacity=".95" />
              <path className={back ? 'story-current story-current-back' : 'story-current'} d={edges[0]} stroke="#e8e0d4" strokeWidth="3.5" strokeDasharray="38 225 6 180" opacity=".9" />
            </g>
          ))}
          <g className="story-inner-current" stroke={ref('edge')} strokeWidth="1" opacity=".8">
            <path d="M189 314C169 231 232 219 293 248C396 298 505 453 610 440C678 432 713 381 710 333" />
            <path d="M710 333C722 249 665 218 609 242C503 288 413 444 288 422C229 412 185 369 189 314" />
          </g>
        </g>

        <g className="story-particles" fill="#e8e0d4">
          <circle cx="368" cy="163" r="2" opacity=".7" />
          <circle cx="564" cy="486" r="2.5" opacity=".8" />
          <circle cx="481" cy="113" r="1.5" opacity=".55" />
          <circle cx="430" cy="507" r="1.5" opacity=".5" />
          <path d="M369 152V174M358 163H380M564 476V496M554 486H574" stroke="#e8e0d4" strokeWidth=".6" opacity=".4" />
        </g>
      </svg>
    </div>
  );
}
