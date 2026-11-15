import type { CreateDisplayRequestDto } from '@/api/dto';

export const EXHIBITION_TYPES = [
  { label: '졸업 전시', group: 'institution' },
  { label: '과제 전시', group: 'institution' },
  { label: '학과·학회 전시', group: 'institution' },
  { label: '연합 전시', group: 'organization' },
  { label: '소모임·동아리 전시', group: 'institution' },
  { label: '기타 단체 전시', group: 'organization' },
] as const;

export const EXHIBITION_FIELDS = [
  'PAINTING',
  'DESIGN',
  'PHOTOGRAPHY',
  'ARCHITECTURE',
  'VIDEO',
  'SCULPTURE',
  'FASHION',
  'ILLUSTRATION',
  'CRAFT',
  'ETC',
] as const;

export const EXHIBITION_TYPE_LABELS = [
  '졸업 전시',
  '과제 전시',
  '학과·학회 전시',
  '연합 전시',
  '소모임·동아리 전시',
  '기타 단체 전시',
] as const;

export type ExhibitionTypeGroup = 'institution' | 'organization';
export type ExhibitionType = (typeof EXHIBITION_TYPES)[number]['label'];
export type ExhibitionField = (typeof EXHIBITION_FIELDS)[number];

export const DISPLAY_TYPE_MAP: Record<string, CreateDisplayRequestDto['type']> = {
  '졸업 전시': 'GRADUATION',
  '과제 전시': 'ASSIGNMENTS',
  '학과·학회 전시': 'DEPARTMENTS',
  '연합 전시': 'INTER_GROUP',
  '소모임·동아리 전시': 'SMALL_GROUP',
  '기타 단체 전시': 'OTHERS',
} satisfies Record<ExhibitionType, CreateDisplayRequestDto['type']>;

export const DISPLAY_TYPE_REVERSE_MAP: Record<string, string> = {
  GRADUATION: '졸업 전시',
  TASK: '과제 전시',
  ASSIGNMENTS: '과제 전시',
  CLUB: '학과·학회 전시',
  DEPARTMENTS: '학과·학회 전시',
  SMALL_GROUP: '소모임·동아리 전시',
  JOINT: '연합 전시',
  INTER_GROUP: '연합 전시',
  ETC: '기타 단체 전시',
  OTHERS: '기타 단체 전시',
};

/*
 * 전시 등록 · 수정 분야(POST · PATCH /display fields). 서버는 새로 고르는 값으로 이 12개만 받는다.
 * DESIGN · FASHION 등 예전 값을 새로 보내면 400 이고, 원래 저장돼 있던 예전 값만 다시 보내 유지할 수 있다.
 */
export const DISPLAY_FIELD_SERVER_VALUES = [
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

export type DisplayFieldValue = (typeof DISPLAY_FIELD_SERVER_VALUES)[number];

// 서버가 같은 분야로 보는 예전 표기(서버 CreativeFieldCodes)
const DISPLAY_FIELD_ALIASES: Record<string, DisplayFieldValue> = {
  UXUI: 'UX_UI',
  MEDIA: 'VIDEO',
  CRAFT: 'CRAFTS',
  ETC: 'OTHERS',
};

export const toDisplayFieldValue = (code: string) => DISPLAY_FIELD_ALIASES[code] ?? code;

export type ArtistFieldCode =
  | 'PAINTING'
  | 'DESIGN'
  | 'PHOTOGRAPHY'
  | 'ARCHITECTURE'
  | 'VIDEO'
  | 'CRAFT'
  | 'SCULPTURE'
  | 'FASHION'
  | 'ILLUSTRATION'
  | 'ETC';

export const ARTIST_FIELD_MAP: Record<ExhibitionField, ArtistFieldCode> = {
  PAINTING: 'PAINTING',
  DESIGN: 'DESIGN',
  PHOTOGRAPHY: 'PHOTOGRAPHY',
  ARCHITECTURE: 'ARCHITECTURE',
  VIDEO: 'VIDEO',
  SCULPTURE: 'SCULPTURE',
  FASHION: 'FASHION',
  ILLUSTRATION: 'ILLUSTRATION',
  CRAFT: 'CRAFT',
  ETC: 'ETC',
};

export const EXHIBITION_FIELD_LABELS: Record<ExhibitionField, string> = {
  PAINTING: '회화',
  DESIGN: '디자인',
  PHOTOGRAPHY: '사진',
  ARCHITECTURE: '건축',
  VIDEO: '영상',
  CRAFT: '공예',
  SCULPTURE: '조소',
  FASHION: '패션',
  ILLUSTRATION: '일러스트',
  ETC: '기타',
};

export const ARTIST_FIELD_REVERSE_MAP: Record<ArtistFieldCode, ExhibitionField> = {
  PAINTING: 'PAINTING',
  DESIGN: 'DESIGN',
  PHOTOGRAPHY: 'PHOTOGRAPHY',
  ARCHITECTURE: 'ARCHITECTURE',
  VIDEO: 'VIDEO',
  CRAFT: 'CRAFT',
  SCULPTURE: 'SCULPTURE',
  FASHION: 'FASHION',
  ILLUSTRATION: 'ILLUSTRATION',
  ETC: 'ETC',
};

/* 작가 인증에서 주요 활동 분야로 고를 수 있는 최대 개수입니다. */
export const MAX_ARTIST_FIELDS = 2;

export const MAX_POSTER_UPLOAD_IMAGES = 5;
