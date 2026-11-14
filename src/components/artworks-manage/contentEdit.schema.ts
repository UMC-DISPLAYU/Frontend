import { z } from 'zod';

import { SECTION_TITLE_MAX_LENGTH } from './constants';

// 섹션 설명은 프로토타입 11-15(U-151)에서 입력 · 표시 모두 없앴다
export const contentEditSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '섹션 제목을 입력해주세요.')
    .max(
      SECTION_TITLE_MAX_LENGTH,
      `섹션 제목은 ${SECTION_TITLE_MAX_LENGTH}자 이내로 입력해주세요.`,
    ),
});

export type ContentEditValues = z.infer<typeof contentEditSchema>;

// 섹션 편집은 예전 규칙으로 저장된 긴 제목도 다시 저장할 수 있어야 해서 길이는 입력칸 maxLength 로만 막는다
export const sectionEditSchema = z.object({
  title: z.string().trim().min(1, '섹션 제목을 입력해주세요.'),
});
