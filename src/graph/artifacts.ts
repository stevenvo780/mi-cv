import { createHash } from 'node:crypto';
import { encodeGraph, type GraphMeta } from './codec';
import { computeLayouts, type Layouts } from './layouts';
import type { GraphModel } from './model';
import { renderPosterSvg } from './poster';
import { buildGraphModel } from './sources';

export interface Artifacts {
  model: GraphModel;
  layouts: Layouts;
  bin: Uint8Array;
  meta: GraphMeta;
  posterSvg: string;
  hash: string;
}

/** Solo se usa en build y tests (Node). No importar desde componentes. */
export function buildArtifacts(): Artifacts {
  const model = buildGraphModel();
  const layouts = computeLayouts(model);
  const { bin, meta } = encodeGraph(model, layouts);
  const posterSvg = renderPosterSvg(model, layouts.red);
  const hash = createHash('sha256').update(bin).update(JSON.stringify(meta)).digest('hex').slice(0, 10);
  return { model, layouts, bin, meta, posterSvg, hash };
}
