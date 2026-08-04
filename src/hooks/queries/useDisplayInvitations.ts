import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  acceptDisplayInvitation,
  getMyDisplayInvitations,
  rejectDisplayInvitation,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useMyDisplayInvitations = () =>
  useQuery({
    queryKey: queryKeys.displayInvitations.me(),
    queryFn: getMyDisplayInvitations,
  });

export const useAcceptDisplayInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invitationId,
      displayNickname,
    }: {
      invitationId: number;
      displayNickname: string;
    }) => acceptDisplayInvitation(invitationId, { displayNickname }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displayInvitations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
    },
  });
};

export const useRejectDisplayInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: number) => rejectDisplayInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displayInvitations.all });
    },
  });
};
