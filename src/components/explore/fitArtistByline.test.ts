import { describe, expect, it } from 'vitest';

import { fitArtistByline } from './fitArtistByline';

const fitsWithin = (max: number) => (text: string) => text.length <= max;

describe('fitArtistByline', () => {
  it('다 들어가면 모든 이름을 쉼표로 잇는다', () => {
    expect(fitArtistByline(['고상준', '김서윤'], fitsWithin(20))).toBe('고상준, 김서윤');
  });

  it('넘치면 들어가는 만큼만 남기고 외 N명을 붙인다', () => {
    expect(fitArtistByline(['고상준', '김서윤', '박도현', '이소영'], fitsWithin(14))).toBe(
      '고상준, 김서윤 외 2명',
    );
  });

  it('하나도 안 들어가면 첫 이름 + 외 N명을 두고 말줄임에 맡긴다', () => {
    expect(fitArtistByline(['고상준', '김서윤'], fitsWithin(2))).toBe('고상준 외 1명');
  });

  it('한 명이면 그 이름만 쓴다', () => {
    expect(fitArtistByline(['고상준'], fitsWithin(1))).toBe('고상준');
  });
});
