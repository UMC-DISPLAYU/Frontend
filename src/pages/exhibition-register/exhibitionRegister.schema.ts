import { z } from 'zod';

import { EXHIBITION_FIELDS, EXHIBITION_TYPE_LABELS } from '@/constants/exhibition';

export const exhibitionRegisterSchema = z
  .object({
    imageUrls: z
      .array(z.string())
      .min(1, { message: '전시 포스터 이미지를 최소 1장 이상 등록해주세요.' }),

    title: z.string().trim().min(1, { message: '전시명을 입력해주세요.' }),

    subtitle: z
      .string()
      .trim()
      .max(100, { message: '부제목은 100자 이하로 입력해주세요.' })
      .optional()
      .or(z.literal('')),

    intro: z
      .string()
      .trim()
      .max(1500, { message: '전시소개는 1500자 이하로 입력해주세요.' })
      .optional()
      .or(z.literal('')),

    type: z
      .string({ required_error: '전시 유형을 선택해주세요.' })
      .nullable()
      .refine((val) => val !== null && EXHIBITION_TYPE_LABELS.includes(val), {
        message: '전시 유형을 선택해주세요.',
      }),

    field: z
      .array(z.enum(EXHIBITION_FIELDS as unknown as [string, ...string[]]))
      .min(1, { message: '전시분야를 최소 1개 이상 선택해주세요.' }),

    school: z.string().trim().optional(),
    department: z.string().trim().optional(),
    organizer: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      const isInstitution =
        data.type === '졸업 전시' ||
        data.type === '과제 전시' ||
        data.type === '학과·학회 전시' ||
        data.type === '연합 전시';

      if (isInstitution) {
        return !!data.department && data.department.trim() !== '';
      }

      const isOrganization = data.type === '소모임·동아리 전시' || data.type === '기타 단체 전시';

      if (isOrganization) {
        return !!data.organizer && data.organizer.trim() !== '';
      }

      return true;
    },
    {
      message: '소속 정보를 입력해주세요.',
      path: ['department'],
    },
  );

export type ExhibitionRegisterFormValues = z.infer<typeof exhibitionRegisterSchema>;
