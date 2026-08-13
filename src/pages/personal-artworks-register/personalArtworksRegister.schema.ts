import { z } from 'zod';

import { ARTWORK_FIELD_MAP } from '@/constants';

export function sanitizePersonalArtworkYearInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

export function toPersonalArtworkProductionYear(value: string): number {
  return Number(value);
}

function isPersonalArtworkYearValid(value: string): boolean {
  if (!/^\d{4}$/.test(value)) return false;

  const year = Number(value);
  return year >= 1000 && year < 9999;
}

export const personalArtworkRegisterSchema = z.object({
  artworkImageCount: z.number().min(1, { message: '작품 이미지를 1개 이상 업로드해주세요.' }),
  title: z.string().trim().min(1, { message: '작품명을 입력해주세요.' }),
  intro: z.string().trim().optional(),
  field: z.enum(Object.keys(ARTWORK_FIELD_MAP) as [string, ...string[]], {
    message: '작품분야를 선택해주세요.',
  }),
  year: z.string().refine(isPersonalArtworkYearValid, {
    message: '제작연도는 4자리 숫자로 입력해주세요.',
  }),
  material: z.string().trim().min(1, { message: '재료/매체를 입력해주세요.' }),
  size: z.string().trim().optional(),
  thoughts: z.string().trim().optional(),
});

export type PersonalArtworkRegisterFormValues = z.infer<typeof personalArtworkRegisterSchema>;
