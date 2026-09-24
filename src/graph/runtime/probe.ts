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

/**
 * ¿Admite el OffscreenCanvas un contexto WebGL2? La sonda solo prueba WebGL2 en un canvas del hilo principal, y Safari
 * 16.4–16.x tiene OffscreenCanvas solo 2D: ahí el worker no puede pintar y la escena va al hilo principal (spec §4.4
 * paso 3, §8). Libera el contexto de la prueba.
 */
export function offscreenWebGL2(scope: { OffscreenCanvas?: typeof OffscreenCanvas } = globalThis): boolean {
  if (typeof scope.OffscreenCanvas !== 'function') return false;
  try {
    const gl = new scope.OffscreenCanvas(1, 1).getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
