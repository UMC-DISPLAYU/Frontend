import { z } from 'zod';

import { parseInstagramId, parseWebsiteUrl } from './displayLinks';
import { isValidTimeRange } from './displaySchedule';

export const MAX_PLACE_NAME_LENGTH = 60;

export const displayRegisterBasicSchema = z
  .object({
    startDate: z.string().min(1, '전시 기간을 선택해주세요'),
    endDate: z.string().min(1, '전시 기간을 선택해주세요'),
    startTime: z.string().min(1, '운영 시간을 선택해주세요'),
    endTime: z.string().min(1, '운영 시간을 선택해주세요'),
    placeName: z
      .string()
      .trim()
      .min(1, '장소명을 입력해주세요')
      .max(MAX_PLACE_NAME_LENGTH, `장소명은 ${MAX_PLACE_NAME_LENGTH}자 이하로 입력해주세요`),
    address: z.string().min(1, '주소를 검색해주세요'),
    latitude: z.number({ message: '주소를 검색해주세요' }),
    longitude: z.number({ message: '주소를 검색해주세요' }),
    instagram: z.string().refine((value) => parseInstagramId(value).status !== 'invalid', {
      message: '아이디 형식을 확인해 주세요 (영문·숫자·밑줄·마침표)',
    }),
    website: z.string().refine((value) => parseWebsiteUrl(value).status !== 'invalid', {
      message: '주소 형식을 확인해 주세요 (예: displayu.kr)',
    }),
  })
  .refine((values) => values.endDate >= values.startDate, {
    path: ['endDate'],
    message: '종료일은 시작일보다 빠를 수 없어요',
  })
  .refine((values) => isValidTimeRange(values.startTime, values.endTime), {
    path: ['endTime'],
    message: '종료 시간은 시작 시간보다 늦어야 해요',
  });

export type DisplayRegisterBasicValues = z.infer<typeof displayRegisterBasicSchema>;
