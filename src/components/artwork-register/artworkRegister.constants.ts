import type { ArtworkTypeDto } from '@/api/dto';

export const MAX_ARTWORK_IMAGES = 10;
export const MAX_PROCESS_IMAGES = 10;
export const MAX_ARTWORK_IMAGE_MB = 20;
// 업로드 API(presigned-url)가 HEIC 를 받지 않아 JPG · PNG · WEBP 만 고른다
export const ARTWORK_IMAGE_ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const MAX_ARTWORK_TITLE_LENGTH = 60;
export const MAX_ARTWORK_INTRO_LENGTH = 1500;
export const MAX_ARTWORK_MATERIAL_LENGTH = 40;
export const MAX_ARTWORK_SIZE_LENGTH = 40;
export const MAX_CO_AUTHOR_NAME_LENGTH = 20;
export const MAX_PROXY_AUTHOR_NAME_LENGTH = 20;

// 서버 types 가 최대 2개라 화면에서도 2개까지만 고른다
export const MAX_ARTWORK_FIELDS = 2;

// 서버 enum 이 화면의 12개 분야보다 적어 그래픽 · 브랜딩 · 제품 · 공간 · UXUI 는 DESIGN 으로 보낸다
export const ARTWORK_FIELD_OPTIONS: readonly { label: string; value: ArtworkTypeDto }[] = [
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

const FALLBACK_FIELD_LABEL = '기타';

/** 고른 분야 이름을 서버 enum 으로 바꾼다. 같은 enum 은 한 번만 보낸다 */
export function toArtworkTypes(labels: readonly string[]): ArtworkTypeDto[] {
  const values = labels.flatMap(
    (label) => ARTWORK_FIELD_OPTIONS.find((option) => option.label === label)?.value ?? [],
  );

  return [...new Set(values)];
}

/** 서버 enum 을 분야 이름으로 되돌린다. 화면에 없는 값(FASHION · COMPLEX 등)은 기타로 본다 */
export function toArtworkFieldLabels(types: readonly string[]): string[] {
  const labels = types.map(
    (type) =>
      ARTWORK_FIELD_OPTIONS.find((option) => option.value === type.trim())?.label ??
      FALLBACK_FIELD_LABEL,
  );

  return [...new Set(labels)].slice(0, MAX_ARTWORK_FIELDS);
}
