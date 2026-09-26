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
// con Catmull-Rom; con los nudos justos para no apartarse más de 1,2 unidades de la curva completa.
const LORENZ =
  'M240 315s13-3 19-8 11-7 19-20 22-41 28-55 7-16 10-29 9-37 10-50-1-21-2-27-2-6-5-7-5-3-10-1-13 8-21 14-14 12-24 25-29 34-39 54-16 48-20 65-2 27-2 39 2 24 4 32 5 14 9 18 11 5 17 4 14-6 20-11 10-7 18-19 21-30 32-54 25-65 32-89 9-38 11-54 3-30 3-40-3-14-4-18-3-5-5-6-4-2-7-1-2-3-12 4-29 24-46 40-37 38-53 58-34 49-43 63-9 18-13 23-7 9-12 10-13-1-19-5-11-9-18-22-18-40-22-55-2-28-2-35 0-8 4-8 14 4 21 9 15 15 21 23 11 18 16 27 9 18 11 27 3 20 2 27-3 13-6 17-8 6-13 5-14-8-20-14-11-15-16-24-9-16-13-29-10-38-12-50 1-19 3-23 5-5 10-3 15 10 22 17 13 11 21 24 22 42 27 56 3 21 3 29-2 15-5 20-6 9-11 9-14-2-20-7-12-13-18-21-11-18-15-27-7-16-11-29-10-39-12-52 1-20 3-25 3-5 7-4 10 0 20 10 32 32 43 50 21 42 25 57 2 22 2 31-2 17-5 23-6 10-11 12-12 2-18-1-13-10-19-17-9-11-16-24-19-39-25-57-10-41-13-53-2-12-2-19 1-18 3-22 3-4 6-5 6-1 12 2 12 5 23 17 32 34 44 53 23 35 29 58 8 60 9 79 0 27-2 36-3 16-8 20-12 4-19 3-12-2-21-11-25-26-35-43-20-37-28-57-14-37-21-61-15-65-18-85-2-27-2-36 3-16 4-20 1-5 5-6 11-1 16 1 3-1 14 9 30 27 52 50 62 69 79 89 15 22 20 29 7 11 12 13 13 1 19-3 13-14 18-23 9-20 12-28 4-16 4-22 2-10-1-12-13-3-19 1-14 16-20 24-10 18-13 26-4 18-4 25 0 13 4 16 12 4 18 0 12-10 18-23 17-41 19-54 0-21-4-23-16 4-23 10-14 17-19 26-9 18-12 27-4 19-4 26 1 13 4 16 10 6 16 3 12-7 19-20 19-40 23-55 3-26 2-33-1-7-6-6-16 7-23 14-13 16-19 25-11 18-14 27-6 19-6 27 1 15 3 20 4 9 9 9 15-3 21-9 12-16 17-25 8-15 12-28 10-37 11-48-2-17-7-18-16 5-23 11-13 12-21 25-21 41-25 55-2 19-1 26 2 13 6 16 9 6 15 4 11-4 19-15 22-37 29-54 11-39 12-51-1-19-4-23-5-4-11-1-15 10-22 17-15 16-21 25-11 18-16 27-9 19-11 29-3 20-3 28 2 16 5 21 6 9 11 10 13-2 19-6 10-7 18-19 20-38 27-56 11-38 13-51 0-24-1-30-1-5-5-6-10-1-16 3-16 13-23 21-15 16-21 25-12 18-17 27-9 19-12 29-5 21-6 31-1 20 1 28 5 15 8 19 10 6 10 6';

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
  // Ranura j de n; h, la de Lorenz (el ecuador). La esfera se calcula en el CSS.
  const orbit = { '--n': rows.length || 1, '--h': Math.max(0, rows.findIndex(([r]) => r === 'teoria-caos')) } as CSSProperties;
  return (
    <div className="art art-complexlab" aria-hidden="true">
      {/* El trazo quieto y los cometas en capas aparte: el cometa se repinta en cada cuadro, el fantasma no. */}
      <svg viewBox="35 55 324 340">
        <path id="art-complexlab-l" d={LORENZ} pathLength={100} />
        <use href="#art-complexlab-l" />
        <use href="#art-complexlab-l" />
      </svg>
      <svg viewBox="35 55 324 340">
        <use href="#art-complexlab-l" />
        <use href="#art-complexlab-l" />
      </svg>
      {/* Polvo de estrellas; dentro de la inclinación, los tres velos de niebla (todo en el CSS). */}
      <i />
      <div className="cl-st">
        <div className="cl-tl">
          <i />
          <i />
          <i />
          <div className="cl-o">
            <div className="cl-s" style={orbit}>
              {rows.map(([r, eq], j) => (
                <b data-k={kinds.get(r)} style={{ '--j': j } as CSSProperties} key={r}>
                  {Array.isArray(eq) ? (
                    <i className="cl-lz">
                      {eq.flatMap((l, k) => (k ? [<br key={k} />, l] : [l]))}
                    </i>
                  ) : (
                    <i>{tex(eq)}</i>
                  )}
                </b>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p>σ = 10 · ρ = 28 · β = 8/3</p>
    </div>
  );
}
