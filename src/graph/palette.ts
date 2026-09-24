import type { FrenteId } from '@/data/frentes';
import type { NodeKind } from './model';

/** Luz semántica: teal = ingeniería, oro = lógica/filosofía, violeta = ciencias, óxido = enterprise. */
export const FRENTE_COLOR: Record<FrenteId, string> = {
  informatica: '#43b5a6',
  filosofia: '#e0a85e',
  ciencias: '#8d7cc0',
  enterprise: '#cf6a3c',
};
export const SELF_COLOR = '#f6f1e8';
export const EMPRESA_COLOR = '#6fd3c4';
export const NEUTRAL_COLOR = '#8fa3a8';
/** Fondo de la home: el mismo `--ink-0` de home.css. Color de borrado del canvas y base del fondo de la escena. */
export const BACKGROUND_COLOR = '#05090b';
/** Halo radial detrás del grafo: el `rgb(35 67 90)` de home.css (spec §3.1). */
export const HALO_COLOR = '#23435a';

export function nodeColor(kind: NodeKind, frente?: FrenteId): string {
  if (kind === 'self') return SELF_COLOR;
  if (kind === 'empresa') return EMPRESA_COLOR;
  return frente ? FRENTE_COLOR[frente] : NEUTRAL_COLOR;
}
