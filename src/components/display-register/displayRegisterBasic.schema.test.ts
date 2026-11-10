import { describe, expect, it } from 'vitest';

import { displayRegisterBasicSchema } from './displayRegisterBasic.schema';

const VALID = {
  startDate: '2026-11-20',
  endDate: '2026-11-26',
  startTime: '10:00',
  endTime: '18:00',
  placeName: '예술관 1층 전시실',
  address: '서울특별시 중구 예술로 12',
  latitude: 37.5,
  longitude: 127,
  instagram: '',
  website: '',
};

const issuePaths = (values: unknown) => {
  const result = displayRegisterBasicSchema.safeParse(values);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
};

describe('displayRegisterBasicSchema', () => {
  it('필수값을 채우고 링크를 비우면 통과한다', () => {
    expect(issuePaths(VALID)).toEqual([]);
  });

  it('장소명은 공백만으로 통과하지 않는다', () => {
    expect(issuePaths({ ...VALID, placeName: '   ' })).toContain('placeName');
  });

  it('주소를 검색하지 않으면 좌표가 없어 통과하지 않는다', () => {
    expect(issuePaths({ ...VALID, latitude: undefined, longitude: undefined })).toEqual(
      expect.arrayContaining(['latitude', 'longitude']),
    );
  });

  it('하루 전시는 통과, 종료일이 시작일보다 빠르면 실패', () => {
    expect(issuePaths({ ...VALID, endDate: '2026-11-20' })).toEqual([]);
    expect(issuePaths({ ...VALID, endDate: '2026-11-19' })).toContain('endDate');
  });

  it('종료 시간이 시작 시간과 같거나 빠르면 실패', () => {
    expect(issuePaths({ ...VALID, endTime: '10:00' })).toContain('endTime');
  });

  it('링크 형식이 틀리면 실패', () => {
    expect(issuePaths({ ...VALID, instagram: 'display u' })).toContain('instagram');
    expect(issuePaths({ ...VALID, website: 'displayu' })).toContain('website');
    expect(issuePaths({ ...VALID, instagram: '@displayu', website: 'displayu.kr' })).toEqual([]);
  });
});
