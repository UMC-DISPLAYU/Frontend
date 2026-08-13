import { z } from 'zod';

import { ARTWORK_FIELD_MAP } from '@/constants';
import { isProductionYearValid } from '@/utils/date';

export const personalArtworkRegisterSchema = z.object({
  artworkImageCount: z.number().min(1, { message: '작품 이미지를 1개 이상 업로드해주세요.' }),
  title: z.string().trim().min(1, { message: '작품명을 입력해주세요.' }),
  intro: z.string().trim().optional(),
  field: z.enum(Object.keys(ARTWORK_FIELD_MAP) as [string, ...string[]], {
    message: '작품분야를 선택해주세요.',
  }),
  year: z.string().refine(isProductionYearValid, {
    message: '제작연도는 1000 이상 9999 미만의 숫자로 입력해주세요.',
  }),
  material: z.string().trim().min(1, { message: '재료/매체를 입력해주세요.' }),
  size: z.string().trim().optional(),
  thoughts: z.string().trim().optional(),
});

export type PersonalArtworkRegisterFormValues = z.infer<typeof personalArtworkRegisterSchema>;
