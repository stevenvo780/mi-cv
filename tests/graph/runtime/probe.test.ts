import { describe, expect, it } from 'vitest';
import { probe3D, type ProbeEnv } from '@/graph/runtime/probe';

const base: ProbeEnv = {
  reducedMotion: false,
  saveData: false,
  deviceMemory: 8,
  hardwareConcurrency: 8,
  override: null,
  getRenderer: () => 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060)',
};

describe('probe3D', () => {
  it('acepta una GPU real', () => {
    expect(probe3D(base)).toEqual({ ok: true });
  });
  it('rechaza renderers por software (Lighthouse/PSI, VMs)', () => {
    expect(probe3D({ ...base, getRenderer: () => 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)))' })).toEqual({ ok: false, reason: 'software-renderer' });
    expect(probe3D({ ...base, getRenderer: () => 'llvmpipe (LLVM 15.0.7, 256 bits)' })).toEqual({ ok: false, reason: 'software-renderer' });
  });
  it('rechaza sin WebGL2', () => {
    expect(probe3D({ ...base, getRenderer: () => null })).toEqual({ ok: false, reason: 'no-webgl2' });
  });
  it('respeta reduced motion, save-data y equipos modestos', () => {
    expect(probe3D({ ...base, reducedMotion: true })).toEqual({ ok: false, reason: 'reduced-motion' });
    expect(probe3D({ ...base, saveData: true })).toEqual({ ok: false, reason: 'save-data' });
    expect(probe3D({ ...base, deviceMemory: 2 })).toEqual({ ok: false, reason: 'low-end' });
    expect(probe3D({ ...base, hardwareConcurrency: 2 })).toEqual({ ok: false, reason: 'low-end' });
  });
  it('el override manda sobre todo lo demás', () => {
    expect(probe3D({ ...base, override: 'force', reducedMotion: true, getRenderer: () => null })).toEqual({ ok: true });
    expect(probe3D({ ...base, override: 'off' })).toEqual({ ok: false, reason: 'override' });
  });
  it('no evalúa el renderer si ya descartó por otra razón', () => {
    let called = false;
    probe3D({ ...base, saveData: true, getRenderer: () => ((called = true), 'x') });
    expect(called).toBe(false);
  });
});
