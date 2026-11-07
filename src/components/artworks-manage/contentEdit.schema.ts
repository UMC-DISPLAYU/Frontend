import { z } from 'zod';

import { CONTENT_DESCRIPTION_MAX_LENGTH } from './constants';

export const contentEditSchema = z.object({
  title: z.string().trim().min(1, '섹션 제목을 입력해주세요.'),
  description: z
    .string()
    .trim()
    .max(
      CONTENT_DESCRIPTION_MAX_LENGTH,
      `섹션 설명은 ${CONTENT_DESCRIPTION_MAX_LENGTH}자 이내로 입력해주세요.`,
    ),
});

export type ContentEditValues = z.infer<typeof contentEditSchema>;
