import { decodeGraph, type DecodedGraph } from '../codec';

export async function loadGraphBinary(url: string, fetchFn: typeof fetch = fetch): Promise<DecodedGraph> {
  const res = await fetchFn(url);
  if (!res.ok) throw new Error(`No se pudo cargar el grafo (${res.status})`);
  return decodeGraph(await res.arrayBuffer());
}
