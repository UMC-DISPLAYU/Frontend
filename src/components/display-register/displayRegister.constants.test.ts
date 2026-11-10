import { describe, expect, it } from 'vitest';

import { toExhibitionFields } from './displayRegister.constants';

describe('toExhibitionFields', () => {
  it('같은 서버 분야로 묶이는 라벨은 한 번만 보낸다', () => {
    expect(toExhibitionFields(['그래픽', '브랜딩', 'UXUI'])).toEqual(['DESIGN']);
  });

  it('서로 다른 분야는 모두 유지한다', () => {
    expect(toExhibitionFields(['회화', '영상', '공예'])).toEqual(['PAINTING', 'VIDEO', 'CRAFT']);
  });

  it('없는 라벨은 무시한다', () => {
    expect(toExhibitionFields(['없는 분야'])).toEqual([]);
  });
});
