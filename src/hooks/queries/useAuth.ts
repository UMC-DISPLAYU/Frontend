import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { LoginRequestDto, LogoutRequestDto, SignupRequestDto } from '@/api/dto';
import {
  getGoogleAuthorizationUrl,
  getKakaoAuthorizationUrl,
  login,
  logout,
  signup,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LoginRequestDto) => login(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body, signupToken }: { body: SignupRequestDto; signupToken: string | null }) =>
      signup(body, signupToken),
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
      queryClient.clear();
    },
  });
};
