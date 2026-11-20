import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

import { invalidateArtworksOfDisplay } from './displayArtworkCache';
import { refetchForNextScreen } from './refetchForNextScreen';

const formatDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return year && month && day ? `${year}.${month}.${day}` : date;
};

const toExhibitionItem = (display: ArtistDisplayDto, isOwner: boolean): ExhibitionItem => ({
  id: String(display.displayId),
  displayId: display.displayId,
  isOwner,
  isLeader: display.isLeader ?? isOwner,
  role: display.role,
  publishStatus: display.publishStatus ?? 'PUBLISHED',
  status: getDisplayStatusLabel(display.displayStatus),
  title: display.title,
  /* 학과·학회 등 소속 전시는 학교/기관명+세부소속을, 연합 전시는 주최/소속명만 저장하므로
   * department가 비어있으면 자연히 주최/소속명만 남습니다. */
  org: [display.school, display.department].filter(Boolean).join(' '),
  period: `${formatDate(display.startDate)} – ${formatDate(display.endDate)}`,
  startDate: display.startDate,
  endDate: display.endDate,
  place: display.placeName,
  thumbnail: display.postImageUrl,
  hasVideoPoster: Boolean(display.posterVideoUrl),
  posterCrop: display.posterCrop ?? null,
  posterFit: display.posterFit ?? null,
  posterEdgeColor: display.posterEdgeColor ?? null,
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

/* 전시를 지우거나 나가면 그 전시에 올린 내 작품도 서버에서 사라져, 작품 목록 · 상세 · 보관함 작품도 바뀝니다. */
const invalidateDisplayQueries = (queryClient: QueryClient, displayId: number) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
  queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.displayMembers.byDisplayId(displayId) });
  invalidateArtworksOfDisplay(queryClient, displayId);
  queryClient.invalidateQueries({ queryKey: queryKeys.archives.works.all() });
  // 대화상자를 닫기 전에 내 전시 관리 목록에서 카드가 빠진 것까지 받아 둔다
  return refetchForNextScreen(queryClient, [[...queryKeys.displays.lists(), 'my']]);
};

export const useDeleteDisplay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (displayId: number) => deleteDisplay(displayId),
    onSuccess: (_, displayId) => {
      const refetched = invalidateDisplayQueries(queryClient, displayId);
      // 무효화만 하면 뒤로가기로 상세에 돌아왔을 때 받아 둔 상세가 먼저 그려진다. 지운 전시는 캐시에서 뺀다
      queryClient.removeQueries({ queryKey: queryKeys.displays.detail(displayId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.displays.all() });
      return refetched;
    },
  });
};

export const useExitDisplay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (displayId: number) => exitDisplay(displayId),
    onSuccess: (_, displayId) => invalidateDisplayQueries(queryClient, displayId),
  });
};

export const useUpdateMyDisplayNickname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateMyDisplayNicknameRequestDto) => updateMyDisplayNickname(body),
    /*
     * 전시 작가명은 전시 상세 teamMembers · 팀원 목록 · 내 전시 · 작가 전시 목록뿐 아니라 그 전시 작품의 artistName 에도 담겨 옵니다.
     * 작품 목록 · 상세를 같이 무효화하지 않으면 staleTime 동안 전시 작업 페이지 등에 예전 이름이 남습니다.
     */
    onSuccess: (_, { displayId }) => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.displays.lists(), 'artist'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.displayMembers.byDisplayId(displayId) });
      invalidateArtworksOfDisplay(queryClient, displayId);
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.works.all() });
      // 시트를 닫기 전에 카드의 작가명과, 카드를 눌러 들어갈 전시 작업 화면 데이터를 새로 받아 둔다
      return refetchForNextScreen(queryClient, [
        [...queryKeys.displays.lists(), 'my'],
        queryKeys.displays.detail(displayId),
        queryKeys.displayArtworks.byDisplayId(displayId),
      ]);
    },
  });
};
