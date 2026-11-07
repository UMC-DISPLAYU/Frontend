import { describe, expect, it } from 'vitest';

import { findOptionByLabel, TYPE_OPTIONS } from './exploreOptions';

describe('findOptionByLabel', () => {
  it.each([null, ''])('%j 이면 기본 옵션을 돌려준다', (label) => {
    expect(findOptionByLabel(TYPE_OPTIONS, label)).toBe(TYPE_OPTIONS[0]);
  });

  it('홈 링크 라벨의 띄어쓰기 · 가운뎃점 차이를 무시한다', () => {
    expect(findOptionByLabel(TYPE_OPTIONS, '졸업 전시').value).toBe('GRADUATION');
    expect(findOptionByLabel(TYPE_OPTIONS, '졸업전시').value).toBe('GRADUATION');
    expect(findOptionByLabel(TYPE_OPTIONS, '학과학회전시').value).toBe('DEPARTMENTS');
  });

  it('알 수 없는 라벨이면 기본 옵션을 돌려준다', () => {
    expect(findOptionByLabel(TYPE_OPTIONS, '없는 라벨')).toBe(TYPE_OPTIONS[0]);
  });
});
