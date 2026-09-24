import { describe, expect, it } from 'vitest';
import { buildArtifacts } from '@/graph/artifacts';
import { loadGraphBinary } from '@/graph/runtime/loader';

describe('loadGraphBinary', () => {
  const { bin, model } = buildArtifacts();
  it('descarga y decodifica', async () => {
    const fake = (async () => new Response(bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength) as ArrayBuffer)) as unknown as typeof fetch;
    const g = await loadGraphBinary('/graph/x.bin', fake);
    expect(g.nodeCount).toBe(model.nodes.length);
  });
  it('propaga errores HTTP', async () => {
    const fake = (async () => new Response('no', { status: 404 })) as unknown as typeof fetch;
    await expect(loadGraphBinary('/graph/x.bin', fake)).rejects.toThrow('404');
  });
});
