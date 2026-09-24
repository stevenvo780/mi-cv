/* Shaders de la escena del grafo. Colores en espacio lineal; los pulsos salen en HDR (> 1) para el bloom. */

const COMMON = /* glsl */ `
uniform sampler2D uLayouts;
uniform sampler2D uHighlight;
uniform int uFrom;
uniform int uTo;
uniform float uMix;
uniform float uTime;
uniform float uFocus;

const float BREATH_AMP = 0.016;
const float BREATH_RATE = 0.08;
const float FOG_MAX = 0.7;
const float FOG_NEAR = 0.4;
const float FOG_FAR = 1.0;

/* Fila de la textura = forma. El parámetro no se llama "layout": es palabra reservada en GLSL ES 3.00. */
vec3 layoutPos(int row, float ref) {
  return texelFetch(uLayouts, ivec2(int(ref + 0.5), row), 0).xyz;
}
float highlightOf(float ref) {
  return texelFetch(uHighlight, ivec2(int(ref + 0.5), 0), 0).r;
}
float nodeKey(float ref, vec3 off) {
  return fract(ref * 0.1373 + dot(off, vec3(12.989, 78.233, 37.719)));
}

/*
 * Ruido simplex 2D (Perlin 2001; formulación de Gustavson, «Simplex noise demystified»). El gradiente de cada
 * vértice de la rejilla sale de un hash sin tablas: la permutación polinómica (34x² + x) mod 289. Todos los
 * enteros intermedios caben exactos en un float de 32 bits (< 2^24). Con gradientes unitarios y núcleo
 * (0.5 − d²)⁴ la suma no pasa de ≈ 0.0101 (medido con 4 millones de muestras): ×99 deja la salida en [-1, 1].
 */
vec3 permute289(vec3 x) {
  return mod((x * 34.0 + 1.0) * x, 289.0);
}
float simplex(vec2 p) {
  const float F2 = 0.36602540;  // (√3 − 1) / 2: del plano a la rejilla de triángulos
  const float G2 = 0.21132487;  // (3 − √3) / 6: de vuelta
  vec2 i = floor(p + (p.x + p.y) * F2);
  vec2 x0 = p - i + (i.x + i.y) * G2;
  vec2 o = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 x1 = x0 - o + G2;
  vec2 x2 = x0 - 1.0 + 2.0 * G2;
  i = mod(i, 289.0);
  vec3 a = permute289(permute289(i.x + vec3(0.0, o.x, 1.0)) + i.y + vec3(0.0, o.y, 1.0)) * (6.2831853 / 289.0);
  vec3 w = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
  w *= w;
  w *= w;
  vec3 g = vec3(dot(vec2(cos(a.x), sin(a.x)), x0), dot(vec2(cos(a.y), sin(a.y)), x1), dot(vec2(cos(a.z), sin(a.z)), x2));
  return 99.0 * dot(w, g);
}

/*
 * Posición animada de un nodo (semántico: off = 0; satélite: off = desplazamiento). La misma para sprites, hubs y
 * aristas. Respiración (spec §3.4): ruido simplex por instancia; cada nodo recorre en el tiempo su propia fila del
 * campo de ruido, una por eje.
 */
vec3 nodePos(float ref, vec3 off) {
  vec3 p = mix(layoutPos(uFrom, ref), layoutPos(uTo, ref), uMix) + off;
  float lane = nodeKey(ref, off) * 173.0;
  float t = uTime * BREATH_RATE;
  return p + BREATH_AMP * vec3(simplex(vec2(t, lane)), simplex(vec2(t + 37.1, lane + 11.3)), simplex(vec2(t + 71.7, lane + 23.9)));
}

/*
 * Niebla (spec §3.3): 0 por delante del plano de foco y hasta FOG_MAX detrás, según la profundidad de vista.
 * Se aplica hacia el fondo: alfa en los nodos, intensidad en las aristas (aditivas) y color en los hubs (opacos).
 */
float fogOf(float depth) {
  return FOG_MAX * smoothstep(uFocus - FOG_NEAR, uFocus + FOG_FAR, depth);
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
  float fog = fogOf(depth) * (1.0 - hl);
  vAlpha = (aSemantic > 0.5 ? 1.0 : 0.6 * twinkle) * (1.0 - 0.5 * coc) * uDim * hover * (1.0 - fog);
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
varying float vFog;
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
  vFog = fogOf(max(-mv.z, 0.05)) * (1.0 - hl);
  gl_Position = projectionMatrix * mv;
}
`;

export const HUB_FRAG = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec3 vColor;
varying float vHl;
varying float vFog;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(vV);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 refr = refract(-v, n, 0.72);
  vec3 env = mix(vec3(0.004, 0.008, 0.01), vColor * 0.85, smoothstep(-0.7, 0.9, refr.y));
  env += vec3(0.95, 0.9, 0.85) * pow(max(refr.x * 0.7 + refr.y * 0.7, 0.0), 8.0) * 0.6;
  vec3 col = env * 0.6 + vColor * fres * 1.8 + vec3(1.0) * pow(fres, 7.0) * 0.9;
  col *= 1.0 + vHl * 1.4;
  col = mix(col, vec3(0.004, 0.012, 0.02), vFog);
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
varying float vCover;
varying float vFog;
const float DECOR_WIDTH = 0.4;
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
  float hA = step(0.99, highlightOf(aA));
  float hB = step(0.99, highlightOf(aB));
  float hl = aSemantic * max(hA, hB);
  float w = uWidth * (aSemantic > 0.5 ? 0.55 + 0.3 * aWeight : DECOR_WIDTH) * (1.0 + 1.4 * hl);
  /* Por debajo de 1 px de semiancho el rasterizador deja la cinta a trozos: se dibuja a 1 px y la línea base se
     atenúa en proporción (vCover), así conserva la energía de su ancho real. */
  float wd = max(w, 1.0);
  clip.xy += nrm * aSide * wd * 2.0 / uResolution * clip.w;
  gl_Position = clip;
  /* Los pulsos van del nodo activo hacia sus vecinos (spec §2.2): si el activo es el extremo b, t se recorre al revés. */
  vT = mix(aT, 1.0 - aT, aSemantic * hB * (1.0 - hA));
  vCover = w / wd;
  vFog = fogOf(max(clip.w, 0.05)) * (1.0 - hl);
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
varying float vCover;
varying float vFog;
/* Opacidad de la línea base en reposo (spec §3.3: ~0.15). */
const float BASE_SEMANTIC = 0.15;
const float BASE_DECOR = 0.05;
void main() {
  float aa = 1.0 - smoothstep(0.55, 1.0, abs(vSide));
  /* La línea base y los pulsos tenues de la capa decorativa conservan la energía de su ancho real (vCover); los
     pulsos semánticos son cuentas de luz HDR del ancho de la cinta: son los que tienen que pasar el umbral del bloom. */
  float base = (vSemantic > 0.5 ? BASE_SEMANTIC : BASE_DECOR) * vCover;
  float speed = 0.16 + 0.1 * vWeight + 0.4 * vHl;
  float p1 = fract(uTime * speed + vSeed);
  float p2 = fract(uTime * speed * 0.61 + vSeed * 3.7);
  float pulse = exp(-pow((vT - p1) * 16.0, 2.0)) + 0.55 * exp(-pow((vT - p2) * 22.0, 2.0));
  float glow = base + pulse * (vSemantic > 0.5 ? 1.5 : 0.35 * vCover) * (1.0 + 2.2 * vHl);
  float hover = mix(1.0, mix(0.25, 1.0, vHl), uHoverActive);
  vec3 col = vColor * glow + vec3(1.0) * pulse * 0.55 * vSemantic * (1.0 + vHl);
  /* Mezcla aditiva (SRC_ALPHA, ONE): la intensidad va en el color (base y pulsos HDR) y el alfa solo lleva
     cobertura, atenuación y niebla. Si el alfa también llevara glow, la base contaría al cuadrado (0.15² ≈ 0.02). */
  gl_FragColor = vec4(col, aa * uDim * hover * (1.0 - vFog));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
