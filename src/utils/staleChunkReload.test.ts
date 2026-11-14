import { describe, expect, it, vi } from 'vitest';

import { reloadForStaleChunk, shouldReloadForStaleChunk } from './staleChunkReload';

const createStorage = (initial?: string) => {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set('du.chunkReloadedAt', initial);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    values,
  };
};

describe('shouldReloadForStaleChunk', () => {
  it('새로고침한 기록이 없으면 새로고침한다', () => {
    expect(shouldReloadForStaleChunk(null, 1_000)).toBe(true);
  });

  it('새로고침하고 10초가 지나지 않았으면 다시 새로고침하지 않는다', () => {
    expect(shouldReloadForStaleChunk(1_000, 11_000)).toBe(false);
  });

  it('새로고침하고 10초가 지나면 다시 새로고침한다', () => {
    expect(shouldReloadForStaleChunk(1_000, 11_001)).toBe(true);
  });
});

describe('reloadForStaleChunk', () => {
  it('처음 실패하면 시각을 남기고 새로고침한다', () => {
    const storage = createStorage();
    const reload = vi.fn();

    expect(reloadForStaleChunk({ now: 5_000, isOnline: true, storage, reload })).toBe(true);
    expect(reload).toHaveBeenCalledOnce();
    expect(storage.values.get('du.chunkReloadedAt')).toBe('5000');
  });

  it('새로고침 직후 또 실패하면 반복하지 않는다', () => {
    const storage = createStorage('5000');
    const reload = vi.fn();

    expect(reloadForStaleChunk({ now: 6_000, isOnline: true, storage, reload })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('남은 기록이 깨져 있으면 기록이 없는 것으로 본다', () => {
    const storage = createStorage('abc');
    const reload = vi.fn();

    expect(reloadForStaleChunk({ now: 6_000, isOnline: true, storage, reload })).toBe(true);
  });

  it('오프라인이면 새로고침하지 않는다', () => {
    const reload = vi.fn();

    expect(
      reloadForStaleChunk({ now: 5_000, isOnline: false, storage: createStorage(), reload }),
    ).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('기록을 남길 수 없으면 무한 새로고침을 막기 위해 새로고침하지 않는다', () => {
    const reload = vi.fn();
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };

    expect(reloadForStaleChunk({ now: 5_000, isOnline: true, storage, reload })).toBe(false);
    expect(reloadForStaleChunk({ now: 5_000, isOnline: true, storage: null, reload })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
