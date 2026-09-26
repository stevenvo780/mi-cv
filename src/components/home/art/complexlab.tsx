import type { CSSProperties, ReactNode } from 'react';
import { catalogoGrupos, catalogos } from '@/data/frentes';
import type { ArtProps } from './types';

/*
 * Kósmos: una nube 3D de ecuaciones en órbita, una por repositorio del catálogo, sobre el fantasma del atractor de
 * Lorenz de su portada. Cada ecuación sale del repositorio (su README o su código) o es la canónica de su tema.
 * Notación: _{…} subíndice, ^{…} superíndice. Las variables usan las cursivas matemáticas de Unicode.
 */
const EQ: Record<string, string | string[]> = {
  ComplejidadYCostoComputacional: '𝑂(log 𝑛) ⊂ 𝑂(𝑛²) ⊂ 𝑂(2^{𝑛})',
  'teoria-informacion': '𝐶 = 𝐵 log₂(1 + 𝑆/𝑁)',
  'complejidad-teoria': '∑ deg(𝑣) = 2|𝐸|',
  kalos: '𝑥′ = sin(𝑎𝑦) − cos(𝑏𝑥)',
  shanon: '𝐻 = −∑ 𝑝_{𝑖} log₂ 𝑝_{𝑖}',
  'teoria-de-juegos': '𝑢_{𝑖}(𝑠*) ≥ 𝑢_{𝑖}(𝑠_{𝑖}, 𝑠*_{−𝑖})',
  'teoria-desicion': '𝑎* = arg max_{𝑎} ∑ 𝑃(𝑠′|𝑠, 𝑎) 𝑈(𝑠′)',
  TheorySemanticInformation: '𝑃(ℎ|𝑒) = 𝑃(𝑒|ℎ) 𝑃(ℎ) / 𝑃(𝑒)',
  EstructurasPreontologicas: 'EDI = 1 − RMSE_{abm} / RMSE_{red}',
  'hiper-objeto-simulaciones': '𝑑𝐼/𝑑𝑡 = 𝛽𝑆𝐼/𝑁 − 𝛾𝐼',
  FenomenologiaUrbana: '𝐿 = 10 log₁₀(𝐼/𝐼₀)',
  'teoria-sistemas': '𝑝\u0307 = 𝑘(𝐷 − 𝑆)',
  'teoria-MASOES': '𝑒_{𝑖}(𝑡) ∈ [−1, 1]',
  SistemaDeTrasporteTrenes: '𝐿 = 𝜆𝑊',
  JacobTesis: '∂𝑇/∂𝑡 = 𝐷∇²𝑇 + 𝑄',
  'teoria-caos': ['𝑥\u0307 = 𝜎(𝑦 − 𝑥)', '𝑦\u0307 = 𝑥(𝜌 − 𝑧) − 𝑦', '𝑧\u0307 = 𝑥𝑦 − 𝛽𝑧'],
  'emergencia-experimento-temperatura': '𝜎 = √(∑(𝑣_{𝑖} − 𝑣\u0304)²/𝑛)',
  'entropia-vacio': '𝑇(𝑡) = 𝑇₀ / 𝑎(𝑡)',
  'emergencia-juego-de-conwey': 'B3/S23',
  'teoria-ruliat': '30 = 00011110₂',
  'experimento-macro-micro': '𝑉(𝑟) = 4𝜀[(𝜎/𝑟)¹² − (𝜎/𝑟)⁶]',
  TestPcForProgramers: '𝐹 = 𝐺𝑚₁𝑚₂/𝑟²',
  neuronalLearning: '𝑤 ← 𝑤 − 𝜂∇𝐿',
};

// Trayectoria de Lorenz (σ = 10, ρ = 28, β = 8/3; RK4) proyectada en (x, z) y simplificada.
const LORENZ =
  'M87 185l-4 6-6 3-6 0-7-3-7-6-7-9-8-11-7-13-7-15-7-18-6-20-5-21-4-20-1-13 1-14 2-7 2-2 4-2 5 2 7 3 15 15 22 24 17 22 13 20 7 15 10 26 3 8 5 6 5 2 4 0 4-2 9-7 10-13 9-19 9-25 5-22 1-19 0-5-2-4-3-2-6 0-7 5-9 8-11 12-10 15-8 13-5 13-4 11-3 12-1 12 1 11 2 9 3 8 5 4 5 2 4-1 6-3 6-5 5-5 11-17 10-23 10-28 7-29 1-21 0-8-2-5-3-3-6 0-5 2-7 5-10 10-9 10-19 25-11 18-8 19-5 17-7 32-3 10-2 4-3 4-4 1-3 1-5-1-6-3-6-5-7-8-11-16-11-25-11-32-7-30-3-25 0-10 1-5 3-5 4-1 5 0 5 3 15 13 21 24 18 24 12 19 7 16 10 29 4 9 5 6 2 2 4 0 4 0 5-2 10-10 10-15 9-19 8-24 6-25 2-13 0-8-1-6-1-5-4-2-2-1-4 2-10 6-10 10-13 15-10 15-8 14-6 14-4 14-3 14 0 15 0 14 2 11 4 7 4 5 6 1 5-1 6-3 6-5 7-7 7-9 6-12 13-27 11-35 7-32 2-14 1-13-1-9-2-7-2-2-5-1-6 2-6 4-16 15-20 22-18 23-13 20-7 14-10 26-4 8-4 5-5 2-4 0-4-1-9-7-9-13-9-18-9-23-5-21-1-18 1-6 2-4 3-2 6 1 7 4 8 9 10 11 9 12 8 14 5 12 4 11 2 10 1 12 0 10-2 9-3 6-4 5-5 1-5 0-4-2-5-4-5-5-10-15-10-19-9-26-7-27-3-21 0-8 2-6 3-4 4-1 6 2 7 5 11 11 12 14 10 14 10 14 9 20 6 19 2 19 3 38 2 12 3 5 3 4 3 2 5 0 6-2 8-4 6-6 8-10 7-10 8-14 12-28 12-36 10-40 3-18 1-16-1-13-1-6-4-6-3-1-4 1-10 5-13 12-25 27-30 34-15 20-16 28-4 5-4 2-3 0-3 0-7-4-7-9-6-12-6-16-4-15 0-12 2-6 2-1 4 1 4 2 5 5 11 14 9 16 4 14 2 13-1 5-1 5-3 3-2 2-4 0-4-1-4-4-4-4-8-12-7-17-6-19-2-15 1-5 1-4 2-2 4 0';

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

export default function Art(_: ArtProps) {
  const kosmos = catalogos.find((c) => c.id === 'complexlab');
  const items = kosmos ? catalogoGrupos(kosmos).flatMap((g) => g.items) : [];
  // La órbita parte con Lorenz de frente; el resto se reparte en ángulo (81°) y altura (permutación ×4 de 23), sin solapes de frente.
  const hub = Math.max(0, items.findIndex((i) => repo(i.url) === 'teoria-caos'));
  const n = items.length || 1;
  const half = Math.floor(n / 2);
  return (
    <div className="art art-complexlab" aria-hidden="true">
      <svg className="cl-g" viewBox="0 0 200 220">
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
              {items.map((it, i) => {
                const eq = EQ[repo(it.url)];
                if (!eq) return null;
                const d = i - hub;
                const k = (((d * 4) % n) + n) % n;
                const style = { '--a': (((d * 81) % 360) + 360) % 360, '--y': k > half ? k - n : k } as CSSProperties;
                return (
                  <div className="cl-e" data-k={it.kind} style={style} key={i}>
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
