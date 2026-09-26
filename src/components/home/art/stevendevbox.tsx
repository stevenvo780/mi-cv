
// Téchne: un escritorio Hyprland en miniatura hecho con la suite. Arriba, la waybar: el logo, los workspaces
// independientes de dos monitores (topes 2 y 3 de Hyprland Multi-Monitor) y el módulo de clawbar con su onda y su fase.
// A la izquierda, la terminal de Ultimate Terminal (nexus → worker-01) con el borde activo y los workers de la flota (el
// stack de desarrollo levanta ocho); a la derecha, Mission Center Web con la historia de la CPU y sus núcleos. Activo:
// se teclea `hyprctl dispatch swapwindow r`, las ventanas se intercambian con la curva por defecto de Hyprland y clawbar
// pasa de idle a speaking.

const f = (n: number) => +n.toFixed(2);
// Onda y núcleos en dos capas que laten desfasadas: cada barra visible es la mayor de las dos.
const onda = (h: number[]) => h.map((x, i) => (i ? `m2.2-${f((x + h[i - 1]) / 2)}` : `M69 ${f(7 - x / 2)}`) + `v${x}`).join('');
const nucleos = (h: number[]) => h.map((x, i) => (i ? `m7 ${h[i - 1]}` : 'M100.5 93') + `v-${x}`).join('');
// Un periodo (55) de la historia de CPU, en y. La línea va de x 93 a 213 y cierra por debajo (y 53): los bordes quedan
// fuera del recorte en todo el bucle.
const Y = [42, 38, 40, 34, 37, 32, 38, 36, 29, 35, 40];
const CPU = `M93 40l${[...Y, ...Y, 42, 38].map((y, i, a) => `5 ${y - (i ? a[i - 1] : 40)}`).join(' ').replace(/ -/g, '-')}V53H93Z`;
// Un anillo casi cerrado: las cuatro flores del logo de Téchne.
const O = 'a1.65 1.65 0 1 0 .01 0';

export default function Art() {
  return (
    <div className="art art-stevendevbox" aria-hidden="true">
      <svg viewBox="0 0 160 100">
        <defs>
          <linearGradient id="art-stevendevbox-b" x2="1" y2="1">
            <stop stopColor="#6fd3c4" />
            <stop offset="1" stopColor="#e0a85e" />
          </linearGradient>
          <rect id="art-stevendevbox-r" x="3" y="14" width="88" height="83" rx="2.5" pathLength={1} />
        </defs>

        <rect className="br" x="3" y="3" width="154" height="8" rx="4" />
        <path className="on" strokeWidth=".35" d={`M7.85 8.5${O}m-1.51-1.5${O}m1.49-1.5${O}m1.49 1.5${O}`} />
        <circle fill="#8d7cc0" cx="9.5" cy="7" r=".7" />
        <path className="ws" d="M23.8 7h0M30.2 7h0M33.6 7h2.8M39.8 7h0" />
        <path className="ws on" d="M17.6 7h2.8" />
        <path className="gr" d="M26.9 5.3v3.4" />
        <path className="w" d={onda([1.2, 2.4, 3.6, 2.2, 4.4, 4.8, 4, 2.6, 3.4, 1.8, 1])} />
        <path className="w w2" d={onda([2.2, 1.4, 2.8, 4.6, 3, 2.2, 4.8, 3.8, 1.6, 3, 2])} />
        <text className="ph i" x="150.4" y="8.1">
          idle
        </text>
        <text className="ph s" x="150.4" y="8.1">
          speaking
        </text>
        <circle className="pd" cx="153.2" cy="7" r=".9" />

        <g className="m">
          <rect className="fr" x="94" y="14" width="63" height="83" rx="2.5" />
          <text className="hd u" x="98" y="20.3">
            CPU
          </text>
          <path className="gr" d="M98 30.5h55M98 40.5h55M98 50.4h55" />
          {/* Ventana de la gráfica: un <svg> anidado recorta lo que se sale al deslizarse. */}
          <svg x="98" y="21" width="55" height="29.4" viewBox="98 21 55 29.4">
            <path className="sc" d={CPU} />
          </svg>
          {/* Las ocho pistas de los núcleos: una línea ancha a trazos. */}
          <path className="tr" d="M98 74.5h54" />
          <path className="co" d={nucleos([22, 12, 30, 17, 33, 10, 24, 19])} />
          <path className="co c2" d={nucleos([14, 26, 18, 31, 20, 24, 11, 28])} />
          <path className="led" d="M125.5 93V55" />
        </g>

        <g className="t">
          <use className="gl" href="#art-stevendevbox-r" />
          <use className="fr" href="#art-stevendevbox-r" />
          <path className="gp" d="M8.7 29.6h0M8.7 36.4h0M8.7 43.2h0M8.7 50h0" />
          <path className="gc" d="M34 29.6h24M34 36.4h14M34 43.2h19M34 50h9M7.5 57.8h44M7.5 64.4h30" />
          <path className="gr" d="M3 23.4h88" />
          <text className="hd" x="7.5" y="20.3">
            nexus → worker-01
          </text>
          <text className="wk p" x="12" y="30.8">
            worker-01
          </text>
          <text className="wk" x="12" y="37.6">
            worker-02
          </text>
          <text className="wk" x="12" y="44.4">
            worker-03
          </text>
          <text className="wk" x="12" y="51.2">
            worker-08
          </text>
          <text x="7.5" y="75.5">
            <tspan className="p">$</tspan> hyprctl reload
          </text>
          <text className="o" x="7.5" y="82">
            ok
          </text>
          <text className="cm" x="7.5" y="88.5">
            <tspan className="p">$</tspan> hyprctl dispatch swapwindow r
          </text>
          <rect className="cr" x="12.3" y="85" width="2.2" height="4.4" />
          <use className="ch cq" href="#art-stevendevbox-r" />
          <use className="ch" href="#art-stevendevbox-r" />
        </g>
      </svg>
    </div>
  );
}
