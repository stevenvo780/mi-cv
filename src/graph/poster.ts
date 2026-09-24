import { CAMERA0 } from './camera0';
import type { GraphModel } from './model';
import { nodeColor } from './palette';

export const POSTER_VIEWBOX = { width: 1600, height: 1000 } as const;
const FOCAL = POSTER_VIEWBOX.height / 2 / Math.tan((CAMERA0.fov * Math.PI) / 360);
const BASE_SCALE = FOCAL / CAMERA0.distance;

export function projectPoint(p: readonly [number, number, number]) {
  const [x0, y0, z0] = p;
  const cy = Math.cos(CAMERA0.yaw);
  const sy = Math.sin(CAMERA0.yaw);
  const x1 = x0 * cy + z0 * sy;
  const z1 = -x0 * sy + z0 * cy;
  const cp = Math.cos(CAMERA0.pitch);
  const sp = Math.sin(CAMERA0.pitch);
  const y2 = y0 * cp - z1 * sp;
  const z2 = y0 * sp + z1 * cp;
  const depth = CAMERA0.distance - z2;
  const scale = FOCAL / depth;
  return { x: POSTER_VIEWBOX.width / 2 + x1 * scale, y: POSTER_VIEWBOX.height / 2 - y2 * scale, depth, scale };
}

const int = (v: number) => Math.round(v);
const dec = (v: number) => Math.round(v * 10) / 10;
const op = (v: number) => v.toFixed(2).replace(/^0/, '');

export function renderPosterSvg(model: GraphModel, positions: Float32Array): string {
  const pts = model.nodes.map((_, i) => projectPoint([positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]));
  const index = new Map(model.nodes.map((n, i) => [n.id, i]));
  const depths = pts.map((p) => p.depth);
  const dMin = Math.min(...depths);
  const dMax = Math.max(...depths);
  const fade = (d: number) => 1 - 0.55 * ((d - dMin) / Math.max(dMax - dMin, 1e-6));
  const colorOf = (i: number) => nodeColor(model.nodes[i].kind, model.nodes[i].frente);
  const colors = [...new Set(model.nodes.map((_, i) => colorOf(i)))];
  const gid = (c: string) => `gp${colors.indexOf(c)}`;

  const defs = colors
    .map((c) => `<radialGradient id="${gid(c)}"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".3" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`)
    .join('');

  const edgesByColor = new Map<string, string[]>();
  model.edges.forEach((e, k) => {
    const ia = index.get(e.source)!;
    const ib = index.get(e.target)!;
    const a = pts[ia];
    const b = pts[ib];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const bend = (k % 2 ? 1 : -1) * 0.12 * len;
    const cx = (a.x + b.x) / 2 - (dy / len) * bend;
    const cy = (a.y + b.y) / 2 + (dx / len) * bend;
    const opacity = (0.07 + 0.035 * e.weight) * fade((a.depth + b.depth) / 2);
    const c = colorOf(ia);
    const list = edgesByColor.get(c) ?? [];
    list.push(`<path d="M${int(a.x)} ${int(a.y)}Q${int(cx)} ${int(cy)} ${int(b.x)} ${int(b.y)}" opacity="${op(opacity)}"/>`);
    edgesByColor.set(c, list);
  });

  const farFirst = pts.map((_, i) => i).sort((i, j) => pts[j].depth - pts[i].depth);
  const glows: string[] = [];
  const nodesByColor = new Map<string, string[]>();
  for (const i of farFirst) {
    const n = model.nodes[i];
    const p = pts[i];
    const r = (0.9 + n.weight * 0.9) * (p.scale / BASE_SCALE);
    const c = colorOf(i);
    if (n.weight >= 3) glows.push(`<circle cx="${int(p.x)}" cy="${int(p.y)}" r="${dec(r * 4.5)}" fill="url(#${gid(c)})" opacity="${op(0.5 * fade(p.depth))}"/>`);
    const list = nodesByColor.get(c) ?? [];
    list.push(`<circle cx="${int(p.x)}" cy="${int(p.y)}" r="${dec(r)}" opacity="${op(0.55 + 0.45 * fade(p.depth))}"/>`);
    nodesByColor.set(c, list);
  }

  const edgeGroups = [...edgesByColor].map(([c, paths]) => `<g stroke="${c}">${paths.join('')}</g>`).join('');
  const nodeGroups = [...nodesByColor].map(([c, circles]) => `<g fill="${c}">${circles.join('')}</g>`).join('');
  const { width, height } = POSTER_VIEWBOX;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">` +
    `<defs>${defs}</defs>` +
    `<g fill="none" stroke-width="1.1" stroke-linecap="round">${edgeGroups}</g>` +
    `<g>${glows.join('')}</g>` +
    nodeGroups +
    `</svg>`
  );
}
