import { z } from 'zod';

import { EXHIBITION_FIELDS, EXHIBITION_TYPE_LABELS } from '@/constants/exhibition';

// 1. 전시 기본 정보 입력 스키마 (첫 페이지: ExhibitionRegister)
export const exhibitionRegisterSchema = z
  .object({
    imageUrls: z
      .array(z.string())
      .min(1, { message: '전시 포스터 이미지를 최소 1장 이상 등록해주세요.' }),

    title: z.string().trim().min(1, { message: '전시명을 입력해주세요.' }),

    subtitle: z
      .string()
      .trim()
      .max(100, { message: '부제목은 100자 이하로 입력해주세요.' })
      .optional()
      .or(z.literal('')),

    intro: z
      .string()
      .trim()
      .max(1500, { message: '전시소개는 1500자 이하로 입력해주세요.' })
      .optional()
      .or(z.literal('')),

    type: z
      .string()
      .nullable()
      .refine(
        (val) => val !== null && (EXHIBITION_TYPE_LABELS as readonly string[]).includes(val),
        {
          message: '전시 유형을 선택해주세요.',
        },
      ),

    field: z
      .array(z.enum(EXHIBITION_FIELDS as unknown as [string, ...string[]]))
      .min(1, { message: '전시분야를 최소 1개 이상 선택해주세요.' }),

    school: z.string().trim().optional(),
    department: z.string().trim().optional(),
    organizer: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const isInstitution =
      data.type === '졸업 전시' ||
      data.type === '과제 전시' ||
      data.type === '학과·학회 전시' ||
      data.type === '연합 전시';

    if (isInstitution && (!data.department || data.department.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['department'],
        message: '학과를 입력해주세요.',
      });
    }

    const isOrganization = data.type === '소모임·동아리 전시' || data.type === '기타 단체 전시';

    if (isOrganization && (!data.organizer || data.organizer.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['organizer'],
        message: '단체명을 입력해주세요.',
      });
    }
  });

export type ExhibitionRegisterFormValues = z.infer<typeof exhibitionRegisterSchema>;

// 2. 전시 기본 정보 추가 입력 스키마 (두 번째 페이지: ExhibitionBasicInfo)
export const exhibitionBasicInfoSchema = z.object({
  // 전시 기간 (시작일, 종료일 필수)
  startDate: z.string().min(1, { message: '전시 시작일을 입력해주세요.' }),
  endDate: z.string().min(1, { message: '전시 종료일을 입력해주세요.' }),

  // 운영 시간 (오픈 시간, 마감 시간 필수)
  startTime: z.string().min(1, { message: '운영 시작 시간을 입력해주세요.' }),
  endTime: z.string().min(1, { message: '운영 종료 시간을 입력해주세요.' }),

  // 전시 장소 정보
  placeName: z.string().trim().min(1, { message: '장소명을 입력해주세요.' }),
  address: z.string().trim().min(1, { message: '상세 주소를 입력해주세요.' }),
  latitude: z.number({ message: '위도를 선택해주세요.' }),
  longitude: z.number({ message: '경도를 선택해주세요.' }),

  // 문의 계정 (Q&A 계정)
  contact: z.string().trim().min(1, { message: '문의처를 입력해주세요.' }),

  // 유의 사항 (선택)
  notice: z.string().trim().optional().or(z.literal('')),
});

export type ExhibitionBasicInfoFormValues = z.infer<typeof exhibitionBasicInfoSchema>;

// 3. 전시 작가명 설정 스키마 (세 번째 페이지: ArtistNameSetup)
export const artistNameSetupSchema = z.object({
  artistName: z
    .string()
    .trim()
    .min(1, { message: '작가명을 입력해주세요.' })
    .max(50, { message: '작가명은 50자 이하로 입력해주세요.' }),
});

export type ArtistNameSetupFormValues = z.infer<typeof artistNameSetupSchema>;
