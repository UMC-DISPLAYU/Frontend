import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { waitForHistoryIndex } from './waitForHistoryIndex';

const createTarget = () => {
  const events = new EventTarget();
  const history = { state: null as unknown };

  return {
    target: {
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
      history,
    } as unknown as Window,
    pop: (state: unknown) => {
      history.state = state;
      events.dispatchEvent(new Event('popstate'));
    },
  };
};

describe('waitForHistoryIndex', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('목표 기록에 도착하면 true', async () => {
    const { target, pop } = createTarget();
    const arrived = waitForHistoryIndex(2, { target });

    pop({ idx: 2 });

    await expect(arrived).resolves.toBe(true);
  });

  it('다른 기록의 popstate 는 무시하고 목표에 도착할 때까지 기다린다', async () => {
    const { target, pop } = createTarget();
    const arrived = waitForHistoryIndex(1, { target });

    pop({ idx: 3 });
    pop({ idx: 1 });

    await expect(arrived).resolves.toBe(true);
  });

  it('시간 안에 도착하지 않으면 false', async () => {
    const { target, pop } = createTarget();
    const arrived = waitForHistoryIndex(1, { target, timeoutMs: 100 });

    pop({ idx: 2 });
    vi.advanceTimersByTime(100);

    await expect(arrived).resolves.toBe(false);
  });

  it('idx 가 없는 기록은 도착으로 보지 않는다', async () => {
    const { target, pop } = createTarget();
    const arrived = waitForHistoryIndex(0, { target, timeoutMs: 100 });

    pop(null);
    pop({ usr: {} });
    vi.advanceTimersByTime(100);

    await expect(arrived).resolves.toBe(false);
  });
});
