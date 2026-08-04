import type { CreateDisplayRequestDto } from '@/api/dto';

export const EXHIBITION_TYPES = [
  { label: '졸업 전시', group: 'institution' },
  { label: '과제 전시', group: 'institution' },
  { label: '학과·학회 전시', group: 'institution' },
  { label: '연합 전시', group: 'institution' },
  { label: '소모임·동아리 전시', group: 'organization' },
  { label: '기타 단체 전시', group: 'organization' },
] as const;

export const EXHIBITION_FIELDS = [
  '회화',
  '디자인',
  '사진',
  '건축',
  '영상',
  '조소',
  '패션',
  '일러스트',
  '공예',
  '기타',
] as const;

export const EXHIBITION_TYPE_LABELS = EXHIBITION_TYPES.map((type) => type.label);

export type ExhibitionTypeGroup = 'institution' | 'organization';
export type ExhibitionType = (typeof EXHIBITION_TYPES)[number]['label'];
export type ExhibitionField = (typeof EXHIBITION_FIELDS)[number];

export const DISPLAY_TYPE_MAP: Record<string, CreateDisplayRequestDto['type']> = {
  '졸업 전시': 'GRADUATION',
  '과제 전시': 'TASK',
  '학과·학회 전시': 'CLUB',
  '연합 전시': 'JOINT',
  '소모임·동아리 전시': 'CLUB',
  '기타 단체 전시': 'ETC',
} satisfies Record<ExhibitionType, CreateDisplayRequestDto['type']>;

//백엔드에서 다른 Enum을 사용해서 따로 분리했습니다. 수정되는대로 변경하도록 하겠습니다.
export const DISPLAY_FIELD_MAP: Record<string, string> = {
  회화: 'PAINTING',
  디자인: 'DESIGN',
  사진: 'PHOTOGRAPHY',
  건축: 'ARCHITECTURE',
  영상: 'MEDIA',
  조소: 'SCULPTURE',
  패션: 'FASHION',
  일러스트: 'DESIGN',
  공예: 'CRAFT',
  기타: 'ETC',
} satisfies Record<ExhibitionField, string>;

export const ARTWORK_FIELD_MAP: Record<string, string> = {
  회화: 'PAINTING',
  디자인: 'DESIGN',
  사진: 'PHOTOGRAPHY',
  건축: 'ARCHITECTURE',
  영상: 'VIDEO',
  조소: 'SCULPTURE',
  패션: 'FASHION',
  일러스트: 'ILLUSTRATION',
  공예: 'CRAFTS',
  기타: 'OTHERS',
} satisfies Record<ExhibitionField, string>;

export const ARTWORK_FIELD_FALLBACK = 'OTHERS';

/* 작가 인증에서 주요 활동 분야로 고를 수 있는 최대 개수입니다. */
export const MAX_ARTIST_FIELDS = 2;

export const MAX_POSTER_UPLOAD_IMAGES = 4;
export const MAX_ARTWORK_UPLOAD_IMAGES = 20;
export const MAX_ARTWORK_PROGRESS_IMAGES = 20;
