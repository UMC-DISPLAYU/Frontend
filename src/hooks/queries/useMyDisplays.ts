import { useQuery } from '@tanstack/react-query';

import { getMyDisplays } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import type { ExhibitionItem } from '@/types/mypage';

const formatMonthDay = (date: string) => {
  const [, month, day] = date.split('-');
  return month && day ? `${month}.${day}` : date;
};

// 가짜 API 연동: 백엔드 내 전시 관리 API가 확정되기 전까지 GET /v1/display/me 응답을 화면 카드 타입으로 변환합니다.
export const useMyDisplays = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery<ExhibitionItem[]>({
    queryKey: [...queryKeys.displays.lists(), 'my'],
    enabled,
    queryFn: async () => {
      const data = await getMyDisplays();
      const displays = [...data.createdDisplays, ...data.participatedDisplays];

      return displays.map((display) => ({
        id: String(display.displayId),
        displayId: display.displayId,
        status: display.isDisplaying ? '전시 중' : '전시 종료',
        title: display.title,
        org: display.school || display.department,
        period: `${formatMonthDay(display.startDate)} - ${formatMonthDay(display.endDate)}`,
        place: display.placeName,
        thumbnail: display.postImageUrl,
      }));
    },
  });
