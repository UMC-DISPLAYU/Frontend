import { useQuery } from '@tanstack/react-query';

import { getMyDisplays } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import type { ExhibitionItem } from '@/types/mypage';

const formatDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return year && month && day ? `${year}.${month}.${day}` : date;
};

const STATUS_LABEL: Record<string, string> = {
  DISPLAYING: '전시 중',
  UPCOMING: '전시 예정',
  ENDED: '전시 종료',
};

// 가짜 API 연동: 백엔드 내 전시 관리 API가 확정되기 전까지 GET /v1/display/me 응답을 화면 카드 타입으로 변환합니다.
export const useMyDisplays = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery<ExhibitionItem[]>({
    queryKey: [...queryKeys.displays.lists(), 'my'],
    enabled,
    queryFn: async () => {
      const data = await getMyDisplays();
      /* 응답이 생성/참여를 나눠 주므로 전시 상세를 따로 조회하지 않고 소유 여부를 판단합니다. */
      const displays = [
        ...data.createdDisplays.map((display) => ({ display, isOwner: true })),
        ...data.participatedDisplays.map((display) => ({ display, isOwner: false })),
      ];

      return displays.map(({ display, isOwner }) => ({
        id: String(display.displayId),
        displayId: display.displayId,
        isOwner,
        status: STATUS_LABEL[display.displayStatus] ?? display.displayStatus,
        title: display.title,
        org: isOwner ? '대표자' : '팀원',
        period: `${formatDate(display.startDate)} – ${formatDate(display.endDate)}`,
        place: display.placeName,
        thumbnail: display.postImageUrl,
      }));
    },
  });
