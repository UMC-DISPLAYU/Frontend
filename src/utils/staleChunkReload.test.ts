import { describe, expect, it, vi } from 'vitest';

import {
  isChunkLoadError,
  reloadForStaleChunk,
  shouldReloadForStaleChunk,
} from './staleChunkReload';

const CHUNK_ERROR = new TypeError(
  'Failed to fetch dynamically imported module: https://www.displayu.co.kr/assets/MapPage-CpiPu5Dw.js',
);

const createStorage = (initial?: string) => {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set('du.chunkReloaded', initial);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    values,
  };
};

const setup = (initial?: string) => {
  const storage = createStorage(initial);
  const reload = vi.fn();
  const env = { target: '/map', now: 100_000, isOnline: true, storage, reload };
  return { storage, reload, env };
};

describe('isChunkLoadError', () => {
  it.each([
    'Failed to fetch dynamically imported module: https://a.com/assets/x.js',
    'error loading dynamically imported module: https://a.com/assets/x.js',
    'Importing a module script failed.',
    "'text/html' is not a valid JavaScript MIME type.",
    'Unable to preload CSS for /assets/x.css',
  ])('페이지 파일을 못 받은 오류로 본다: %s', (message) => {
    expect(isChunkLoadError(new TypeError(message))).toBe(true);
  });

  it('모듈 안에서 난 다른 오류는 새로고침 대상이 아니다', () => {
    expect(isChunkLoadError(new ReferenceError('foo is not defined'))).toBe(false);
    expect(isChunkLoadError('Failed to fetch dynamically imported module')).toBe(false);
  });
});

describe('shouldReloadForStaleChunk', () => {
  it('기록이 없으면 새로고침한다', () => {
    expect(shouldReloadForStaleChunk(null, '/map', 1_000)).toBe(true);
  });

  it('같은 주소에서 60초 안에 또 실패하면 새로고침하지 않는다', () => {
    expect(shouldReloadForStaleChunk({ target: '/map', at: 1_000 }, '/map', 61_000)).toBe(false);
  });

  it('같은 주소라도 60초가 지나면 다시 새로고침한다', () => {
    expect(shouldReloadForStaleChunk({ target: '/map', at: 1_000 }, '/map', 61_001)).toBe(true);
  });

  it('다른 주소면 바로 새로고침한다', () => {
    expect(shouldReloadForStaleChunk({ target: '/home', at: 1_000 }, '/map', 1_001)).toBe(true);
  });
});

describe('reloadForStaleChunk', () => {
  it('처음 실패하면 주소와 시각을 남기고 새로고침한다', () => {
    const { storage, reload, env } = setup();

    expect(reloadForStaleChunk(CHUNK_ERROR, env)).toBe(true);
    expect(reload).toHaveBeenCalledOnce();
    expect(JSON.parse(storage.values.get('du.chunkReloaded') ?? '')).toEqual({
      target: '/map',
      at: 100_000,
    });
  });

  it('새로고침 직후 같은 주소에서 또 실패하면 반복하지 않는다', () => {
    const { reload, env } = setup(JSON.stringify({ target: '/map', at: 90_000 }));

    expect(reloadForStaleChunk(CHUNK_ERROR, env)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('남은 기록이 깨져 있으면 기록이 없는 것으로 본다', () => {
    const { env } = setup('abc');

    expect(reloadForStaleChunk(CHUNK_ERROR, env)).toBe(true);
  });

  it('페이지 파일을 못 받은 오류가 아니면 새로고침하지 않는다', () => {
    const { reload, env } = setup();

    expect(reloadForStaleChunk(new Error('boom'), env)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('오프라인이면 새로고침하지 않는다', () => {
    const { reload, env } = setup();

    expect(reloadForStaleChunk(CHUNK_ERROR, { ...env, isOnline: false })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('기록을 남길 수 없으면 무한 새로고침을 막기 위해 새로고침하지 않는다', () => {
    const { reload, env } = setup();
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };

    expect(reloadForStaleChunk(CHUNK_ERROR, { ...env, storage })).toBe(false);
    expect(reloadForStaleChunk(CHUNK_ERROR, { ...env, storage: null })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
