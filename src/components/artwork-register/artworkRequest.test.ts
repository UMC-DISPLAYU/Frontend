import { describe, expect, it } from 'vitest';

import type { ArtworkRegisterValues } from './artworkRegister.schema';
import type { ArtworkPerson } from './artworkRegister.types';
import {
  buildCreateArtworkRequest,
  buildUpdateArtworkRequest,
  resolveQaHandlerUserIds,
  splitArtworkImages,
  toArtworkImageRequests,
  toArtworkRegisterValues,
} from './artworkRequest';

const values: ArtworkRegisterValues = {
  title: '머문 자리의 온기',
  intro: '',
  fieldLabels: ['회화', '그래픽'],
  year: '2026',
  material: '아크릴',
  size: '',
};
const images = { artworkUrls: ['a1', 'a2'], processUrls: ['p1'] };
const me: ArtworkPerson = { key: 'author', name: '김디유', caption: '작가 · 나', userId: 1 };
const teamCoAuthor: ArtworkPerson = { key: 'user-3', name: '김서윤', caption: '팀원', userId: 3 };
const namedCoAuthor: ArtworkPerson = { key: 'name-황유선', name: '황유선', caption: '직접 입력' };

describe('splitArtworkImages', () => {
  it('순서대로 정렬해 작품 이미지와 작업 과정을 나누고, 구분이 없으면 작품 이미지로 본다', () => {
    expect(
      splitArtworkImages([
        { imageUrl: 'p2', sortOrder: 2, imageType: 'WORK_PROCESS' },
        { imageUrl: 'a2', sortOrder: 2, imageType: 'ARTWORK' },
        { imageUrl: 'a1', sortOrder: 1 },
        { imageUrl: 'p1', sortOrder: 1, imageType: 'WORK_PROCESS' },
      ]),
    ).toEqual({ artworkUrls: ['a1', 'a2'], processUrls: ['p1', 'p2'] });
  });
});

describe('toArtworkImageRequests', () => {
  it('작품 이미지 첫 장만 대표로 보내고 순서는 1부터 센다', () => {
    const requests = toArtworkImageRequests(images);

    expect(
      requests.map(({ imageUrl, isThumbnail, imageType, sortOrder }) => [
        imageUrl,
        isThumbnail,
        imageType,
        sortOrder,
      ]),
    ).toEqual([
      ['a1', true, 'ARTWORK', 1],
      ['a2', false, 'ARTWORK', 2],
      ['p1', false, 'WORK_PROCESS', 1],
    ]);
    expect(requests.every((image) => image.width! > 0 && image.height! > 0)).toBe(true);
  });
});

describe('resolveQaHandlerUserIds', () => {
  it('기존 담당자 중 아직 지정할 수 있는 사람만 남긴다', () => {
    expect(
      resolveQaHandlerUserIds({
        artistUserId: 1,
        coAuthors: [teamCoAuthor],
        ownerUserId: 9,
        previous: [3, 4, 3],
      }),
    ).toEqual([3]);
  });

  it('남은 담당자가 없으면 작가를, 작가 계정이 없으면 대표자를 보낸다', () => {
    expect(resolveQaHandlerUserIds({ artistUserId: 1, coAuthors: [], previous: [4] })).toEqual([1]);
    expect(resolveQaHandlerUserIds({ coAuthors: [namedCoAuthor], ownerUserId: 9 })).toEqual([9]);
    expect(resolveQaHandlerUserIds({ coAuthors: [] })).toEqual([]);
  });
});

describe('buildCreateArtworkRequest', () => {
  it('공동 작가를 계정 연결 여부로 나누고 분야를 서버 enum 으로 보낸다', () => {
    const request = buildCreateArtworkRequest(7, {
      values,
      images,
      author: me,
      coAuthors: [teamCoAuthor, namedCoAuthor],
      ownerUserId: 9,
    });

    expect(request).toMatchObject({
      displayId: 7,
      artworkName: '머문 자리의 온기',
      content: '',
      type: 'PAINTING',
      types: ['PAINTING', 'DESIGN'],
      productionYear: 2026,
      materialMedia: '아크릴',
      size: '',
      artistName: '김디유',
      artistUserId: 1,
      coAuthors: { userIds: [3], rawNames: ['황유선'] },
      qaHandlerUserIds: [1],
    });
    expect(request).not.toHaveProperty('point');
  });

  it('이름을 직접 입력한 작가는 계정 없이 이름만 보낸다', () => {
    const request = buildCreateArtworkRequest(7, {
      values,
      images,
      author: { key: 'author', name: ' 김하늘 ', caption: '작가 · 직접 입력' },
      coAuthors: [],
      ownerUserId: 9,
    });

    expect(request.artistName).toBe('김하늘');
    expect(request).not.toHaveProperty('artistUserId');
    expect(request.qaHandlerUserIds).toEqual([9]);
  });
});

describe('buildUpdateArtworkRequest', () => {
  it('화면에 없는 감상 포인트와 기존 담당자를 그대로 보낸다', () => {
    const request = buildUpdateArtworkRequest({
      values,
      images,
      author: me,
      coAuthors: [teamCoAuthor],
      ownerUserId: 9,
      previous: { point: '겹겹이 쌓인 색', qaHandlerUserIds: [3] },
    });

    expect(request).not.toHaveProperty('displayId');
    expect(request.point).toBe('겹겹이 쌓인 색');
    expect(request.qaHandlerUserIds).toEqual([3]);
  });
});

describe('toArtworkRegisterValues', () => {
  it('types 가 없으면 쉼표로 이어진 type 을 나눠 분야를 채운다', () => {
    expect(
      toArtworkRegisterValues({
        artworkName: '작은 정원',
        content: null,
        type: 'PAINTING, SCULPTURE',
        types: [],
        productionYear: 2025,
        materialMedia: 'Mixed media',
        size: null,
      }),
    ).toEqual({
      title: '작은 정원',
      intro: '',
      fieldLabels: ['회화', '조소'],
      year: '2025',
      material: 'Mixed media',
      size: '',
    });
  });
});
