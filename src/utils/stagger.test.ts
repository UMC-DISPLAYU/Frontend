import { describe, expect, it } from 'vitest';

import { getStaggerStep, STAGGER_MAX_STEPS, staggerStyle } from './stagger';

describe('getStaggerStep', () => {
  it('인덱스만큼 순번을 준다', () => {
    expect(getStaggerStep(0)).toBe(0);
    expect(getStaggerStep(3)).toBe(3);
  });

  it('상한을 넘으면 상한에서 멈춘다', () => {
    expect(getStaggerStep(STAGGER_MAX_STEPS)).toBe(STAGGER_MAX_STEPS);
    expect(getStaggerStep(STAGGER_MAX_STEPS + 1)).toBe(STAGGER_MAX_STEPS);
    expect(getStaggerStep(500)).toBe(STAGGER_MAX_STEPS);
    expect(getStaggerStep(5, { maxSteps: 2 })).toBe(2);
  });

  it('무한 스크롤로 붙은 묶음은 startIndex 부터 0으로 센다', () => {
    expect(getStaggerStep(20, { startIndex: 20 })).toBe(0);
    expect(getStaggerStep(23, { startIndex: 20 })).toBe(3);
  });

  it('startIndex 앞(이미 있던 아이템)이나 잘못된 값은 0이다', () => {
    expect(getStaggerStep(5, { startIndex: 20 })).toBe(0);
    expect(getStaggerStep(-1)).toBe(0);
    expect(getStaggerStep(Number.NaN)).toBe(0);
    expect(getStaggerStep(3, { maxSteps: -1 })).toBe(0);
  });
});

describe('staggerStyle', () => {
  it('stagger 토큰에 순번을 곱한 animationDelay 를 만든다', () => {
    expect(staggerStyle(2)).toEqual({
      animationDelay: 'calc(var(--semantic-motion-stagger) * 2)',
    });
  });
});
