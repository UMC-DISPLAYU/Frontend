import { describe, expect, it } from 'vitest';

import { toArtistProfileField, toArtistProfileFieldLabels } from './artistField';

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

  it('예전 별칭은 같은 분야 이름으로 보여 준다', () => {
    expect(toArtistProfileFieldLabels(['CRAFT', 'ETC', 'MEDIA', 'UXUI'])).toEqual([
      '공예',
      '기타',
      '영상',
      'UXUI',
    ]);
  });

  it('새 목록에서 빠진 예전 분야와 모르는 값은 무시한다', () => {
    expect(
      toArtistProfileFieldLabels(['DESIGN', 'PHOTOGRAPHY', 'FASHION', 'ILLUSTRATION', 'X']),
    ).toEqual(['사진']);
  });

  it('별칭과 표준 값이 겹치면 한 번만 보여 준다', () => {
    expect(toArtistProfileFieldLabels(['CRAFT', 'CRAFTS'])).toEqual(['공예']);
    expect(toArtistProfileFieldLabels(undefined)).toEqual([]);
  });
});
