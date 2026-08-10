import { z } from 'zod';

// 1. 개별 규칙 검증용 Zod 스키마
export const alphaNumericKoSchema = z.string().regex(/^[가-힣a-zA-Z0-9]*$/);
export const nicknameLengthSchema = z.string().min(2).max(15);
export const noSpecialCharSchema = z.string().regex(/^[^~`@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/!]*$/);
export const noSpaceSchema = z.string().regex(/^\S*$/);

// 2. 통합 폼 유효성 검증용 Zod 스키마
export const onboardingNicknameSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, { message: '닉네임은 최소 2자 이상 입력해주세요.' })
    .max(15, { message: '닉네임은 최대 15자 이하로 입력해주세요.' })
    .regex(/^[가-힣a-zA-Z0-9]+$/, {
      message: '한글, 영문, 숫자만 사용할 수 있습니다. (특수문자/공백 불가)',
    }),
});

export type OnboardingNicknameFormValues = z.infer<typeof onboardingNicknameSchema>;
