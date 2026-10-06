/** Único contrato público: sin repositorios, autores, rutas ni mensajes de Git. */
export interface ActivityDay { date: string; count: number }
export interface ActivityHighlight {
  date: string;
  area: 'engineering' | 'research' | 'design' | 'writing';
  title: { es: string; en: string };
}
export interface ActivitySnapshot {
  version: 1;
  source: 'github' | 'journal';
  metric: 'contributions' | 'commits';
  updatedAt: string;
  days: ActivityDay[];
  highlights: ActivityHighlight[];
}
export interface ActivityResponse {
  status: 'ready' | 'unavailable';
  snapshot: ActivitySnapshot | null;
}
