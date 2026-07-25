import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { LoginRequestDto, SignupRequestDto } from '@/api/dto';
import { login, logout, signup } from '@/api/endpoints';
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
    mutationFn: (body: SignupRequestDto) => signup(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
