import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearPendingRedirect,
  consumePendingRedirect,
  isInternalPath,
  savePendingRedirect,
} from './pendingRedirect';

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isInternalPath', () => {
  it.each(['/', '/my', '/display/3?tab=review#comments'])(
    '같은 사이트 경로 %s는 허용한다',
    (path) => {
      expect(isInternalPath(path)).toBe(true);
    },
  );

  it.each(['', 'my', 'https://evil.com', '//evil.com', '/\\evil.com', 'javascript:alert(1)'])(
    '외부로 갈 수 있는 값 %s는 막는다',
    (path) => {
      expect(isInternalPath(path)).toBe(false);
    },
  );
});

describe('pendingRedirect', () => {
  it('저장한 경로를 한 번만 꺼낸다', () => {
    savePendingRedirect('/display/3?tab=review');

    expect(consumePendingRedirect()).toBe('/display/3?tab=review');
    expect(consumePendingRedirect()).toBeNull();
  });

  it('나중에 저장한 경로가 앞의 경로를 덮는다', () => {
    savePendingRedirect('/my');
    savePendingRedirect('/artwork/1');

    expect(consumePendingRedirect()).toBe('/artwork/1');
  });

  it('외부 URL은 저장하지 않는다', () => {
    savePendingRedirect('https://evil.com');
    savePendingRedirect('//evil.com');

    expect(consumePendingRedirect()).toBeNull();
  });

  it('저장소에 외부 URL이 들어 있어도 돌려주지 않고 지운다', () => {
    storage.set('pending-redirect', '//evil.com');

    expect(consumePendingRedirect()).toBeNull();
    expect(storage.has('pending-redirect')).toBe(false);
  });

  it('지우면 꺼낼 경로가 없다', () => {
    savePendingRedirect('/my');
    clearPendingRedirect();

    expect(consumePendingRedirect()).toBeNull();
  });
});
