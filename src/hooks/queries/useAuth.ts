import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { LogoutRequestDto, SignupRequestDto } from '@/api/dto';
import {
  getGoogleAuthorizationUrl,
  getKakaoAuthorizationUrl,
  logout,
  signup,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SignupRequestDto) => signup(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
};

export const useKakaoAuthorizationUrl = () =>
  useMutation({
    mutationFn: () => getKakaoAuthorizationUrl(),
  });

export const useGoogleAuthorizationUrl = () =>
  useMutation({
    mutationFn: () => getGoogleAuthorizationUrl(),
  });

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LogoutRequestDto) => logout(body),
    onSettled: () => {
      useAuthStore.getState().clearAccessToken();
      queryClient.clear();
    },
  });
};
