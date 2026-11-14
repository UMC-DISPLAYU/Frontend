import { describe, expect, it } from 'vitest';

import { BRAND_EXHIBITIONS, sortByStatus } from './brandExhibitions';

describe('sortByStatus', () => {
  it('전시 중 → 전시 예정 → 종료 순이고 같은 상태 안은 데이터 순서를 지킨다', () => {
    const sorted = sortByStatus(BRAND_EXHIBITIONS);

    expect(sorted.map((e) => e.index)).toEqual([5, 7, 9, 0, 1, 2, 3, 4, 6, 8, 10]);
  });

  it('원본 배열을 바꾸지 않는다', () => {
    const before = BRAND_EXHIBITIONS.map((e) => e.index);
    sortByStatus(BRAND_EXHIBITIONS);

    expect(BRAND_EXHIBITIONS.map((e) => e.index)).toEqual(before);
  });
});
