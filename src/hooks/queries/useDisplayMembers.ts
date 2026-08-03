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
