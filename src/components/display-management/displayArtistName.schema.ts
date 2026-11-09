import { z } from 'zod';

export const displayArtistNameSchema = z.object({
  artistName: z
    .string()
    .trim()
    .min(1, { message: '작가명을 입력해주세요.' })
    .max(255, { message: '작가명은 255자 이하로 입력해주세요.' }),
});

export type DisplayArtistNameValues = z.infer<typeof displayArtistNameSchema>;
