/* SpecOrganon: an expediente of evidence and specifications enters a nine-phase review instrument.
   The outgoing branches retain their paths back to the source. Brass, paper and glass echo the public site's
   emerald / cream / gold palette; the instrument is a visual metaphor, not an automatic approval verdict. */
const PHASES = [
  [131, 101], [133, 87], [149, 79], [172, 79], [189, 88],
  [194, 102], [183, 115], [160, 121], [139, 115],
] as const;

export default function Art() {
  return (
    <div className="art art-specorganon" aria-hidden="true">
      <svg viewBox="0 0 320 200">
        <defs>
          <linearGradient id="art-specorganon-floor" x1="0" y1="0" x2=".6" y2="1">
            <stop stopColor="#365d4c" stopOpacity=".9" />
            <stop offset="1" stopColor="#102b25" />
          </linearGradient>
          <linearGradient id="art-specorganon-brass" x1="0" y1="0" x2=".8" y2="1">
            <stop stopColor="#fff0c8" />
            <stop offset=".35" stopColor="#cdae72" />
            <stop offset="1" stopColor="#6b5430" />
          </linearGradient>
          <linearGradient id="art-specorganon-glass" x1="0" y1="0" x2="1" y2=".9">
            <stop stopColor="#d1fff0" stopOpacity=".75" />
            <stop offset=".45" stopColor="#67b69c" stopOpacity=".2" />
            <stop offset="1" stopColor="#174336" stopOpacity=".75" />
          </linearGradient>
          <linearGradient id="art-specorganon-paper" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fff4d8" />
            <stop offset="1" stopColor="#c9c2a5" />
          </linearGradient>
          <radialGradient id="art-specorganon-light">
            <stop stopColor="#aaf5c8" stopOpacity=".34" />
            <stop offset="1" stopColor="#aaf5c8" stopOpacity="0" />
          </radialGradient>
          <g id="art-specorganon-paper-sheet">
            <path d="m-29-9 36-18 25 15-36 18z" fill="#596553" />
            <path d="m-29-12 36-18 25 15-36 18z" fill="url(#art-specorganon-paper)" stroke="#e7e3c0" strokeWidth=".5" />
            <path d="m-17-13 17-8m-13 12 23-11M-8-5l15-7" stroke="#778b75" strokeWidth="1.5" />
            <path d="m17-12 5-2 4 2-5 3z" fill="#567c64" />
          </g>
          <g id="art-specorganon-phase">
            <path d="m-5 0 5-3 5 3v5l-5 3-5-3z" fill="#254c3c" stroke="#69927a" strokeWidth=".4" />
            <path d="m-5 0 5-3 5 3-5 3z" fill="url(#art-specorganon-brass)" />
            <path d="M0 3v5" stroke="#8bb39a" strokeWidth=".4" />
          </g>
          <g id="art-specorganon-record">
            <path d="m-12 3 12-6 12 6v6L0 15l-12-6z" fill="#164a3b" stroke="#6aab8e" strokeWidth=".5" />
            <path d="m-12 3 12-6 12 6L0 9z" fill="#88b59a" />
            <path d="m-9-8 9-5 9 5v8L0 5l-9-5z" fill="url(#art-specorganon-glass)" stroke="#a9d5b8" strokeWidth=".6" />
            <path d="m-5-5 5 3 5-3M0-2v4" stroke="#e3eed2" strokeWidth=".9" />
          </g>
        </defs>

        <ellipse className="ambient" cx="159" cy="108" rx="135" ry="82" fill="url(#art-specorganon-light)" />
        <path className="draft" d="m-10 128 160-75 185 86M-2 151l164-79 164 80M16 173l149-72 139 62M44 190l129-61 102 48M19 72l177 113M48 58l175 112M81 47l175 112M121 33l169 110" />
        <path className="frame" d="M23 49V37h21m232 0h21v12M23 169v12h21m232 0h21v-12" />

        <ellipse className="shadow" cx="162" cy="155" rx="131" ry="31" />
        <path className="plinth-edge" d="m26 131 132-60 136 65v9l-135 61-133-66z" />
        <path className="plinth" d="m26 131 132-60 136 65-135 61z" fill="url(#art-specorganon-floor)" />
        <path className="inlay" d="m42 132 116-53 119 57-118 53zM159 189v-22M49 136l21 10m191-2 14-7" />

        <path className="trace-back" d="M82 119 111 132 160 109 231 141M160 109l61-29 45 22M230 141l39 18M233 144l-35 20" />
        <path className="trace" d="M82 119 111 132 160 109 231 141M160 109l61-29 45 22M230 141l39 18M233 144l-35 20" />
        <path className="signal in" d="M82 119 111 132 160 109" />
        <path className="signal out" d="M160 109l61-29 45 22M160 109l71 32 38 18M231 141l-33 23" />
        <path className="return" d="M198 164 178 174 113 143 75 160 47 146" />

        <g transform="translate(75 139)">
          <ellipse cy="10" rx="35" ry="10" fill="#091c16" opacity=".55" />
          <use href="#art-specorganon-paper-sheet" y="-1" />
          <use href="#art-specorganon-paper-sheet" y="-6" />
          <g className="sheet lower"><use href="#art-specorganon-paper-sheet" y="-16" /></g>
          <g className="sheet upper"><use href="#art-specorganon-paper-sheet" y="-27" /></g>
        </g>
        <g className="spec" transform="translate(76 86)">
          <path d="m-17-6 24-12 18 10-24 12z" fill="#09291f" stroke="#cfbe85" strokeWidth=".65" />
          <path d="m-17-6v16L1 20V4m0 16 24-12V-8" fill="#254337" stroke="#76937d" strokeWidth=".5" />
          <path d="M-12 1v6m5-3v6m5-3v6" stroke="#d4c291" strokeWidth="1.2" />
          <path d="m7 8 11-6m-11 10 7-4" stroke="#bdd6ad" strokeWidth=".8" />
          <path d="m-9-6 11-5 9 5-10 5z" fill="#72947d" />
        </g>

        <g className="instrument">
          <ellipse className="well-shadow" cx="160" cy="126" rx="44" ry="21" />
          <path className="base-side" d="M120 112v10c0 12 80 12 80 0v-10" />
          <ellipse className="base-top" cx="160" cy="112" rx="40" ry="19" />
          <ellipse className="rim" cx="160" cy="109" rx="34" ry="16" />
          <ellipse className="rim inner" cx="160" cy="109" rx="24" ry="11" />
          <g className="phase-lights">
            {PHASES.map(([x, y], i) => (
              <g className={`phase phase-${i}`} key={i} transform={`translate(${x} ${y})`}>
                <use href="#art-specorganon-phase" />
              </g>
            ))}
          </g>
          <path className="core-shadow" d="m142 104 18-9 18 9-18 9z" />
          <g className="core">
            <path className="core-left" d="m144 67 16 8v37l-16-8z" />
            <path className="core-right" d="m160 75 16-8v37l-16 8z" />
            <path className="core-top" d="m144 67 16-8 16 8-16 8z" />
            <path className="core-lines" d="m148 73 12 6 12-6m-24 8 12 6 12-6m-24 8 12 6 12-6m-24 8 12 6 12-6M160 79v27" />
            <path className="seal" d="m153 66 7-3 7 3-7 4z" />
          </g>
          <ellipse className="scan" cx="160" cy="90" rx="22" ry="10" />
          <path className="crown" d="M160 43v7m-3.5-3.5h7M140 53h2m36 0h2" />
        </g>

        <g className="record r1" transform="translate(266 101)"><use href="#art-specorganon-record" /></g>
        <g className="record r2" transform="translate(231 140)"><use href="#art-specorganon-record" /></g>
        <g className="record r3" transform="translate(269 158)"><use href="#art-specorganon-record" /></g>
        <g className="record r4" transform="translate(198 164)"><use href="#art-specorganon-record" /></g>
        <path className="bracket" d="M241 99v-13l13-6m24 36 10-5v-15M212 140v-12l10-5M180 164v-12l9-4" />
        <g className="notation">
          <text x="39" y="67">SPEC</text>
          <text x="237" y="63">MCP</text>
          <text x="239" y="179">TRACE</text>
        </g>
      </svg>
    </div>
  );
}
