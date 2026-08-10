import { z } from 'zod';

export const editArtistProfileSchema = z.object({
  artistName: z
    .string()
    .trim()
    .min(2, { message: '프로필명은 최소 2자 이상 입력해주세요.' })
    .max(15, { message: '프로필명은 최대 15자 이하로 입력해주세요.' }),
  introduction: z
    .string()
    .trim()
    .max(100, { message: '소개글은 최대 100자 이하로 작성해주세요.' })
    .optional(),
  fields: z
    .array(z.string())
    .min(1, { message: '최소 1개 이상의 전시 분야를 선택해야 합니다.' })
    .max(3, { message: '분야는 최대 3개까지만 선택할 수 있습니다.' }),
  externalLink: z.string().trim().optional(),
  univName: z.string().trim().optional(),
});

export type EditArtistProfileFormValues = z.infer<typeof editArtistProfileSchema>;
