import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, LineSegments, Points, ShaderMaterial } from 'three';
import { commitConstellation, type CommitConstellation } from '@/activity/projects/constellation';
import type { BeastKind } from '@/activity/projects/model';
import { COMMIT_FILAMENT_FRAGMENT, COMMIT_FILAMENT_VERTEX, COMMIT_STAR_FRAGMENT, COMMIT_STAR_VERTEX } from './galaxy-shaders';

/** Exactly the counted commit nuclei, in a shallow, living three-dimensional spiral disc. */
export class CommitGalaxy extends Group {
  private key = '';
  private plan: CommitConstellation = commitConstellation(0, 0, '');
  private readonly stars: Points<BufferGeometry, ShaderMaterial>;
  private readonly filaments: LineSegments<BufferGeometry, ShaderMaterial>;

  constructor() {
    super();
    this.name = 'counted-commit-constellation';
    const starMaterial = new ShaderMaterial({ vertexShader: COMMIT_STAR_VERTEX, fragmentShader: COMMIT_STAR_FRAGMENT,
      uniforms: { uTime: { value: 0 }, uDpr: { value: 1 }, uHeight: { value: 1 }, uCompanion: { value: 0 } },
      transparent: true, depthWrite: false, blending: AdditiveBlending });
    this.stars = new Points(new BufferGeometry(), starMaterial);
    this.stars.frustumCulled = false;
    this.stars.renderOrder = -3;
    const filamentMaterial = new ShaderMaterial({ vertexShader: COMMIT_FILAMENT_VERTEX, fragmentShader: COMMIT_FILAMENT_FRAGMENT,
      uniforms: { uTime: { value: 0 }, uStrength: { value: 0 } },
      transparent: true, depthWrite: false, blending: AdditiveBlending });
    this.filaments = new LineSegments(new BufferGeometry(), filamentMaterial);
    this.filaments.frustumCulled = false;
    this.filaments.renderOrder = -4;
    this.add(this.filaments, this.stars);
    this.visible = false;
  }

  syncCounts(commits: number, maximumCommits: number, identity: string, kind: BeastKind): CommitConstellation {
    const key = `${commits}:${maximumCommits}:${identity}:${kind}`;
    if (key === this.key) return this.plan;
    this.key = key;
    this.plan = commitConstellation(commits, maximumCommits, identity, kind);
    const { stars, radius, ratio, renderedCount } = this.plan;
    const positions = new Float32Array(renderedCount * 3), colors = new Float32Array(renderedCount * 3);
    const sizes = new Float32Array(renderedCount), phases = new Float32Array(renderedCount);
    const color = new Color();
    stars.forEach((star, index) => {
      positions.set([star.x, star.y, star.z], index * 3);
      color.set(star.color).toArray(colors, index * 3);
      sizes[index] = star.size;
      phases[index] = star.phase;
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new BufferAttribute(phases, 1));
    this.stars.geometry.dispose();
    this.stars.geometry = geometry;
    this.stars.material.uniforms.uCompanion.value = renderedCount <= 12 ? 1 : 0;

    const linePositions: number[] = [], progresses: number[] = [];
    if (renderedCount >= 20) {
      const inner = kind === 'moth' ? 2.13 : kind === 'sprout' ? 1.73 : 1.97;
      for (let arm = 0; arm < 4; arm++) {
        for (let segment = 0; segment < 95; segment++) {
          for (let end = 0; end < 2; end++) {
            const u = (segment + end) / 95;
            const r = inner + .055 + u * (radius - inner - .055);
            const angle = arm * Math.PI / 2 + (u - .5) * 2.7 - .75;
            const y = Math.sin(angle) * r * .88 - .13;
            linePositions.push(Math.cos(angle) * r, y, -1.65 + y * .12);
            progresses.push(u);
          }
        }
      }
    }
    const lines = new BufferGeometry();
    lines.setAttribute('position', new BufferAttribute(new Float32Array(linePositions), 3));
    lines.setAttribute('aProgress', new BufferAttribute(new Float32Array(progresses), 1));
    this.filaments.geometry.dispose();
    this.filaments.geometry = lines;
    this.filaments.material.uniforms.uStrength.value = Math.min(1, this.plan.commits / 600) * ratio * .37;
    this.visible = renderedCount > 0;
    return this.plan;
  }

  setViewport(height: number, dpr: number): void {
    this.stars.material.uniforms.uHeight.value = height;
    this.stars.material.uniforms.uDpr.value = dpr;
  }

  update(time: number): void {
    this.stars.material.uniforms.uTime.value = time;
    this.filaments.material.uniforms.uTime.value = time;
  }

  dispose(): void {
    this.stars.geometry.dispose();
    this.stars.material.dispose();
    this.filaments.geometry.dispose();
    this.filaments.material.dispose();
    this.removeFromParent();
  }
}
