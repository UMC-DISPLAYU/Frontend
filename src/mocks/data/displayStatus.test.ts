import { describe, expect, it } from 'vitest';

import { displayStatusOn } from './displayStatus';

describe('displayStatusOn', () => {
  const start = '2026-11-20';
  const end = '2026-11-27';

  it('시작일 전날은 전시 예정이다', () => {
    expect(displayStatusOn(start, end, '2026-11-19')).toBe('UPCOMING');
  });

  it('시작일 당일부터 전시 중이다', () => {
    expect(displayStatusOn(start, end, '2026-11-20')).toBe('DISPLAYING');
  });

  it('종료일 당일은 아직 전시 중이다', () => {
    expect(displayStatusOn(start, end, '2026-11-27')).toBe('DISPLAYING');
  });

  it('종료일 다음 날부터 전시 종료다', () => {
    expect(displayStatusOn(start, end, '2026-11-28')).toBe('ENDED');
  });

  it('하루짜리 전시는 그날만 전시 중이다', () => {
    expect(displayStatusOn(start, start, '2026-11-20')).toBe('DISPLAYING');
    expect(displayStatusOn(start, start, '2026-11-21')).toBe('ENDED');
  });

  it('시각이 붙은 날짜도 날짜만 비교한다', () => {
    expect(displayStatusOn('2026-11-20T10:00:00', '2026-11-27T18:00:00', '2026-11-27')).toBe(
      'DISPLAYING',
    );
  });
});
