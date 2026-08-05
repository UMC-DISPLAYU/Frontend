import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CheckNicknameRequestDto,
  CreateArtistProfileRequestDto,
  UpdateArtistProfileRequestDto,
  UpdateMyProfileRequestDto,
  UpdateNicknameRequestDto,
} from '@/api/dto';
import {
  checkNickname,
  createMyArtistProfile,
  deleteUserMe,
  getMyArtistProfile,
  getUserArtistProfile,
  getUserMe,
  updateMyArtistProfile,
  updateNickname,
  updateUserMe,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';

export const useUserMe = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getUserMe,
    enabled: !!accessToken,
  });
};

export const useCheckNickname = () =>
  useMutation({
    mutationFn: (params: CheckNicknameRequestDto) => checkNickname(params),
  });

export const useMyArtistProfile = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: queryKeys.users.artistProfile(),
    queryFn: getMyArtistProfile,
    enabled,
  });

export const useUserArtistProfile = (userId: number) =>
  useQuery({
    queryKey: queryKeys.users.userArtistProfile(userId),
    queryFn: () => getUserArtistProfile(userId),
    enabled: Number.isFinite(userId) && userId > 0,
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

export const useUpdateUserMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateMyProfileRequestDto) => updateUserMe(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
};

export const useUpdateMyArtistProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateArtistProfileRequestDto) => updateMyArtistProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.artistProfile() });
    },
  });
};

export const useCreateMyArtistProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateArtistProfileRequestDto) => createMyArtistProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.artistProfile() });
    },
  });
};

export const useDeleteUserMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserMe,
    onSuccess: () => {
      useAuthStore.getState().clearAccessToken();
      queryClient.clear();
    },
  });
};
