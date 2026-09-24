/*
 * Cinta de una arista (EDGE_VERT la curva y la extruye en pantalla). Tiene `segments` tramos y dos vértices por
 * punto de la curva: el 2i con aSide = −1 y el 2i + 1 con aSide = +1, los dos en t = i / segments.
 */

/** Atributos por vértice: `t` a lo largo de la curva y `side`, el lado de la extrusión. */
export function ribbonVertices(segments: number): { t: Float32Array; side: Float32Array } {
  const n = (segments + 1) * 2;
  const t = new Float32Array(n);
  const side = new Float32Array(n);
  for (let i = 0; i <= segments; i++) {
    t[i * 2] = t[i * 2 + 1] = i / segments;
    side[i * 2] = -1;
    side[i * 2 + 1] = 1;
  }
  return { t, side };
}

/**
 * Dos triángulos por tramo, antihorarios en pantalla. El shader extruye aSide = +1 hacia la normal, que es la
 * tangente girada 90° a la izquierda: con el orden (a, a+1, a+2, …) todos los triángulos quedan de espaldas y
 * FrontSide los descarta (la escena se queda sin aristas). Lo comprueba en CPU tests/graph/scene/ribbon.test.ts.
 */
export function ribbonIndex(segments: number): number[] {
  const index: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  return index;
}
