import { useMutation } from '@tanstack/react-query';

import type { CreatePresignedUrlRequestDto } from '@/api/dto';
import { createPresignedUrl } from '@/api/endpoints';

export const useCreatePresignedUrl = () =>
  useMutation({
    mutationFn: (body: CreatePresignedUrlRequestDto) => createPresignedUrl(body),
  });
