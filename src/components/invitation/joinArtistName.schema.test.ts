import { expect, it } from 'vitest';

import { JOIN_ARTIST_NAME_MAX_LENGTH, joinArtistNameSchema } from './joinArtistName.schema';

const parse = (artistName: string) => joinArtistNameSchema.safeParse({ artistName });

it('빈 칸으로 시작하면 통과하지 않는다(참여 완료 버튼이 꺼진다)', () => {
  expect(parse('').success).toBe(false);
});

it('공백만 있으면 통과하지 않는다', () => {
  expect(parse('   ').success).toBe(false);
});

it('한 글자부터 통과하고 앞뒤 공백을 지운 값을 보낸다', () => {
  expect(parse('김').data).toEqual({ artistName: '김' });
  expect(parse('  김디유 ').data).toEqual({ artistName: '김디유' });
});

it('프로토타입 입력 제한(20자)까지만 통과한다', () => {
  expect(JOIN_ARTIST_NAME_MAX_LENGTH).toBe(20);
  expect(parse('가'.repeat(20)).success).toBe(true);
  expect(parse('가'.repeat(21)).success).toBe(false);
  expect(parse(` ${'가'.repeat(20)} `).success).toBe(true);
});
