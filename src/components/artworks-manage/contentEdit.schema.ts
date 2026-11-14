import { z } from 'zod';

import { SECTION_DESCRIPTION_MAX_LENGTH, SECTION_TITLE_MAX_LENGTH } from './constants';

export const contentEditSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '섹션 제목을 입력해주세요.')
    .max(
      SECTION_TITLE_MAX_LENGTH,
      `섹션 제목은 ${SECTION_TITLE_MAX_LENGTH}자 이내로 입력해주세요.`,
    ),
  description: z
    .string()
    .trim()
    .max(
      SECTION_DESCRIPTION_MAX_LENGTH,
      `섹션 설명은 ${SECTION_DESCRIPTION_MAX_LENGTH}자 이내로 입력해주세요.`,
    ),
});

export type ContentEditValues = z.infer<typeof contentEditSchema>;

// 섹션 편집은 예전 규칙(설명 255자)으로 저장된 글도 다시 저장할 수 있어야 해서 길이는 입력칸 maxLength 로만 막는다
export const sectionEditSchema = z.object({
  title: z.string().trim().min(1, '섹션 제목을 입력해주세요.'),
  description: z.string().trim(),
});
