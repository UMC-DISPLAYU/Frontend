/* eslint-disable @typescript-eslint/no-explicit-any */
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
