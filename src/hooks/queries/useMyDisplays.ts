import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ArtistDisplayDto, UpdateMyDisplayNicknameRequestDto } from '@/api/dto';
import {
  deleteDisplay,
  exitDisplay,
  getArtistDisplays,
  getMyDisplays,
  updateMyDisplayNickname,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import type { ExhibitionItem } from '@/types/mypage';
import { getDisplayStatusLabel } from '@/utils/mypage';

const formatDate = (date: string) => {
  const [, month, day] = date.split('-');
  return month && day ? `${month}.${day}` : date;
};

const toExhibitionItem = (display: ArtistDisplayDto, isOwner: boolean): ExhibitionItem => ({
  id: String(display.displayId),
  displayId: display.displayId,
  isOwner,
  isLeader: display.isLeader ?? isOwner,
  publishStatus: display.publishStatus ?? 'PUBLISHED',
  status: getDisplayStatusLabel(display.displayStatus),
  title: display.title,
  /* 학과·학회 등 소속 전시는 학교/기관명+세부소속을, 연합 전시는 주최/소속명만 저장하므로
   * department가 비어있으면 자연히 주최/소속명만 남습니다. */
  org: [display.school, display.department].filter(Boolean).join(' '),
  period: `${formatDate(display.startDate)} – ${formatDate(display.endDate)}`,
  place: display.placeName,
  thumbnail: display.postImageUrl,
  artistName: display.displayNickname ?? display.artistName,
});

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
export const useArtistDisplays = (userId: number, { enabled = true }: { enabled?: boolean } = {}) =>
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

export const useDeleteDisplay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (displayId: number) => deleteDisplay(displayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.displays.lists(), 'my'] });
    },
  });
};

export const useExitDisplay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (displayId: number) => exitDisplay(displayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.displays.lists(), 'my'] });
    },
  });
};

export const useUpdateMyDisplayNickname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateMyDisplayNicknameRequestDto) => updateMyDisplayNickname(body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.displays.lists(), 'my'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.displayMembers.byDisplayId(variables.displayId),
      });
    },
  });
};
