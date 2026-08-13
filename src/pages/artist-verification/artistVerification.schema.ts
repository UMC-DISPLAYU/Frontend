import { z } from 'zod';

export const artistVerificationSchema = z.object({
  artistName: z
    .string()
    .trim()
    .min(2, { message: '대표 작가 프로필명은 최소 2자 이상 입력해주세요.' })
    .max(15, { message: '대표 작가 프로필명은 최대 15자 이하로 입력해주세요.' })
    .regex(/^[가-힣a-zA-Z0-9]+$/, {
      message: '한글, 영문, 숫자만 사용할 수 있습니다. (특수문자/공백 불가)',
    }),
});

export type ArtistVerificationFormValues = z.infer<typeof artistVerificationSchema>;
