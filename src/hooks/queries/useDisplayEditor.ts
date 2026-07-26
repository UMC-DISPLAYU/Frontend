import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateDisplayRequestDto } from '@/api/dto';
import { createDisplay } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useCreateDisplay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateDisplayRequestDto) => createDisplay(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
    },
  });
};
