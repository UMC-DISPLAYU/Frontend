/* eslint-disable @typescript-eslint/no-explicit-any */
import artworkThumbnailUrl from '@/mocks/assets/artwork-thumbnail.jpg?url';
import artworkVideoUrl from '@/mocks/assets/artwork-video.mp4?url';
import posterThumbnailUrl from '@/mocks/assets/poster-thumbnail.jpg?url';
import posterVideoUrl from '@/mocks/assets/poster-video.mp4?url';

/*
 * 영상 화면 확인용 샘플(직접 만든 6초 H.264 영상). 101번 전시의 대표 포스터를 영상으로 바꿔
 * 홈 · 전시 상세 · 전시 관리 · 내 전시 관리 · 전시 수정에서 업로드 없이 영상을 볼 수 있게 한다.
 * 기존 포스터는 추가 포스터로 남긴다(서버 한도: 대표 1 + 추가 4)
 */
export const MOCK_VIDEO_DISPLAY_ID = 101;
export const MOCK_POSTER_THUMBNAIL_URL = posterThumbnailUrl;

export const withPosterVideoSample = (display: any) => {
  if (display.displayId !== MOCK_VIDEO_DISPLAY_ID) return display;

  const main = {
    imageId: display.displayId * 100,
    imageUrl: posterVideoUrl,
    isThumbnail: true,
    imageType: 'MAIN',
    caption: '',
    width: 480,
    height: 678,
    sortOrder: 0,
    mediaType: 'VIDEO',
    thumbnailUrl: posterThumbnailUrl,
  };
  const extras = (display.posterImages ?? []).slice(0, 4).map((image: any, index: number) => ({
    ...image,
    isThumbnail: false,
    imageType: 'DETAIL',
    caption: '',
    sortOrder: index + 1,
    mediaType: 'IMAGE',
    thumbnailUrl: null,
  }));
  const images = [main, ...extras];

  return {
    ...display,
    images,
    posterImages: images,
    posterImageUrl: posterThumbnailUrl,
    thumbnailUrl: posterThumbnailUrl,
    posterVideoUrl,
  };
};

export const MOCK_VIDEO_ARTWORK_ID = 1099;

/*
 * 영상 작품 샘플(직접 만든 8초 H.264 영상). 101번 전시의 첫 작품(목 로그인 사용자 작품)을 바탕으로
 * 대표가 영상이고 둘째 칸이 사진인 작품을 하나 더 둔다. 전시 상세 작품 탭 · 작품 상세 · 작품 수정에서 확인한다
 */
export const withArtworkVideoSample = (artworks: any[]) => {
  const baseIndex = artworks.findIndex((artwork) => artwork.artworkId === 1001);
  if (baseIndex < 0) return artworks;

  const base = artworks[baseIndex];
  const photo = base.images.find((image: any) => image.imageType === 'ARTWORK');
  const sample = {
    ...base,
    artworkId: MOCK_VIDEO_ARTWORK_ID,
    id: MOCK_VIDEO_ARTWORK_ID,
    title: '흐르는 원',
    artworkName: '흐르는 원',
    content:
      '원이 천천히 흐르며 겹치는 장면을 담은 8초 영상 작업입니다. 영상 화면 확인용 샘플이에요.',
    description:
      '원이 천천히 흐르며 겹치는 장면을 담은 8초 영상 작업입니다. 영상 화면 확인용 샘플이에요.',
    materialMedia: '영상',
    material: '영상',
    artworkImageUrl: artworkThumbnailUrl,
    artworkVideoUrl,
    thumbnailUrl: artworkThumbnailUrl,
    imageWidth: 640,
    imageHeight: 360,
    images: [
      {
        imageId: MOCK_VIDEO_ARTWORK_ID * 100 + 1,
        artworkImageId: MOCK_VIDEO_ARTWORK_ID * 100 + 1,
        imageUrl: artworkVideoUrl,
        isThumbnail: true,
        imageType: 'ARTWORK',
        width: 640,
        height: 360,
        sortOrder: 0,
        mediaType: 'VIDEO',
        thumbnailUrl: artworkThumbnailUrl,
      },
      ...(photo
        ? [
            {
              ...photo,
              imageId: MOCK_VIDEO_ARTWORK_ID * 100 + 2,
              artworkImageId: MOCK_VIDEO_ARTWORK_ID * 100 + 2,
              isThumbnail: false,
              sortOrder: 1,
            },
          ]
        : []),
    ],
  };

  return [...artworks.slice(0, baseIndex + 1), sample, ...artworks.slice(baseIndex + 1)];
};
