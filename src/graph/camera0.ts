/**
 * Cámara del primer frame. La comparten el póster SVG, la imagen OG y la escena WebGL (Plan 2):
 * cámara en (0, 0, distance) mirando al origen, fov vertical en grados. El grafo se rota primero
 * `yaw` alrededor de Y y después `pitch` alrededor de X.
 */
export const CAMERA0 = { distance: 4.4, fov: 38, yaw: 0.6, pitch: -0.25 } as const;
