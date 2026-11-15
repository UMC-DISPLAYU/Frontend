/*
 * 작가 프로필 분야. 프로토타입(profile-edit.html)의 12개를 같은 순서로 둔다.
 * 값은 서버 저장 · 응답 표준 값이다(예전 CRAFT · ETC 로 보내도 CRAFTS · OTHERS 로 응답한다).
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
  'CRAFTS',
  'OTHERS',
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
  CRAFTS: '공예',
  OTHERS: '기타',
};

export const isArtistProfileField = (code: string): code is ArtistProfileField =>
  (ARTIST_PROFILE_FIELDS as readonly string[]).includes(code);

// 작가 프로필 조회는 저장된 값을 그대로 내려주므로 예전 별칭 · 예전 분야가 올 수 있다(서버 CreativeFieldCodes)
const ARTIST_PROFILE_FIELD_ALIASES: Record<string, ArtistProfileField> = {
  UXUI: 'UX_UI',
  MEDIA: 'VIDEO',
  CRAFT: 'CRAFTS',
  ETC: 'OTHERS',
};

const LEGACY_ARTIST_PROFILE_FIELD_LABELS: Record<string, string> = {
  DESIGN: '디자인',
  FASHION: '패션',
  ILLUSTRATION: '일러스트',
};

export const toArtistProfileField = (code: string) => ARTIST_PROFILE_FIELD_ALIASES[code] ?? code;

export const getArtistProfileFieldLabel = (code: string) => {
  const field = toArtistProfileField(code);
  return isArtistProfileField(field)
    ? ARTIST_PROFILE_FIELD_LABELS[field]
    : (LEGACY_ARTIST_PROFILE_FIELD_LABELS[code] ?? code);
};
