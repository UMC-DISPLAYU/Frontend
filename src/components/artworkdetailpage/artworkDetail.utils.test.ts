import { describe, expect, it } from 'vitest';

import { getExhibitionState, getProcessImages, hasArtworkIntro } from './artworkDetail.utils';

const period = {
  startDate: '2026-05-01',
  endDate: '2026-05-10',
  startTime: '10:00:00',
  endTime: '18:00:00',
};
const at = (value: string) => new Date(value).getTime();

describe('getExhibitionState', () => {
  it('시작·종료 시각의 경계를 전시 중으로 본다', () => {
    expect(getExhibitionState(period, at('2026-05-01T09:59:59'))).toBe('upcoming');
    expect(getExhibitionState(period, at('2026-05-01T10:00:00'))).toBe('ongoing');
    expect(getExhibitionState(period, at('2026-05-10T18:00:00'))).toBe('ongoing');
    expect(getExhibitionState(period, at('2026-05-10T18:00:01'))).toBe('ended');
  });

  it('시간이 없으면 시작일 0시부터 종료일 끝까지로 본다', () => {
    const dateOnly = { ...period, startTime: '', endTime: '' };
    expect(getExhibitionState(dateOnly, at('2026-05-01T00:00:00'))).toBe('ongoing');
    expect(getExhibitionState(dateOnly, at('2026-05-10T23:59:00'))).toBe('ongoing');
  });

  it('기간을 모르면 상태를 표시하지 않는다', () => {
    expect(getExhibitionState(undefined)).toBeNull();
    expect(getExhibitionState({ ...period, startDate: 'invalid' })).toBeNull();
  });
});

describe('hasArtworkIntro', () => {
  it('소개글·감상 포인트·작업과정 중 하나라도 있으면 소개 탭을 둔다', () => {
    expect(hasArtworkIntro({ content: '소개', processImageCount: 0 })).toBe(true);
    expect(hasArtworkIntro({ point: '포인트', processImageCount: 0 })).toBe(true);
    expect(hasArtworkIntro({ processImageCount: 1 })).toBe(true);
  });

  it('공백뿐인 글은 내용이 없는 것으로 본다', () => {
    expect(hasArtworkIntro({ content: '  ', point: '\n', processImageCount: 0 })).toBe(false);
  });
});

it('getProcessImages는 작업과정 이미지만 순서대로 고른다', () => {
  const images = [
    { imageType: 'WORK_PROCESS', sortOrder: 2, id: 'b' },
    { imageType: 'ARTWORK', sortOrder: 0, id: 'x' },
    { imageType: 'WORK_PROCESS', sortOrder: 1, id: 'a' },
  ];
  expect(getProcessImages(images).map((image) => image.id)).toEqual(['a', 'b']);
});
