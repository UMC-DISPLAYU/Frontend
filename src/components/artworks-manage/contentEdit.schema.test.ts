import { expect, it } from 'vitest';

import { contentEditSchema } from './contentEdit.schema';

it('기존 섹션 제목·설명의 공백 정리와 필수 제목 규칙을 유지한다', () => {
  expect(contentEditSchema.parse({ title: ' 섹션 ', description: ' 설명 ' })).toEqual({
    title: '섹션',
    description: '설명',
  });
  expect(contentEditSchema.safeParse({ title: '   ', description: '' }).success).toBe(false);
});

it('디자인 표시 길이와 별개로 기존 설명 255자 제한을 유지한다', () => {
  expect(
    contentEditSchema.safeParse({ title: '섹션', description: '가'.repeat(255) }).success,
  ).toBe(true);
  expect(
    contentEditSchema.safeParse({ title: '섹션', description: '가'.repeat(256) }).success,
  ).toBe(false);
});
