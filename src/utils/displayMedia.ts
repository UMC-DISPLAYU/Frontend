import type { DisplayImageDto } from '@/api/dto';

export const isVideoMedia = (image: Pick<DisplayImageDto, 'mediaType'>) =>
  image.mediaType === 'VIDEO';

/** 카드 · 목록에 보일 이미지 주소. 영상이면 imageUrl 이 영상 원본이라 썸네일을 쓴다 */
export const toDisplayImageCardUrl = (
  image: Pick<DisplayImageDto, 'imageUrl' | 'mediaType' | 'thumbnailUrl'>,
) => (isVideoMedia(image) ? (image.thumbnailUrl ?? '') : image.imageUrl);
