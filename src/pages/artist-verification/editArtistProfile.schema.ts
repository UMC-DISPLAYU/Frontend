import { z } from 'zod';

import { type ExhibitionField, MAX_ARTIST_FIELDS } from '@/constants/exhibition';
import { parseInstagramId, parseWebsiteUrl } from '@/utils/linkInput';

export const ARTIST_INTRO_MAX = 100;

export const editArtistProfileSchema = z.object({
  artistName: z
    .string()
    .trim()
    .min(2, { message: '2자 이상 입력해주세요' })
    .max(15, { message: '15자 이하로 입력해주세요' })
    .regex(/^[가-힣a-zA-Z0-9]+$/, { message: '한글, 영문, 숫자만 쓸 수 있어요' }),
  fields: z
    .array(z.custom<ExhibitionField>())
    .min(1, { message: '작가 분야를 1개 이상 골라주세요' })
    .max(MAX_ARTIST_FIELDS, { message: `분야는 최대 ${MAX_ARTIST_FIELDS}개까지 선택할 수 있어요` }),
  introduction: z.string().max(ARTIST_INTRO_MAX, {
    message: `소개는 ${ARTIST_INTRO_MAX}자 이하로 적어주세요`,
  }),
  instagram: z.string().refine((value) => parseInstagramId(value).status !== 'invalid', {
    message: '아이디 형식을 확인해 주세요 (영문·숫자·밑줄·마침표)',
  }),
  portfolio: z.string().refine((value) => parseWebsiteUrl(value).status !== 'invalid', {
    message: '주소 형식을 확인해 주세요 (예: displayu.kr)',
  }),
});

export type EditArtistProfileFormValues = z.infer<typeof editArtistProfileSchema>;
