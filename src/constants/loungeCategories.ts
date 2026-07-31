export const LOUNGE_CATEGORIES = {
  review: '전시 후기',
  tips: '전시 준비·작업 팁',
  collab: '모집·협업',
  venue: '전시 장소 대여',
} as const;

// 게시글 카드 상단 태그 칩에 쓰는 축약형 (피그마 디자인 기준)
export const LOUNGE_CATEGORY_TAGS = {
  review: '전시 후기',
  tips: '준비·작업 팁',
  collab: '모집·협업',
  venue: '장소 대여',
} as const;

export type LoungeCategoryKey = keyof typeof LOUNGE_CATEGORIES;

export function isLoungeCategoryKey(value: string | undefined): value is LoungeCategoryKey {
  return !!value && value in LOUNGE_CATEGORIES;
}

// 프론트 카테고리 키 ↔ 백엔드 category enum 값 매핑 (LoungePostCard.tsx의 CATEGORY_LABEL 기준)
export const LOUNGE_CATEGORY_API_VALUES = {
  review: 'DISPLAY_REVIEW',
  tips: 'WORK_TIP',
  collab: 'COLLABORATION',
  venue: 'SPACE_RENTAL',
} as const;

export function toLoungeCategoryKey(apiCategory: string): LoungeCategoryKey | undefined {
  return (Object.keys(LOUNGE_CATEGORY_API_VALUES) as LoungeCategoryKey[]).find(
    (key) => LOUNGE_CATEGORY_API_VALUES[key] === apiCategory,
  );
}
