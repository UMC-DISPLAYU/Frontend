import { describe, expect, it } from 'vitest';

import { toExhibitionFields } from './displayRegister.constants';

describe('toExhibitionFields', () => {
  it('화면 분야 이름을 전시 등록 API 의 서버 값으로 바꾼다', () => {
    expect(toExhibitionFields(['그래픽', '브랜딩', '제품', '공간', 'UXUI'])).toEqual([
      'GRAPHIC',
      'BRANDING',
      'PRODUCT',
      'SPACE',
      'UX_UI',
    ]);
    expect(toExhibitionFields(['회화', '영상', '공예', '기타'])).toEqual([
      'PAINTING',
      'VIDEO',
      'CRAFTS',
      'OTHERS',
    ]);
  });

  it('없는 라벨은 무시한다', () => {
    expect(toExhibitionFields(['없는 분야'])).toEqual([]);
  });
});
