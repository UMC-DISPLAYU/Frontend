import type { ArtworkTypeDto, DisplayArtworkTypeDto } from '@/api/dto';

export const MAX_ARTWORK_IMAGES = 10;
export const MAX_PROCESS_IMAGES = 10;
export const MAX_ARTWORK_IMAGE_MB = 20;
// HEIC · HEIF 도 받고, 올리기 전에 JPG 로 바꾼다(heicImage.ts)
export const ARTWORK_IMAGE_ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ARTWORK_VIDEO_ACCEPT_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'] as const;
/** 작품 이미지 10개 중 영상은 1개까지. 작업 과정은 사진만 받는다 */
export const MAX_ARTWORK_VIDEOS = 1;
export const MAX_ARTWORK_VIDEO_SECONDS = 180;
/** 서버가 10진 바이트(500,000,000)로 검사해 MB 표시와 같은 기준을 쓴다 */
export const MAX_ARTWORK_VIDEO_MB = 500;
export const MAX_ARTWORK_VIDEO_BYTES = MAX_ARTWORK_VIDEO_MB * 1_000_000;

export const MAX_ARTWORK_TITLE_LENGTH = 60;
export const MAX_ARTWORK_INTRO_LENGTH = 1500;
export const MAX_ARTWORK_MATERIAL_LENGTH = 40;
export const MAX_ARTWORK_SIZE_LENGTH = 40;
export const MAX_CO_AUTHOR_NAME_LENGTH = 20;
export const MAX_PROXY_AUTHOR_NAME_LENGTH = 20;

// 프로토타입 · 사용자 요청: 작품분야는 3개까지 고른다
export const MAX_ARTWORK_FIELDS = 3;

type ArtworkFieldOption<TValue extends string> = { label: string; value: TValue };

/* 전시 작품 분야. 화면의 12개 분야와 서버 값이 하나씩 맞는다 */
export const ARTWORK_FIELD_OPTIONS: readonly ArtworkFieldOption<DisplayArtworkTypeDto>[] = [
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

// 개인 작품 API 는 아직 예전 10개 분야만 받아 그래픽 · 브랜딩 · 제품 · 공간 · UXUI 는 DESIGN 으로 보낸다
const PERSONAL_ARTWORK_FIELD_OPTIONS: readonly ArtworkFieldOption<ArtworkTypeDto>[] = [
  { label: '회화', value: 'PAINTING' },
  { label: '조소', value: 'SCULPTURE' },
  { label: '사진', value: 'PHOTOGRAPHY' },
  { label: '그래픽', value: 'DESIGN' },
  { label: '브랜딩', value: 'DESIGN' },
  { label: '제품', value: 'DESIGN' },
  { label: '영상', value: 'MEDIA' },
  { label: '공간', value: 'DESIGN' },
  { label: '건축', value: 'ARCHITECTURE' },
  { label: 'UXUI', value: 'DESIGN' },
  { label: '공예', value: 'CRAFT' },
  { label: '기타', value: 'ETC' },
];

export type ArtworkFieldTarget = 'display' | 'personal';

const FIELD_OPTIONS_BY_TARGET = {
  display: ARTWORK_FIELD_OPTIONS,
  personal: PERSONAL_ARTWORK_FIELD_OPTIONS,
} as const;

/* 12개 밖의 분야 값은 없는 값으로 본다 */
const toFieldLabel = (type: string) =>
  ARTWORK_FIELD_OPTIONS.find((option) => option.value === type)?.label;

/** 고른 분야 이름을 서버 값으로 바꾼다. 같은 값은 한 번만 보낸다 */
export function toArtworkTypes(
  labels: readonly string[],
  target?: 'display',
): DisplayArtworkTypeDto[];
export function toArtworkTypes(labels: readonly string[], target: 'personal'): ArtworkTypeDto[];
export function toArtworkTypes(
  labels: readonly string[],
  target: ArtworkFieldTarget = 'display',
): string[] {
  const options: readonly ArtworkFieldOption<string>[] = FIELD_OPTIONS_BY_TARGET[target];
  const values = labels.flatMap(
    (label) => options.find((option) => option.label === label)?.value ?? [],
  );

  return [...new Set(values)];
}

/** 서버 분야 값을 분야 이름으로 되돌린다. 12개 밖의 값은 버린다 */
export function toArtworkFieldLabels(types: readonly string[]): string[] {
  const labels = types.flatMap((type) => toFieldLabel(type.trim()) ?? []);

  return [...new Set(labels)].slice(0, MAX_ARTWORK_FIELDS);
}
