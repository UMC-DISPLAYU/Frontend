import { z } from 'zod';

export const NICKNAME_MAX = 15;

// 먼저 걸린 규칙의 문구가 보이도록 공백 → 문자 종류 → 길이 순서로 검사한다
export const editBasicInfoSchema = z.object({
  nickname: z
    .string()
    .regex(/^\S*$/, { message: '공백은 쓸 수 없어요' })
    .regex(/^[가-힣a-zA-Z0-9]*$/, { message: '한글, 영문, 숫자만 쓸 수 있어요' })
    .min(2, { message: '2자 이상 입력해주세요' })
    .max(NICKNAME_MAX, { message: `${NICKNAME_MAX}자 이하로 입력해주세요` }),
});

export type EditBasicInfoFormValues = z.infer<typeof editBasicInfoSchema>;
