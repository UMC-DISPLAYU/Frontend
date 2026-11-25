/* eslint-disable @typescript-eslint/no-explicit-any */

export const MOCK_SERIES_ARTWORK_ID = 1098;

/* 작품 1 사진 4장, 작품 2 · 3 사진 2장씩(프로토타입 work.html?w=0 과 같은 구성) */
const PHOTOS_PER_WORK = [4, 2, 2];

/*
 * 연작(작품 여러 점) 샘플. 101번 전시의 두 번째 작품(목 로그인 사용자가 공동 작가)을 바탕으로
 * 작품 1 · WALK · 세 지점의 수첩 세 점을 한 작품 등록에 담는다. 작품 상세 · 작품 수정에서 확인한다
 */
export const withArtworkSeriesSample = (artworks: any[]) => {
  const baseIndex = artworks.findIndex((artwork) => artwork.artworkId === 1002);
  if (baseIndex < 0) return artworks;

  const base = artworks[baseIndex];
  const photos = base.images.filter((image: any) => image.imageType === 'ARTWORK');
  const processImages = base.images.filter((image: any) => image.imageType === 'WORK_PROCESS');
  if (photos.length < PHOTOS_PER_WORK.reduce((sum, count) => sum + count, 0)) return artworks;

  let photoIndex = 0;
  const images = PHOTOS_PER_WORK.flatMap((count, partIndex) =>
    Array.from({ length: count }, () => {
      const photo = photos[photoIndex];
      const sortOrder = photoIndex;
      photoIndex += 1;
      return {
        ...photo,
        imageId: MOCK_SERIES_ARTWORK_ID * 100 + sortOrder + 1,
        artworkImageId: MOCK_SERIES_ARTWORK_ID * 100 + sortOrder + 1,
        isThumbnail: sortOrder === 0,
        sortOrder,
        partIndex,
      };
    }),
  );
  const content =
    '학교 뒷산 산책로를 세 구간으로 나눠 접지 지도와 소책자로 만들었다. 지도는 다 펼쳐야 길이 이어지고, 접으면 구간마다 따로 읽힌다. 실제로 걸으면서 접는 순서를 몇 번이고 바꿔 봤다.';
  const sample = {
    ...base,
    artworkId: MOCK_SERIES_ARTWORK_ID,
    id: MOCK_SERIES_ARTWORK_ID,
    title: '접으면 달라지는 지도',
    artworkName: '접으면 달라지는 지도',
    content,
    description: content,
    type: 'GRAPHIC',
    types: ['GRAPHIC'],
    productionYear: 2026,
    materialMedia: '종이에 리소 인쇄, 접지',
    material: '종이에 리소 인쇄, 접지',
    size: '42 × 59.4 cm',
    artworkImageUrl: images[0].imageUrl,
    thumbnailUrl: images[0].imageUrl,
    artworkCrop: null,
    images: [...images, ...processImages],
    parts: [
      {
        artworkName: 'WALK',
        productionYear: 2026,
        materialMedia: '종이에 리소 인쇄, 아코디언 접지',
        size: '10.5 × 14.8 cm',
      },
      {
        artworkName: '세 지점의 수첩',
        productionYear: 2025,
        materialMedia: '종이에 인쇄, 실 제본',
        size: '9 × 12 cm',
      },
    ],
  };

  return [...artworks.slice(0, baseIndex + 1), sample, ...artworks.slice(baseIndex + 1)];
};
