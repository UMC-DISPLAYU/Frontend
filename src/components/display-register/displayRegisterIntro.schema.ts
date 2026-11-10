import { z } from 'zod';

import { EXHIBITION_TYPE_LABELS } from '@/constants/exhibition';

import { MAX_DISPLAY_FIELDS } from './displayRegister.constants';

export const displayRegisterIntroSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: '전시명을 입력해주세요.' })
    .max(60, { message: '전시명은 60자 이하로 입력해주세요.' }),
  intro: z.string().trim().max(1500, { message: '전시 소개는 1500자 이하로 입력해주세요.' }),
  type: z.enum(EXHIBITION_TYPE_LABELS, { message: '전시 유형을 선택해주세요.' }),
  fieldLabels: z
    .array(z.string())
    .min(1, { message: '전시 분야를 최소 1개 이상 선택해주세요.' })
    .max(MAX_DISPLAY_FIELDS, { message: '전시 분야는 최대 3개까지 선택할 수 있어요.' }),
  department: z
    .string()
    .trim()
    .min(1, { message: '소속 정보를 입력해주세요.' })
    .max(40, { message: '소속 정보는 40자 이하로 입력해주세요.' }),
});

export type DisplayRegisterIntroValues = z.infer<typeof displayRegisterIntroSchema>;
