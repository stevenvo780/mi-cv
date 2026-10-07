/** A single bright nucleus per real commit. Glows and diffraction belong to that same star. */
export const COMMIT_STAR_VERTEX = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;
uniform float uTime;
uniform float uDpr;
uniform float uHeight;
uniform float uCompanion;
varying vec3 vColor;
varying float vPhase;
varying float vLight;
void main() {
  vec3 p = position;
  float angle = uTime * mix(0.026,0.013,uCompanion);
  mat2 turn = mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
  p.xy = turn * vec2(p.x,p.y + 0.13);
  p.y -= 0.13;
  p.z += sin(uTime * 0.37 + aPhase * 6.28318) * 0.085;
  vec4 view = modelViewMatrix * vec4(p,1.0);
  float projected = aSize * uDpr * uHeight * 0.5 * projectionMatrix[1][1] / max(0.1,-view.z);
  gl_PointSize = clamp(max(projected, mix(6.2,16.0,uCompanion) * uDpr),1.0,28.0 * uDpr);
  gl_Position = projectionMatrix * view;
  vColor = aColor;
  vPhase = aPhase;
  vLight = 0.92 + sin(uTime * 0.8 + aPhase * 19.0) * 0.08;
}
`;
export const COMMIT_STAR_FRAGMENT = /* glsl */ `
varying vec3 vColor;
varying float vPhase;
varying float vLight;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float radius = dot(p,p);
  if (radius > 1.0) discard;
  float nucleus = exp(-radius * 64.0);
  float corona = exp(-radius * 7.0) * 0.33;
  float spoke = exp(-abs(p.x) * 43.0 - abs(p.y) * 7.0)
    + exp(-abs(p.y) * 43.0 - abs(p.x) * 7.0);
  float edge = 1.0 - smoothstep(0.6,1.0,radius);
  vec3 color = mix(vColor,vec3(1.0,0.98,0.84),nucleus * 0.64);
  float alpha = (nucleus * 0.97 + corona + spoke * 0.075) * vLight * edge;
  gl_FragColor = vec4(color * (0.95 + nucleus * 2.2),alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Continuous trajectories: these are filaments, never additional star nuclei. */
export const COMMIT_FILAMENT_VERTEX = /* glsl */ `
attribute float aProgress;
uniform float uTime;
varying float vProgress;
void main() {
  vec3 p = position;
  float angle = uTime * 0.026;
  mat2 turn = mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
  p.xy = turn * vec2(p.x,p.y + 0.13);
  p.y -= 0.13;
  vProgress = aProgress;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
}
`;
export const COMMIT_FILAMENT_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uStrength;
varying float vProgress;
void main() {
  float flow = 0.6 + 0.4 * sin(vProgress * 13.0 - uTime * 0.8);
  float edge = sin(vProgress * 3.14159);
  vec3 color = mix(vec3(0.09,0.43,0.34),vec3(0.62,0.42,0.17),vProgress);
  gl_FragColor = vec4(color,edge * flow * uStrength);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
