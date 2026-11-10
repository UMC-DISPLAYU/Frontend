import { describe, expect, it } from 'vitest';

import { displayRegisterIntroSchema } from './displayRegisterIntro.schema';

const valid = {
  title: '모두의 삶',
  intro: '',
  type: '졸업 전시',
  fieldLabels: ['그래픽'],
  department: '시각디자인학과',
};

describe('displayRegisterIntroSchema', () => {
  it('필수값이 있으면 통과한다', () => {
    expect(displayRegisterIntroSchema.safeParse(valid).success).toBe(true);
  });

  it('전시명이 공백뿐이면 실패한다', () => {
    expect(displayRegisterIntroSchema.safeParse({ ...valid, title: '   ' }).success).toBe(false);
  });

  it('전시명은 60자까지 허용한다', () => {
    expect(displayRegisterIntroSchema.safeParse({ ...valid, title: '가'.repeat(60) }).success).toBe(
      true,
    );
    expect(displayRegisterIntroSchema.safeParse({ ...valid, title: '가'.repeat(61) }).success).toBe(
      false,
    );
  });

  it('전시 소개는 1500자까지 허용한다', () => {
    expect(
      displayRegisterIntroSchema.safeParse({ ...valid, intro: '가'.repeat(1500) }).success,
    ).toBe(true);
    expect(
      displayRegisterIntroSchema.safeParse({ ...valid, intro: '가'.repeat(1501) }).success,
    ).toBe(false);
  });

  it('전시 유형을 고르지 않으면 실패한다', () => {
    expect(displayRegisterIntroSchema.safeParse({ ...valid, type: '' }).success).toBe(false);
  });

  it('전시 분야는 1개 이상 3개 이하만 허용한다', () => {
    expect(displayRegisterIntroSchema.safeParse({ ...valid, fieldLabels: [] }).success).toBe(false);
    expect(
      displayRegisterIntroSchema.safeParse({
        ...valid,
        fieldLabels: ['회화', '조소', '사진'],
      }).success,
    ).toBe(true);
    expect(
      displayRegisterIntroSchema.safeParse({
        ...valid,
        fieldLabels: ['회화', '조소', '사진', '공예'],
      }).success,
    ).toBe(false);
  });

  it('소속 정보는 비울 수 없고 40자까지 허용한다', () => {
    expect(displayRegisterIntroSchema.safeParse({ ...valid, department: ' ' }).success).toBe(false);
    expect(
      displayRegisterIntroSchema.safeParse({ ...valid, department: '가'.repeat(40) }).success,
    ).toBe(true);
    expect(
      displayRegisterIntroSchema.safeParse({ ...valid, department: '가'.repeat(41) }).success,
    ).toBe(false);
  });
});
