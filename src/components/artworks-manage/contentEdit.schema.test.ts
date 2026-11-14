import { expect, it } from 'vitest';

import { contentEditSchema, sectionEditSchema } from './contentEdit.schema';

it('섹션 제목은 공백을 정리하고 비어 있으면 받지 않는다', () => {
  expect(contentEditSchema.parse({ title: ' 섹션 ' })).toEqual({ title: '섹션' });
  expect(contentEditSchema.safeParse({ title: '   ' }).success).toBe(false);
});

it.each([
  ['제목 30자', '가'.repeat(30), true],
  ['제목 31자', '가'.repeat(31), false],
])('프로토타입 글자 수 제한: %s', (_, title, valid) => {
  expect(contentEditSchema.safeParse({ title }).success).toBe(valid);
});

it('섹션 설명은 받지 않는다(프로토타입 11-15 설명 삭제)', () => {
  expect(contentEditSchema.parse({ title: '섹션', description: '설명' })).toEqual({
    title: '섹션',
  });
});

it('섹션 편집은 예전 규칙으로 저장된 긴 제목도 다시 저장할 수 있다', () => {
  expect(sectionEditSchema.safeParse({ title: '가'.repeat(40) }).success).toBe(true);
  expect(sectionEditSchema.safeParse({ title: '  ' }).success).toBe(false);
});
