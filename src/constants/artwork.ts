export const DEFAULT_ARTWORK_IMAGE_WIDTH = 800;
export const DEFAULT_ARTWORK_IMAGE_HEIGHT = 600;

/* 개인 작품 등록에서 작품 이미지·작업과정 이미지에 각각 허용하는 장수입니다. */
export const MAX_PERSONAL_ARTWORK_IMAGES = 4;

export const ARTWORK_FIELD_MAP: Record<string, string> = {
  회화: 'PAINTING',
  디자인: 'DESIGN',
  사진: 'PHOTOGRAPHY',
  건축: 'ARCHITECTURE',
  영상: 'MEDIA',
  조소: 'SCULPTURE',
  패션: 'FASHION',
  공예: 'CRAFT',
  기타: 'ETC',
};
