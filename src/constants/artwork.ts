export const DEFAULT_ARTWORK_IMAGE_WIDTH = 800;
export const DEFAULT_ARTWORK_IMAGE_HEIGHT = 600;

/* 작품 분야 값 → 한글 이름. 12개 밖의 값은 없는 값으로 보고 이름을 보이지 않는다 */
export const ARTWORK_TYPE_LABEL_MAP: Record<string, string> = {
  PAINTING: '회화',
  SCULPTURE: '조소',
  PHOTOGRAPHY: '사진',
  GRAPHIC: '그래픽',
  BRANDING: '브랜딩',
  PRODUCT: '제품',
  VIDEO: '영상',
  SPACE: '공간',
  ARCHITECTURE: '건축',
  UX_UI: 'UXUI',
  CRAFTS: '공예',
  OTHERS: '기타',
};
