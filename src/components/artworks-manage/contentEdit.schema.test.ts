import { expect, it } from 'vitest';

import { contentEditSchema, sectionEditSchema } from './contentEdit.schema';

it('기존 섹션 제목·설명의 공백 정리와 필수 제목 규칙을 유지한다', () => {
  expect(contentEditSchema.parse({ title: ' 섹션 ', description: ' 설명 ' })).toEqual({
    title: '섹션',
    description: '설명',
  });
  expect(contentEditSchema.safeParse({ title: '   ', description: '' }).success).toBe(false);
});

it.each([
  ['제목 30자', { title: '가'.repeat(30), description: '' }, true],
  ['제목 31자', { title: '가'.repeat(31), description: '' }, false],
  ['설명 100자', { title: '섹션', description: '가'.repeat(100) }, true],
  ['설명 101자', { title: '섹션', description: '가'.repeat(101) }, false],
])('프로토타입 글자 수 제한: %s', (_, values, valid) => {
  expect(contentEditSchema.safeParse(values).success).toBe(valid);
});

it('섹션 편집은 예전 규칙으로 저장된 긴 제목 · 설명도 다시 저장할 수 있다', () => {
  expect(
    sectionEditSchema.safeParse({ title: '가'.repeat(40), description: '가'.repeat(255) }).success,
  ).toBe(true);
  expect(sectionEditSchema.safeParse({ title: '  ', description: '' }).success).toBe(false);
});
