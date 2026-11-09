import { describe, expect, it } from 'vitest';

import { isPreviewDisplay } from './isPreviewDisplay';

const period = {
  startDate: '2026-11-11',
  endDate: '2026-11-13',
  startTime: '09:00:00',
  endTime: '18:00:00',
};
const at = (value: string) => new Date(value).getTime();

describe('isPreviewDisplay', () => {
  it('공개된 전시는 개막 시각 전까지만 공개 전으로 본다', () => {
    expect(isPreviewDisplay({ status: 'PUBLISHED', period }, at('2026-11-11T08:59:59'))).toBe(true);
    expect(isPreviewDisplay({ status: 'PUBLISHED', period }, at('2026-11-11T09:00:00'))).toBe(
      false,
    );
    expect(isPreviewDisplay({ status: 'PUBLISHED', period }, at('2026-11-14T00:00:00'))).toBe(
      false,
    );
  });

  it('등록 중 전시는 기간과 상관없이 공개 전이다', () => {
    expect(isPreviewDisplay({ status: 'DRAFT', period }, at('2026-11-12T12:00:00'))).toBe(true);
  });

  it('기간을 모르는 공개 전시는 공개 전으로 보지 않는다', () => {
    expect(isPreviewDisplay({ status: 'PUBLISHED', period: { ...period, startDate: '' } }, 0)).toBe(
      false,
    );
  });
});
