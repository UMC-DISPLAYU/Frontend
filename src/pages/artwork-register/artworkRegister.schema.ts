import { z } from 'zod';

import { ARTWORK_FIELD_MAP } from '@/constants';

export const ARTWORK_REGISTER_AUTHOR_NAME_MAX_LENGTH = 255;

export function sanitizeArtworkRegisterYearInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

export function toArtworkRegisterProductionYear(value: string): number {
  return Number(value);
}

function isArtworkRegisterYearValid(value: string): boolean {
  if (!/^\d{4}$/.test(value)) return false;

  const year = Number(value);
  return year >= 1000 && year < 9999;
}

const artworkFieldSchema = z.enum(Object.keys(ARTWORK_FIELD_MAP) as [string, ...string[]], {
  message: '작품분야를 선택해주세요.',
});

export const artworkRegisterSchema = z.object({
  artworkImageCount: z.number().min(1, { message: '작품 이미지를 1개 이상 업로드해주세요.' }),
  title: z.string().trim().min(1, { message: '작품명을 입력해주세요.' }),
  intro: z.string().trim().optional(),
  field: artworkFieldSchema,
  year: z.string().refine(isArtworkRegisterYearValid, {
    message: '제작연도는 4자리 숫자로 입력해주세요.',
  }),
  material: z.string().trim().min(1, { message: '재료/매체를 입력해주세요.' }),
  size: z.string().trim().optional(),
  thoughts: z.string().trim().optional(),
});

export const artworkRegisterSubmitSchema = artworkRegisterSchema.extend({
  artistName: z.string().trim().min(1, { message: '작가명을 입력해주세요.' }),
  qaHandlerUserIds: z.array(z.number()).min(1, { message: 'Q&A 담당자를 선택해주세요.' }),
});

export type ArtworkRegisterFormValues = z.infer<typeof artworkRegisterSchema>;
