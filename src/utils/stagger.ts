import type { CSSProperties } from 'react';

/** 이 순번 뒤의 아이템은 같은 지연으로 함께 뜬다. 긴 목록의 끝이 한참 늦게 뜨지 않게 하는 상한 */
export const STAGGER_MAX_STEPS = 10;

interface StaggerOptions {
  /** 무한 스크롤로 뒤에 붙은 묶음의 첫 인덱스. 이 아이템부터 0번으로 센다 */
  startIndex?: number;
  maxSteps?: number;
}

export function getStaggerStep(
  index: number,
  { startIndex = 0, maxSteps = STAGGER_MAX_STEPS }: StaggerOptions = {},
) {
  const step = Math.floor(index - startIndex);

  if (!Number.isFinite(step) || step <= 0) return 0;

  return Math.min(step, Math.max(0, Math.floor(maxSteps)));
}

/** 목록 아이템에 `animate-rise` 와 함께 쓴다. 예: `<li className="animate-rise" style={staggerStyle(i)}>` */
export function staggerStyle(index: number, options?: StaggerOptions): CSSProperties {
  return {
    animationDelay: `calc(var(--semantic-motion-stagger) * ${getStaggerStep(index, options)})`,
  };
}
