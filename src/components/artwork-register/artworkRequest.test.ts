import { describe, expect, it } from 'vitest';

import type { ArtworkRegisterValues } from './artworkRegister.schema';
import type { ArtworkPerson } from './artworkRegister.types';
import {
  buildCreateArtworkRequest,
  buildPersonalArtworkRequest,
  buildUpdateArtworkRequest,
  resolveQaHandlerUserIds,
  splitArtworkImages,
  toArtworkImageRequests,
  toArtworkPartRequests,
  toArtworkRegisterValues,
} from './artworkRequest';

const values: ArtworkRegisterValues = {
  title: '머문 자리의 온기',
  intro: '',
  fieldLabels: ['회화', '그래픽'],
  year: '2026',
  material: '아크릴',
  size: '',
  parts: [],
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

  it('대표 사진이 첫 순서가 아니어도 맨 앞에 둬서 수정해도 대표 사진이 바뀌지 않는다', () => {
    expect(
      splitArtworkImages([
        { imageUrl: 'a1', sortOrder: 1, imageType: 'ARTWORK', isThumbnail: false },
        { imageUrl: 'a2', sortOrder: 2, imageType: 'ARTWORK', isThumbnail: true },
        { imageUrl: 'a3', sortOrder: 3, imageType: 'ARTWORK', isThumbnail: false },
        { imageUrl: 'p1', sortOrder: 1, imageType: 'WORK_PROCESS', isThumbnail: true },
      ]),
    ).toEqual({ artworkUrls: ['a2', 'a1', 'a3'], processUrls: ['p1'] });
  });

  it('영상은 썸네일 · 크기를 따로 모은다', () => {
    expect(
      splitArtworkImages([
        { imageUrl: 'a1', sortOrder: 1, imageType: 'ARTWORK' },
        {
          imageUrl: 'v1.mp4',
          sortOrder: 2,
          imageType: 'ARTWORK',
          mediaType: 'VIDEO',
          thumbnailUrl: 't1.jpg',
          width: 1920,
          height: 1080,
        },
      ]),
    ).toEqual({
      artworkUrls: ['a1', 'v1.mp4'],
      processUrls: [],
      videos: { 'v1.mp4': { thumbnailUrl: 't1.jpg', width: 1920, height: 1080 } },
    });
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

  it('이미 저장된 사진은 설명(공백 · 빈 값 포함) · 크기를 그대로 보내고, 새 사진 · 잘못된 크기는 기본값을 쓴다', () => {
    const requests = toArtworkImageRequests(images, [
      { imageUrl: 'a1', caption: ' 정면 ', width: 1200, height: 1600 },
      { imageUrl: 'p1', caption: '', width: 0, height: -1 },
    ]);

    expect(requests[0]).toMatchObject({ caption: ' 정면 ', width: 1200, height: 1600 });
    expect(requests[1]).not.toHaveProperty('caption');
    expect(requests[2]).toMatchObject({ caption: '' });
    expect(requests[2].width).toBeGreaterThan(0);
    expect(requests[2].height).toBeGreaterThan(0);
  });

  it('영상은 VIDEO · 썸네일 · 썸네일 크기를 보내고, 사진에는 mediaType 을 붙이지 않는다', () => {
    const requests = toArtworkImageRequests({
      artworkUrls: ['v1.mp4', 'a1'],
      processUrls: [],
      videos: { 'v1.mp4': { thumbnailUrl: 't1.jpg', width: 1920, height: 1080 } },
    });

    expect(requests[0]).toMatchObject({
      imageUrl: 'v1.mp4',
      isThumbnail: true,
      mediaType: 'VIDEO',
      thumbnailUrl: 't1.jpg',
      width: 1920,
      height: 1080,
    });
    expect(requests[1]).not.toHaveProperty('mediaType');
    expect(requests[1]).not.toHaveProperty('thumbnailUrl');
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
      types: ['PAINTING', 'GRAPHIC'],
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

describe('artworkCrop', () => {
  it('대표 사진의 썸네일 영역을 보내고, 고르지 않았으면 보내지 않는다', () => {
    const base = { values, author: me, coAuthors: [], ownerUserId: 9 };

    expect(
      buildCreateArtworkRequest(7, {
        ...base,
        images: { ...images, artworkCrop: { x: 0.25, y: 0, w: 0.75, h: 1 } },
      }).artworkCrop,
    ).toEqual({ x: 0.25, y: 0, w: 0.75, h: 1 });
    expect(buildCreateArtworkRequest(7, { ...base, images })).not.toHaveProperty('artworkCrop');
    expect(
      buildUpdateArtworkRequest({ ...base, images: { ...images, artworkCrop: null } }),
    ).not.toHaveProperty('artworkCrop');
  });

  it('보이는 방식은 썸네일 조정에서 고른 경우에만 보낸다', () => {
    const base = { values, author: me, coAuthors: [], ownerUserId: 9 };

    expect(
      buildCreateArtworkRequest(7, { ...base, images: { ...images, artworkFit: 'FIT' } }),
    ).toMatchObject({ artworkFit: 'FIT' });
    expect(
      buildUpdateArtworkRequest({ ...base, images: { ...images, artworkFit: null } }),
    ).not.toHaveProperty('artworkFit');
  });
});

describe('buildPersonalArtworkRequest', () => {
  it('작가 · 담당자 필드 없이 작품 정보만 보낸다', () => {
    const request = buildPersonalArtworkRequest(values, images);

    expect(request).not.toHaveProperty('artistName');
    expect(request).not.toHaveProperty('point');
    expect(buildPersonalArtworkRequest(values, images, { point: ' 포인트 ' }).point).toBe('포인트');
  });

  it('개인 작품 API 는 예전 분야 값을 받아 그래픽 · 영상 · 공예 · 기타를 예전 값으로 보내고 썸네일 영역은 보내지 않는다', () => {
    const request = buildPersonalArtworkRequest(
      { ...values, fieldLabels: ['그래픽', '영상', '공예'] },
      { ...images, artworkCrop: { x: 0, y: 0, w: 0.75, h: 1 } },
    );

    expect(request.types).toEqual(['DESIGN', 'MEDIA', 'CRAFT']);
    expect(request.type).toBe('DESIGN');
    expect(request).not.toHaveProperty('artworkCrop');
    expect(buildPersonalArtworkRequest({ ...values, fieldLabels: ['기타'] }, images).types).toEqual(
      ['ETC'],
    );
  });
});

describe('12개 밖의 분야 값', () => {
  it('수정 화면에 보이지 않고, 저장할 때도 보내지 않는다', () => {
    const edited = toArtworkRegisterValues({
      artworkName: '작은 정원',
      content: null,
      type: 'DESIGN',
      types: ['DESIGN', 'PAINTING', 'FASHION'],
      productionYear: 2025,
      materialMedia: null,
      size: null,
    });

    expect(edited.fieldLabels).toEqual(['회화']);
    expect(
      buildUpdateArtworkRequest({
        values: edited,
        images,
        author: me,
        coAuthors: [],
        previous: { point: null, qaHandlerUserIds: [1], types: ['DESIGN', 'PAINTING', 'FASHION'] },
      }).types,
    ).toEqual(['PAINTING']);
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
      parts: [],
    });
  });

  it('연작은 작품 2부터를 저장된 칸 구분 값과 함께 채우고, 사진은 비워 둔다', () => {
    expect(
      toArtworkRegisterValues({
        artworkName: '접으면 달라지는 지도',
        type: 'GRAPHIC',
        productionYear: 2026,
        materialMedia: null,
        size: null,
        parts: [
          { artworkName: 'WALK', productionYear: 2025, materialMedia: '리소', size: null },
          { artworkName: '세 지점의 수첩', productionYear: null },
        ],
      }).parts,
    ).toEqual([
      { key: 'saved-0', title: 'WALK', year: '2025', material: '리소', size: '', media: [] },
      { key: 'saved-1', title: '세 지점의 수첩', year: '', material: '', size: '', media: [] },
    ]);
  });
});

const part = (title: string, year = '') => ({ title, year, material: ' 종이 ', size: '' });

describe('연작 요청', () => {
  it('splitArtworkImages 는 partIndex 로 작품 칸을 나누고, 범위 밖 partIndex 는 작품 1로 본다', () => {
    const split = splitArtworkImages(
      [
        { imageUrl: 'b1', sortOrder: 4, imageType: 'ARTWORK', partIndex: 1 },
        { imageUrl: 'a2', sortOrder: 2, imageType: 'ARTWORK', partIndex: 0 },
        { imageUrl: 'a1', sortOrder: 1, imageType: 'ARTWORK', isThumbnail: true },
        { imageUrl: 'c1', sortOrder: 5, imageType: 'ARTWORK', partIndex: 2 },
        { imageUrl: 'x', sortOrder: 6, imageType: 'ARTWORK', partIndex: 3 },
        {
          imageUrl: 'v',
          sortOrder: 3,
          imageType: 'ARTWORK',
          partIndex: 1,
          mediaType: 'VIDEO',
          thumbnailUrl: 'v.jpg',
        },
        { imageUrl: 'p1', sortOrder: 1, imageType: 'WORK_PROCESS' },
      ],
      2,
    );

    expect(split.artworkUrls).toEqual(['a1', 'a2', 'x']);
    expect(split.partUrls).toEqual([['v', 'b1'], ['c1']]);
    expect(split.processUrls).toEqual(['p1']);
    // 작품 2부터의 영상도 썸네일을 찾을 수 있다
    expect(split.videos).toHaveProperty('v');
  });

  it('연작이 아니면 partUrls 를 두지 않는다', () => {
    expect(
      splitArtworkImages([{ imageUrl: 'a', sortOrder: 1, imageType: 'ARTWORK', partIndex: 1 }]),
    ).toEqual({ artworkUrls: ['a'], processUrls: [] });
  });

  it('작품 1 → 작품 2 … 순서로 sortOrder 를 잇고, 작품 2부터만 partIndex 를 보낸다', () => {
    const requests = toArtworkImageRequests({
      artworkUrls: ['a1'],
      processUrls: ['p1'],
      partUrls: [['b1', 'b2'], ['c1']],
    });

    expect(
      requests.map(({ imageUrl, imageType, sortOrder, partIndex, isThumbnail }) => ({
        imageUrl,
        imageType,
        sortOrder,
        partIndex,
        isThumbnail,
      })),
    ).toEqual([
      {
        imageUrl: 'a1',
        imageType: 'ARTWORK',
        sortOrder: 1,
        partIndex: undefined,
        isThumbnail: true,
      },
      { imageUrl: 'b1', imageType: 'ARTWORK', sortOrder: 2, partIndex: 1, isThumbnail: false },
      { imageUrl: 'b2', imageType: 'ARTWORK', sortOrder: 3, partIndex: 1, isThumbnail: false },
      { imageUrl: 'c1', imageType: 'ARTWORK', sortOrder: 4, partIndex: 2, isThumbnail: false },
      {
        imageUrl: 'p1',
        imageType: 'WORK_PROCESS',
        sortOrder: 1,
        partIndex: undefined,
        isThumbnail: false,
      },
    ]);
    expect(requests[0]).not.toHaveProperty('partIndex');
  });

  it('앞 작품을 지우면 뒤 작품의 partIndex 가 남은 순서대로 당겨진다', () => {
    // 작품 2(b)를 지운 뒤 남은 작품 3(c)이 parts[0] 이 된다
    const requests = toArtworkImageRequests({
      artworkUrls: ['a1'],
      processUrls: [],
      partUrls: [['c1', 'c2']],
    });

    expect(
      requests.filter((image) => image.partIndex === 1).map((image) => image.imageUrl),
    ).toEqual(['c1', 'c2']);
    expect(requests.some((image) => (image.partIndex ?? 0) > 1)).toBe(false);
  });

  it('작품 2부터 요청은 이름 · 재료의 공백을 지우고, 제작 연도를 비웠으면 작품 1 연도를 보낸다', () => {
    expect(toArtworkPartRequests([part(' WALK ', '2025'), part('수첩')], '2026')).toEqual([
      { artworkName: 'WALK', productionYear: 2025, materialMedia: '종이', size: '' },
      { artworkName: '수첩', productionYear: 2026, materialMedia: '종이', size: '' },
    ]);
  });

  it('등록은 작품을 더했을 때만 parts 를 보낸다', () => {
    const base = { images, author: me, coAuthors: [] };
    const withParts = { ...values, parts: [{ ...part('WALK'), key: 'k', media: [] }] };

    expect(buildCreateArtworkRequest(7, { ...base, values })).not.toHaveProperty('parts');
    expect(buildCreateArtworkRequest(7, { ...base, values: withParts }).parts).toEqual([
      { artworkName: 'WALK', productionYear: 2026, materialMedia: '종이', size: '' },
    ]);
  });

  it('수정은 작품을 모두 지우면 빈 parts 를 보내고, 조회에 parts 가 없었으면 생략해 기존 작품을 지킨다', () => {
    const base = { values, images, author: me, coAuthors: [] };

    expect(
      buildUpdateArtworkRequest({ ...base, previous: { qaHandlerUserIds: [1], parts: [] } }).parts,
    ).toEqual([]);
    expect(
      buildUpdateArtworkRequest({ ...base, previous: { qaHandlerUserIds: [1] } }),
    ).not.toHaveProperty('parts');
  });
});
