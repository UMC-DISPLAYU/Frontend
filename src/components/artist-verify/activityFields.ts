/*
 * 프로토타입 순서의 작가 분야 12개. 그래픽 · 브랜딩 · 제품 · 공간 · UXUI 는 아직 서버 값이 없어
 * 실서버에 보내면 저장에 실패한다(#470 "필요한 API").
 */
export const ACTIVITY_FIELDS = [
  { code: 'PAINTING', label: '회화' },
  { code: 'SCULPTURE', label: '조소' },
  { code: 'PHOTOGRAPHY', label: '사진' },
  { code: 'GRAPHIC', label: '그래픽' },
  { code: 'BRANDING', label: '브랜딩' },
  { code: 'PRODUCT', label: '제품' },
  { code: 'VIDEO', label: '영상' },
  { code: 'SPACE', label: '공간' },
  { code: 'ARCHITECTURE', label: '건축' },
  { code: 'UX_UI', label: 'UXUI' },
  { code: 'CRAFT', label: '공예' },
  { code: 'ETC', label: '기타' },
] as const;

export type ActivityFieldCode = (typeof ACTIVITY_FIELDS)[number]['code'];
