import { describe, expect, it } from 'vitest';
import { normalizeSearch } from '@/lib/text';

describe('normalizeSearch', () => {
  it('quita tildes y pasa a minúsculas', () => {
    expect(normalizeSearch('Lógica FORMAL · Órganon')).toBe('logica formal · organon');
  });
});
