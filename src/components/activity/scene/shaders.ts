/**
 * GLSL 1 shaders for the activity sculpture.
 * Ribbon: BufferGeometry position / normal / uv; uTime and uOpacity are floats.
 */
export const RIBBON_VERTEX = /* glsl */ `
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;

    // A very small breathing displacement preserves the sculpted silhouette.
    float breath = sin(position.y * 1.7 + position.x * 0.6 + uTime * 0.36);
    vec3 displaced = position + normal * breath * 0.006;
    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);

    vWorldPosition = worldPosition.xyz;
    // Recover the world normal from the normal matrix, including nonuniform scale.
    vWorldNormal = normalize(
      vec3(vec4(normalMatrix * normal, 0.0) * viewMatrix)
    );

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const RIBBON_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec3 normalDirection = normalize(vWorldNormal);
    if (!gl_FrontFacing) normalDirection *= -1.0;

    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 reflected = reflect(-viewDirection, normalDirection);
    float facing = clamp(abs(dot(normalDirection, viewDirection)), 0.0, 1.0);
    float rim = pow(1.0 - facing, 2.7);

    vec3 teal = vec3(0.045, 0.42, 0.38);
    vec3 gold = vec3(0.65, 0.34, 0.085);
    vec3 violet = vec3(0.26, 0.105, 0.39);
    vec3 white = vec3(1.0, 0.97, 0.88);

    // Broad, curved reflected fields give the metal depth without an environment map.
    float flow = vUv.y * 6.2831853 + uTime * 0.14;
    float reflectionCoordinate = dot(
      reflected, normalize(vec3(-0.55, 0.66, 0.51))
    ) + sin(flow * 1.35) * 0.095;
    float warmField = smoothstep(-0.42, 0.3, reflectionCoordinate);
    float violetField = smoothstep(0.25, 0.82, -reflected.x + reflected.y * 0.25);
    vec3 reflectedColor = mix(teal, gold, warmField);
    reflectedColor = mix(reflectedColor, violet, violetField * 0.58);

    float broadLight = pow(max(dot(
      reflected, normalize(vec3(-0.8, 0.7, 0.45))
    ), 0.0), 12.0);
    float coolLight = pow(max(dot(
      reflected, normalize(vec3(0.85, 0.15, 0.52))
    ), 0.0), 18.0);

    // Fine parallel contours read as machined, layered material as it turns.
    float contourCoordinate = vUv.x + sin(flow * 1.8) * 0.012;
    float contours = 0.5 + 0.5 * sin(contourCoordinate * 6.2831853 * 82.0);
    float fineLines = pow(contours, 14.0);
    float secondaryLines = 0.5 + 0.5 * sin(
      contourCoordinate * 6.2831853 * 164.0 + 0.8
    );
    float brushing = 0.87 + contours * 0.11 + secondaryLines * 0.025;

    vec3 color = vec3(0.009, 0.018, 0.022);
    color += reflectedColor * (0.2 + broadLight * 0.78 + coolLight * 0.34) * 1.4;
    color *= brushing;
    color += mix(teal, gold, warmField) * fineLines * (0.055 + rim * 0.065);

    // Narrow white reflections and a second warm glint animate across the folds.
    float glint = pow(max(dot(
      reflected, normalize(vec3(-0.48, 0.78, 0.4))
    ), 0.0), 110.0);
    float warmGlint = pow(max(dot(
      reflected, normalize(vec3(0.63, -0.28, 0.72))
    ), 0.0), 155.0);
    float glintVariation = 0.8 + 0.2 * sin(flow * 2.4);
    color += white * glint * glintVariation * 1.35;
    color += vec3(1.0, 0.72, 0.31) * warmGlint * 0.85;
    color += mix(teal, gold, warmField) * rim * 0.48;

    gl_FragColor = vec4(color, uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * Points attributes: position, aSize (world-space diameter), aColor (vec3),
 * aPhase (float). uViewportHeight is CSS pixels; uPixelRatio scales to device pixels.
 */
export const PARTICLE_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uViewportHeight;

  varying vec3 vColor;
  varying float vPulse;
  varying float vVisible;

  void main() {
    vec3 drifting = position;
    float time = uTime * 0.12;
    drifting.x += sin(time + aPhase) * 0.045;
    drifting.y += sin(time * 0.71 + aPhase * 1.9) * 0.055;
    drifting.z += cos(time * 0.63 + aPhase * 1.3) * 0.035;

    vec4 viewPosition = modelViewMatrix * vec4(drifting, 1.0);
    float perspectiveScale = projectionMatrix[1][1] * 0.5
      * uViewportHeight * uPixelRatio / max(0.1, -viewPosition.z);

    gl_PointSize = clamp(aSize * perspectiveScale, 1.0, 72.0);
    gl_Position = projectionMatrix * viewPosition;
    vColor = aColor;
    vPulse = 0.68 + 0.32 * sin(uTime * 0.42 + aPhase);
    vVisible = step(0.0001, aSize);
  }
`;

export const PARTICLE_FRAGMENT = /* glsl */ `
  uniform float uOpacity;

  varying vec3 vColor;
  varying float vPulse;
  varying float vVisible;

  void main() {
    if (vVisible < 0.5) discard;

    vec2 point = gl_PointCoord * 2.0 - 1.0;
    float radiusSquared = dot(point, point);
    if (radiusSquared > 1.0) discard;

    float edge = 1.0 - smoothstep(0.42, 1.0, radiusSquared);
    float halo = exp(-radiusSquared * 4.6) * edge;
    float core = exp(-radiusSquared * 58.0);
    float brightCore = exp(-radiusSquared * 180.0);
    vec3 color = vColor * (0.6 + halo * 0.7);
    color += vec3(1.0, 0.94, 0.76) * core * 0.8;
    color += vec3(1.0) * brightCore * 0.45;

    float alpha = (halo * 0.32 + core * 0.65) * vPulse * uOpacity;
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** PlaneGeometry background: standard position / uv; uTime and uOpacity are floats. */
export const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;

  varying vec2 vUv;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 fraction = fract(point);
    vec2 blend = fraction * fraction * (3.0 - 2.0 * fraction);
    return mix(
      mix(hash(cell), hash(cell + vec2(1.0, 0.0)), blend.x),
      mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), blend.x),
      blend.y
    );
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.8, -0.6, 0.6, 0.8);
    for (int octave = 0; octave < 5; octave++) {
      value += amplitude * noise(point);
      point = rotation * point * 2.03 + vec2(13.7, 7.2);
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 point = vUv * 2.0 - 1.0;
    vec2 field = point * vec2(1.3, 0.95);
    float time = uTime * 0.018;
    float folds = fbm(field * 2.4 + vec2(time, -time * 0.4));
    float detail = fbm(field * 4.1 + vec2(-time * 0.6, time * 0.25));
    float bend = (folds - 0.5) * 0.3;

    // A few broad, softly folded curtains, with no stars or discrete specks.
    float tealDistance = point.x * 0.58 + point.y * 0.24 + bend + 0.18;
    float violetDistance = point.x * 0.48 - point.y * 0.34 - bend - 0.48;
    float goldDistance = point.x * 0.37 + point.y * 0.49 + bend - 0.57;
    float tealCurtain = exp(-pow(tealDistance / 0.3, 2.0));
    float violetCurtain = exp(-pow(violetDistance / 0.36, 2.0));
    float goldCurtain = exp(-pow(goldDistance / 0.28, 2.0));
    float textureWeight = 0.62 + folds * 0.25 + detail * 0.13;
    float vignette = 1.0 - smoothstep(0.5, 1.5, length(point * vec2(0.85, 1.0)));

    vec3 color = vec3(0.005, 0.009, 0.015);
    color += vec3(0.025, 0.16, 0.135) * tealCurtain * textureWeight;
    color += vec3(0.085, 0.035, 0.13) * violetCurtain * textureWeight;
    color += vec3(0.15, 0.082, 0.018) * goldCurtain * textureWeight;
    color *= 0.65 + vignette * 0.35;

    float alpha = (0.08 + tealCurtain * 0.18 + violetCurtain * 0.12
      + goldCurtain * 0.13) * vignette * uOpacity;
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
