/* 프로토타입 순서의 작가 분야 12개. 값은 서버 저장 · 응답 표준 값이다 */
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
  { code: 'CRAFTS', label: '공예' },
  { code: 'OTHERS', label: '기타' },
] as const;

export type ActivityFieldCode = (typeof ACTIVITY_FIELDS)[number]['code'];
