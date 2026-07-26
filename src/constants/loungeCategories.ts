export const LOUNGE_CATEGORIES = {
  DISPLAY_REVIEW: '전시 후기',
  WORK_TIP: '전시 준비·작업 팁',
  COLLABORATION: '모집·협업',
  VENUE_RENTAL: '전시 장소 대여',
} as const;

// 게시글 카드 상단 태그 칩에 쓰는 축약형 (피그마 디자인 기준)
export const LOUNGE_CATEGORY_TAGS = {
  DISPLAY_REVIEW: '전시 후기',
  WORK_TIP: '준비·작업 팁',
  COLLABORATION: '모집·협업',
  VENUE_RENTAL: '장소 대여',
} as const;

export type LoungeCategoryKey = keyof typeof LOUNGE_CATEGORIES;

export function isLoungeCategoryKey(value: string | undefined): value is LoungeCategoryKey {
  return !!value && value in LOUNGE_CATEGORIES;
}
