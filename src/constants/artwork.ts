export const DEFAULT_ARTWORK_IMAGE_WIDTH = 800;
export const DEFAULT_ARTWORK_IMAGE_HEIGHT = 600;

export const ARTWORK_FIELD_MAP: Record<string, string> = {
  회화: 'PAINTING',
  디자인: 'DESIGN',
  사진: 'PHOTOGRAPHY',
  건축: 'ARCHITECTURE',
  영상: 'MEDIA',
  조소: 'SCULPTURE',
  패션: 'FASHION',
  일러스트: 'ILLUSTRATION',
  공예: 'CRAFT',
  기타: 'ETC',
};

/* ARTWORK_FIELD_MAP의 역방향(영문 enum → 한글 라벨) 조회용입니다. */
export const ARTWORK_TYPE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ARTWORK_FIELD_MAP).map(([label, value]) => [value, label]),
);
