import { describe, expect, it } from 'vitest';

import {
  formatDistance,
  getDaysUntilOpen,
  getDistanceMeters,
  getMapExhibitionStatus,
  getMapStatusLabel,
  matchesMapQuery,
} from './mapExhibition';

const NOW = new Date(2026, 10, 7, 15, 30);

describe('getMapExhibitionStatus', () => {
  it('시작일 당일과 종료일 당일은 전시 중이다', () => {
    expect(getMapExhibitionStatus({ startDate: '2026-11-07', endDate: '2026-11-20' }, NOW)).toBe(
      'live',
    );
    expect(getMapExhibitionStatus({ startDate: '2026-11-01', endDate: '2026-11-07' }, NOW)).toBe(
      'live',
    );
  });

  it('시작 전이면 전시 예정, 종료일이 지나면 종료다', () => {
    expect(getMapExhibitionStatus({ startDate: '2026-11-08', endDate: '2026-11-20' }, NOW)).toBe(
      'soon',
    );
    expect(getMapExhibitionStatus({ startDate: '2026-10-01', endDate: '2026-11-06' }, NOW)).toBe(
      'ended',
    );
  });
});

describe('getMapStatusLabel', () => {
  it('전시 예정은 열리기까지 남은 날을 붙인다', () => {
    expect(getMapStatusLabel({ startDate: '2026-11-10', endDate: '2026-11-20' }, NOW)).toBe(
      '전시 예정 · D-3',
    );
    expect(getMapStatusLabel({ startDate: '2026-11-01', endDate: '2026-11-20' }, NOW)).toBe(
      '전시 중',
    );
  });

  it('남은 날은 음수가 되지 않는다', () => {
    expect(getDaysUntilOpen('2026-11-01', NOW)).toBe(0);
  });
});

describe('matchesMapQuery', () => {
  const exhibition = {
    title: '봄의 기록',
    schoolDepartmentName: '한결대학교 시각디자인과',
    locationName: '예술로 갤러리',
  };

  it('공백과 대소문자를 무시하고 제목·학교·장소에서 찾는다', () => {
    expect(matchesMapQuery(exhibition, '봄의기록')).toBe(true);
    expect(matchesMapQuery(exhibition, '한결 대학교')).toBe(true);
    expect(matchesMapQuery(exhibition, '갤러리')).toBe(true);
    expect(matchesMapQuery(exhibition, '가온')).toBe(false);
  });

  it('검색어가 비어 있으면 모두 통과한다', () => {
    expect(matchesMapQuery(exhibition, '   ')).toBe(true);
  });
});

describe('formatDistance', () => {
  it('1km 미만은 10m 단위, 최소 10m로 보여준다', () => {
    expect(formatDistance(3)).toBe('10m');
    expect(formatDistance(234)).toBe('230m');
    expect(formatDistance(994)).toBe('990m');
    expect(formatDistance(995)).toBe('1.0km');
  });

  it('1km 이상은 소수 한 자리 km로 보여준다', () => {
    expect(formatDistance(1000)).toBe('1.0km');
    expect(formatDistance(12_345)).toBe('12.3km');
  });
});

describe('getDistanceMeters', () => {
  it('같은 지점은 0m, 위도 0.01도는 약 1.1km다', () => {
    const origin = { lat: 37.5665, lng: 126.978 };
    expect(getDistanceMeters(origin, origin)).toBe(0);
    expect(getDistanceMeters(origin, { lat: 37.5765, lng: 126.978 })).toBeCloseTo(1112, -1);
  });
});
