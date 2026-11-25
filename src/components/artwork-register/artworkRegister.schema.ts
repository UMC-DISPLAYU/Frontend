import { z } from 'zod';

import {
  ARTWORK_FIELD_OPTIONS,
  MAX_ARTWORK_FIELDS,
  MAX_ARTWORK_INTRO_LENGTH,
  MAX_ARTWORK_MATERIAL_LENGTH,
  MAX_ARTWORK_SIZE_LENGTH,
  MAX_ARTWORK_TITLE_LENGTH,
} from './artworkRegister.constants';
import type { ArtworkImageItem } from './useArtworkImageUploads';

const FIELD_LABELS = ARTWORK_FIELD_OPTIONS.map((option) => option.label);
// 서버가 제작 연도를 1000 이상으로 받는다
const MIN_PRODUCTION_YEAR = 1000;

export function sanitizeArtworkYearInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

const titleSchema = z
  .string()
  .trim()
  .min(1, { message: '작품명을 입력해주세요.' })
  .max(MAX_ARTWORK_TITLE_LENGTH, {
    message: `작품명은 ${MAX_ARTWORK_TITLE_LENGTH}자까지 입력할 수 있어요.`,
  });

const materialSchema = z
  .string()
  .trim()
  .max(MAX_ARTWORK_MATERIAL_LENGTH, {
    message: `재료 / 매체는 ${MAX_ARTWORK_MATERIAL_LENGTH}자까지 입력할 수 있어요.`,
  });

const sizeSchema = z
  .string()
  .trim()
  .max(MAX_ARTWORK_SIZE_LENGTH, {
    message: `규격은 ${MAX_ARTWORK_SIZE_LENGTH}자까지 입력할 수 있어요.`,
  });

const YEAR_FORMAT_MESSAGE = '제작 연도는 4자리 숫자로 입력해주세요.';
const YEAR_RANGE_MESSAGE = '제작 연도를 확인해주세요.';

/*
 * 연작의 작품 2부터. 사진 · 영상은 각 작품 칸이 올린 목록(media)을 그대로 담는다.
 * 제작 연도는 비우면 작품 1 연도로 보낸다(프로토타입)
 */
export const artworkPartSchema = z.object({
  /* 칸을 구분하는 값(요청에는 보내지 않는다) */
  key: z.string(),
  title: titleSchema,
  year: z
    .string()
    .refine((value) => value === '' || /^\d{4}$/.test(value), { message: YEAR_FORMAT_MESSAGE })
    .refine((value) => value === '' || Number(value) >= MIN_PRODUCTION_YEAR, {
      message: YEAR_RANGE_MESSAGE,
    }),
  material: materialSchema,
  size: sizeSchema,
  // 서버가 작품 2부터 사진(IMAGE)을 1장 이상 요구한다. 영상만으로는 등록할 수 없다
  media: z
    .array(z.custom<ArtworkImageItem>())
    .refine((media) => media.some((item) => item.mediaType === 'IMAGE'), {
      message: '작품 사진을 1장 이상 올려주세요.',
    }),
});

export type ArtworkPartValues = z.infer<typeof artworkPartSchema>;

export const artworkRegisterSchema = z.object({
  title: titleSchema,
  intro: z.string().max(MAX_ARTWORK_INTRO_LENGTH, {
    message: `작품 설명은 ${MAX_ARTWORK_INTRO_LENGTH}자까지 입력할 수 있어요.`,
  }),
  fieldLabels: z
    .array(z.string().refine((label) => FIELD_LABELS.includes(label)))
    .min(1, { message: '작품분야를 선택해주세요.' })
    .max(MAX_ARTWORK_FIELDS, {
      message: `작품분야는 최대 ${MAX_ARTWORK_FIELDS}개까지 선택할 수 있어요.`,
    }),
  year: z
    .string()
    .regex(/^\d{4}$/, { message: YEAR_FORMAT_MESSAGE })
    .refine((value) => Number(value) >= MIN_PRODUCTION_YEAR, { message: YEAR_RANGE_MESSAGE }),
  material: materialSchema,
  size: sizeSchema,
  /* 연작의 작품 2부터. 개인 작품은 늘 비어 있다 */
  parts: z.array(artworkPartSchema),
});

export type ArtworkRegisterValues = z.infer<typeof artworkRegisterSchema>;

export const EMPTY_ARTWORK_REGISTER_VALUES: ArtworkRegisterValues = {
  title: '',
  intro: '',
  fieldLabels: [],
  year: '',
  material: '',
  size: '',
  parts: [],
};
