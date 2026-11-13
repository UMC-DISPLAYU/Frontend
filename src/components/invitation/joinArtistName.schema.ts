import { z } from 'zod';

/** 프로토타입 입력창 maxlength 와 같다 */
export const JOIN_ARTIST_NAME_MAX_LENGTH = 20;

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
