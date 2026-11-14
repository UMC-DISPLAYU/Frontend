import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { MyDisplayInvitationListResponseDataDto } from '@/api/dto';
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

// 처리한 초대는 다시 불러오기 전에 목록에서 바로 뺀다(받은 초대 시트 · 마이 숫자가 곧바로 줄어든다)
const removeAnsweredInvitation = (queryClient: QueryClient, invitationId: number) => {
  queryClient.setQueryData<MyDisplayInvitationListResponseDataDto>(
    queryKeys.displayInvitations.me(),
    (data) =>
      data && {
        ...data,
        invitations: data.invitations.filter((item) => item.invitationId !== invitationId),
      },
  );
  queryClient.invalidateQueries({ queryKey: queryKeys.displayInvitations.all });
};

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
    onSuccess: ({ displayId }, { invitationId }) => {
      removeAnsweredInvitation(queryClient, invitationId);
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
      // 팀원이 되면 전시 상세 · 팀원 목록으로 판단하는 작품 등록 권한이 바뀐다
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.displayMembers.byDisplayId(displayId) });
    },
  });
};

export const useRejectDisplayInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: number) => rejectDisplayInvitation(invitationId),
    onSuccess: (_, invitationId) => removeAnsweredInvitation(queryClient, invitationId),
  });
};
