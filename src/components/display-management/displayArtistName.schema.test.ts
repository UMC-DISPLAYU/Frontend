import { expect, it } from 'vitest';

import { displayArtistNameSchema } from './displayArtistName.schema';

const parse = (artistName: string) => displayArtistNameSchema.safeParse({ artistName });

it('앞뒤 공백을 지운 값으로 통과한다', () => {
  expect(parse('  김디유 ').data).toEqual({ artistName: '김디유' });
});

it('공백만 있으면 통과하지 않는다', () => {
  expect(parse('   ').success).toBe(false);
});

it('255자까지만 통과한다', () => {
  expect(parse('가'.repeat(255)).success).toBe(true);
  expect(parse('가'.repeat(256)).success).toBe(false);
});
