export type MockDisplayStatus = 'UPCOMING' | 'DISPLAYING' | 'ENDED';

/** 실서버처럼 날짜만 비교한다. 시작일 · 종료일 당일은 전시 중이다 */
export const displayStatusOn = (
  startDate: string,
  endDate: string,
  today: string,
): MockDisplayStatus => {
  if (today < startDate.slice(0, 10)) return 'UPCOMING';
  if (today > endDate.slice(0, 10)) return 'ENDED';
  return 'DISPLAYING';
};
