/*
 * 작가 프로필 분야. 프로토타입(profile-edit.html)의 12개를 같은 순서로 둔다.
 */
export const ARTIST_PROFILE_FIELDS = [
  'PAINTING',
  'SCULPTURE',
  'PHOTOGRAPHY',
  'GRAPHIC',
  'BRANDING',
  'PRODUCT',
  'VIDEO',
  'SPACE',
  'ARCHITECTURE',
  'UX_UI',
  'CRAFT',
  'ETC',
] as const;

export type ArtistProfileField = (typeof ARTIST_PROFILE_FIELDS)[number];

export const ARTIST_PROFILE_FIELD_LABELS: Record<ArtistProfileField, string> = {
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
  CRAFT: '공예',
  ETC: '기타',
};

export const isArtistProfileField = (code: string): code is ArtistProfileField =>
  (ARTIST_PROFILE_FIELDS as readonly string[]).includes(code);
