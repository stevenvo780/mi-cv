import { describe, expect, it, vi } from 'vitest';
import { createInbox } from '@/graph/runtime/inbox';

describe('createInbox', () => {
  it('antes de abrir no aplica nada y guarda solo el último mensaje de cada tipo', () => {
    const apply = vi.fn();
    const inbox = createInbox(apply);
    inbox.push({ type: 'resize', width: 1, height: 1, dpr: 1 });
    inbox.push({ type: 'focus', index: 2 });
    inbox.push({ type: 'resize', width: 800, height: 600, dpr: 2 });
    expect(apply).not.toHaveBeenCalled();
    inbox.open();
    expect(apply.mock.calls.map(([m]) => m)).toEqual([
      { type: 'resize', width: 800, height: 600, dpr: 2 },
      { type: 'focus', index: 2 },
    ]);
  });

  it('abierto, aplica cada mensaje al llegar y no repite los de la cola', () => {
    const apply = vi.fn();
    const inbox = createInbox(apply);
    inbox.push({ type: 'scroll', s: 1 });
    inbox.open();
    inbox.push({ type: 'scroll', s: 2 });
    inbox.push({ type: 'scroll', s: 3 });
    expect(apply.mock.calls.map(([m]) => m)).toEqual([
      { type: 'scroll', s: 1 },
      { type: 'scroll', s: 2 },
      { type: 'scroll', s: 3 },
    ]);
  });
});
