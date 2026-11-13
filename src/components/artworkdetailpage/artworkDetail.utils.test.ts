import { describe, expect, it } from 'vitest';

import { getProcessImages, getStackPhotoIndex, hasArtworkIntro } from './artworkDetail.utils';

describe('hasArtworkIntro', () => {
  it('소개글·작업과정 중 하나라도 있으면 소개 탭을 둔다', () => {
    expect(hasArtworkIntro({ content: '소개', processImageCount: 0 })).toBe(true);
    expect(hasArtworkIntro({ processImageCount: 1 })).toBe(true);
  });

  it('공백뿐인 글은 내용이 없는 것으로 본다', () => {
    expect(hasArtworkIntro({ content: '  \n', processImageCount: 0 })).toBe(false);
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

describe('getStackPhotoIndex', () => {
  // 위 여백(anchor) 96, 읽는 선(line) 400. 짧은 사진(높이 300)은 선보다 덜 내려와도 다음 장이 선 위에 들어온다
  const anchor = 96;
  const line = 400;
  const shortPhotos = (firstTop: number) => [0, 1, 2, 3].map((index) => firstTop + index * 300);

  it('맨 위에서는 첫 장을 고른다(다음 장이 선 위에 있어도)', () => {
    expect(getStackPhotoIndex(shortPhotos(anchor), anchor, line)).toBe(0);
  });

  it('썸네일로 옮겨 위 여백에 맞춘 장을 고른다', () => {
    expect(getStackPhotoIndex(shortPhotos(anchor - 300), anchor, line)).toBe(1);
    expect(getStackPhotoIndex(shortPhotos(anchor - 600), anchor, line)).toBe(2);
  });

  it('스크롤 위치가 반올림돼 1px 어긋나도 같은 장을 고른다', () => {
    expect(getStackPhotoIndex(shortPhotos(anchor - 300 - 0.5), anchor, line)).toBe(1);
    expect(getStackPhotoIndex(shortPhotos(anchor - 300 - 1), anchor, line)).toBe(1);
  });

  it('앞 장이 위 여백 위로 올라가기 시작하면 선을 넘은 다음 장으로 넘어간다', () => {
    expect(getStackPhotoIndex(shortPhotos(anchor - 2), anchor, line)).toBe(1);
  });

  it('긴 사진은 다음 장 윗변이 선에 닿을 때 넘어간다', () => {
    const tallPhotos = (firstTop: number) => [firstTop, firstTop + 700, firstTop + 1400];
    expect(getStackPhotoIndex(tallPhotos(line - 699), anchor, line)).toBe(0);
    expect(getStackPhotoIndex(tallPhotos(line - 700), anchor, line)).toBe(1);
  });

  it('사진이 없거나 첫 장이 선 아래에 있으면 첫 장으로 둔다', () => {
    expect(getStackPhotoIndex([], anchor, line)).toBe(0);
    expect(getStackPhotoIndex([line + 100, line + 400], anchor, line)).toBe(0);
  });
});
