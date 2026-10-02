import './StoryScene.css';

// Nombres estables de una hoja acotada a story-*: evita enviar el mapa de un CSS module al cliente de la home.
const styles = {
  scene: 'story-scene', compact: 'story-compact', floor: 'story-floor',
  engineering: 'story-engineering', philosophy: 'story-philosophy', sculpture: 'story-sculpture',
  current: 'story-current', countercurrent: 'story-countercurrent', sparks: 'story-sparks',
};

type StorySceneProps = { id: string; compact?: boolean };

// Geometry is evaluated on the server; the browser receives only SVG and CSS.
function filament(phase: number) {
  const point = (t: number) => [450 + 286 * Math.cos(t) + phase * Math.sin(t), 330 + 132 * Math.sin(2 * t) + phase * Math.cos(t)];
  const slope = (t: number) => [-286 * Math.sin(t) + phase * Math.cos(t), 264 * Math.cos(2 * t) - phase * Math.sin(t)];
  const pair = (p: number[]) => p.map((value) => value.toFixed(0)).join(',');
  const step = Math.PI / 4;
  return `M${pair(point(0))}` + Array.from({ length: 8 }, (_, index) => {
    const start = point(index * step);
    const end = point((index + 1) * step);
    const incoming = slope(index * step);
    const outgoing = slope((index + 1) * step);
    return `C${pair(start.map((value, axis) => value + incoming[axis] * step / 3))} ${pair(end.map((value, axis) => value - outgoing[axis] * step / 3))} ${pair(end)}`;
  }).join('');
}

export default function StoryScene({ id, compact = false }: StorySceneProps) {
  const prefix = `story-${id}`;
  const ref = (name: string) => `url(#${prefix}-${name})`;

  return (
    <div
      className={`${styles.scene}${compact ? ` ${styles.compact}` : ''}`}
      aria-hidden="true"
      data-story-scene
    >
      <svg viewBox="0 0 900 650" fill="none" focusable="false">
        <defs>
          <radialGradient id={`${prefix}-aura`}>
            <stop stopColor="#43b5a6" stopOpacity=".15" />
            <stop offset=".63" stopColor="#43b5a6" stopOpacity=".035" />
            <stop offset="1" stopColor="#43b5a6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${prefix}-gold-aura`}>
            <stop stopColor="#e0a85e" stopOpacity=".13" />
            <stop offset="1" stopColor="#e0a85e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${prefix}-ribbon`} x1="160" y1="200" x2="755" y2="455" gradientUnits="userSpaceOnUse">
            <stop stopColor="#164d49" />
            <stop offset=".19" stopColor="#43b5a6" />
            <stop offset=".42" stopColor="#b6e4d8" />
            <stop offset=".58" stopColor="#e8e0d4" />
            <stop offset=".77" stopColor="#e0a85e" />
            <stop offset="1" stopColor="#5e3e24" />
          </linearGradient>
          <linearGradient id={`${prefix}-face`} x1="270" y1="195" x2="660" y2="460" gradientUnits="userSpaceOnUse">
            <stop stopColor="#43b5a6" stopOpacity=".08" />
            <stop offset=".3" stopColor="#43b5a6" stopOpacity=".38" />
            <stop offset=".52" stopColor="#e8e0d4" stopOpacity=".78" />
            <stop offset=".73" stopColor="#e0a85e" stopOpacity=".48" />
            <stop offset="1" stopColor="#e0a85e" stopOpacity=".08" />
          </linearGradient>
          <linearGradient id={`${prefix}-floor`} x1="180" y1="540" x2="760" y2="540" gradientUnits="userSpaceOnUse">
            <stop stopColor="#43b5a6" stopOpacity="0" />
            <stop offset=".4" stopColor="#43b5a6" stopOpacity=".25" />
            <stop offset=".65" stopColor="#e0a85e" stopOpacity=".2" />
            <stop offset="1" stopColor="#e0a85e" stopOpacity="0" />
          </linearGradient>
        </defs>

        <ellipse cx="300" cy="315" rx="300" ry="290" fill={ref('aura')} />
        <ellipse cx="655" cy="310" rx="245" ry="245" fill={ref('gold-aura')} />

        <g className={styles.floor} stroke={ref('floor')} strokeWidth="1">
          <path d="M95 551H805M140 581H760M191 613H709M450 513V626M359 515L281 626M541 515L619 626M274 518L130 615M626 518L770 615" />
          <ellipse cx="450" cy="537" rx="302" ry="30" />
          <ellipse cx="450" cy="537" rx="232" ry="19" />
        </g>

        <g className={styles.engineering} stroke="#43b5a6" strokeWidth=".9">
          <path d="M109 309L156 234L217 201L284 238L313 320L270 392L198 416L139 374Z M109 309L217 201L313 320L198 416Z M156 234L270 392L139 374L284 238L198 416 M109 309L313 320M156 234L198 416M217 201L270 392M139 374L284 238" opacity=".38" />
          <path d="M92 288L134 219L208 178L298 222L334 317L285 412L196 441L120 389Z" strokeDasharray="2 9" opacity=".28" />
          {[[109, 309], [156, 234], [217, 201], [284, 238], [313, 320], [270, 392], [198, 416], [139, 374]].map(([cx, cy], index) => (
            <circle key={index} cx={cx} cy={cy} r={index % 3 === 0 ? 3.2 : 2} fill="#81d1c1" stroke="#0b1417" strokeWidth="1.5" />
          ))}
          <circle cx="210" cy="307" r="8" fill="#43b5a6" fillOpacity=".13" />
          <circle cx="210" cy="307" r="2.5" fill="#e8e0d4" stroke="none" />
        </g>

        <g className={styles.philosophy} stroke="#e0a85e" strokeWidth=".9">
          <ellipse cx="690" cy="310" rx="115" ry="145" transform="rotate(28 690 310)" opacity=".28" />
          <ellipse cx="690" cy="310" rx="83" ry="130" transform="rotate(-30 690 310)" opacity=".34" />
          <ellipse cx="690" cy="310" rx="116" ry="53" transform="rotate(-30 690 310)" opacity=".5" />
          <path d="M621 171L757 449M559 347L811 274M586 230L792 390" opacity=".17" />
          <path d="M655 156Q791 167 809 299M572 363Q595 457 695 464" strokeDasharray="2 8" opacity=".34" />
          <circle cx="631" cy="195" r="3.3" fill="#e0a85e" stroke="none" />
          <circle cx="791" cy="355" r="2.8" fill="#e8e0d4" stroke="none" />
          <circle cx="605" cy="405" r="2.3" fill="#e0a85e" stroke="none" />
          <circle cx="690" cy="310" r="8" fill="#e0a85e" fillOpacity=".12" />
          <circle cx="690" cy="310" r="2.5" fill="#e8e0d4" stroke="none" />
        </g>

        <g className={styles.sculpture} strokeLinecap="round" strokeLinejoin="round">
          <path d={filament(-45)} stroke={ref('ribbon')} strokeWidth=".7" opacity=".21" />
          <path d={filament(45)} stroke={ref('ribbon')} strokeWidth=".7" opacity=".21" />
          <path d="M166 332C161 219 225 171 309 192C412 218 505 466 624 465C694 465 744 410 734 329C746 429 698 486 620 484C495 483 406 238 304 215C233 198 184 239 166 332Z" fill={ref('face')} opacity=".64" />
          <path d="M734 329C725 235 674 190 610 205C503 230 405 469 282 456C213 450 163 406 166 332C148 422 205 477 282 479C410 483 514 246 615 227C670 217 714 248 734 329Z" fill={ref('face')} opacity=".83" />
          <path d="M166 332C161 219 225 171 309 192C412 218 505 466 624 465C694 465 744 410 734 329" stroke={ref('ribbon')} strokeWidth="2" opacity=".9" />
          <path d="M734 329C725 235 674 190 610 205C503 230 405 469 282 456C213 450 163 406 166 332" stroke={ref('ribbon')} strokeWidth="2.2" />
          <path d="M304 215C406 238 495 483 620 484M282 479C410 483 514 246 615 227" stroke={ref('ribbon')} strokeWidth=".75" opacity=".7" />
          <path d={filament(-17)} stroke={ref('ribbon')} strokeWidth=".8" opacity=".54" />
          <path d={filament(17)} stroke={ref('ribbon')} strokeWidth=".8" opacity=".54" />
          <path d="M367 257C417 300 465 414 530 447L544 457C478 435 425 334 379 288Z" fill="#05090b" opacity=".75" />
          <path d="M360 422C413 387 468 280 530 238L549 229C484 278 427 393 371 433Z" fill={ref('face')} />
          <path d="M360 422C413 387 468 280 530 238" stroke="#e8e0d4" strokeWidth="1.1" opacity=".8" />
          <path className={styles.current} d="M166 332C161 219 225 171 309 192C412 218 505 466 624 465C694 465 744 410 734 329" stroke="#e8e0d4" strokeWidth="2.8" strokeDasharray="2 99 1 183" opacity=".8" />
          <path className={styles.countercurrent} d="M734 329C725 235 674 190 610 205C503 230 405 469 282 456C213 450 163 406 166 332" stroke="#b6e4d8" strokeWidth="2.8" strokeDasharray="1 139 2 171" opacity=".75" />
        </g>

        <g className={styles.sparks} fill="#e8e0d4">
          <circle cx="309" cy="192" r="3" />
          <circle cx="624" cy="465" r="3" />
          <circle cx="166" cy="332" r="2.2" />
          <circle cx="734" cy="329" r="2.2" />
          <circle cx="450" cy="329" r="2" opacity=".6" />
          <path d="M309 180V204M297 192H321M624 454V476M613 465H635" stroke="#e8e0d4" strokeWidth=".7" opacity=".5" />
        </g>
      </svg>
    </div>
  );
}
