# Portada "El grafo" — Plan 2 (escena WebGL en worker, interacción y coreografía) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Enmiendas del controlador (antes de ejecutar)

> Mandan sobre el resto del documento: si un paso o un snippet las contradice, se sigue la enmienda. Salen del pre-flight del Plan 2 (`.superpowers/sdd/2026-09-23-home-grafo-plan-2/preflight.md`, hallazgos H1–H10, y los Rulings de su `progress.md`) y de la revisión final del Plan 1 (hallazgo I5).

- **H1 (bloqueante): presupuesto de JS y puerta `GraphStageLazy`.**
  - El presupuesto de ≤ 133 120 B gz es el JS de la ruta crítica: los scripts pedidos antes del evento `load`.
  - `GraphStageLazy` pasa a ser una puerta mínima: sin `next/dynamic` en el render y sin importar `probe`, `quality`, `dispatch` ni `choreography`. Espera la primera interacción, o `requestIdleCallback` tras `load` (timeout 1.5 s, spec §4.4), y solo entonces hace `import('./GraphStage')`. El snippet de `GraphStageLazy.tsx` del Step 4 de la Tarea 4 queda sustituido por esta puerta.
  - El chunk de `GraphStage` y el worker cuentan en el presupuesto del 3D (≤ 175 KB gz).
  - El test de presupuesto de `e2e/home.spec.ts` pasa a contar solo los scripts pedidos antes de `load`: es la decisión que la spec §5.1 pedía traer a su tabla, y la tabla de §5 se actualiza en el mismo commit que cambie el test.
  - Coste si es erróneo: JS diferido que Lighthouse todavía ve como TBT. La Tarea 6 lo mide.
- **H2 (bloqueante): LCP.** El objetivo es LCP ≤ 2.5 s en laboratorio móvil (ruling de la Tarea 14 del Plan 1), no 1.8 s. Ya está corregido en las restricciones globales y en el Step 1 de la Tarea 6.
- **H3: `aria-hidden`.** `.stage` conserva `aria-hidden="true"` (spec §4.8), porque todo lo interactivo (pausa, «Explorar en 3D», tooltip) se porta a `.home`. La Tarea 4 no lo quita.
- **H4: `postprocessing`.** Sus exports (`EffectComposer`, `BloomEffect`…) los consume la Tarea 3 (`GraphScene.ts`), no la 4: si alguno cambia de nombre, lo adapta la Tarea 3.
- **H5: selectores.** Todo selector nuevo de `home.css` cuelga de `.home`, como el resto del archivo, también los del Step 6 de la Tarea 4.
- **H6: test de `dispatch`.** La Tarea 3 añade `tests/graph/runtime/dispatch.test.ts`, con una escena simulada y una aserción por cada variante de `MainToWorker`.
- **H7: Turbopack.** La contingencia de Turbopack del Step 7 de la Tarea 4 ya no aplica: el build de producción es `next build --webpack` desde la Tarea 14 del Plan 1, y `new Worker(new URL(...), { type: 'module' })` debe compilar sin cambios.
- **H8: worker huérfano.** En el `catch` de `start()` de `GraphStage.tsx`, `worker?.terminate()` antes de pasar al fallback.
- **H9: atribución.** La línea `Co-Authored-By` de cada commit es la del modelo que lo escribe, no la literal de los snippets.
- **H10: halo.** `.home .stage::before` gana una transición de opacidad de 0.6 s, para desvanecerse al ritmo del póster y del canvas.
- **Orden y archivos reales.** La Tarea 4 no empieza hasta que el Plan 1 esté cerrado. Antes de aplicar los snippets de `Stage.tsx`, `home.css` y `e2e/home.spec.ts`, relee esos archivos y conserva lo que el Plan 1 cambió después de escribir este plan: el póster en archivo, las fuentes propias de la home, los scrims del texto pequeño y los e2e de la revisión final.
- **I5: el póster sigue siendo `<img>`.** `Stage` (RSC) conserva `<img src={POSTER_ASSET} fetchPriority="low" decoding="async">` y monta la puerta `GraphStageLazy` a su lado. No vuelve el SVG inline (`POSTER_SVG` con `dangerouslySetInnerHTML`): inline viajaba dos veces en el HTML (+10.7 KB gz) y Lighthouse móvil bajaba a 97 / 2.57 s frente a 99 / 1.74 s (spec §5.2, commit 8d2d585). `POSTER_SVG` queda solo para la imagen OG. El snippet del Step 5 de la Tarea 4 ya está corregido.

**Goal:** Montar sobre la home del Plan 1 la escena 3D del grafo (three.js en un Web Worker con OffscreenCanvas): nodos SDF iridiscentes, hubs de cristal, aristas Bézier con pulsos HDR y bloom. El grafo se reorganiza entre las 5 formas según el scroll, reacciona al puntero y al teclado, y puede pausarse. Todo sin tocar el LCP ni el TBT: el laboratorio sigue midiendo la ruta del póster.

**Architecture:**
- **Hilo principal:** carga una isla cliente pequeña (`GraphStage`) que ejecuta la sonda de GPU. Con la primera interacción o en idle transfiere un canvas al worker `graph.worker.ts`, y le reenvía puntero, progreso de scroll, foco, visibilidad y pausa.
- **Escena:** la clase `GraphScene`, independiente del entorno, dibuja todo en unas 4 draw calls. Lee las 5 formas desde una textura de datos, así que el morph entre formas es un `mix()` en el vertex shader.
- **Fallback:** si no hay OffscreenCanvas con WebGL, la misma clase corre en el hilo principal.

**Tech Stack:** three 0.186.0, postprocessing 6.39.5 (se carga de forma diferida dentro del worker, solo en los niveles con bloom), Next 16.3.6 / React 19.3, vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-23-home-grafo-design.md`. Depende del Plan 1 completo: `docs/superpowers/plans/2026-09-23-home-grafo-plan-1.md`.

## Global Constraints

- **Entorno:** antes de cualquier npm/npx/Playwright:
  `export npm_config_cache=/workspace/.scratch-steven-redesign/npm-cache TMPDIR=/workspace/.scratch-steven-redesign/tmp && mkdir -p $TMPDIR`
- **Directorio:** `/workspace/prizma/Stev/mi-cv`, rama `redesign/home-grafo`.
- **Versiones exactas:** `three@0.186.0`, `postprocessing@6.39.5` y `@types/three@0.186.0`. Las del Plan 1 no cambian.
- **Presupuestos** (spec §5):

  | Métrica | Límite |
  |---|---|
  | JS del hilo principal en la home | ≤ 130 KB gz |
  | JS del worker y sus chunks | ≤ 175 KB gz |
  | LCP | ≤ 2.5 s en móvil (enmienda H2) |
  | TBT | ≤ 100 ms |
  | CLS | ≤ 0.02 |
  | Errores de consola | 0 |
  | Violaciones de CSP | 0 |

- **Lighthouse** (mediana de 5): SEO, Accesibilidad y Best Practices = 100; Performance ≥ 95 en móvil y ≥ 98 en escritorio. El 3D **no** se carga en Lighthouse (renderer por software): es intencional.
- **Accesibilidad:**
  - El canvas lleva `aria-hidden`.
  - Botón de pausa visible con `aria-pressed` (WCAG 2.2.2).
  - `prefers-reduced-motion` → póster más botón "Explorar el grafo en 3D", sin autoplay (WCAG 2.3.3).
  - Foco de teclado en `[data-node]` → resalta el nodo.
- **Prohibido:** campo de estrellas o partículas sin aristas; toda la capa decorativa son nodos conectados.
- **Colores:** los de `src/graph/palette.ts`. La cámara inicial es `CAMERA0` (`src/graph/camera0.ts`), la misma que la del póster.
- **Commits:** en español, con la línea `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
- **Git:** sin push ni merge; los hace el controlador al final.

## Mapa de archivos (Plan 2)

| Archivo | Responsabilidad |
|---|---|
| `src/graph/random.ts` | `mulberry32` sin dependencias (lo usan layouts y decor) |
| `src/graph/runtime/protocol.ts` | Mensajes hilo principal ↔ worker y eventos de escena |
| `src/graph/runtime/probe.ts` | Sonda de GPU |
| `src/graph/runtime/quality.ts` | Niveles de calidad y regulador |
| `src/graph/runtime/loader.ts` | Descarga y decodifica el binario |
| `src/graph/runtime/dispatch.ts` | Aplica un `MainToWorker` a una `GraphScene` (compartido por el worker y el fallback) |
| `src/graph/scene/choreography.ts` | Scroll continuo → forma, mezcla y pose de cámara |
| `src/graph/scene/data.ts` | Arrays de GPU desde el grafo decodificado: instancias, textura de formas, adyacencia y capa decorativa |
| `src/graph/scene/shaders.ts` | GLSL de fondo, nodos, hubs y aristas |
| `src/graph/scene/GraphScene.ts` | three.js: renderer, capas, postprocesado, bucle, hover y foco |
| `src/graph/worker/graph.worker.ts` | Punto de entrada del worker |
| `src/components/home/useSectionProgress.ts` | Progreso continuo de scroll por secciones |
| `src/components/graph/GraphStage.tsx` | Isla cliente: sonda, arranque, puente de eventos, tooltip, pausa, "Explorar en 3D" |
| `src/components/home/Stage.tsx`, `Hero.tsx`, `src/content/home.ts`, `src/styles/home.css` | Integración |
| `tests/graph/runtime/*.test.ts`, `tests/graph/scene/*.test.ts`, `e2e/graph3d.spec.ts` | Verificación |

---
### Task 1: Dependencias 3D y runtime puro (protocolo, sonda, calidad, aleatoriedad)

**Files:**
- Modify: `package.json` (añade `three@0.186.0`, `postprocessing@6.39.5`; dev `@types/three@0.186.0`)
- Create: `src/graph/random.ts`, `src/graph/runtime/protocol.ts`, `src/graph/runtime/probe.ts`, `src/graph/runtime/quality.ts`
- Modify: `src/graph/layouts.ts` (importa y re-exporta `mulberry32` desde `./random`, sin cambiar su comportamiento)
- Test: `tests/graph/runtime/probe.test.ts`, `tests/graph/runtime/quality.test.ts`

**Interfaces:**
- Produce:
  - `mulberry32(seed: number): () => number` (en `random.ts`)
  - `type Tier = 1 | 2 | 3`
  - `TIERS: Record<Tier, { maxDpr: number; decor: number; bloom: boolean }>`
  - `initialTier(env: { width: number; mobile: boolean; cores: number }): Tier`
  - `class QualityGovernor { tier: Tier; constructor(tier: Tier, ceiling?: Tier); sample(frameMs: number, now: number): Tier | null }`
  - `interface ProbeEnv`, `type ProbeResult`, `SOFTWARE_RENDERER`, `probe3D(env: ProbeEnv): ProbeResult`, `browserProbeEnv(): ProbeEnv`
  - `type MainToWorker`, `type SceneEvent`, `type WorkerToMain = SceneEvent`

- [ ] **Step 1: Instalar dependencias**

```bash
cd /workspace/prizma/Stev/mi-cv
export npm_config_cache=/workspace/.scratch-steven-redesign/npm-cache TMPDIR=/workspace/.scratch-steven-redesign/tmp && mkdir -p $TMPDIR
npm install --save-exact three@0.186.0 postprocessing@6.39.5
npm install --save-dev --save-exact @types/three@0.186.0
grep -E "export \{|BloomEffect|ToneMappingEffect|VignetteEffect|NoiseEffect|EffectComposer|EffectPass|RenderPass|ToneMappingMode|BlendFunction" node_modules/postprocessing/build/index.d.ts | head -20
```

Resultado esperado: el `.d.ts` exporta `EffectComposer`, `RenderPass`, `EffectPass`, `BloomEffect`, `ToneMappingEffect`, `ToneMappingMode`, `VignetteEffect`, `NoiseEffect` y `BlendFunction`. La Tarea 4 los usa con esos nombres; si alguno difiere, anótalo en el reporte para que la Tarea 4 lo adapte.

- [ ] **Step 2: Escribir los tests (fallan)**

`tests/graph/runtime/probe.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { probe3D, type ProbeEnv } from '@/graph/runtime/probe';

const base: ProbeEnv = {
  reducedMotion: false,
  saveData: false,
  deviceMemory: 8,
  hardwareConcurrency: 8,
  override: null,
  getRenderer: () => 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060)',
};

describe('probe3D', () => {
  it('acepta una GPU real', () => {
    expect(probe3D(base)).toEqual({ ok: true });
  });
  it('rechaza renderers por software (Lighthouse/PSI, VMs)', () => {
    expect(probe3D({ ...base, getRenderer: () => 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)))' })).toEqual({ ok: false, reason: 'software-renderer' });
    expect(probe3D({ ...base, getRenderer: () => 'llvmpipe (LLVM 15.0.7, 256 bits)' })).toEqual({ ok: false, reason: 'software-renderer' });
  });
  it('rechaza sin WebGL2', () => {
    expect(probe3D({ ...base, getRenderer: () => null })).toEqual({ ok: false, reason: 'no-webgl2' });
  });
  it('respeta reduced motion, save-data y equipos modestos', () => {
    expect(probe3D({ ...base, reducedMotion: true })).toEqual({ ok: false, reason: 'reduced-motion' });
    expect(probe3D({ ...base, saveData: true })).toEqual({ ok: false, reason: 'save-data' });
    expect(probe3D({ ...base, deviceMemory: 2 })).toEqual({ ok: false, reason: 'low-end' });
    expect(probe3D({ ...base, hardwareConcurrency: 2 })).toEqual({ ok: false, reason: 'low-end' });
  });
  it('el override manda sobre todo lo demás', () => {
    expect(probe3D({ ...base, override: 'force', reducedMotion: true, getRenderer: () => null })).toEqual({ ok: true });
    expect(probe3D({ ...base, override: 'off' })).toEqual({ ok: false, reason: 'override' });
  });
  it('no evalúa el renderer si ya descartó por otra razón', () => {
    let called = false;
    probe3D({ ...base, saveData: true, getRenderer: () => ((called = true), 'x') });
    expect(called).toBe(false);
  });
});
```

`tests/graph/runtime/quality.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { QualityGovernor, TIERS, initialTier } from '@/graph/runtime/quality';

const feed = (g: QualityGovernor, ms: number, frames: number, start: number) => {
  let changed = null;
  let now = start;
  for (let i = 0; i < frames; i++) {
    now += ms;
    const r = g.sample(ms, now);
    if (r !== null) changed = r;
  }
  return { changed, now };
};

describe('calidad', () => {
  it('los niveles crecen en coste', () => {
    expect(TIERS[1].decor).toBeLessThan(TIERS[2].decor);
    expect(TIERS[2].decor).toBeLessThan(TIERS[3].decor);
    expect(TIERS[1].bloom).toBe(false);
  });
  it('nivel inicial por dispositivo', () => {
    expect(initialTier({ width: 390, mobile: true, cores: 8 })).toBe(1);
    expect(initialTier({ width: 1440, mobile: false, cores: 12 })).toBe(3);
    expect(initialTier({ width: 1100, mobile: false, cores: 4 })).toBe(2);
  });
  it('baja de nivel con frames lentos (mediana > 20 ms)', () => {
    const g = new QualityGovernor(3);
    expect(feed(g, 28, 90, 0).changed).toBe(2);
    expect(g.tier).toBe(2);
  });
  it('sube solo tras 5 s sostenidos por debajo de 10 ms y nunca por encima del techo', () => {
    const g = new QualityGovernor(2, 3);
    const first = feed(g, 8, 300, 0);
    expect(first.changed).toBe(null);
    const second = feed(g, 8, 450, first.now);
    expect(second.changed).toBe(3);
    expect(feed(g, 8, 1200, second.now).changed).toBe(null);
    expect(g.tier).toBe(3);
  });
  it('nunca baja de 1', () => {
    const g = new QualityGovernor(1);
    expect(feed(g, 60, 900, 0).changed).toBe(null);
    expect(g.tier).toBe(1);
  });
});
```

Run: `npx vitest run tests/graph/runtime` → Expected: FAIL (módulos inexistentes).

- [ ] **Step 3: Implementar**

`src/graph/random.ts`:

```ts
/** PRNG determinista (mulberry32). Sin dependencias: lo usan el build (layouts) y la escena (decor). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

En `src/graph/layouts.ts`: borra la definición local de `mulberry32`, añade `import { mulberry32 } from './random';` y `export { mulberry32 };`. Ejecuta `npx vitest run tests/graph` para confirmar que las formas no cambian (el test de determinismo y el de artefactos deben seguir pasando).

`src/graph/runtime/quality.ts`:

```ts
export type Tier = 1 | 2 | 3;

export interface TierConfig {
  /** Tope de devicePixelRatio. */
  maxDpr: number;
  /** Nodos decorativos. */
  decor: number;
  /** Bloom real (postprocessing). Sin él, halo aditivo en el propio shader. */
  bloom: boolean;
}

export const TIERS: Record<Tier, TierConfig> = {
  1: { maxDpr: 1, decor: 1500, bloom: false },
  2: { maxDpr: 1.5, decor: 4000, bloom: true },
  3: { maxDpr: 2, decor: 8000, bloom: true },
};

export function initialTier(env: { width: number; mobile: boolean; cores: number }): Tier {
  if (env.mobile || env.width < 900) return 1;
  if (env.cores >= 8 && env.width >= 1280) return 3;
  return 2;
}

const WINDOW = 90;
const SLOW_MS = 20;
const FAST_MS = 10;
const FAST_HOLD_MS = 5000;

/** Mediana del tiempo de frame por ventanas de 90 frames: baja si > 20 ms, sube si < 10 ms durante 5 s. */
export class QualityGovernor {
  private samples: number[] = [];
  private fastSince: number | null = null;

  constructor(
    public tier: Tier,
    private readonly ceiling: Tier = tier,
  ) {}

  sample(frameMs: number, now: number): Tier | null {
    this.samples.push(frameMs);
    if (this.samples.length < WINDOW) return null;
    const median = [...this.samples].sort((a, b) => a - b)[WINDOW >> 1];
    this.samples = [];
    if (median > SLOW_MS) {
      this.fastSince = null;
      if (this.tier > 1) {
        this.tier = (this.tier - 1) as Tier;
        return this.tier;
      }
      return null;
    }
    if (median < FAST_MS) {
      this.fastSince ??= now;
      if (now - this.fastSince >= FAST_HOLD_MS && this.tier < this.ceiling) {
        this.tier = (this.tier + 1) as Tier;
        this.fastSince = null;
        return this.tier;
      }
      return null;
    }
    this.fastSince = null;
    return null;
  }
}
```

`src/graph/runtime/probe.ts`:

```ts
export interface ProbeEnv {
  reducedMotion: boolean;
  saveData: boolean;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  /** `?gl=force` (pruebas, "Explorar en 3D") u `?gl=off`. */
  override: 'force' | 'off' | null;
  /** Nombre del renderer WebGL2, o null si no hay WebGL2 sin "major performance caveat". */
  getRenderer: () => string | null;
}

export type ProbeResult =
  | { ok: true }
  | { ok: false; reason: 'override' | 'reduced-motion' | 'save-data' | 'low-end' | 'no-webgl2' | 'software-renderer' };

export const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

export function probe3D(env: ProbeEnv): ProbeResult {
  if (env.override === 'force') return { ok: true };
  if (env.override === 'off') return { ok: false, reason: 'override' };
  if (env.reducedMotion) return { ok: false, reason: 'reduced-motion' };
  if (env.saveData) return { ok: false, reason: 'save-data' };
  if ((env.deviceMemory ?? 8) < 4 || (env.hardwareConcurrency ?? 8) < 4) return { ok: false, reason: 'low-end' };
  const renderer = env.getRenderer();
  if (renderer === null) return { ok: false, reason: 'no-webgl2' };
  if (SOFTWARE_RENDERER.test(renderer)) return { ok: false, reason: 'software-renderer' };
  return { ok: true };
}

export function browserProbeEnv(): ProbeEnv {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const param = new URLSearchParams(window.location.search).get('gl');
  return {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: Boolean(nav.connection?.saveData),
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
    override: param === 'force' || param === 'off' ? param : null,
    getRenderer: () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
      if (!gl) return null;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const name = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return name;
    },
  };
}
```

`src/graph/runtime/protocol.ts`:

```ts
import type { Tier } from './quality';

/** Mensajes del hilo principal a la escena (worker o fallback). `s` = scroll continuo: índice de sección + progreso. */
export type MainToWorker =
  | { type: 'init'; canvas: OffscreenCanvas; width: number; height: number; dpr: number; tier: Tier; motion: boolean; binUrl: string }
  | { type: 'resize'; width: number; height: number; dpr: number }
  | { type: 'pointer'; x: number; y: number; inside: boolean }
  | { type: 'scroll'; s: number }
  | { type: 'motion'; on: boolean }
  | { type: 'focus'; index: number | null }
  | { type: 'visible'; visible: boolean }
  | { type: 'dispose' };

/** Eventos de la escena. Las coordenadas x/y son píxeles CSS relativos al escenario. */
export type SceneEvent =
  | { type: 'ready' }
  | { type: 'hover'; index: number; x: number; y: number }
  | { type: 'hover-end' }
  | { type: 'tier'; tier: Tier }
  | { type: 'error'; message: string };

export type WorkerToMain = SceneEvent;
```

- [ ] **Step 4: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → Expected: todo PASS (tests nuevos incluidos).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(graph-3d): dependencias three/postprocessing y runtime puro (protocolo, sonda de GPU, niveles de calidad)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Coreografía del scroll y datos de GPU (puros, con tests)

**Files:**
- Create: `src/graph/scene/choreography.ts`, `src/graph/scene/data.ts`, `src/graph/runtime/loader.ts`
- Test: `tests/graph/scene/choreography.test.ts`, `tests/graph/scene/data.test.ts`, `tests/graph/runtime/loader.test.ts`

**Interfaces:**
- Consume:
  - `DecodedGraph`, `decodeGraph`, `KINDS`, `FRENTES`, `NO_FRENTE` (Plan 1 · codec).
  - `LAYOUT_NAMES`, `LayoutName` (Plan 1 · layout-names).
  - `nodeColor`, `FRENTE_COLOR` (Plan 1 · palette).
  - `CAMERA0` (Plan 1 · camera0).
  - `mulberry32` (Tarea 1).
- Produce:
  - `SECTIONS`, `SectionId`, `SECTION_LAYOUT`, `interface Pose`, `SECTION_POSE`, `interface FrameContext`, `interface Frame`, `smoothstep`, `frameAt(s: number, ctx: FrameContext): Frame`
  - `hexToLinear(hex: string): [number, number, number]`
  - `interface SceneData` y `buildSceneData(graph: DecodedGraph, decorCount: number, seed?: number): SceneData`
  - `clusterCentroids(data: SceneData): [number, number, number][]` (orden de `FRENTES`)
  - `helixSpan(data: SceneData): [number, number]`
  - `loadGraphBinary(url: string, fetchFn?: typeof fetch): Promise<DecodedGraph>`

- [ ] **Step 1: Escribir los tests (fallan)**

`tests/graph/scene/choreography.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { SECTIONS, SECTION_POSE, frameAt, type FrameContext } from '@/graph/scene/choreography';

const ctx: FrameContext = {
  aspect: 1.6,
  clusterCenters: [
    [-0.5, 0.2, 0],
    [0.5, 0.3, -0.1],
    [0.3, -0.5, 0.3],
    [-0.2, -0.5, -0.4],
  ],
  helixSpan: [-0.8, 0.9],
};

describe('coreografía', () => {
  it('al inicio: forma red, sin mezcla y la pose del hero (= cámara del póster)', () => {
    const f = frameAt(0, ctx);
    expect(f.from).toBe('red');
    expect(f.to).toBe('hemisferios');
    expect(f.mix).toBe(0);
    expect(f.pose.distance).toBeCloseTo(SECTION_POSE.hero.distance);
    expect(f.pose.yaw).toBeCloseTo(SECTION_POSE.hero.yaw);
  });

  it('la mezcla hacia la siguiente forma empieza pasado el 55 % de la sección', () => {
    expect(frameAt(0.5, ctx).mix).toBe(0);
    expect(frameAt(0.8, ctx).mix).toBeGreaterThan(0);
    expect(frameAt(0.8, ctx).mix).toBeLessThan(1);
  });

  it('es continuo en las fronteras entre secciones', () => {
    for (let k = 1; k < SECTIONS.length; k++) {
      const before = frameAt(k - 1e-6, ctx);
      const after = frameAt(k, ctx);
      expect(before.to).toBe(after.from);
      expect(before.mix).toBeCloseTo(1, 4);
      expect(after.mix).toBe(0);
      expect(before.pose.distance).toBeCloseTo(after.pose.distance, 3);
      expect(before.pose.target[1]).toBeCloseTo(after.pose.target[1], 3);
    }
  });

  it('trayectoria: la cámara sube por la hélice con el progreso', () => {
    const k = SECTIONS.indexOf('trayectoria');
    expect(frameAt(k, ctx).pose.target[1]).toBeCloseTo(-0.8);
    expect(frameAt(k + 0.5, ctx).pose.target[1]).toBeCloseTo(0.05);
  });

  it('frentes: la cámara visita los 4 clusters en orden', () => {
    const k = SECTIONS.indexOf('frentes');
    expect(frameAt(k + 0.1, ctx).pose.target).toEqual(ctx.clusterCenters[0]);
    expect(frameAt(k + 0.3, ctx).pose.target).toEqual(ctx.clusterCenters[1]);
    expect(frameAt(k + 0.55, ctx).pose.target).toEqual(ctx.clusterCenters[2]);
  });

  it('en pantallas estrechas no desplaza el grafo a un lado', () => {
    const k = SECTIONS.indexOf('frentes');
    expect(frameAt(k + 0.2, ctx).pose.shiftX).toBeGreaterThan(0);
    expect(frameAt(k + 0.2, { ...ctx, aspect: 0.6 }).pose.shiftX).toBe(0);
  });

  it('la última sección termina en la lemniscata y no se sale de rango', () => {
    const f = frameAt(SECTIONS.length + 3, ctx);
    expect(f.from).toBe('lemniscata');
    expect(f.to).toBe('lemniscata');
    expect(frameAt(-2, ctx).from).toBe('red');
  });
});
```

`tests/graph/scene/data.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildArtifacts } from '@/graph/artifacts';
import { decodeGraph } from '@/graph/codec';
import { LAYOUT_NAMES } from '@/graph/layout-names';
import { buildSceneData, clusterCentroids, helixSpan, hexToLinear } from '@/graph/scene/data';

const { bin } = buildArtifacts();
const graph = decodeGraph(bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength));

describe('datos de GPU', () => {
  const d = buildSceneData(graph, 500);

  it('convierte sRGB a lineal', () => {
    expect(hexToLinear('#ffffff')).toEqual([1, 1, 1]);
    const [r] = hexToLinear('#808080');
    expect(r).toBeCloseTo(0.2158, 3);
  });

  it('textura de formas: N×L texels RGBA con las posiciones del binario', () => {
    expect(d.layoutCount).toBe(LAYOUT_NAMES.length);
    expect(d.layoutTexture.length).toBe(graph.nodeCount * LAYOUT_NAMES.length * 4);
    const i = 7;
    const l = 3;
    const texel = (l * graph.nodeCount + i) * 4;
    expect(d.layoutTexture[texel]).toBe(graph.layouts[l][i * 3]);
    expect(d.layoutTexture[texel + 3]).toBe(1);
  });

  it('instancias de nodos: semánticos + decorativos, referencias válidas', () => {
    expect(d.nodes.count).toBe(graph.nodeCount + 500);
    for (let k = 0; k < d.nodes.count; k++) expect(d.nodes.ref[k]).toBeLessThan(graph.nodeCount);
    expect(Array.from(d.nodes.semantic.slice(0, graph.nodeCount)).every((v) => v === 1)).toBe(true);
    expect(Array.from(d.nodes.semantic.slice(graph.nodeCount)).every((v) => v === 0)).toBe(true);
    expect(Array.from(d.nodes.color).every((v) => v >= 0 && v <= 1)).toBe(true);
  });

  it('cada nodo decorativo está conectado (no hay puntos sueltos)', () => {
    const decorEdges = d.edges.count - graph.edgeCount;
    expect(decorEdges).toBeGreaterThanOrEqual(500);
    expect(d.decorEdgePrefix[d.decorCount]).toBe(decorEdges);
    expect(d.decorEdgePrefix[250]).toBeGreaterThanOrEqual(250);
    expect(Array.from(d.edges.semantic.slice(0, graph.edgeCount)).every((v) => v === 1)).toBe(true);
  });

  it('hubs = nodos semánticos de peso ≥ 3', () => {
    const expected = Array.from(graph.weight).filter((w) => w >= 3).length;
    expect(d.hubs.count).toBe(expected);
  });

  it('adyacencia simétrica', () => {
    d.adjacency.forEach((list, i) => list.forEach((j) => expect(d.adjacency[j]).toContain(i)));
  });

  it('es determinista', () => {
    const again = buildSceneData(graph, 500);
    expect(Array.from(again.nodes.offset)).toEqual(Array.from(d.nodes.offset));
  });

  it('centroides de los 4 frentes y rango de la hélice', () => {
    const c = clusterCentroids(d);
    expect(c).toHaveLength(4);
    const [lo, hi] = helixSpan(d);
    expect(lo).toBeLessThan(hi);
  });
});
```

`tests/graph/runtime/loader.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildArtifacts } from '@/graph/artifacts';
import { loadGraphBinary } from '@/graph/runtime/loader';

describe('loadGraphBinary', () => {
  const { bin, model } = buildArtifacts();
  it('descarga y decodifica', async () => {
    const fake = (async () => new Response(bin)) as unknown as typeof fetch;
    const g = await loadGraphBinary('/graph/x.bin', fake);
    expect(g.nodeCount).toBe(model.nodes.length);
  });
  it('propaga errores HTTP', async () => {
    const fake = (async () => new Response('no', { status: 404 })) as unknown as typeof fetch;
    await expect(loadGraphBinary('/graph/x.bin', fake)).rejects.toThrow('404');
  });
});
```

Run: `npx vitest run tests/graph/scene tests/graph/runtime/loader.test.ts` → Expected: FAIL.

- [ ] **Step 2: `choreography.ts`**

```ts
import type { LayoutName } from '../layout-names';
import { CAMERA0 } from '../camera0';

/** Orden de las secciones en el DOM (atributo data-section). */
export const SECTIONS = ['hero', 'metodo', 'trayectoria', 'frentes', 'prueba', 'contacto'] as const;
export type SectionId = (typeof SECTIONS)[number];

export const SECTION_LAYOUT: Record<SectionId, LayoutName> = {
  hero: 'red',
  metodo: 'hemisferios',
  trayectoria: 'helice',
  frentes: 'clusters',
  prueba: 'clusters',
  contacto: 'lemniscata',
};

export interface Pose {
  distance: number;
  yaw: number;
  pitch: number;
  /** Punto del grafo (espacio normalizado) que queda en el centro. */
  target: [number, number, number];
  /** Desplazamiento lateral del grafo en pantallas anchas (texto a la izquierda). */
  shiftX: number;
  /** Intensidad global de la escena (1 = plena). */
  dim: number;
}

export const SECTION_POSE: Record<SectionId, Pose> = {
  hero: { distance: CAMERA0.distance, yaw: CAMERA0.yaw, pitch: CAMERA0.pitch, target: [0, 0, 0], shiftX: 0, dim: 1 },
  metodo: { distance: 3.9, yaw: 0, pitch: -0.08, target: [0, 0, 0], shiftX: 0, dim: 0.8 },
  trayectoria: { distance: 3.2, yaw: 0.9, pitch: -0.32, target: [0, 0, 0], shiftX: 0.55, dim: 0.9 },
  frentes: { distance: 2.7, yaw: 0.35, pitch: -0.2, target: [0, 0, 0], shiftX: 0.6, dim: 0.9 },
  prueba: { distance: 4.9, yaw: 1.25, pitch: -0.3, target: [0, 0, 0], shiftX: 0, dim: 0.35 },
  contacto: { distance: 3.4, yaw: 0, pitch: 0, target: [0, 0, 0], shiftX: 0, dim: 1 },
};

export interface FrameContext {
  aspect: number;
  /** Centroides de los 4 frentes en la forma "clusters", en el orden de la sección Frentes. */
  clusterCenters: [number, number, number][];
  /** Altura mínima y máxima de las empresas en la forma "hélice". */
  helixSpan: [number, number];
}

export interface Frame {
  from: LayoutName;
  to: LayoutName;
  mix: number;
  pose: Pose;
}

export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: readonly number[], b: readonly number[], t: number): [number, number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

function sectionTarget(section: SectionId, progress: number, ctx: FrameContext): [number, number, number] {
  if (section === 'trayectoria') return [0, lerp(ctx.helixSpan[0], ctx.helixSpan[1], progress), 0];
  if (section === 'frentes') {
    const f = Math.min(progress * 4, 3.999);
    const k = Math.floor(f);
    const t = smoothstep(0.7, 1, f - k);
    const next = Math.min(k + 1, ctx.clusterCenters.length - 1);
    return t === 0 ? [...ctx.clusterCenters[k]] : lerp3(ctx.clusterCenters[k], ctx.clusterCenters[next], t);
  }
  return [0, 0, 0];
}

/** `s` = índice de sección + progreso dentro de ella (0..1). Continuo en las fronteras. */
export function frameAt(s: number, ctx: FrameContext): Frame {
  const clamped = Math.min(Math.max(s, 0), SECTIONS.length - 1);
  const index = Math.min(Math.floor(clamped), SECTIONS.length - 1);
  const progress = clamped - index;
  const cur = SECTIONS[index];
  const next = SECTIONS[Math.min(index + 1, SECTIONS.length - 1)];
  const mix = next === cur ? 0 : smoothstep(0.55, 1, progress);
  const a = SECTION_POSE[cur];
  const b = SECTION_POSE[next];
  const target = lerp3(sectionTarget(cur, progress, ctx), sectionTarget(next, 0, ctx), mix);
  const pose: Pose = {
    distance: lerp(a.distance, b.distance, mix),
    yaw: lerp(a.yaw, b.yaw, mix),
    pitch: lerp(a.pitch, b.pitch, mix),
    target: mix === 0 ? sectionTarget(cur, progress, ctx) : target,
    shiftX: ctx.aspect < 1.2 ? 0 : lerp(a.shiftX, b.shiftX, mix),
    dim: lerp(a.dim, b.dim, mix),
  };
  return { from: SECTION_LAYOUT[cur], to: SECTION_LAYOUT[next], mix, pose };
}
```

- [ ] **Step 3: `data.ts`**

```ts
import { FRENTES, KINDS, NO_FRENTE, type DecodedGraph } from '../codec';
import { LAYOUT_NAMES } from '../layout-names';
import type { NodeKind } from '../model';
import { nodeColor } from '../palette';
import { mulberry32 } from '../random';

export function hexToLinear(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  const ch = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return [ch((v >> 16) & 255), ch((v >> 8) & 255), ch(v & 255)];
}

/** Tamaño del sprite en px CSS por tipo de nodo. */
const SPRITE_PX: Record<NodeKind, number> = { self: 22, frente: 16, empresa: 12, producto: 10, grupo: 8, tecnologia: 5, concepto: 6 };
/** Radio del hub de cristal (unidades de mundo) por tipo. */
const HUB_SCALE: Partial<Record<NodeKind, number>> = { self: 0.075, frente: 0.058 };
const HUB_DEFAULT = 0.042;

export interface NodeInstances {
  ref: Float32Array;
  offset: Float32Array;
  color: Float32Array;
  size: Float32Array;
  seed: Float32Array;
  semantic: Float32Array;
  count: number;
}
export interface EdgeInstances {
  a: Float32Array;
  b: Float32Array;
  offA: Float32Array;
  offB: Float32Array;
  colA: Float32Array;
  colB: Float32Array;
  seed: Float32Array;
  weight: Float32Array;
  semantic: Float32Array;
  count: number;
}
export interface HubInstances {
  ref: Float32Array;
  color: Float32Array;
  scale: Float32Array;
  count: number;
}
export interface SceneData {
  nodeCount: number;
  layoutCount: number;
  /** RGBA32F, ancho = nodeCount, alto = layoutCount. */
  layoutTexture: Float32Array;
  nodes: NodeInstances;
  edges: EdgeInstances;
  hubs: HubInstances;
  adjacency: number[][];
  frente: Uint8Array;
  kind: Uint8Array;
  /** Posiciones por forma, para proyectar en CPU (hover). */
  layouts: Float32Array[];
  decorCount: number;
  /** decorEdgePrefix[k] = nº de aristas decorativas de los k primeros satélites: permite recortar la capa al bajar de nivel. */
  decorEdgePrefix: Uint32Array;
}

export function buildSceneData(graph: DecodedGraph, decorCount: number, seed = 13): SceneData {
  const n = graph.nodeCount;
  const m = graph.edgeCount;
  const L = graph.layouts.length;
  if (L !== LAYOUT_NAMES.length) throw new Error('El binario no trae las 5 formas');
  const rand = mulberry32(seed);
  const colorOf = (i: number) => hexToLinear(nodeColor(KINDS[graph.kind[i]], graph.frente[i] === NO_FRENTE ? undefined : FRENTES[graph.frente[i]]));

  const layoutTexture = new Float32Array(n * L * 4);
  for (let l = 0; l < L; l++) {
    for (let i = 0; i < n; i++) {
      const t = (l * n + i) * 4;
      layoutTexture[t] = graph.layouts[l][i * 3];
      layoutTexture[t + 1] = graph.layouts[l][i * 3 + 1];
      layoutTexture[t + 2] = graph.layouts[l][i * 3 + 2];
      layoutTexture[t + 3] = 1;
    }
  }

  // Capa decorativa: satélites repartidos según peso^1.5 (más alrededor de lo importante).
  let acc = 0;
  const cdf = new Float64Array(n);
  for (let i = 0; i < n; i++) cdf[i] = acc += graph.weight[i] ** 1.5;
  const parent = new Uint16Array(decorCount);
  const decorOffset = new Float32Array(decorCount * 3);
  for (let k = 0; k < decorCount; k++) {
    const r = rand() * acc;
    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    parent[k] = lo;
    const u = rand() * 2 - 1;
    const phi = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const radius = (0.03 + 0.13 * rand() ** 1.8) * (0.7 + 0.15 * graph.weight[lo]);
    decorOffset.set([s * Math.cos(phi) * radius, u * radius, s * Math.sin(phi) * radius], k * 3);
  }

  const total = n + decorCount;
  const nodes: NodeInstances = {
    ref: new Float32Array(total),
    offset: new Float32Array(total * 3),
    color: new Float32Array(total * 3),
    size: new Float32Array(total),
    seed: new Float32Array(total),
    semantic: new Float32Array(total),
    count: total,
  };
  for (let i = 0; i < n; i++) {
    nodes.ref[i] = i;
    nodes.color.set(colorOf(i), i * 3);
    nodes.size[i] = SPRITE_PX[KINDS[graph.kind[i]]] * (graph.weight[i] >= 3 ? 1.15 : 1);
    nodes.seed[i] = rand();
    nodes.semantic[i] = 1;
  }
  for (let k = 0; k < decorCount; k++) {
    const i = n + k;
    nodes.ref[i] = parent[k];
    nodes.offset.set(decorOffset.subarray(k * 3, k * 3 + 3), i * 3);
    const [r, g, b] = colorOf(parent[k]);
    nodes.color.set([r * 0.8, g * 0.8, b * 0.8], i * 3);
    nodes.size[i] = 2 + rand() * 1.6;
    nodes.seed[i] = rand();
    nodes.semantic[i] = 0;
  }

  // Aristas: semánticas + satélite→padre + satélite→satélite anterior del mismo padre.
  const lastOfParent = new Int32Array(n).fill(-1);
  const decorPairs: [number, number][] = [];
  const decorEdgePrefix = new Uint32Array(decorCount + 1);
  for (let k = 0; k < decorCount; k++) {
    decorPairs.push([k, -1]);
    const prev = lastOfParent[parent[k]];
    if (prev >= 0) decorPairs.push([k, prev]);
    lastOfParent[parent[k]] = k;
    decorEdgePrefix[k + 1] = decorPairs.length;
  }
  const e = m + decorPairs.length;
  const edges: EdgeInstances = {
    a: new Float32Array(e),
    b: new Float32Array(e),
    offA: new Float32Array(e * 3),
    offB: new Float32Array(e * 3),
    colA: new Float32Array(e * 3),
    colB: new Float32Array(e * 3),
    seed: new Float32Array(e),
    weight: new Float32Array(e),
    semantic: new Float32Array(e),
    count: e,
  };
  const adjacency: number[][] = Array.from({ length: n }, () => []);
  for (let j = 0; j < m; j++) {
    const s = graph.edges[j * 2];
    const t = graph.edges[j * 2 + 1];
    edges.a[j] = s;
    edges.b[j] = t;
    edges.colA.set(colorOf(s), j * 3);
    edges.colB.set(colorOf(t), j * 3);
    edges.seed[j] = rand();
    edges.weight[j] = graph.edgeWeight[j];
    edges.semantic[j] = 1;
    adjacency[s].push(t);
    adjacency[t].push(s);
  }
  decorPairs.forEach(([k, other], idx) => {
    const j = m + idx;
    const p = parent[k];
    edges.a[j] = p;
    edges.b[j] = p;
    edges.offA.set(decorOffset.subarray(k * 3, k * 3 + 3), j * 3);
    if (other >= 0) edges.offB.set(decorOffset.subarray(other * 3, other * 3 + 3), j * 3);
    const c = colorOf(p);
    edges.colA.set(c, j * 3);
    edges.colB.set(c, j * 3);
    edges.seed[j] = rand();
    edges.weight[j] = 1;
    edges.semantic[j] = 0;
  });

  const hubIdx = Array.from({ length: n }, (_, i) => i).filter((i) => graph.weight[i] >= 3);
  const hubs: HubInstances = {
    ref: new Float32Array(hubIdx.length),
    color: new Float32Array(hubIdx.length * 3),
    scale: new Float32Array(hubIdx.length),
    count: hubIdx.length,
  };
  hubIdx.forEach((i, h) => {
    hubs.ref[h] = i;
    hubs.color.set(colorOf(i), h * 3);
    hubs.scale[h] = HUB_SCALE[KINDS[graph.kind[i]]] ?? HUB_DEFAULT;
  });

  return {
    nodeCount: n,
    layoutCount: L,
    layoutTexture,
    nodes,
    edges,
    hubs,
    adjacency,
    frente: graph.frente,
    kind: graph.kind,
    layouts: graph.layouts,
    decorCount,
    decorEdgePrefix,
  };
}

export function clusterCentroids(data: SceneData): [number, number, number][] {
  const l = LAYOUT_NAMES.indexOf('clusters');
  return FRENTES.map((_, f) => {
    const c: [number, number, number] = [0, 0, 0];
    let count = 0;
    for (let i = 0; i < data.nodeCount; i++) {
      if (data.frente[i] !== f) continue;
      for (let k = 0; k < 3; k++) c[k] += data.layouts[l][i * 3 + k];
      count++;
    }
    return count ? (c.map((v) => v / count) as [number, number, number]) : c;
  });
}

export function helixSpan(data: SceneData): [number, number] {
  const l = LAYOUT_NAMES.indexOf('helice');
  const empresa = KINDS.indexOf('empresa');
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < data.nodeCount; i++) {
    if (data.kind[i] !== empresa) continue;
    lo = Math.min(lo, data.layouts[l][i * 3 + 1]);
    hi = Math.max(hi, data.layouts[l][i * 3 + 1]);
  }
  return Number.isFinite(lo) ? [lo, hi] : [-0.8, 0.8];
}
```

- [ ] **Step 4: `loader.ts`**

```ts
import { decodeGraph, type DecodedGraph } from '../codec';

export async function loadGraphBinary(url: string, fetchFn: typeof fetch = fetch): Promise<DecodedGraph> {
  const res = await fetchFn(url);
  if (!res.ok) throw new Error(`No se pudo cargar el grafo (${res.status})`);
  return decodeGraph(await res.arrayBuffer());
}
```

- [ ] **Step 5: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(graph-3d): coreografía de scroll, datos de GPU (formas, capa decorativa conectada, hubs) y cargador

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---
### Task 3: Shaders y `GraphScene` (three.js, independiente del entorno)

**Files:**
- Create: `src/graph/scene/shaders.ts`, `src/graph/scene/GraphScene.ts`, `src/graph/runtime/dispatch.ts`
- Test: `tests/graph/scene/shaders.test.ts`

**Interfaces:**
- Consume:
  - `buildSceneData`, `clusterCentroids`, `helixSpan`, `SceneData` (Tarea 2).
  - `frameAt`, `FrameContext` (Tarea 2).
  - `TIERS`, `QualityGovernor`, `Tier` (Tarea 1).
  - `SceneEvent`, `MainToWorker` (Tarea 1).
  - `LAYOUT_NAMES`, `CAMERA0`, `DecodedGraph` (Plan 1).
- Produce:
  - `class GraphScene` con este contrato:
    - `ready: boolean`
    - `constructor(emit: (e: SceneEvent) => void)`
    - `init(o: SceneInit): Promise<void>`
    - `resize(width, height, dpr)`, `setPointer(x, y, inside)`, `setScroll(s)`, `setMotion(on)`, `focusNode(index | null)`, `setVisible(v)`, `dispose()`
  - `interface SceneInit { canvas: HTMLCanvasElement | OffscreenCanvas; width: number; height: number; dpr: number; tier: Tier; motion: boolean; graph: DecodedGraph }`
  - `dispatch(scene: GraphScene, msg: Exclude<MainToWorker, { type: 'init' }>): void`, que solo importa el **tipo** de GraphScene, así que no arrastra three al hilo principal.
  - Desde `shaders.ts`: `BACKGROUND_VERT`, `BACKGROUND_FRAG`, `NODE_VERT`, `NODE_FRAG`, `HUB_VERT`, `HUB_FRAG`, `EDGE_VERT`, `EDGE_FRAG`.

Nota de GLSL: con WebGL2, three compila los `ShaderMaterial` como GLSL ES 3.00 y añade los alias `attribute`/`varying`/`gl_FragColor`. Por eso `texelFetch` está disponible. **No** pongas `glslVersion: GLSL3`: con esa opción three deja de definir `gl_FragColor`.

- [ ] **Step 1: Test de coherencia de los shaders (falla)**

`tests/graph/scene/shaders.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import * as S from '@/graph/scene/shaders';

const ATTRS: Record<string, string[]> = {
  NODE_VERT: ['aRef', 'aOffset', 'aColor', 'aSize', 'aSeed', 'aSemantic'],
  HUB_VERT: ['aRef', 'aColor', 'aScale'],
  EDGE_VERT: ['aT', 'aSide', 'aA', 'aB', 'aOffA', 'aOffB', 'aColA', 'aColB', 'aSeed', 'aWeight', 'aSemantic'],
};

describe('shaders', () => {
  it('declaran los atributos que la escena les pasa', () => {
    for (const [name, attrs] of Object.entries(ATTRS)) {
      const src = (S as Record<string, string>)[name];
      for (const a of attrs) expect(src, `${name}:${a}`).toMatch(new RegExp(`attribute\\s+\\w+\\s+${a};`));
    }
  });
  it('los fragment shaders aplican tone mapping y espacio de color de three', () => {
    for (const name of ['BACKGROUND_FRAG', 'NODE_FRAG', 'HUB_FRAG', 'EDGE_FRAG']) {
      const src = (S as Record<string, string>)[name];
      expect(src, name).toContain('#include <tonemapping_fragment>');
      expect(src, name).toContain('#include <colorspace_fragment>');
    }
  });
  it('nodos, hubs y aristas comparten la misma posición animada (nodePos)', () => {
    for (const name of ['NODE_VERT', 'HUB_VERT', 'EDGE_VERT']) expect((S as Record<string, string>)[name], name).toContain('nodePos(');
  });
  it('ningún shader fuerza GLSL3 a mano', () => {
    for (const src of Object.values(S)) expect(src).not.toContain('#version');
  });
});
```

Run: `npx vitest run tests/graph/scene/shaders.test.ts` → Expected: FAIL.

- [ ] **Step 2: `shaders.ts`**

```ts
/* Shaders de la escena del grafo. Colores en espacio lineal; los pulsos salen en HDR (> 1) para el bloom. */

const COMMON = /* glsl */ `
uniform sampler2D uLayouts;
uniform sampler2D uHighlight;
uniform int uFrom;
uniform int uTo;
uniform float uMix;
uniform float uTime;

vec3 layoutPos(int layout, float ref) {
  return texelFetch(uLayouts, ivec2(int(ref + 0.5), layout), 0).xyz;
}
float highlightOf(float ref) {
  return texelFetch(uHighlight, ivec2(int(ref + 0.5), 0), 0).r;
}
float nodeKey(float ref, vec3 off) {
  return fract(ref * 0.1373 + dot(off, vec3(12.989, 78.233, 37.719)));
}
/* Posición animada de un nodo (semántico: off = 0; satélite: off = desplazamiento). La misma para sprites, hubs y aristas. */
vec3 nodePos(float ref, vec3 off) {
  vec3 p = mix(layoutPos(uFrom, ref), layoutPos(uTo, ref), uMix) + off;
  float k = nodeKey(ref, off) * 6.2831;
  return p + 0.012 * vec3(sin(uTime * 0.7 + k), cos(uTime * 0.6 + k * 0.65), sin(uTime * 0.5 + k * 0.37));
}
`;

export const BACKGROUND_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`;

export const BACKGROUND_FRAG = /* glsl */ `
uniform vec2 uAspect;
uniform float uDim;
varying vec2 vUv;
void main() {
  vec2 q = (vUv - 0.5) * uAspect;
  float halo = exp(-dot(q, q) * 2.6);
  vec3 ink = vec3(0.0015, 0.0027, 0.0033);   // #05090b
  vec3 glow = vec3(0.0168, 0.0561, 0.1022);  // rgb(35 67 90)
  gl_FragColor = vec4(ink + glow * halo * (0.3 + 0.4 * uDim), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const NODE_VERT = /* glsl */ `
${COMMON}
uniform float uPixelRatio;
uniform float uViewportH;
uniform float uFocus;
uniform float uDim;
uniform float uHoverActive;
attribute float aRef;
attribute vec3 aOffset;
attribute vec3 aColor;
attribute float aSize;
attribute float aSeed;
attribute float aSemantic;
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
varying float vBlur;
varying float vHl;
void main() {
  vec4 mv = modelViewMatrix * vec4(nodePos(aRef, aOffset), 1.0);
  float hl = aSemantic * highlightOf(aRef);
  float depth = max(-mv.z, 0.05);
  float coc = clamp(abs(depth - uFocus) * 0.32, 0.0, 1.0);
  float focal = projectionMatrix[1][1] * 0.5 * uViewportH;
  float px = aSize * uPixelRatio * (1.0 + 1.4 * coc) * (1.0 + 0.9 * hl);
  mv.xy += position.xy * px * depth / focal;
  gl_Position = projectionMatrix * mv;
  vUv = uv;
  vColor = aColor;
  vBlur = coc;
  vHl = hl;
  float hover = mix(1.0, aSemantic > 0.5 ? mix(0.35, 1.0, step(0.01, hl)) : 0.3, uHoverActive);
  float twinkle = 0.85 + 0.15 * sin(uTime * 1.3 + aSeed * 40.0);
  vAlpha = (aSemantic > 0.5 ? 1.0 : 0.6 * twinkle) * (1.0 - 0.5 * coc) * uDim * hover;
}
`;

export const NODE_FRAG = /* glsl */ `
uniform float uGlow;
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
varying float vBlur;
varying float vHl;
void main() {
  vec2 q = vUv * 2.0 - 1.0;
  float r = length(q);
  float coreR = 0.62;
  float soft = mix(0.04, 0.35, vBlur);
  float core = 1.0 - smoothstep(coreR - soft, coreR, r);
  float halo = exp(-r * r * 5.0) * (0.25 + 0.75 * uGlow) * (0.4 + vHl);
  if (core + halo < 0.004) discard;
  vec2 cq = q / coreR;
  float z = sqrt(max(0.0, 1.0 - dot(cq, cq)));
  float fres = pow(1.0 - z, 2.4);
  vec3 irid = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + fres * 1.1 + vHl * 0.25));
  vec3 lit = vColor * (0.28 + 0.72 * z) + fres * mix(vColor, irid, 0.5) * 1.3 + vColor * vHl * 1.8;
  vec3 col = lit * core + vColor * halo * 1.2;
  gl_FragColor = vec4(col, clamp(core + halo, 0.0, 1.0) * vAlpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const HUB_VERT = /* glsl */ `
${COMMON}
uniform float uDim;
attribute float aRef;
attribute vec3 aColor;
attribute float aScale;
varying vec3 vN;
varying vec3 vV;
varying vec3 vColor;
varying float vHl;
void main() {
  float hl = highlightOf(aRef);
  float ang = uTime * 0.25 + aRef;
  float c = cos(ang);
  float s = sin(ang);
  mat3 rot = mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
  vec3 local = rot * position * aScale * (1.0 + 0.35 * hl);
  vec4 mv = modelViewMatrix * vec4(nodePos(aRef, vec3(0.0)) + local, 1.0);
  vN = normalize(normalMatrix * (rot * normal));
  vV = normalize(-mv.xyz);
  vColor = aColor * uDim;
  vHl = hl;
  gl_Position = projectionMatrix * mv;
}
`;

export const HUB_FRAG = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec3 vColor;
varying float vHl;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(vV);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 refr = refract(-v, n, 0.72);
  vec3 env = mix(vec3(0.004, 0.008, 0.01), vColor * 0.85, smoothstep(-0.7, 0.9, refr.y));
  env += vec3(0.95, 0.9, 0.85) * pow(max(refr.x * 0.7 + refr.y * 0.7, 0.0), 8.0) * 0.6;
  vec3 col = env * 0.6 + vColor * fres * 1.8 + vec3(1.0) * pow(fres, 7.0) * 0.9;
  col *= 1.0 + vHl * 1.4;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const EDGE_VERT = /* glsl */ `
${COMMON}
uniform vec2 uResolution;
uniform float uWidth;
attribute float aT;
attribute float aSide;
attribute float aA;
attribute float aB;
attribute vec3 aOffA;
attribute vec3 aOffB;
attribute vec3 aColA;
attribute vec3 aColB;
attribute float aSeed;
attribute float aWeight;
attribute float aSemantic;
varying float vT;
varying vec3 vColor;
varying float vSeed;
varying float vWeight;
varying float vHl;
varying float vSide;
varying float vSemantic;
vec3 bez(vec3 a, vec3 c, vec3 b, float t) {
  float u = 1.0 - t;
  return u * u * a + 2.0 * u * t * c + t * t * b;
}
vec2 toScreen(vec4 clip) {
  return clip.xy / clip.w * 0.5 * uResolution;
}
void main() {
  vec3 a = nodePos(aA, aOffA);
  vec3 b = nodePos(aB, aOffB);
  vec3 dir = b - a;
  float len = length(dir);
  vec3 side = cross(dir, vec3(0.0, 1.0, 0.0));
  float sl = length(side);
  side = sl > 1e-5 ? side / sl : vec3(1.0, 0.0, 0.0);
  float sgn = fract(aSeed * 7.13) > 0.5 ? 1.0 : -1.0;
  vec3 c = 0.5 * (a + b) + side * len * 0.16 * sgn;
  mat4 mvp = projectionMatrix * modelViewMatrix;
  vec4 clip = mvp * vec4(bez(a, c, b, aT), 1.0);
  vec2 s0 = toScreen(mvp * vec4(bez(a, c, b, max(aT - 0.02, 0.0)), 1.0));
  vec2 s1 = toScreen(mvp * vec4(bez(a, c, b, min(aT + 0.02, 1.0)), 1.0));
  vec2 tng = s1 - s0;
  float tl = length(tng);
  vec2 nrm = tl > 1e-4 ? vec2(-tng.y, tng.x) / tl : vec2(0.0, 1.0);
  float hl = aSemantic * max(step(0.99, highlightOf(aA)), step(0.99, highlightOf(aB)));
  float w = uWidth * (aSemantic > 0.5 ? 0.55 + 0.3 * aWeight : 0.4) * (1.0 + 1.4 * hl);
  clip.xy += nrm * aSide * w * 2.0 / uResolution * clip.w;
  gl_Position = clip;
  vT = aT;
  vColor = mix(aColA, aColB, aT);
  vSeed = aSeed;
  vWeight = aWeight;
  vHl = hl;
  vSide = aSide;
  vSemantic = aSemantic;
}
`;

export const EDGE_FRAG = /* glsl */ `
uniform float uTime;
uniform float uDim;
uniform float uHoverActive;
varying float vT;
varying vec3 vColor;
varying float vSeed;
varying float vWeight;
varying float vHl;
varying float vSide;
varying float vSemantic;
void main() {
  float aa = 1.0 - smoothstep(0.55, 1.0, abs(vSide));
  float base = vSemantic > 0.5 ? 0.14 : 0.06;
  float speed = 0.16 + 0.1 * vWeight + 0.4 * vHl;
  float p1 = fract(uTime * speed + vSeed);
  float p2 = fract(uTime * speed * 0.61 + vSeed * 3.7);
  float pulse = exp(-pow((vT - p1) * 16.0, 2.0)) + 0.55 * exp(-pow((vT - p2) * 22.0, 2.0));
  float glow = base + pulse * (vSemantic > 0.5 ? 1.5 : 0.35) * (1.0 + 2.2 * vHl);
  float hover = mix(1.0, mix(0.25, 1.0, vHl), uHoverActive);
  vec3 col = vColor * glow + vec3(1.0) * pulse * 0.55 * vSemantic * (1.0 + vHl);
  gl_FragColor = vec4(col, aa * min(glow, 1.0) * uDim * hover);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
```

Run: `npx vitest run tests/graph/scene/shaders.test.ts` → Expected: PASS.

- [ ] **Step 3: `dispatch.ts`**

```ts
import type { GraphScene } from '../scene/GraphScene';
import type { MainToWorker } from './protocol';

/** Aplica un mensaje del hilo principal a la escena. Lo comparten el worker y el fallback en el hilo principal. */
export function dispatch(scene: GraphScene, msg: Exclude<MainToWorker, { type: 'init' }>): void {
  switch (msg.type) {
    case 'resize':
      scene.resize(msg.width, msg.height, msg.dpr);
      break;
    case 'pointer':
      scene.setPointer(msg.x, msg.y, msg.inside);
      break;
    case 'scroll':
      scene.setScroll(msg.s);
      break;
    case 'motion':
      scene.setMotion(msg.on);
      break;
    case 'focus':
      scene.focusNode(msg.index);
      break;
    case 'visible':
      scene.setVisible(msg.visible);
      break;
    case 'dispose':
      scene.dispose();
      break;
  }
}
```

- [ ] **Step 4: `GraphScene.ts`**

```ts
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  Color,
  DataTexture,
  FloatType,
  Group,
  HalfFloatType,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Matrix4,
  Mesh,
  NearestFilter,
  NoToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  RedFormat,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderer,
  type IUniform,
} from 'three';
import { CAMERA0 } from '../camera0';
import type { DecodedGraph } from '../codec';
import { LAYOUT_NAMES } from '../layout-names';
import type { SceneEvent } from '../runtime/protocol';
import { QualityGovernor, TIERS, type Tier } from '../runtime/quality';
import { frameAt, type FrameContext } from './choreography';
import { buildSceneData, clusterCentroids, helixSpan, type SceneData } from './data';
import * as S from './shaders';

export interface SceneInit {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  width: number;
  height: number;
  dpr: number;
  tier: Tier;
  motion: boolean;
  graph: DecodedGraph;
}

interface Composer {
  render(deltaTime?: number): void;
  setSize(width: number, height: number): void;
  dispose(): void;
}

const EDGE_SEGMENTS = 20;
const HOVER_RADIUS_PX = 18;
const IDLE_MS = 8000;

const requestFrame: (cb: (t: number) => void) => number =
  typeof globalThis.requestAnimationFrame === 'function'
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number;
const cancelFrame: (id: number) => void =
  typeof globalThis.cancelAnimationFrame === 'function' ? globalThis.cancelAnimationFrame.bind(globalThis) : (id) => clearTimeout(id);

const damp = (current: number, target: number, lambda: number, dt: number) => current + (target - current) * (1 - Math.exp(-lambda * dt));

export class GraphScene {
  ready = false;
  private renderer!: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(CAMERA0.fov, 1, 0.05, 60);
  private readonly group = new Group();
  private data!: SceneData;
  private ctx!: FrameContext;
  private composer: Composer | null = null;
  private governor!: QualityGovernor;
  private tier: Tier = 2;
  private highlight!: DataTexture;
  private nodeGeometry!: InstancedBufferGeometry;
  private edgeGeometry!: InstancedBufferGeometry;
  private readonly u = {
    uLayouts: { value: null as DataTexture | null },
    uHighlight: { value: null as DataTexture | null },
    uFrom: { value: 0 },
    uTo: { value: 1 },
    uMix: { value: 0 },
    uTime: { value: 0 },
    uDim: { value: 1 },
    uHoverActive: { value: 0 },
    uPixelRatio: { value: 1 },
    uViewportH: { value: 1 },
    uFocus: { value: CAMERA0.distance as number },
    uResolution: { value: new Vector2(1, 1) },
    uWidth: { value: 0.9 },
    uGlow: { value: 0 },
    uAspect: { value: new Vector2(1, 1) },
  };
  private width = 1;
  private height = 1;
  private dpr = 1;
  private motion = true;
  private visible = true;
  private disposed = false;
  private rafId = 0;
  private last = 0;
  private lastInput = 0;
  private frameCount = 0;
  private time = 0;
  private s = 0;
  private sTarget = 0;
  private readonly pointer = { x: 0, y: 0, inside: false };
  private readonly parallax = { x: 0, y: 0 };
  private readonly pose = { distance: CAMERA0.distance as number, yaw: CAMERA0.yaw as number, pitch: CAMERA0.pitch as number, tx: 0, ty: 0, tz: 0, shiftX: 0, dim: 1 };
  private hovered = -1;
  private lastEmit = { x: -1, y: -1 };
  private focused: number | null = null;
  private hoverActive = 0;
  private dirty = true;
  private readonly tmp = new Vector3();
  private readonly mvp = new Matrix4();

  constructor(private readonly emit: (e: SceneEvent) => void) {}

  async init(o: SceneInit): Promise<void> {
    this.tier = o.tier;
    this.motion = o.motion;
    this.governor = new QualityGovernor(o.tier);
    this.renderer = new WebGLRenderer({ canvas: o.canvas, antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(new Color(0x05090b), 1);
    const onLost = (e: Event) => {
      e.preventDefault();
      this.emit({ type: 'error', message: 'webgl-context-lost' });
    };
    (o.canvas as EventTarget).addEventListener('webglcontextlost', onLost);
    (o.canvas as EventTarget).addEventListener('contextlost', onLost);

    this.data = buildSceneData(o.graph, TIERS[o.tier].decor);
    this.ctx = { aspect: o.width / Math.max(o.height, 1), clusterCenters: clusterCentroids(this.data), helixSpan: helixSpan(this.data) };
    this.buildMeshes();
    this.scene.add(this.group);
    this.resize(o.width, o.height, o.dpr);
    await this.setupComposer();
    this.update(0);
    await this.renderer.compileAsync(this.scene, this.camera);
    this.ready = true;
    this.last = performance.now();
    this.lastInput = this.last;
    this.renderFrame(0);
    this.emit({ type: 'ready' });
    this.rafId = requestFrame(this.loop);
  }

  resize(width: number, height: number, dpr: number): void {
    this.width = Math.max(1, Math.round(width));
    this.height = Math.max(1, Math.round(height));
    this.dpr = Math.min(dpr, TIERS[this.tier].maxDpr);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(this.width, this.height, false);
    this.composer?.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    if (this.ctx) this.ctx.aspect = this.camera.aspect;
    const bw = this.width * this.dpr;
    const bh = this.height * this.dpr;
    this.u.uResolution.value.set(bw, bh);
    this.u.uViewportH.value = bh;
    this.u.uPixelRatio.value = this.dpr;
    this.u.uWidth.value = 0.85 * this.dpr;
    this.u.uAspect.value.set(this.camera.aspect, 1);
    this.dirty = true;
  }

  setPointer(x: number, y: number, inside: boolean): void {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.inside = inside;
    this.lastInput = performance.now();
    this.dirty = true;
  }

  setScroll(s: number): void {
    this.sTarget = s;
    this.lastInput = performance.now();
    this.dirty = true;
  }

  setMotion(on: boolean): void {
    this.motion = on;
    this.dirty = true;
  }

  focusNode(index: number | null): void {
    this.focused = index;
    this.applyHighlight(index ?? this.hovered);
    this.lastInput = performance.now();
    this.dirty = true;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (visible) this.last = performance.now();
  }

  dispose(): void {
    this.disposed = true;
    cancelFrame(this.rafId);
    this.composer?.dispose();
    this.scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
        (obj.material as ShaderMaterial).dispose();
      }
    });
    this.u.uLayouts.value?.dispose();
    this.highlight?.dispose();
    this.renderer?.dispose();
  }

  private buildMeshes(): void {
    const d = this.data;
    const layouts = new DataTexture(d.layoutTexture, d.nodeCount, d.layoutCount, RGBAFormat, FloatType);
    layouts.minFilter = NearestFilter;
    layouts.magFilter = NearestFilter;
    layouts.needsUpdate = true;
    this.u.uLayouts.value = layouts;
    this.highlight = new DataTexture(new Uint8Array(d.nodeCount), d.nodeCount, 1, RedFormat, UnsignedByteType);
    this.highlight.minFilter = NearestFilter;
    this.highlight.magFilter = NearestFilter;
    this.highlight.unpackAlignment = 1;
    this.highlight.needsUpdate = true;
    this.u.uHighlight.value = this.highlight;

    const pick = (...names: (keyof typeof this.u)[]) => Object.fromEntries(names.map((n) => [n, this.u[n] as IUniform])) as Record<string, IUniform>;
    const shared = ['uLayouts', 'uHighlight', 'uFrom', 'uTo', 'uMix', 'uTime'] as const;

    const background = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({ vertexShader: S.BACKGROUND_VERT, fragmentShader: S.BACKGROUND_FRAG, uniforms: pick('uAspect', 'uDim'), depthTest: false, depthWrite: false }),
    );
    background.frustumCulled = false;
    background.renderOrder = -10;
    this.scene.add(background);

    // Aristas: cinta de EDGE_SEGMENTS tramos instanciada por arista.
    const verts = (EDGE_SEGMENTS + 1) * 2;
    const aT = new Float32Array(verts);
    const aSide = new Float32Array(verts);
    for (let i = 0; i <= EDGE_SEGMENTS; i++) {
      aT[i * 2] = aT[i * 2 + 1] = i / EDGE_SEGMENTS;
      aSide[i * 2] = -1;
      aSide[i * 2 + 1] = 1;
    }
    const index: number[] = [];
    for (let i = 0; i < EDGE_SEGMENTS; i++) {
      const a = i * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const edges = new InstancedBufferGeometry();
    edges.setIndex(index);
    edges.setAttribute('position', new BufferAttribute(new Float32Array(verts * 3), 3));
    edges.setAttribute('aT', new BufferAttribute(aT, 1));
    edges.setAttribute('aSide', new BufferAttribute(aSide, 1));
    const e = d.edges;
    const inst = (arr: Float32Array, size: number) => new InstancedBufferAttribute(arr, size);
    edges.setAttribute('aA', inst(e.a, 1));
    edges.setAttribute('aB', inst(e.b, 1));
    edges.setAttribute('aOffA', inst(e.offA, 3));
    edges.setAttribute('aOffB', inst(e.offB, 3));
    edges.setAttribute('aColA', inst(e.colA, 3));
    edges.setAttribute('aColB', inst(e.colB, 3));
    edges.setAttribute('aSeed', inst(e.seed, 1));
    edges.setAttribute('aWeight', inst(e.weight, 1));
    edges.setAttribute('aSemantic', inst(e.semantic, 1));
    edges.instanceCount = e.count;
    this.edgeGeometry = edges;
    const edgeMesh = new Mesh(
      edges,
      new ShaderMaterial({
        vertexShader: S.EDGE_VERT,
        fragmentShader: S.EDGE_FRAG,
        uniforms: pick(...shared, 'uResolution', 'uWidth', 'uDim', 'uHoverActive'),
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    );
    edgeMesh.frustumCulled = false;
    edgeMesh.renderOrder = 1;
    this.group.add(edgeMesh);

    // Hubs de cristal: icosaedro con normales planas (detalle 0).
    const ico = new IcosahedronGeometry(1, 0);
    const hubs = new InstancedBufferGeometry();
    hubs.setAttribute('position', ico.getAttribute('position'));
    hubs.setAttribute('normal', ico.getAttribute('normal'));
    hubs.setAttribute('aRef', inst(d.hubs.ref, 1));
    hubs.setAttribute('aColor', inst(d.hubs.color, 3));
    hubs.setAttribute('aScale', inst(d.hubs.scale, 1));
    hubs.instanceCount = d.hubs.count;
    const hubMesh = new Mesh(hubs, new ShaderMaterial({ vertexShader: S.HUB_VERT, fragmentShader: S.HUB_FRAG, uniforms: pick(...shared, 'uDim') }));
    hubMesh.frustumCulled = false;
    hubMesh.renderOrder = 2;
    this.group.add(hubMesh);

    // Nodos: quad instanciado con impostor de esfera SDF.
    const plane = new PlaneGeometry(1, 1);
    const nodes = new InstancedBufferGeometry();
    nodes.setIndex(plane.getIndex());
    nodes.setAttribute('position', plane.getAttribute('position'));
    nodes.setAttribute('uv', plane.getAttribute('uv'));
    const n = d.nodes;
    nodes.setAttribute('aRef', inst(n.ref, 1));
    nodes.setAttribute('aOffset', inst(n.offset, 3));
    nodes.setAttribute('aColor', inst(n.color, 3));
    nodes.setAttribute('aSize', inst(n.size, 1));
    nodes.setAttribute('aSeed', inst(n.seed, 1));
    nodes.setAttribute('aSemantic', inst(n.semantic, 1));
    nodes.instanceCount = n.count;
    this.nodeGeometry = nodes;
    const nodeMesh = new Mesh(
      nodes,
      new ShaderMaterial({
        vertexShader: S.NODE_VERT,
        fragmentShader: S.NODE_FRAG,
        uniforms: pick(...shared, 'uPixelRatio', 'uViewportH', 'uFocus', 'uDim', 'uHoverActive', 'uGlow'),
        transparent: true,
        depthWrite: false,
      }),
    );
    nodeMesh.frustumCulled = false;
    nodeMesh.renderOrder = 3;
    this.group.add(nodeMesh);
  }

  /** Bloom real (postprocessing, carga diferida) solo en los niveles que lo permiten; si no, halo en el shader. */
  private async setupComposer(): Promise<void> {
    this.composer?.dispose();
    this.composer = null;
    if (!TIERS[this.tier].bloom) {
      this.renderer.toneMapping = ACESFilmicToneMapping;
      this.u.uGlow.value = 1;
      return;
    }
    try {
      const pp = await import('postprocessing');
      const composer = new pp.EffectComposer(this.renderer, { frameBufferType: HalfFloatType });
      composer.addPass(new pp.RenderPass(this.scene, this.camera));
      const bloom = new pp.BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.85, luminanceSmoothing: 0.25, intensity: 1.35, radius: 0.72 });
      const vignette = new pp.VignetteEffect({ offset: 0.28, darkness: 0.62 });
      const noise = new pp.NoiseEffect({ blendFunction: pp.BlendFunction.OVERLAY, premultiply: true });
      noise.blendMode.opacity.value = 0.05;
      const tone = new pp.ToneMappingEffect({ mode: pp.ToneMappingMode.ACES_FILMIC });
      composer.addPass(new pp.EffectPass(this.camera, bloom, vignette, noise, tone));
      composer.setSize(this.width, this.height);
      this.renderer.toneMapping = NoToneMapping;
      this.u.uGlow.value = 0;
      this.composer = composer;
    } catch (err) {
      console.warn('[grafo] postprocesado no disponible, uso halo en shader', err);
      this.renderer.toneMapping = ACESFilmicToneMapping;
      this.u.uGlow.value = 1;
    }
  }

  private async changeTier(tier: Tier): Promise<void> {
    const hadBloom = TIERS[this.tier].bloom;
    this.tier = tier;
    const decor = Math.min(TIERS[tier].decor, this.data.decorCount);
    this.nodeGeometry.instanceCount = this.data.nodeCount + decor;
    this.edgeGeometry.instanceCount = this.data.edges.count - this.data.decorEdgePrefix[this.data.decorCount] + this.data.decorEdgePrefix[decor];
    this.resize(this.width, this.height, this.dpr);
    if (hadBloom !== TIERS[tier].bloom) await this.setupComposer();
    this.emit({ type: 'tier', tier });
  }

  private readonly loop = (now: number): void => {
    if (this.disposed) return;
    this.rafId = requestFrame(this.loop);
    const dt = Math.min(Math.max((now - this.last) / 1000, 0), 0.05);
    this.last = now;
    if (!this.visible) return;
    const idle = now - this.lastInput > IDLE_MS;
    this.frameCount++;
    if (idle && this.frameCount % 2 === 1) return;
    const settling = this.update(dt);
    if (!this.motion && !this.dirty && !settling) return;
    this.renderFrame(dt);
    this.dirty = false;
    if (this.motion && !idle) {
      const next = this.governor.sample(dt * 1000, now);
      if (next !== null) void this.changeTier(next);
    }
  };

  private renderFrame(dt: number): void {
    if (this.composer) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
  }

  private nodeLayoutPos(i: number): [number, number, number] {
    const a = this.data.layouts[this.u.uFrom.value];
    const b = this.data.layouts[this.u.uTo.value];
    const m = this.u.uMix.value;
    return [a[i * 3] + (b[i * 3] - a[i * 3]) * m, a[i * 3 + 1] + (b[i * 3 + 1] - a[i * 3 + 1]) * m, a[i * 3 + 2] + (b[i * 3 + 2] - a[i * 3 + 2]) * m];
  }

  /** Avanza el estado; devuelve true mientras las magnitudes amortiguadas no hayan convergido. */
  private update(dt: number): boolean {
    if (this.motion) this.time += dt;
    this.u.uTime.value = this.time;
    this.s = damp(this.s, this.sTarget, 4, dt);
    const frame = frameAt(this.s, this.ctx);
    this.u.uFrom.value = LAYOUT_NAMES.indexOf(frame.from);
    this.u.uTo.value = LAYOUT_NAMES.indexOf(frame.to);
    this.u.uMix.value = frame.mix;

    let { distance } = frame.pose;
    let [tx, ty, tz] = frame.pose.target;
    if (this.focused !== null) {
      [tx, ty, tz] = this.nodeLayoutPos(this.focused);
      distance = Math.max(distance * 0.72, 2.2);
    }
    const k = 5;
    const p = this.pose;
    p.distance = damp(p.distance, distance, k, dt);
    p.yaw = damp(p.yaw, frame.pose.yaw, k, dt);
    p.pitch = damp(p.pitch, frame.pose.pitch, k, dt);
    p.tx = damp(p.tx, tx, k, dt);
    p.ty = damp(p.ty, ty, k, dt);
    p.tz = damp(p.tz, tz, k, dt);
    p.shiftX = damp(p.shiftX, frame.pose.shiftX, k, dt);
    p.dim = damp(p.dim, frame.pose.dim, k, dt);
    if (dt === 0) Object.assign(p, { distance, yaw: frame.pose.yaw, pitch: frame.pose.pitch, tx, ty, tz, shiftX: frame.pose.shiftX, dim: frame.pose.dim });

    this.parallax.x = damp(this.parallax.x, this.pointer.inside ? this.pointer.x : 0, 3, dt);
    this.parallax.y = damp(this.parallax.y, this.pointer.inside ? this.pointer.y : 0, 3, dt);
    const drift = this.time * 0.035;
    this.group.rotation.set(p.pitch + this.parallax.y * 0.08, p.yaw + drift + this.parallax.x * 0.14, 0, 'XYZ');
    this.tmp.set(p.tx, p.ty, p.tz).applyEuler(this.group.rotation);
    this.group.position.set(p.shiftX - this.tmp.x, -this.tmp.y, -this.tmp.z);
    this.group.updateMatrixWorld();
    this.camera.position.set(0, 0, p.distance);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateMatrixWorld();
    this.u.uFocus.value = p.distance;
    this.u.uDim.value = p.dim;

    const hoverTarget = this.hovered >= 0 || this.focused !== null ? 1 : 0;
    this.hoverActive = damp(this.hoverActive, hoverTarget, 6, dt);
    this.u.uHoverActive.value = this.hoverActive;
    if (this.pointer.inside || this.hovered >= 0) this.pick();

    return (
      Math.abs(this.s - this.sTarget) > 1e-3 ||
      Math.abs(p.distance - distance) > 1e-3 ||
      Math.abs(p.ty - ty) > 1e-3 ||
      Math.abs(this.hoverActive - hoverTarget) > 1e-3 ||
      Math.abs(this.parallax.x - (this.pointer.inside ? this.pointer.x : 0)) > 1e-3
    );
  }

  /** Hover por proyección en CPU de los nodos semánticos (~200): sin lectura de GPU. */
  private pick(): void {
    if (!this.pointer.inside) {
      this.setHovered(-1, 0, 0);
      return;
    }
    const px = ((this.pointer.x + 1) / 2) * this.width;
    const py = ((1 - this.pointer.y) / 2) * this.height;
    this.mvp.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse).multiply(this.group.matrixWorld);
    let best = -1;
    let bestD = Infinity;
    let bx = 0;
    let by = 0;
    for (let i = 0; i < this.data.nodeCount; i++) {
      const [x, y, z] = this.nodeLayoutPos(i);
      this.tmp.set(x, y, z).applyMatrix4(this.mvp);
      if (this.tmp.z > 1) continue;
      const sx = ((this.tmp.x + 1) / 2) * this.width;
      const sy = ((1 - this.tmp.y) / 2) * this.height;
      const dist = Math.hypot(sx - px, sy - py);
      if (dist < HOVER_RADIUS_PX + this.data.nodes.size[i] * 0.5 && dist < bestD) {
        best = i;
        bestD = dist;
        bx = sx;
        by = sy;
      }
    }
    this.setHovered(best, bx, by);
  }

  private setHovered(index: number, x: number, y: number): void {
    if (index === this.hovered) {
      if (index >= 0 && Math.hypot(x - this.lastEmit.x, y - this.lastEmit.y) > 1.5) {
        this.lastEmit = { x, y };
        this.emit({ type: 'hover', index, x, y });
      }
      return;
    }
    this.hovered = index;
    if (this.focused === null) this.applyHighlight(index);
    this.lastEmit = { x, y };
    this.emit(index >= 0 ? { type: 'hover', index, x, y } : { type: 'hover-end' });
  }

  /** 255 = nodo activo, 153 = vecinos, 0 = resto. */
  private applyHighlight(index: number): void {
    const buf = this.highlight.image.data as Uint8Array;
    buf.fill(0);
    if (index >= 0) {
      buf[index] = 255;
      for (const j of this.data.adjacency[index]) buf[j] = Math.max(buf[j], 153);
    }
    this.highlight.needsUpdate = true;
    this.dirty = true;
  }
}
```

- [ ] **Step 5: Verificar tipos, lint y tests**

Run: `npm run typecheck && npm run lint && npm test` → Expected: PASS.
- Si `@types/three` no expone `compileAsync` o `unpackAlignment` con esos nombres en 0.186, usa el nombre que exponga la versión instalada (mira `node_modules/@types/three/src/renderers/WebGLRenderer.d.ts`) y anótalo en el reporte.
- Si `import('postprocessing')` no tipa `blendMode.opacity`, usa `noise.blendMode.setOpacity?.(0.05) ?? (noise.blendMode.opacity.value = 0.05)`, según exponga el `.d.ts`.

La verificación visual y de runtime se hace en la Tarea 5 (e2e con WebGL por SwiftShader); aquí basta con que compile y pasen los tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(graph-3d): GraphScene con nodos SDF iridiscentes, hubs de cristal, aristas Bézier con pulsos HDR y bloom diferido

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---
### Task 4: Worker, isla `GraphStage` e integración en la home

**Files:**
- Create: `src/graph/worker/graph.worker.ts`, `src/components/home/useSectionProgress.ts`, `src/components/graph/GraphStage.tsx`, `src/components/graph/GraphStageLazy.tsx`
- Modify:
  - `src/components/home/Stage.tsx` (conserva el póster `<img>` y `aria-hidden`, y monta la puerta `GraphStageLazy` al lado: enmiendas I5 y H3)
  - `src/components/home/Hero.tsx` (añade `data-section="hero"`)
  - `src/app/[locale]/(home)/page.tsx` (pasa `locale` y `t` a `Stage`)
  - `src/content/home.ts` (bloque `graph` en `HomeCopy` y en ES/EN)
  - `src/styles/home.css` (canvas, fundido, tooltip, controles y pausa)

**Interfaces:**
- Consume: `dispatch` (Tarea 3), `GraphScene` y `SceneInit` (Tarea 3, solo en el fallback con `import()`), `probe3D` y `browserProbeEnv` (Tarea 1), `initialTier` (Tarea 1), `MainToWorker` y `SceneEvent` (Tarea 1), `loadGraphBinary` (Tarea 2), `SECTIONS` (Tarea 2), `GRAPH_ASSET` (Plan 1), `MetaNode` y `GraphMeta` (Plan 1, solo tipos).
- Produce:
  - `HomeCopy['graph'] = { pause: string; explore: string; openHint: string; present: string; kinds: Record<NodeKind, string> }`
  - `useSectionProgress(onChange: (s: number) => void): () => void`, que devuelve una función que fuerza un recálculo inmediato.
  - Escenario con `data-state="live"` cuando el 3D pinta su primer frame.
  - Botón `.graph-motion` (`aria-pressed` = pausado), botón `.graph-explore` (solo con reduced motion) y tooltip `.graph-tip` (`role="tooltip"`).
  - Parámetros de URL: `?gl=force` (se salta la sonda), `?gl=off` y `?worker=off` (fuerza el fallback en el hilo principal, para pruebas).

- [ ] **Step 1: Copy del bloque `graph`**

En `src/content/home.ts`:
- Añade `import type { NodeKind } from '@/graph/model';`.
- En `HomeCopy`, añade: `graph: { pause: string; explore: string; openHint: string; present: string; kinds: Record<NodeKind, string> };`.
- En `es`:

```ts
    graph: {
      pause: 'Pausar la animación del grafo',
      explore: 'Explorar el grafo en 3D',
      openHint: 'Clic para abrir',
      present: 'Actualidad',
      kinds: { self: 'Yo', frente: 'Frente', empresa: 'Empresa', producto: 'Producto', grupo: 'Familia de herramientas', tecnologia: 'Tecnología', concepto: 'Concepto' },
    },
```

- En `en`:

```ts
    graph: {
      pause: 'Pause the graph animation',
      explore: 'Explore the graph in 3D',
      openHint: 'Click to open',
      present: 'Present',
      kinds: { self: 'Me', frente: 'Front', empresa: 'Company', producto: 'Product', grupo: 'Tool family', tecnologia: 'Technology', concepto: 'Concept' },
    },
```

- [ ] **Step 2: Worker**

`src/graph/worker/graph.worker.ts`:

```ts
import { GraphScene } from '../scene/GraphScene';
import { dispatch } from '../runtime/dispatch';
import { loadGraphBinary } from '../runtime/loader';
import type { MainToWorker, WorkerToMain } from '../runtime/protocol';

type WorkerScope = {
  postMessage(message: WorkerToMain): void;
  onmessage: ((event: MessageEvent<MainToWorker>) => void) | null;
};
const scope = self as unknown as WorkerScope;
type Msg = Exclude<MainToWorker, { type: 'init' }>;

let scene: GraphScene | null = null;
/** Último mensaje de cada tipo recibido antes de que la escena esté lista. */
const queued = new Map<Msg['type'], Msg>();

scope.onmessage = (event) => {
  const msg = event.data;
  if (msg.type === 'init') {
    const s = new GraphScene((e) => scope.postMessage(e));
    scene = s;
    loadGraphBinary(msg.binUrl)
      .then((graph) => s.init({ canvas: msg.canvas, width: msg.width, height: msg.height, dpr: msg.dpr, tier: msg.tier, motion: msg.motion, graph }))
      .then(() => {
        for (const m of queued.values()) dispatch(s, m);
        queued.clear();
      })
      .catch((err: unknown) => scope.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) }));
    return;
  }
  if (!scene?.ready) {
    queued.set(msg.type, msg);
    return;
  }
  dispatch(scene, msg);
};
```

- [ ] **Step 3: Progreso de scroll**

`src/components/home/useSectionProgress.ts`:

```ts
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { SECTIONS } from '@/graph/scene/choreography';

/** Scroll continuo s = índice de la sección bajo el centro de la pantalla + progreso dentro de ella. */
export function useSectionProgress(onChange: (s: number) => void): () => void {
  const callback = useRef(onChange);
  const compute = useRef<() => void>(() => {});

  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let frame = 0;
    const run = () => {
      frame = 0;
      const mid = window.innerHeight / 2;
      let s = 0;
      SECTIONS.forEach((id, i) => {
        const el = document.querySelector<HTMLElement>(`[data-section="${id}"]`);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top <= mid) s = i + Math.min(Math.max((mid - r.top) / Math.max(r.height, 1), 0), 1 - 1e-6);
      });
      callback.current(s);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };
    compute.current = run;
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return useCallback(() => compute.current(), []);
}
```

- [ ] **Step 4: Isla `GraphStage`**

`src/components/graph/GraphStageLazy.tsx` (sustituido por la puerta mínima de la enmienda H1: no uses este snippet tal cual):

```tsx
'use client';

import dynamic from 'next/dynamic';

/** Solo en cliente: la sonda de GPU y el canvas no tienen sentido en SSR. */
const GraphStageLazy = dynamic(() => import('./GraphStage'), { ssr: false });
export default GraphStageLazy;
```

`src/components/graph/GraphStage.tsx`:

```tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSectionProgress } from '@/components/home/useSectionProgress';
import type { HomeCopy } from '@/content/home';
import type { GraphMeta, MetaNode } from '@/graph/codec';
import { GRAPH_ASSET } from '@/graph/generated/stats';
import { dispatch } from '@/graph/runtime/dispatch';
import { browserProbeEnv, probe3D } from '@/graph/runtime/probe';
import type { MainToWorker, SceneEvent } from '@/graph/runtime/protocol';
import { initialTier, type Tier } from '@/graph/runtime/quality';
import type { Locale } from '@/lib/site';

type Phase = 'poster' | 'loading' | 'live' | 'reduced';
type Msg = Exclude<MainToWorker, { type: 'init' }>;
interface Tip {
  node: MetaNode;
  x: number;
  y: number;
}
interface Common {
  width: number;
  height: number;
  dpr: number;
  tier: Tier;
  motion: boolean;
}

/** Zonas donde el puntero pertenece al contenido y no al grafo. */
const CONTENT = 'a, button, input, select, textarea, summary, label, [role="button"], .panel, .card, .sec-head, .hero-meta, .front-head, .contact-list, .stack-group, .figures, .search, .topbar, .graph-motion, .graph-explore';
const MOTION_KEY = 'mouseion:motion';

function readMotionPreference(): boolean {
  try {
    return window.localStorage.getItem(MOTION_KEY) !== 'paused';
  } catch {
    return true;
  }
}

export default function GraphStage({ locale, t }: { locale: Locale; t: HomeCopy['graph'] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<((m: Msg) => void) | null>(null);
  const disposeRef = useRef<(() => void) | null>(null);
  const metaRef = useRef<MetaNode[] | null>(null);
  const tipRef = useRef<Tip | null>(null);
  const [phase, setPhase] = useState<Phase>('poster');
  const [tip, setTip] = useState<Tip | null>(null);
  const [motion, setMotion] = useState(readMotionPreference);

  // Refleja la preferencia guardada en <html> (pausa también las animaciones CSS).
  useEffect(() => {
    if (!motion) document.documentElement.dataset.motion = 'paused';
  }, [motion]);

  const send = useCallback((m: Msg) => sendRef.current?.(m), []);
  const emitScroll = useSectionProgress(useCallback((s: number) => send({ type: 'scroll', s }), [send]));

  const stage = () => hostRef.current?.closest<HTMLElement>('.stage') ?? null;

  const teardown = useCallback(() => {
    disposeRef.current?.();
    disposeRef.current = null;
    sendRef.current = null;
    hostRef.current?.replaceChildren();
    stage()?.removeAttribute('data-state');
    tipRef.current = null;
    setTip(null);
    setPhase('poster');
  }, []);

  const onEvent = useCallback(
    (e: SceneEvent) => {
      switch (e.type) {
        case 'ready':
          stage()?.setAttribute('data-state', 'live');
          setPhase('live');
          break;
        case 'hover': {
          const node = metaRef.current?.[e.index];
          if (!node) return;
          tipRef.current = { node, x: e.x, y: e.y };
          setTip(tipRef.current);
          break;
        }
        case 'hover-end':
          tipRef.current = null;
          setTip(null);
          break;
        case 'error':
          console.warn('[grafo] escena desactivada:', e.message);
          teardown();
          break;
        case 'tier':
          break;
      }
    },
    [teardown],
  );

  const startMain = useCallback(
    async (host: HTMLDivElement, common: Common, binUrl: string) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'stage-canvas';
      host.appendChild(canvas);
      const [{ GraphScene }, { loadGraphBinary }] = await Promise.all([import('@/graph/scene/GraphScene'), import('@/graph/runtime/loader')]);
      const scene = new GraphScene(onEvent);
      sendRef.current = (m) => {
        if (scene.ready) dispatch(scene, m);
      };
      disposeRef.current = () => scene.dispose();
      await scene.init({ canvas, graph: await loadGraphBinary(binUrl), ...common });
      emitScroll();
    },
    [emitScroll, onEvent],
  );

  const start = useCallback(
    async (motionOn: boolean) => {
      const host = hostRef.current;
      if (!host || sendRef.current) return;
      setPhase('loading');
      fetch(GRAPH_ASSET.meta)
        .then((r) => r.json() as Promise<GraphMeta>)
        .then((m) => {
          metaRef.current = m.nodes;
        })
        .catch((err: unknown) => console.warn('[grafo] sin fichas de nodos:', err));
      const rect = host.getBoundingClientRect();
      const common: Common = {
        width: rect.width,
        height: rect.height,
        dpr: window.devicePixelRatio || 1,
        tier: initialTier({ width: window.innerWidth, mobile: window.matchMedia('(pointer: coarse)').matches, cores: navigator.hardwareConcurrency ?? 4 }),
        motion: motionOn,
      };
      const binUrl = new URL(GRAPH_ASSET.bin, window.location.href).toString();
      const allowWorker = new URLSearchParams(window.location.search).get('worker') !== 'off';
      const probeCanvas = document.createElement('canvas');
      if (allowWorker && typeof Worker !== 'undefined' && 'transferControlToOffscreen' in probeCanvas) {
        try {
          const canvas = probeCanvas;
          canvas.className = 'stage-canvas';
          host.appendChild(canvas);
          const worker = new Worker(new URL('../../graph/worker/graph.worker.ts', import.meta.url), { type: 'module' });
          const offscreen = canvas.transferControlToOffscreen();
          worker.onmessage = (ev: MessageEvent<SceneEvent>) => onEvent(ev.data);
          worker.onerror = (ev) => {
            ev.preventDefault();
            worker.terminate();
            host.replaceChildren();
            sendRef.current = null;
            void startMain(host, common, binUrl).catch(teardown);
          };
          const init: MainToWorker = { type: 'init', canvas: offscreen, binUrl, ...common };
          worker.postMessage(init, [offscreen]);
          sendRef.current = (m) => worker.postMessage(m);
          disposeRef.current = () => worker.terminate();
          emitScroll();
          return;
        } catch (err) {
          console.warn('[grafo] worker no disponible, uso el hilo principal:', err);
          host.replaceChildren();
        }
      }
      await startMain(host, common, binUrl).catch(teardown);
    },
    [emitScroll, onEvent, startMain, teardown],
  );

  // Arranque: sonda en idle; 3D con la primera interacción o tras load + idle (≤ 1.5 s).
  useEffect(() => {
    let cancelled = false;
    const idle = (cb: () => void) => ('requestIdleCallback' in window ? window.requestIdleCallback(cb, { timeout: 1500 }) : window.setTimeout(cb, 200));
    const events = ['pointermove', 'touchstart', 'scroll', 'keydown'] as const;
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go));
      idle(() => {
        if (cancelled) return;
        const env = browserProbeEnv();
        if (env.reducedMotion && env.override !== 'force') {
          setPhase('reduced');
          return;
        }
        if (probe3D(env).ok) void start(readMotionPreference());
      });
    };
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    const onLoad = () => idle(go);
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
    return () => {
      cancelled = true;
      events.forEach((e) => window.removeEventListener(e, go));
      window.removeEventListener('load', onLoad);
      disposeRef.current?.();
    };
  }, [start]);

  const activate = useCallback(
    (node: MetaNode) => {
      if (node.kind === 'producto' && node.url) {
        window.open(node.url, '_blank', 'noopener');
        return;
      }
      if (node.kind === 'frente' && node.frente) {
        window.location.assign(`/${locale}/${node.frente}`);
        return;
      }
      const target =
        document.querySelector(`[data-node="${CSS.escape(node.id)}"]`) ??
        document.getElementById(node.kind === 'self' ? 'metodo' : node.kind === 'empresa' ? 'trayectoria' : 'prueba');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    },
    [locale],
  );

  // Puente de eventos mientras el 3D está vivo.
  useEffect(() => {
    if (phase !== 'live' && phase !== 'loading') return;
    const host = hostRef.current;
    if (!host) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    const flush = () => {
      frame = 0;
      if (!last) return;
      const r = host.getBoundingClientRect();
      const target = last.target instanceof Element ? last.target : null;
      send({
        type: 'pointer',
        x: ((last.clientX - r.left) / r.width) * 2 - 1,
        y: -(((last.clientY - r.top) / r.height) * 2 - 1),
        inside: !target?.closest(CONTENT),
      });
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(flush);
    };
    const onLeave = () => send({ type: 'pointer', x: 0, y: 0, inside: false });
    const onClick = (e: MouseEvent) => {
      const current = tipRef.current;
      if (!current || (e.target instanceof Element && e.target.closest(CONTENT))) return;
      activate(current.node);
    };
    const onFocusIn = (e: FocusEvent) => {
      const id = e.target instanceof Element ? e.target.closest('[data-node]')?.getAttribute('data-node') : null;
      const index = id ? (metaRef.current?.findIndex((n) => n.id === id) ?? -1) : -1;
      send({ type: 'focus', index: index >= 0 ? index : null });
    };
    const onFocusOut = () => send({ type: 'focus', index: null });
    const onVisibility = () => send({ type: 'visible', visible: !document.hidden });
    const observer = new ResizeObserver(([entry]) =>
      send({ type: 'resize', width: entry.contentRect.width, height: entry.contentRect.height, dpr: window.devicePixelRatio || 1 }),
    );
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('click', onClick);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    document.addEventListener('visibilitychange', onVisibility);
    observer.observe(host);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('click', onClick);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
    };
  }, [phase, send, activate]);

  const toggleMotion = () => {
    const next = !motion;
    setMotion(next);
    try {
      window.localStorage.setItem(MOTION_KEY, next ? 'on' : 'paused');
    } catch {
      // almacenamiento no disponible: la preferencia vale solo para esta visita
    }
    if (next) delete document.documentElement.dataset.motion;
    else document.documentElement.dataset.motion = 'paused';
    send({ type: 'motion', on: next });
  };

  const home = typeof document !== 'undefined' ? document.querySelector('.home') : null;
  const actionable = tip && ((tip.node.kind === 'producto' && tip.node.url) || tip.node.kind !== 'producto');

  return (
    <>
      <div ref={hostRef} className="stage-host" aria-hidden="true" />
      {home
        ? createPortal(
            <>
              {phase === 'live' || phase === 'loading' ? (
                <button type="button" className="graph-motion" aria-pressed={!motion} onClick={toggleMotion}>
                  {t.pause}
                </button>
              ) : null}
              {phase === 'reduced' ? (
                <button
                  type="button"
                  className="graph-explore"
                  onClick={() => {
                    setMotion(false);
                    document.documentElement.dataset.motion = 'paused';
                    void start(false);
                  }}
                >
                  {t.explore}
                </button>
              ) : null}
              {tip ? (
                <div className="graph-tip" role="tooltip" style={{ transform: `translate(${Math.round(tip.x)}px, ${Math.round(tip.y)}px)` }}>
                  <p className="graph-tip-kind">{t.kinds[tip.node.kind]}</p>
                  <p className="graph-tip-label">{tip.node.label[locale]}</p>
                  {tip.node.role ? <p className="graph-tip-role">{tip.node.role[locale]}</p> : null}
                  {tip.node.year ? (
                    <p className="graph-tip-years">
                      {tip.node.year} — {tip.node.yearEnd ?? t.present}
                    </p>
                  ) : null}
                  {actionable ? <p className="graph-tip-hint">{t.openHint}</p> : null}
                </div>
              ) : null}
            </>,
            home,
          )
        : null}
    </>
  );
}
```

Si `react-hooks/set-state-in-effect` marca el `setPhase('reduced')`, no aplica: está dentro de un callback de idle, no en el cuerpo síncrono del efecto. Si aun así la regla lo marca, mueve la decisión a una función `decide()` fuera del efecto y llámala desde el callback. No desactives la regla.

- [ ] **Step 5: Integración en `Stage`, `Hero` y la página**

`src/components/home/Stage.tsx`:

```tsx
import GraphStageLazy from '@/components/graph/GraphStageLazy';
import type { HomeCopy } from '@/content/home';
import { POSTER_ASSET } from '@/graph/generated/stats';
import type { Locale } from '@/lib/site';

/**
 * Escenario fijo durante todo el scroll. El póster lo pinta el servidor como archivo con hash en /graph (caché
 * immutable), no como SVG inline (enmienda I5, spec §5.2). Al lado va la puerta GraphStageLazy, que monta la
 * escena WebGL encima cuando procede. `.stage` conserva aria-hidden (enmienda H3).
 */
export default function Stage({ locale, t }: { locale: Locale; t: HomeCopy }) {
  return (
    <div className="stage" data-stage aria-hidden="true">
      <div className="stage-poster">
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático: next/image no aporta nada y añade JS */}
        <img src={POSTER_ASSET} alt="" width={1600} height={1000} decoding="async" fetchPriority="low" />
      </div>
      <GraphStageLazy locale={locale} t={t.graph} />
    </div>
  );
}
```

En `src/app/[locale]/(home)/page.tsx`: `<Stage locale={locale} t={t} />`.

En `src/components/home/Hero.tsx`: `<section className="hero" aria-labelledby="hero-title" data-section="hero">`.

- [ ] **Step 6: Estilos del 3D en `src/styles/home.css`**

Añade dentro de `@layer home`, antes del bloque de movimiento:

```css
  /* ── Escena 3D ── */
  .stage-host {
    position: absolute;
    inset: 0;
  }
  .stage-canvas {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.6s var(--ease-out);
  }
  .stage[data-state='live'] .stage-canvas {
    opacity: 1;
  }
  .stage[data-state='live'] .stage-poster {
    animation: none;
    opacity: 0;
    transition: opacity 0.6s var(--ease-out);
  }
  .stage[data-state='live']::before {
    opacity: 0;
  }
  .graph-motion,
  .graph-explore {
    position: fixed;
    right: var(--gutter);
    bottom: 1.25rem;
    z-index: 40;
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    min-height: 2.5rem;
    padding: 0.55rem 1rem;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    background: rgb(5 9 11 / 0.82);
    color: var(--text-soft);
    font-family: var(--f-mono);
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .graph-motion::before {
    content: '❚❚';
    font-size: 0.66rem;
    letter-spacing: -0.1em;
  }
  .graph-motion[aria-pressed='true'] {
    color: var(--gold-2);
    border-color: color-mix(in oklab, var(--gold) 50%, transparent);
  }
  .graph-motion[aria-pressed='true']::before {
    content: '▶';
  }
  .graph-explore {
    color: var(--text-strong);
    border-color: color-mix(in oklab, var(--teal) 60%, transparent);
  }
  .graph-tip {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 45;
    max-width: 18rem;
    padding: 0.7rem 0.9rem;
    pointer-events: none;
    translate: 14px -50%;
    background: rgb(5 9 11 / 0.92);
    border: 1px solid var(--line-strong);
    border-radius: 12px;
    display: grid;
    gap: 0.2rem;
  }
  .graph-tip-kind {
    font-family: var(--f-mono);
    font-size: 0.66rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--teal-2);
  }
  .graph-tip-label {
    font-family: var(--f-display);
    font-size: 1.3rem;
    line-height: 1.1;
    color: var(--text-strong);
  }
  .graph-tip-role,
  .graph-tip-years {
    font-size: 0.82rem;
    color: var(--text-soft);
  }
  .graph-tip-hint {
    margin-top: 0.3rem;
    font-size: 0.72rem;
    color: var(--gold-2);
  }
  html[data-motion='paused'] .home .reveal {
    animation: none;
  }
```

- [ ] **Step 7: Build y verificación del bundle del worker**

```bash
npm run typecheck && npm run lint && npm test && npm run build 2>&1 | tail -25
ls .next/static/media 2>/dev/null | grep -i worker; grep -rl "GRF1\|graph.worker" .next/static/chunks 2>/dev/null | head -5
```

Resultado esperado: el build pasa y existe un chunk del worker. Si Turbopack no acepta `new Worker(new URL(...), { type: 'module' })`:
1. Cambia el script `build` a `NODE_ENV=production next build --webpack`.
2. Documenta el motivo en el commit.
3. Verifica de nuevo.

- [ ] **Step 8: Prueba manual rápida en navegador**

```bash
(npx next start -p 3100 & sleep 6)
node /tmp/claude-1000/-workspace-MySites/7ea71e47-55a6-4be8-a107-7aa1ceab04d6/scratchpad/refshot/capture.cjs "http://localhost:3100/es?gl=force" /workspace/.scratch-steven-redesign/shots/p2-t4
kill %1
```

Mira `d-hero-t0..3.png` con Read. El grafo 3D debe verse con nodos luminosos, aristas con pulsos y hubs de cristal. El script mueve el ratón, así que el 3D arranca. Si solo se ve el póster, revisa la consola: el script guarda `d-report.json`. Si hace falta, añade temporalmente un `page.on('console')` al script local (fuera del repo) para depurar.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(graph-3d): worker con OffscreenCanvas, isla GraphStage (sonda, puente de eventos, tooltip, pausa, reduced motion) e integración en la home

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: E2E del 3D, fallback, presupuestos y capturas por sección

**Files:**
- Create: `e2e/graph3d.spec.ts`
- Modify: `playwright.config.ts` (proyecto `3d` con WebGL por SwiftShader, que solo ejecuta `graph3d.spec.ts`; los demás proyectos lo ignoran)

**Interfaces:**
- Consume: todo lo anterior; selectores `.stage[data-state="live"]`, `.graph-motion`, `.graph-explore`, `.graph-tip`, `[data-section]`, `[data-node]`.
- Produce: evidencia de funcionamiento del 3D en navegador real y capturas en `/workspace/.scratch-steven-redesign/shots/3d-*.png`.

- [ ] **Step 1: Proyecto `3d` en Playwright**

En `playwright.config.ts`:
- Añade `testIgnore: /graph3d\.spec\.ts/` a los proyectos `desktop`, `tablet` y `mobile`.
- Añade este proyecto:

```ts
    {
      name: '3d',
      testMatch: /graph3d\.spec\.ts/,
      timeout: 180_000,
      use: {
        viewport: { width: 1440, height: 900 },
        launchOptions: {
          executablePath: process.env.PW_CHROME ?? '/usr/bin/google-chrome',
          args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
        },
      },
    },
```

- [ ] **Step 2: Tests**

`e2e/graph3d.spec.ts`:

```ts
import { gzipSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';

const SHOTS = '/workspace/.scratch-steven-redesign/shots';

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

async function openLive(page: Page, query = 'gl=force') {
  await page.goto(`/es?${query}`);
  await page.mouse.move(320, 240);
  await expect(page.locator('.stage[data-state="live"]')).toBeAttached({ timeout: 60_000 });
  await page.waitForTimeout(1500);
}

async function findNode(page: Page) {
  const { width, height } = page.viewportSize()!;
  for (let y = height * 0.3; y < height * 0.72; y += 22) {
    for (let x = width * 0.28; x < width * 0.72; x += 22) {
      await page.mouse.move(x, y);
      await page.waitForTimeout(90);
      if (await page.locator('.graph-tip').isVisible()) return true;
    }
  }
  return false;
}

test('el grafo 3D arranca en el worker, pinta y se anima', async ({ page }) => {
  const errors = watchErrors(page);
  await openLive(page);
  const a = await page.locator('.stage').screenshot({ path: `${SHOTS}/3d-hero.png` });
  await page.waitForTimeout(800);
  const b = await page.locator('.stage').screenshot();
  expect(a.length).toBeGreaterThan(20_000);
  expect(a.equals(b)).toBe(false);
  expect(errors).toEqual([]);
});

test('hover sobre un nodo muestra su ficha', async ({ page }) => {
  await openLive(page);
  expect(await findNode(page)).toBe(true);
  await expect(page.locator('.graph-tip .graph-tip-label')).not.toBeEmpty();
  await page.screenshot({ path: `${SHOTS}/3d-hover.png` });
});

test('la pausa detiene la animación y persiste', async ({ page }) => {
  await openLive(page);
  const button = page.locator('.graph-motion');
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  await page.mouse.move(5, 5);
  await page.waitForTimeout(1500);
  const a = await page.locator('.stage').screenshot();
  await page.waitForTimeout(700);
  const b = await page.locator('.stage').screenshot();
  expect(a.equals(b)).toBe(true);
  await page.reload();
  await page.mouse.move(320, 240);
  await expect(page.locator('.graph-motion')).toHaveAttribute('aria-pressed', 'true', { timeout: 60_000 });
});

test('el scroll recorre las cinco formas sin errores', async ({ page }) => {
  const errors = watchErrors(page);
  await openLive(page);
  for (const section of ['metodo', 'trayectoria', 'frentes', 'prueba', 'contacto']) {
    await page.locator(`[data-section="${section}"]`).scrollIntoViewIfNeeded();
    await page.evaluate((s) => document.querySelector(`[data-section="${s}"]`)!.scrollIntoView({ block: 'center' }), section);
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${SHOTS}/3d-${section}.png` });
  }
  expect(errors).toEqual([]);
});

test('el foco de teclado en un producto mueve la cámara hacia su nodo', async ({ page }) => {
  await openLive(page);
  await page.locator('[data-section="frentes"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const before = await page.locator('.stage').screenshot();
  await page.locator('[data-node="producto:nlp-to-logic"] a').first().focus();
  await page.waitForTimeout(1800);
  const after = await page.locator('.stage').screenshot();
  expect(before.equals(after)).toBe(false);
});

test('fallback en el hilo principal (?worker=off) también pinta', async ({ page }) => {
  const errors = watchErrors(page);
  await openLive(page, 'gl=force&worker=off');
  await page.locator('.stage').screenshot({ path: `${SHOTS}/3d-fallback.png` });
  expect(errors).toEqual([]);
});

test('reduced motion: póster y botón "Explorar en 3D" sin autoplay', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('/es');
  await page.mouse.move(300, 300);
  const explore = page.locator('.graph-explore');
  await expect(explore).toBeVisible({ timeout: 20_000 });
  await explore.click();
  await expect(page.locator('.stage[data-state="live"]')).toBeAttached({ timeout: 60_000 });
  await expect(page.locator('.graph-motion')).toHaveAttribute('aria-pressed', 'true');
  await context.close();
});

test('presupuesto del worker y sus chunks ≤ 175 KB gz', async ({ page, baseURL }) => {
  const before = new Set<string>();
  const after: Promise<number>[] = [];
  let armed = false;
  page.on('response', (r) => {
    const url = r.url();
    if (!url.startsWith(baseURL!) || !/\.m?js(\?|$)/.test(url)) return;
    if (!armed) before.add(url);
    else if (!before.has(url)) after.push(r.body().then((b) => gzipSync(b).length));
  });
  await page.goto('/es?gl=force', { waitUntil: 'networkidle' });
  armed = true;
  await page.mouse.move(320, 240);
  await expect(page.locator('.stage[data-state="live"]')).toBeAttached({ timeout: 60_000 });
  await page.waitForTimeout(1500);
  const total = (await Promise.all(after)).reduce((x, y) => x + y, 0);
  console.log(`JS del 3D: ${(total / 1024).toFixed(1)} KB gz en ${after.length} archivos`);
  expect(total).toBeGreaterThan(0);
  expect(total).toBeLessThanOrEqual(175 * 1024);
});
```

- [ ] **Step 3: Ejecutar**

```bash
npm run build && npm run e2e
```

Resultado esperado: pasan todos los proyectos, también los e2e del Plan 1. Que el 3D no arranque en headless sin `gl=force` no deja igual el presupuesto de JS: la puerta `GraphStageLazy` se descarga en toda carga de la home y cuenta en el presupuesto de la ruta crítica, que tiene muy poco margen (spec §5.1). Con la enmienda H1, el test de presupuesto cuenta los scripts pedidos antes de `load` y la puerta tiene que caber ahí. El chunk de `GraphStage` y el worker, que llegan tras la primera interacción o el idle, van al presupuesto del 3D (≤ 175 KB gz). Si la puerta no cabe, no se sube el límite: se para y se lleva la decisión a la tabla de §5, que decide Steven.
- Mira con Read todas las capturas `3d-*.png`. Cada sección debe mostrar su forma: red, dos hemisferios, hélice, clusters, grafo atenuado en Prueba y lemniscata (∞) en Contacto.
- Si una forma no se reconoce o se ve mal (nodos demasiado grandes o pequeños, aristas invisibles, texto sin contraste), ajusta los parámetros visuales de `SPRITE_PX`, `HUB_SCALE`, `SECTION_POSE` y los shaders, y repite.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test(e2e): grafo 3D en navegador (worker, hover, pausa, formas por sección, foco, fallback, reduced motion y presupuesto)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Lighthouse final, pulido visual y spec al día

**Files:**
- Modify: los que requiera el pulido (`src/styles/home.css`, `src/graph/scene/*`, `src/content/home.ts`)
- Modify: `docs/superpowers/specs/2026-09-23-home-grafo-design.md` (desviaciones del Plan 2)

**Interfaces:**
- Consume: todo.
- Produce: medianas de Lighthouse dentro de objetivo y la spec reflejando lo construido.

- [ ] **Step 1: Lighthouse (ruta del póster, la que mide el laboratorio)**

```bash
npm run build
(npx next start -p 3210 & echo $! > /workspace/.scratch-steven-redesign/next.pid; sleep 6)
npm run lighthouse
kill $(cat /workspace/.scratch-steven-redesign/next.pid)
cat /workspace/.scratch-steven-redesign/lh/summary.json
```

Resultado esperado:
- SEO, Accessibility y Best Practices = 100.
- Performance ≥ 95 en móvil y ≥ 98 en escritorio.
- LCP ≤ 2500 ms (enmienda H2), TBT ≤ 100 ms, CLS ≤ 0.02.

Si algo baja respecto al Plan 1, la causa está en el JS nuevo del hilo principal (`GraphStage` y su chunk). Revisa que `GraphStageLazy` siga siendo la puerta mínima de la enmienda H1 (sin `next/dynamic` en el render) y que `GraphStage` no importe three ni `postprocessing` de forma estática.

- [ ] **Step 2: Revisión visual**

Mira de nuevo las capturas de la Tarea 5 (`3d-*.png`) y las de la home (`desktop-es.png`, `mobile-es.png`). Criterio (spec §3):
- La luz es semántica: teal para ingeniería, oro para lógica, violeta para ciencias, óxido para enterprise.
- Solo los pulsos y el hover activan el bloom.
- Ningún texto queda ilegible sobre el grafo.
- No hay "campo de estrellas" sin aristas.

Ajusta lo que falle y repite la captura.

- [ ] **Step 3: Spec al día**

En `docs/superpowers/specs/2026-09-23-home-grafo-design.md` (§3.3, §4.4 y §4.8), deja constancia de estas desviaciones:
- Sin etiquetas en el canvas: la etiqueta activa es el tooltip DOM.
- Sin `DepthOfFieldEffect`: el desenfoque es el bokeh en el sprite en todos los niveles.
- `postprocessing` se carga de forma diferida solo en T2/T3.
- La capa decorativa son satélites conectados a su nodo padre.
- Los controles y el tooltip van en un portal dentro de `.home`, con `position: fixed`.
- Hay parámetros de prueba `?gl=force`, `?gl=off` y `?worker=off`.

- [ ] **Step 4: Verificación completa y commit**

```bash
npm run typecheck && npm run lint && npm test && npm run build && npm run e2e
git add -A
git commit -m "perf,docs: Lighthouse en objetivo con el 3D integrado, pulido visual y spec al día

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```
