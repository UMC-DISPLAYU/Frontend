import type { ExhibitionField } from '@/constants/exhibition';

export const MAX_DISPLAY_FIELDS = 3;
export const MAX_POSTER_FILE_MB = 20;
export const POSTER_CARD_RATIO = 402 / 568;
export const POSTER_ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const OTHER_GROUP_DISPLAY_TYPE = '기타 단체 전시';

// 서버 enum 이 화면의 12개 분야보다 적어 그래픽 · 브랜딩 · 제품 · 공간 · UXUI 는 DESIGN 으로 보낸다
export const DISPLAY_FIELD_OPTIONS: readonly { label: string; value: ExhibitionField }[] = [
  { label: '회화', value: 'PAINTING' },
  { label: '조소', value: 'SCULPTURE' },
  { label: '사진', value: 'PHOTOGRAPHY' },
  { label: '그래픽', value: 'DESIGN' },
  { label: '브랜딩', value: 'DESIGN' },
  { label: '제품', value: 'DESIGN' },
  { label: '영상', value: 'VIDEO' },
  { label: '공간', value: 'DESIGN' },
  { label: '건축', value: 'ARCHITECTURE' },
  { label: 'UXUI', value: 'DESIGN' },
  { label: '공예', value: 'CRAFT' },
  { label: '기타', value: 'ETC' },
];

export function toExhibitionFields(labels: readonly string[]): ExhibitionField[] {
  const values = DISPLAY_FIELD_OPTIONS.filter((option) => labels.includes(option.label)).map(
    (option) => option.value,
  );

  return [...new Set(values)];
}
