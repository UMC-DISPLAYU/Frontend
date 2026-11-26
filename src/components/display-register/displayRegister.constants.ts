import type { DisplayFieldValue } from '@/constants/exhibition';

export const MAX_DISPLAY_FIELDS = 3;
export const MAX_POSTER_FILE_MB = 20;
export const POSTER_CARD_RATIO = 402 / 568;
export const POSTER_ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const POSTER_VIDEO_ACCEPT_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'] as const;
/** 포스터 중 영상은 1개까지 */
export const MAX_POSTER_VIDEOS = 1;
export const MAX_POSTER_VIDEO_SECONDS = 30;
/** 서버가 10진 바이트(200,000,000)로 검사해 MB 표시와 같은 기준을 쓴다 */
export const MAX_POSTER_VIDEO_MB = 200;
export const MAX_POSTER_VIDEO_BYTES = MAX_POSTER_VIDEO_MB * 1_000_000;

export const OTHER_GROUP_DISPLAY_TYPE = '기타 단체 전시';

// 프로토타입 12개 분야. 값은 전시 등록 · 수정 API 가 받는 서버 값이다
export const DISPLAY_FIELD_OPTIONS: readonly { label: string; value: DisplayFieldValue }[] = [
  { label: '회화', value: 'PAINTING' },
  { label: '조소', value: 'SCULPTURE' },
  { label: '사진', value: 'PHOTOGRAPHY' },
  { label: '그래픽', value: 'GRAPHIC' },
  { label: '브랜딩', value: 'BRANDING' },
  { label: '제품', value: 'PRODUCT' },
  { label: '영상', value: 'VIDEO' },
  { label: '공간', value: 'SPACE' },
  { label: '건축', value: 'ARCHITECTURE' },
  { label: 'UXUI', value: 'UX_UI' },
  { label: '공예', value: 'CRAFTS' },
  { label: '기타', value: 'OTHERS' },
];

export function toExhibitionFields(labels: readonly string[]): DisplayFieldValue[] {
  const values = DISPLAY_FIELD_OPTIONS.filter((option) => labels.includes(option.label)).map(
    (option) => option.value,
  );

  return [...new Set(values)];
}
