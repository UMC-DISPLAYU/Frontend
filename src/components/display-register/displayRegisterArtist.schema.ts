import { z } from 'zod';

export const MAX_ARTIST_NAME_LENGTH = 20;

export const displayRegisterArtistSchema = z.object({
  artistName: z
    .string()
    .trim()
    .min(1, '작가명을 입력해주세요')
    .max(MAX_ARTIST_NAME_LENGTH, `작가명은 ${MAX_ARTIST_NAME_LENGTH}자 이하로 입력해주세요`),
});

export type DisplayRegisterArtistValues = z.infer<typeof displayRegisterArtistSchema>;
