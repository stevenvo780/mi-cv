import type { CSSProperties, ReactNode } from 'react';
import { catalogoGrupos, catalogos } from '@/data/frentes';
import type { ArtProps } from './types';

/*
 * Kósmos: una nube 3D de ecuaciones, una por repositorio del catálogo, que gira sobre el fantasma del atractor de Lorenz
 * de su portada. Cada ecuación sale del repositorio (su README o su código) o es la canónica de su tema.
 * Notación: _{…} subíndice, ^{…} superíndice. Las variables usan las cursivas matemáticas de Unicode.
 * El orden es el de las ranuras de la esfera, de abajo arriba (Lorenz en el ecuador); se eligió midiendo la proyección
 * para que las ecuaciones cercanas no se pisen ni salgan de la caja.
 */
const EQ: [string, string | string[]][] = [
  ['emergencia-juego-de-conwey', 'B3/S23'],
  ['EstructurasPreontologicas', 'EDI = 1 − RMSE_{abm} / RMSE_{red}'],
  ['teoria-de-juegos', '𝑢_{𝑖}(𝑠*) ≥ 𝑢_{𝑖}(𝑠_{𝑖}, 𝑠*_{−𝑖})'],
  ['kalos', '𝑥′ = sin(𝑎𝑦) − cos(𝑏𝑥)'],
  ['teoria-ruliat', '30 = 00011110₂'],
  ['teoria-desicion', '𝑎* = arg max_{𝑎} ∑ 𝑃(𝑠′|𝑠, 𝑎) 𝑈(𝑠′)'],
  ['teoria-informacion', '𝐶 = 𝐵 log₂(1 + 𝑆/𝑁)'],
  ['TestPcForProgramers', '𝐹 = 𝐺𝑚₁𝑚₂/𝑟²'],
  ['hiper-objeto-simulaciones', '𝑑𝐼/𝑑𝑡 = 𝛽𝑆𝐼/𝑁 − 𝛾𝐼'],
  ['neuronalLearning', '𝑤 ← 𝑤 − 𝜂∇𝐿'],
  ['teoria-sistemas', '𝑝\u0307 = 𝑘(𝐷 − 𝑆)'],
  ['teoria-caos', ['𝑥\u0307 = 𝜎(𝑦 − 𝑥)', '𝑦\u0307 = 𝑥(𝜌 − 𝑧) − 𝑦', '𝑧\u0307 = 𝑥𝑦 − 𝛽𝑧']],
  ['experimento-macro-micro', '𝑉(𝑟) = 4𝜀[(𝜎/𝑟)¹² − (𝜎/𝑟)⁶]'],
  ['complejidad-teoria', '∑ deg(𝑣) = 2|𝐸|'],
  ['TheorySemanticInformation', '𝑃(ℎ|𝑒) = 𝑃(𝑒|ℎ) 𝑃(ℎ) / 𝑃(𝑒)'],
  ['shanon', '𝐻 = −∑ 𝑝_{𝑖} log₂ 𝑝_{𝑖}'],
  ['teoria-MASOES', '𝑒_{𝑖}(𝑡) ∈ [−1, 1]'],
  ['entropia-vacio', '𝑇(𝑡) = 𝑇₀ / 𝑎(𝑡)'],
  ['SistemaDeTrasporteTrenes', '𝐿 = 𝜆𝑊'],
  ['JacobTesis', '∂𝑇/∂𝑡 = 𝐷∇²𝑇 + 𝑄'],
  ['FenomenologiaUrbana', '𝐿 = 10 log₁₀(𝐼/𝐼₀)'],
  ['ComplejidadYCostoComputacional', '𝑂(log 𝑛) ⊂ 𝑂(𝑛²) ⊂ 𝑂(2^{𝑛})'],
  ['emergencia-experimento-temperatura', '𝜎 = √(∑(𝑣_{𝑖} − 𝑣\u0304)²/𝑛)'],
];

// Trayectoria de Lorenz (σ = 10, ρ = 28, β = 8/3; RK4 desde (0, 1, 1.05), t ∈ [14.5, 24]) en el plano (x, z), suavizada
// con Catmull-Rom.
const LORENZ =
  'M240 315s13-3 19-8 13-12 19-20 10-17 15-26 9-19 13-29 7-19 10-29 4-20 6-28 3-15 4-22 0-12 0-17-1-7-2-10-2-6-5-7-5-3-10-1-13 8-21 14-16 16-24 25-14 18-21 27-13 18-18 27-9 19-12 30-6 23-8 35-2 27-2 39 2 24 4 32 5 14 9 18 11 5 17 4 14-6 20-11 12-12 18-19 12-16 17-25 11-19 15-29 8-19 12-29 7-19 10-29 7-21 10-31 4-19 6-28 4-18 5-26 3-16 3-23 0-12 0-17-1-7-2-10-1-6-2-8-3-5-5-6-4-1-7-1-7 1-12 4-11 7-19 14-18 17-27 26-18 19-27 29-18 20-26 29-14 18-21 28-16 25-22 35-9 18-13 23-7 9-12 10-13 0-19-5-13-14-18-22-9-19-13-28-7-19-9-27-3-16-3-22 0-9 1-13 0-8 4-8 14 4 21 9 15 15 21 23 12 18 16 27 9 18 11 27 3 20 2 27-3 13-6 17-7 7-13 5-14-8-20-14-11-15-16-24-9-20-13-29-6-19-8-27-3-17-4-23 0-10 0-14 1-7 3-9 5-5 10-3 15 10 22 17 15 15 21 24 12 19 16 28 9 19 11 28 3 21 3 29-2 15-5 20-6 9-11 9-14-2-20-7-12-13-18-21-11-18-15-27-8-19-11-29-6-20-8-29-3-17-4-23 0-11 0-15 1-8 3-10 3-5 7-4 13 4 20 10 16 16 23 24 14 17 20 26 11 19 15 28 8 19 10 29 3 22 2 31-2 17-5 23-6 10-11 12-12 2-18-1-13-10-19-17-11-15-16-24-10-19-14-29-8-18-11-28-6-20-8-29-4-17-5-24-2-14-2-19 1-9 1-13 1-7 2-9 3-4 6-5 6-1 12 2 15 10 23 17 16 17 23 26 15 18 21 27 12 18 17 28 9 19 12 30 6 25 7 38 2 28 2 41 0 27-2 36-3 16-8 20-12 4-19 3-14-6-21-11-13-13-19-20-11-15-16-23-9-17-14-27-10-20-14-30-7-21-11-31-7-20-10-30-6-20-8-30-4-22-6-31-3-16-4-24-2-15-2-21 0-11 0-15 0-8 1-11 2-6 3-9 3-5 5-6 4-1 7-1 5 0 9 2 8 4 14 9 14 13 23 21 19 19 29 29 20 21 29 31 19 20 27 30 16 19 23 28 15 22 20 29 7 11 12 13 13 1 19-3 13-14 18-23 9-20 12-28 4-16 4-22 2-10-1-12-12-3-19 1-14 16-20 24-10 18-13 26-4 18-4 25 0 13 4 16 12 4 18 0 13-14 18-23 9-20 12-29 6-18 7-25 1-11 0-15 1-8-4-8-16 4-23 10-14 17-19 26-9 18-12 27-4 19-4 26 1 13 4 16 10 6 16 3 14-12 19-20 10-19 14-28 7-19 9-27 3-15 3-21 0-9-1-12-1-7-6-6-16 8-23 14-13 16-19 25-11 18-14 27-5 19-6 27 1 15 3 20 4 9 9 9 15-3 21-9 12-16 17-25 9-19 12-28 6-20 8-28 3-15 3-20-1-9-2-12 0-7-5-6-16 5-23 11-15 16-21 25-11 18-15 27-8 19-10 28-2 19-1 26 3 13 6 16 9 6 15 4 13-8 19-15 11-16 16-25 10-19 13-29 6-20 8-29 4-16 4-22 0-11-1-15-1-6-3-8-5-4-11-1-15 10-22 17-15 16-21 25-11 18-16 27-9 20-11 29-3 20-3 28 2 16 5 21 6 9 11 10 13-2 19-6 13-11 18-19 11-18 15-27 9-19 12-29 7-19 9-28 3-16 4-23 1-13 1-18-1-9-2-12-1-5-5-6-9-1-16 3-16 13-23 21-15 16-21 25-12 18-17 27-9 19-12 29-5 21-6 31 0 20 1 28 5 15 8 19 8 5 10 6';

/** Texto con _{…} y ^{…} → nodos con <sub> y <sup>. */
function tex(s: string): ReactNode[] {
  const parts = s.split(/([_^])\{([^}]*)\}/);
  const out: ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) out.push(parts[i]);
    if (i + 2 < parts.length) out.push(parts[i + 1] === '_' ? <sub key={i}>{parts[i + 2]}</sub> : <sup key={i}>{parts[i + 2]}</sup>);
  }
  return out;
}

const repo = (url?: string) => url?.split('/').pop() ?? '';

export default function Art({}: ArtProps) {
  const kosmos = catalogos.find((c) => c.id === 'complexlab');
  const kinds = new Map((kosmos ? catalogoGrupos(kosmos).flatMap((g) => g.items) : []).map((i) => [repo(i.url), i.kind]));
  const rows = EQ.filter(([r]) => kinds.has(r));
  const n = rows.length || 1;
  const hub = Math.max(0, rows.findIndex(([r]) => r === 'teoria-caos'));
  return (
    <div className="art art-complexlab" aria-hidden="true">
      <svg className="cl-g" viewBox="35 55 324 340">
        <defs>
          <path id="art-complexlab-l" d={LORENZ} pathLength={100} />
        </defs>
        <use href="#art-complexlab-l" className="cl-g1" />
        <use href="#art-complexlab-l" className="cl-g2" />
        <use href="#art-complexlab-l" className="cl-c cl-c1" />
        <use href="#art-complexlab-l" className="cl-c cl-c2" />
      </svg>
      <i className="cl-sky" />
      <div className="cl-st">
        <div className="cl-tl">
          <i className="cl-f" />
          <i className="cl-f" />
          <i className="cl-f" />
          <div className="cl-o">
            <div className="cl-s">
              {rows.map(([r, eq], j) => {
                // Esfera de Fibonacci achatada: altura pareja, ángulo áureo, radio menor hacia los polos.
                const s = 1 - (2 * j + 1) / n;
                const style = {
                  '--a': ((((j - hub) * 137.508) % 360) + 360) % 360,
                  '--s': +s.toFixed(3),
                  '--r': +Math.sqrt(1 - 0.6 * s * s).toFixed(3),
                } as CSSProperties;
                return (
                  <div className="cl-e" data-k={kinds.get(r)} style={style} key={r}>
                    <div className="cl-sp">
                      {Array.isArray(eq) ? (
                        <span className="cl-t cl-lz">
                          {eq.map((l) => (
                            <span key={l}>{l}</span>
                          ))}
                        </span>
                      ) : (
                        <span className="cl-t">{tex(eq)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <p className="cl-k">σ = 10 · ρ = 28 · β = 8/3</p>
    </div>
  );
}
