import { z } from 'zod';

import { MAX_ARTIST_FIELDS } from '@/constants/exhibition';

export const editArtistProfileSchema = z.object({
  artistName: z
    .string()
    .trim()
    .min(2, { message: '프로필명은 최소 2자 이상 입력해주세요.' })
    .max(15, { message: '프로필명은 최대 15자 이하로 입력해주세요.' })
    .regex(/^[가-힣a-zA-Z0-9]+$/, {
      message: '한글, 영문, 숫자만 사용할 수 있습니다. (특수문자/공백 불가)',
    }),
  introduction: z
    .string()
    .trim()
    .max(100, { message: '소개글은 최대 100자 이하로 작성해주세요.' })
    .optional(),
  fields: z
    .array(z.string())
    .min(1, { message: '최소 1개 이상의 전시 분야를 선택해야 합니다.' })
    .max(MAX_ARTIST_FIELDS, {
      message: `분야는 최대 ${MAX_ARTIST_FIELDS}개까지만 선택할 수 있습니다.`,
    }),
  externalLink: z.string().trim().optional(),
  univName: z.string().trim().optional(),
});

export type EditArtistProfileFormValues = z.infer<typeof editArtistProfileSchema>;
