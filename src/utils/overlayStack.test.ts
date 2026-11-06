import { describe, expect, it } from 'vitest';

import {
  createOverlayId,
  createOverlayStack,
  hasStaleOverlayEntry,
  OVERLAY_STATE_KEY,
  readOverlayIds,
  withoutOverlayIds,
  withOverlayId,
} from './overlayStack';

describe('createOverlayStack', () => {
  it('마지막으로 연 오버레이만 맨 위다', () => {
    const stack = createOverlayStack();
    stack.push('a');
    stack.push('b');

    expect(stack.isTop('b')).toBe(true);
    expect(stack.isTop('a')).toBe(false);

    stack.remove('b');
    expect(stack.isTop('a')).toBe(true);
    expect(stack.has('b')).toBe(false);
  });

  it('같은 id 를 두 번 넣어도 한 번만 들어간다(StrictMode 대비)', () => {
    const stack = createOverlayStack();
    stack.push('a');
    stack.push('a');
    stack.remove('a');

    expect(stack.has('a')).toBe(false);
    expect(stack.isTop('a')).toBe(false);
  });

  it('없는 id 를 지워도 다른 항목은 그대로다', () => {
    const stack = createOverlayStack();
    stack.push('a');
    stack.remove('x');

    expect(stack.isTop('a')).toBe(true);
  });
});

describe('createOverlayId', () => {
  it('부를 때마다 다른 id 를 만든다', () => {
    expect(createOverlayId()).not.toBe(createOverlayId());
  });
});

describe('history state 헬퍼', () => {
  const alive = (ids: string[]) => (id: string) => ids.includes(id);

  it('state 가 없거나 객체가 아니면 빈 목록이다', () => {
    expect(readOverlayIds(null)).toEqual([]);
    expect(readOverlayIds('text')).toEqual([]);
    expect(readOverlayIds({ [OVERLAY_STATE_KEY]: 'a' })).toEqual([]);
    expect(readOverlayIds({ [OVERLAY_STATE_KEY]: ['a', 1, 'b'] })).toEqual(['a', 'b']);
  });

  it('기존 state 를 지키면서 id 를 붙인다', () => {
    const next = withOverlayId({ from: '/login' }, 'a', alive([]));

    expect(next).toEqual({ from: '/login', [OVERLAY_STATE_KEY]: ['a'] });
  });

  it('겹쳐 열면 아래 오버레이 id 를 유지하고, 닫힌 오버레이 id 는 버린다', () => {
    const state = { [OVERLAY_STATE_KEY]: ['stale', 'a'] };

    expect(readOverlayIds(withOverlayId(state, 'b', alive(['a'])))).toEqual(['a', 'b']);
  });

  it('오버레이 id 만 지우고, 남는 값이 없으면 null 이다', () => {
    expect(withoutOverlayIds({ from: '/x', [OVERLAY_STATE_KEY]: ['a'] })).toEqual({ from: '/x' });
    expect(withoutOverlayIds({ [OVERLAY_STATE_KEY]: ['a'] })).toBeNull();
    expect(withoutOverlayIds(null)).toBeNull();
  });

  it('맨 위 id 가 닫혀 있을 때만 쓸모없는 기록이다', () => {
    expect(hasStaleOverlayEntry(null, alive([]))).toBe(false);
    expect(hasStaleOverlayEntry({ [OVERLAY_STATE_KEY]: ['a'] }, alive(['a']))).toBe(false);
    expect(hasStaleOverlayEntry({ [OVERLAY_STATE_KEY]: ['a'] }, alive([]))).toBe(true);
    expect(hasStaleOverlayEntry({ [OVERLAY_STATE_KEY]: ['x', 'b'] }, alive(['b']))).toBe(false);
  });
});
