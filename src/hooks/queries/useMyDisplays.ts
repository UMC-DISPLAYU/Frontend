import { useQuery } from '@tanstack/react-query';

import { getMyDisplays } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import type { ExhibitionItem } from '@/types/mypage';

const formatDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return year && month && day ? `${year}.${month}.${day}` : date;
};

// 가짜 API 연동: 백엔드 내 전시 관리 API가 확정되기 전까지 GET /v1/display/me 응답을 화면 카드 타입으로 변환합니다.
export const useMyDisplays = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery<ExhibitionItem[]>({
    queryKey: [...queryKeys.displays.lists(), 'my'],
    enabled,
    queryFn: async () => {
      const data = await getMyDisplays();

      const createdDisplays = data.createdDisplays.map((display) => ({
        id: String(display.displayId),
        displayId: display.displayId,
        status: display.isDisplaying ? '전시 중' : '전시 종료',
        title: display.title,
        org: '대표자',
        period: `${formatDate(display.startDate)} – ${formatDate(display.endDate)}`,
        place: display.placeName,
        thumbnail: display.postImageUrl,
      }));

      const participatedDisplays = data.participatedDisplays.map((display) => ({
        id: String(display.displayId),
        displayId: display.displayId,
        status: display.isDisplaying ? '전시 중' : '전시 종료',
        title: display.title,
        org: '팀원',
        period: `${formatDate(display.startDate)} – ${formatDate(display.endDate)}`,
        place: display.placeName,
        thumbnail: display.postImageUrl,
      }));

      return [...createdDisplays, ...participatedDisplays];
    },
  });
