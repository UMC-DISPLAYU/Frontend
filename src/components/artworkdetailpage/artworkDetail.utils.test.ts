import { describe, expect, it } from 'vitest';

import {
  getArtworkArtists,
  getArtworkSpecText,
  getProcessImages,
  getStackPhotoIndex,
  hasArtworkIntro,
} from './artworkDetail.utils';

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

describe('getArtworkArtists', () => {
  it('대표 작가와 계정이 같은 공동 작업자만 뺀다', () => {
    expect(
      getArtworkArtists({
        artistUserId: 15,
        artistName: '작가가',
        coAuthors: [
          { userId: 15, name: '작가가' },
          { userId: 7, name: '작가나' },
          { userId: null, name: '작가다' },
        ],
      }),
    ).toEqual([
      { userId: 15, name: '작가가' },
      { userId: 7, name: '작가나' },
      { userId: undefined, name: '작가다' },
    ]);
  });

  it('대표 작가도 계정이 없을 때 이름만 입력한 공동 작업자를 지우지 않는다', () => {
    expect(
      getArtworkArtists({
        artistUserId: null,
        artistName: '작가라',
        coAuthors: [
          { userId: null, name: '작가마' },
          { userId: null, name: '작가바' },
        ],
      }),
    ).toEqual([
      { userId: undefined, name: '작가라' },
      { userId: undefined, name: '작가마' },
      { userId: undefined, name: '작가바' },
    ]);
  });

  it('프로필이 있는 작가를 먼저, 이름만 입력한 작가를 뒤에 둔다', () => {
    expect(
      getArtworkArtists({
        artistUserId: null,
        artistName: '작가가',
        coAuthors: [
          { userId: null, name: '작가나' },
          { userId: 7, name: '작가다' },
          { userId: 9, name: '작가라' },
        ],
      }).map((artist) => artist.name),
    ).toEqual(['작가다', '작가라', '작가가', '작가나']);
  });

  it('작가 이름이 비면 작가 미상으로 둔다', () => {
    expect(getArtworkArtists({ artistName: '' })[0].name).toBe('작가 미상');
  });
});

describe('getArtworkSpecText', () => {
  it('12개 분야는 한글 이름으로 보이고, 12개 밖의 분야 값은 보이지 않는다', () => {
    expect(getArtworkSpecText({ type: 'GRAPHIC', productionYear: 2026 })).toBe('그래픽 · 2026');
    expect(getArtworkSpecText({ type: 'DESIGN', productionYear: 2026, size: '50cm' })).toBe(
      '2026 · 50cm',
    );
  });
});
