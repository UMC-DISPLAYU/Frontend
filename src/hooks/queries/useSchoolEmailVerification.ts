import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  ConfirmVerificationEmailRequestDto,
  ResendVerificationEmailRequestDto,
  SendVerificationEmailRequestDto,
} from '@/api/dto';
import {
  confirmVerificationEmail,
  resendVerificationEmail,
  sendVerificationEmail,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useSendVerificationEmail = () =>
  useMutation({
    mutationFn: (body: SendVerificationEmailRequestDto) => sendVerificationEmail(body),
  });

export const useConfirmVerificationEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ConfirmVerificationEmailRequestDto) => confirmVerificationEmail(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
};

export const useResendVerificationEmail = () =>
  useMutation({
    mutationFn: (body: ResendVerificationEmailRequestDto) => resendVerificationEmail(body),
  });
