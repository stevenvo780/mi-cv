import type { FrenteId } from '@/data/frentes';

export type NodeKind = 'self' | 'frente' | 'empresa' | 'producto' | 'grupo' | 'tecnologia' | 'concepto';
export type RelKind = 'agrupa' | 'pertenece-a' | 'trabajo-en' | 'construyo' | 'usa' | 'fundamenta';

export interface Bilingual {
  es: string;
  en: string;
}

export interface GNode {
  /** Único, con prefijo por tipo: 'self', 'frente:filosofia', 'producto:agora', 'empresa:critertec', 'grupo:backend', 'tec:nodejs'. */
  id: string;
  kind: NodeKind;
  label: Bilingual;
  frente?: FrenteId;
  /** Empresas: año y mes de inicio (sin mes si la fuente solo trae el año). */
  year?: number;
  month?: number;
  /** Empresas: año de fin; null = actualidad. */
  yearEnd?: number | null;
  role?: Bilingual;
  url?: string;
  /** Importancia visual 1..5. */
  weight: number;
}

export interface GEdge {
  source: string;
  target: string;
  rel: RelKind;
  weight: number;
}

export interface GraphModel {
  nodes: GNode[];
  edges: GEdge[];
}
