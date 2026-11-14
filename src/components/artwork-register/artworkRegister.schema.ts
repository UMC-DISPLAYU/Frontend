import { z } from 'zod';

import {
  ARTWORK_FIELD_OPTIONS,
  MAX_ARTWORK_FIELDS,
  MAX_ARTWORK_INTRO_LENGTH,
  MAX_ARTWORK_MATERIAL_LENGTH,
  MAX_ARTWORK_SIZE_LENGTH,
  MAX_ARTWORK_TITLE_LENGTH,
} from './artworkRegister.constants';

const FIELD_LABELS = ARTWORK_FIELD_OPTIONS.map((option) => option.label);
// 서버가 제작 연도를 1000 이상으로 받는다
const MIN_PRODUCTION_YEAR = 1000;

export function sanitizeArtworkYearInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

export const artworkRegisterSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: '작품명을 입력해주세요.' })
    .max(MAX_ARTWORK_TITLE_LENGTH, {
      message: `작품명은 ${MAX_ARTWORK_TITLE_LENGTH}자까지 입력할 수 있어요.`,
    }),
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
    .regex(/^\d{4}$/, { message: '제작 연도는 4자리 숫자로 입력해주세요.' })
    .refine((value) => Number(value) >= MIN_PRODUCTION_YEAR, {
      message: '제작 연도를 확인해주세요.',
    }),
  material: z
    .string()
    .trim()
    .min(1, { message: '재료 / 매체를 입력해주세요.' })
    .max(MAX_ARTWORK_MATERIAL_LENGTH, {
      message: `재료 / 매체는 ${MAX_ARTWORK_MATERIAL_LENGTH}자까지 입력할 수 있어요.`,
    }),
  size: z
    .string()
    .trim()
    .max(MAX_ARTWORK_SIZE_LENGTH, {
      message: `규격은 ${MAX_ARTWORK_SIZE_LENGTH}자까지 입력할 수 있어요.`,
    }),
});

export type ArtworkRegisterValues = z.infer<typeof artworkRegisterSchema>;

export const EMPTY_ARTWORK_REGISTER_VALUES: ArtworkRegisterValues = {
  title: '',
  intro: '',
  fieldLabels: [],
  year: '',
  material: '',
  size: '',
};
