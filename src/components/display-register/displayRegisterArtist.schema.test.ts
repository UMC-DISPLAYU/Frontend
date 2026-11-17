import { expect, it } from 'vitest';

import { displayRegisterArtistSchema } from './displayRegisterArtist.schema';

const parse = (artistName: string) => displayRegisterArtistSchema.safeParse({ artistName });

it('전시 작가명은 10자 미만(9자)까지만 통과한다', () => {
  expect(parse('가'.repeat(9)).success).toBe(true);
  expect(parse('가'.repeat(10)).success).toBe(false);
});

it('공백만 있으면 통과하지 않는다', () => {
  expect(parse('   ').success).toBe(false);
});
