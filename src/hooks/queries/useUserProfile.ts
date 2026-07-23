import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CheckNicknameRequestDto, UpdateNicknameRequestDto } from '@/api/dto';
import { checkNickname, deleteUserMe, getUserMe, updateNickname } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useUserMe = () =>
  useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getUserMe,
  });

export const useCheckNickname = (params: CheckNicknameRequestDto, enabled = true) =>
  useQuery({
    queryKey: queryKeys.users.nicknameCheck(params.nickname),
    queryFn: () => checkNickname(params),
    enabled: enabled && params.nickname.trim().length > 0,
  });

export const useUpdateNickname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateNicknameRequestDto) => updateNickname(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
};

export const useDeleteUserMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserMe,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
