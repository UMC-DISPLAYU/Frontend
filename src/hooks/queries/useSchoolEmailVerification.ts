import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  ConfirmVerificationEmailRequestDto,
  ResendVerificationEmailRequestDto,
  SendVerificationEmailRequestDto,
} from '@/api/dto';
import {
  confirmVerificationEmail,
  resendVerificationEmail,
  searchSchools,
  sendVerificationEmail,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useSearchSchools = (keyword: string) =>
  useQuery({
    queryKey: queryKeys.schools.search(keyword.trim()),
    queryFn: () => searchSchools({ keyword: keyword.trim() }),
    enabled: keyword.trim().length > 0,
  });

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
