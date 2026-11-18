import { describe, expect, it } from 'vitest';

import { getInitialViewMode } from './useViewMode';

describe('getInitialViewMode', () => {
  it('이 기기에서 고른 감상 방식이 있으면 화면 폭과 상관없이 그대로 쓴다', () => {
    expect(getInitialViewMode('one', true)).toBe('one');
    expect(getInitialViewMode('stack', false)).toBe('stack');
  });

  it('고른 적이 없거나 알 수 없는 값이면 900px 이상은 이어서 보기, 미만은 한 장씩 보기', () => {
    for (const stored of [null, '', 'big']) {
      expect(getInitialViewMode(stored, true)).toBe('stack');
      expect(getInitialViewMode(stored, false)).toBe('one');
    }
  });
});
