import { describe, expect, it } from 'vitest';

import { getArtistProfileFieldLabel, toArtistProfileField } from './artistField';

describe('작가 프로필 분야', () => {
  it.each([
    ['UXUI', 'UX_UI'],
    ['MEDIA', 'VIDEO'],
    ['CRAFT', 'CRAFTS'],
    ['ETC', 'OTHERS'],
    ['CRAFTS', 'CRAFTS'],
    ['DESIGN', 'DESIGN'],
  ])('예전 별칭 %s 는 표준 값 %s 로 바꾼다', (code, expected) => {
    expect(toArtistProfileField(code)).toBe(expected);
  });

  it.each([
    ['CRAFTS', '공예'],
    ['CRAFT', '공예'],
    ['OTHERS', '기타'],
    ['ETC', '기타'],
    ['UX_UI', 'UXUI'],
    ['MEDIA', '영상'],
    ['DESIGN', '디자인'],
    ['FASHION', '패션'],
    ['ILLUSTRATION', '일러스트'],
    ['UNKNOWN', 'UNKNOWN'],
  ])('%s 는 %s 로 보여 준다', (code, label) => {
    expect(getArtistProfileFieldLabel(code)).toBe(label);
  });
});
