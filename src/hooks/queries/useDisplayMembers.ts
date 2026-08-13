import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createDisplayInvitation,
  disableDisplayInvitation,
  getDisplayMembers,
  inviteDisplayMember,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useDisplayMembers = (displayId: number) =>
  useQuery({
    queryKey: queryKeys.displayMembers.byDisplayId(displayId),
    queryFn: () => getDisplayMembers(displayId),
    enabled: displayId > 0,
    /* 초대받은 사람이 다른 세션에서 수락하는 건 이 브라우저의 캐시를 무효화하지 못하므로,
       대기 중인 초대가 남아있는 동안은 폴링으로 수락 여부를 반영합니다. */
    refetchInterval: (query) =>
      query.state.data?.members.some((member) => !member.accepted) ? 5000 : false,
  });

export const useInviteDisplayMember = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteeUserId: number) =>
      inviteDisplayMember(displayId, { inviteeUserId, role: 'TEAM_MEM' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displayMembers.byDisplayId(displayId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.displayInvitations.all });
    },
  });
};

export const useCreateDisplayInvitationLink = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createDisplayInvitation(displayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
    },
  });
};

export const useDisableDisplayInvitationLink = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => disableDisplayInvitation(displayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
    },
  });
};
