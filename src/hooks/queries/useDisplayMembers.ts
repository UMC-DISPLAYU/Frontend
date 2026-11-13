import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ChangeDisplayMemberRoleRequestDto } from '@/api/dto';
import {
  changeDisplayMemberRole,
  createDisplayInvitation,
  disableDisplayInvitation,
  getDisplayMembers,
  inviteDisplayMember,
  removeDisplayMember,
  transferDisplayLeader,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useDisplayMembers = (displayId: number) =>
  useQuery({
    queryKey: queryKeys.displayMembers.byDisplayId(displayId),
    queryFn: async () => {
      const data = await getDisplayMembers(displayId);
      const members = [...(data.memberAccept ?? []), ...(data.memberPending ?? [])];
      return { ...data, members };
    },
    enabled: displayId > 0,
    /* 초대받은 사람이 다른 세션에서 수락하는 건 이 브라우저의 캐시를 무효화하지 못하므로,
       대기 중인 초대가 남아있는 동안은 폴링으로 수락 여부를 반영합니다. */
    refetchInterval: (query) => (query.state.data?.memberPending.length ? 5000 : false),
  });

/* 전시 상세의 teamMembers도 팀원 목록과 함께 바뀌므로(권한 판단에 쓰임) 같이 다시 불러옵니다. */
const refetchTeam = (queryClient: QueryClient, displayId: number) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.displayMembers.byDisplayId(displayId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) }),
  ]);

export const useInviteDisplayMember = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteeUserId: number) =>
      inviteDisplayMember(displayId, { inviteeUserId, role: 'TEAM_MEM' }),
    // 검색 결과의 버튼이 `초대 대기`로 바뀔 때까지 요청 중 상태를 유지합니다
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.displayInvitations.all });
      return refetchTeam(queryClient, displayId);
    },
  });
};

/* 켜면 새 초대 링크를 발급하고, 끄면 지금 링크를 비활성화합니다. */
export const useToggleDisplayInvitationLink = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (enabled) await createDisplayInvitation(displayId);
      else await disableDisplayInvitation(displayId);
    },
    // 링크 주소는 전시 상세의 토큰으로 그리므로 새 토큰을 받을 때까지 요청 중 상태를 유지합니다
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) }),
  });
};

export const useChangeDisplayMemberRole = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: number;
      role: ChangeDisplayMemberRoleRequestDto['role'];
    }) => changeDisplayMemberRole(displayId, memberId, { role }),
    onSuccess: () => refetchTeam(queryClient, displayId),
  });
};

export const useRemoveDisplayMember = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) => removeDisplayMember(displayId, memberId),
    onSuccess: () => {
      // 내보낸 팀원이 작가로 등록된 작품은 서버에서 함께 삭제됩니다
      void queryClient.invalidateQueries({
        queryKey: queryKeys.displayArtworks.byDisplayId(displayId),
      });
      return refetchTeam(queryClient, displayId);
    },
  });
};

export const useTransferDisplayLeader = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetMemberId: number) => transferDisplayLeader(displayId, { targetMemberId }),
    /*
     * 다시 불러오기를 기다리지 않습니다. 기다리면 바뀐 전시 상세로 팀원 관리 화면의 대표자 권한 가드가 먼저 동작해
     * 완료 화면으로 넘어가기 전에 다른 화면으로 밀려납니다.
     */
    onSuccess: () => {
      void refetchTeam(queryClient, displayId);
      void queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
    },
  });
};
