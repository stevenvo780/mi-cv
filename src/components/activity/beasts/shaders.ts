/** All pigments are linear HDR. The render pipeline applies a single final tone mapping pass. */
export const SURFACE_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uWave;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPosition;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  p.z += uWave * sin(p.x * 3.2 + p.y * 2.4 + uTime * 1.5) * sin(uv.x * 3.14159);
  vec4 world = modelMatrix * vec4(p, 1.0);
  vec4 view = viewMatrix * world;
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-view.xyz);
  vPosition = world.xyz;
  gl_Position = projectionMatrix * view;
}
`;

export const METAL_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uEnergy;
uniform float uFade;
uniform float uSeed;
uniform float uTexture;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPosition;
varying vec2 vUv;
float hash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7))) * 43758.5453); }
void main() {
  if (uFade < 0.999 && hash(floor(vPosition * 135.0)) > uFade) discard;
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n *= -1.0;
  vec3 eye = normalize(vView);
  vec3 r = reflect(-eye,n);
  float fresnel = pow(1.0 - abs(dot(n,eye)), 2.5);
  float lit = max(dot(n,normalize(vec3(-0.45,0.8,0.85))),0.0);
  float warm = smoothstep(-0.6,0.6,r.x * 0.7 + r.y);
  vec3 reflection = mix(vec3(0.035,0.27,0.25),vec3(0.65,0.37,0.095),warm);
  float strip = pow(max(dot(r,normalize(vec3(-0.72,0.63,0.35))),0.0),26.0);
  float glint = pow(max(dot(r,normalize(vec3(0.7,0.38,0.55))),0.0),90.0);
  float grain = 0.9 + sin(vPosition.y * 145.0 + vPosition.x * 73.0) * 0.035;
  float veins = pow(0.5 + 0.5 * sin(vPosition.x * 12.0 + sin(vPosition.y * 9.0 + uSeed) * 2.8 + vPosition.z * 8.0),25.0);
  float current = pow(0.5 + 0.5 * sin(vPosition.y * 5.0 - uTime * 2.0 + uSeed),10.0);
  vec3 col = uColor * (0.18 + lit * 0.8) + reflection * (0.12 + fresnel * 0.55);
  col += vec3(0.88,0.93,0.82) * strip * 0.7 + vec3(1.15,0.86,0.46) * glint * 0.5;
  col += mix(uColor,vec3(0.75,0.45,0.12),0.28) * veins * uTexture * (0.2 + current * (0.6 + uEnergy * 0.6));
  col *= grain;
  gl_FragColor = vec4(col,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const MEMBRANE_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uEnergy;
uniform float uFade;
uniform float uSeed;
uniform float uTexture;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPosition;
varying vec2 vUv;
void main() {
  vec3 n = normalize(vNormal);
  float fresnel = pow(1.0 - abs(dot(n,normalize(vView))),1.8);
  float field = sin(vUv.x * 15.0 + sin(vUv.y * 10.0) * 1.5 + uTime * 0.5 + uSeed);
  float vein = pow(0.5 + 0.5 * sin(vUv.y * 52.0 + vUv.x * 7.0 + field),20.0);
  float sweep = pow(0.5 + 0.5 * sin(vUv.x * 6.0 - uTime * 1.4),8.0);
  vec3 chroma = 0.5 + 0.5 * cos(vec3(0.0,2.1,4.2) + field + fresnel * 3.0);
  vec3 col = mix(uColor,chroma * 0.65,0.25) * (0.35 + fresnel * 1.3 + vein * 0.65);
  col += uColor * sweep * (0.12 + uEnergy * 0.35) + vec3(0.7,0.48,0.14) * vein * 0.2;
  float alpha = (0.2 + fresnel * 0.3 + vein * 0.13) * uFade;
  gl_FragColor = vec4(col,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const CORE_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uEnergy;
uniform float uFade;
uniform float uSeed;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  float lit = 0.7 + max(dot(normalize(vNormal),normalize(vec3(-0.3,0.8,0.7))),0.0) * 0.3;
  float pulse = 0.9 + 0.1 * sin(uTime * 2.0 + uSeed);
  vec3 col = uColor * lit * pulse * (1.0 + uEnergy * 0.8);
  gl_FragColor = vec4(col,uFade);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const DUST_VERTEX = /* glsl */ `
attribute float aPhase;
attribute float aSize;
uniform float uTime;
uniform float uBurst;
uniform float uDpr;
uniform float uHeight;
varying float vAlpha;
varying float vPhase;
void main() {
  vec3 p = position;
  float t = uTime * 0.13;
  p.x += sin(t + aPhase * 3.0) * 0.16;
  p.y += sin(t * 0.7 + aPhase) * 0.13;
  p.z += cos(t + aPhase * 2.0) * 0.15;
  p *= 1.0 + uBurst * 0.38;
  vec4 view = modelViewMatrix * vec4(p,1.0);
  gl_PointSize = clamp(aSize * uDpr * uHeight * 0.5 * projectionMatrix[1][1] / max(0.1,-view.z),1.0,24.0);
  gl_Position = projectionMatrix * view;
  vAlpha = 0.32 + 0.3 * sin(uTime * 0.5 + aPhase * 7.0) + uBurst * 0.5;
  vPhase = aPhase;
}
`;
export const DUST_FRAGMENT = /* glsl */ `
uniform float uEnergy;
varying float vAlpha;
varying float vPhase;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r = dot(p,p);
  if (r > 1.0) discard;
  float core = exp(-r * 35.0);
  float halo = exp(-r * 5.0) * (1.0 - smoothstep(0.4,1.0,r));
  vec3 color = mix(vec3(0.08,0.62,0.48),vec3(0.95,0.62,0.2),step(0.66,vPhase));
  gl_FragColor = vec4(color * (0.7 + core * 2.0), (halo * 0.32 + core * 0.6) * vAlpha * (0.55 + uEnergy * 0.45));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
export const HALO_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
export const HALO_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uEnergy;
varying vec2 vUv;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float center = exp(-r * r * 3.7);
  float shafts = pow(max(0.0,sin(atan(p.y,p.x) * 5.0 + uTime * 0.1)),14.0) * exp(-r * r * 1.6) * 0.08;
  float edge = 1.0 - smoothstep(0.65,1.0,r);
  vec3 col = mix(vec3(0.015,0.2,0.16),vec3(0.11,0.055,0.18),smoothstep(-0.5,0.6,p.x));
  gl_FragColor = vec4(col,(center * 0.38 + shafts) * edge * (0.7 + uEnergy * 0.3));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
