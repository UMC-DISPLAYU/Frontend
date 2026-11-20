import { describe, expect, it } from 'vitest';

import { isSwipeBackDirection, shouldCommitSwipeBack } from './useSwipeBack';

const start = { x: 100, y: 300 };

describe('isSwipeBackDirection', () => {
  it('오른쪽으로 쓸면 스와이프로 본다', () => {
    expect(isSwipeBackDirection(start, { x: 112, y: 300 })).toBe(true);
  });

  it('왼쪽으로 쓸면 스와이프가 아니다', () => {
    expect(isSwipeBackDirection(start, { x: 88, y: 300 })).toBe(false);
  });

  it('세로 이동이 가로 이동 이상이면 스크롤로 본다', () => {
    expect(isSwipeBackDirection(start, { x: 110, y: 309 })).toBe(true);
    expect(isSwipeBackDirection(start, { x: 110, y: 310 })).toBe(false);
    expect(isSwipeBackDirection(start, { x: 110, y: 290 })).toBe(false);
  });
});

describe('shouldCommitSwipeBack', () => {
  const width = 400;

  it('화면 폭의 35% 이상 끌고 놓으면 뒤로 간다', () => {
    expect(shouldCommitSwipeBack(140, 0, width)).toBe(true);
    expect(shouldCommitSwipeBack(139, 0, width)).toBe(false);
  });

  it('조금만 끌었어도 빠르게 튕기면 뒤로 간다', () => {
    expect(shouldCommitSwipeBack(30, 0.5, width)).toBe(true);
    expect(shouldCommitSwipeBack(30, 0.49, width)).toBe(false);
  });

  it('많이 끌었어도 왼쪽으로 되돌리다 놓으면 취소한다', () => {
    expect(shouldCommitSwipeBack(300, -0.1, width)).toBe(false);
  });

  it('제자리로 되돌려 놓으면 취소한다', () => {
    expect(shouldCommitSwipeBack(0, 0.8, width)).toBe(false);
  });
});
