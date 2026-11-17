import { z } from 'zod';

import { DISPLAY_ARTIST_NAME_MAX_LENGTH } from '@/constants/exhibition';

export const displayArtistNameSchema = z.object({
  artistName: z
    .string()
    .trim()
    .min(1, { message: '작가명을 입력해주세요.' })
    .max(DISPLAY_ARTIST_NAME_MAX_LENGTH, {
      message: `작가명은 ${DISPLAY_ARTIST_NAME_MAX_LENGTH}자 이하로 입력해주세요.`,
    }),
});

export type DisplayArtistNameValues = z.infer<typeof displayArtistNameSchema>;
