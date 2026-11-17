import { z } from 'zod';

import { DISPLAY_ARTIST_NAME_MAX_LENGTH } from '@/constants/exhibition';

/* 프로토타입 입력창은 20자지만, 전시 작가명은 어디서 정하든 10자 미만으로 맞춘다(PM 확인) */
export const JOIN_ARTIST_NAME_MAX_LENGTH = DISPLAY_ARTIST_NAME_MAX_LENGTH;

export const joinArtistNameSchema = z.object({
  artistName: z
    .string()
    .trim()
    .min(1, { message: '전시 작가명을 입력해주세요.' })
    .max(JOIN_ARTIST_NAME_MAX_LENGTH, {
      message: `전시 작가명은 ${JOIN_ARTIST_NAME_MAX_LENGTH}자 이하로 입력해주세요.`,
    }),
});

export type JoinArtistNameValues = z.infer<typeof joinArtistNameSchema>;
