import { useQuery } from '@tanstack/react-query';

import type { ArtistDisplayDto } from '@/api/dto';
import { getArtistDisplays, getMyDisplays } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import type { ExhibitionItem } from '@/types/mypage';
import { getDisplayStatusLabel } from '@/utils/mypage';

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
      return [
        ...data.createdDisplays.map((display) => toExhibitionItem(display, true)),
        ...data.participatedDisplays.map((display) => toExhibitionItem(display, false)),
      ];
    },
  });

// GET /v1/display/artists/:userId - 다른 작가가 만들거나 참여한 발행 전시 목록 조회 (작가 프로필 전시 탭)
export const useArtistDisplays = (
  userId: number,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery<ExhibitionItem[]>({
    queryKey: [...queryKeys.displays.lists(), 'artist', userId],
    enabled: enabled && Number.isFinite(userId) && userId > 0,
    queryFn: async () => {
      const data = await getArtistDisplays(userId);
      return [
        ...data.createdDisplays.map((display) => toExhibitionItem(display, true)),
        ...data.participatedDisplays.map((display) => toExhibitionItem(display, false)),
      ];
    },
  });
