import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  ArchiveArtworkCursorDto,
  ArchivedExhibitionDto,
  ArchiveMemoRequestDto,
  DisplayDetailDto,
  GetArchivedArtworksRequestDto,
  GetArchivedArtworksResponseDataDto,
  GetArchivedExhibitionsResponseDataDto,
} from '@/api/dto';
import {
  archiveArtist,
  archiveArtwork,
  archiveExhibition,
  archivePersonalArtwork,
  deleteArchivedArtworkMemo,
  deleteArchivedExhibitionMemo,
  getArchivedArtist,
  getArchivedArtists,
  getArchivedArtwork,
  getArchivedArtworks,
  getArchivedExhibition,
  getArchivedExhibitions,
  unarchiveArtist,
  unarchiveArtwork,
  unarchiveExhibition,
  unarchivePersonalArtwork,
  updateArchivedArtworkMemo,
  updateArchivedExhibitionMemo,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';

export const useArchivedExhibitions = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: queryKeys.archives.displays.list(),
    queryFn: getArchivedExhibitions,
    enabled: !!accessToken,
  });
};

export const useInfiniteArchivedArtworks = (
  params: Omit<GetArchivedArtworksRequestDto, 'cursorId'> & { size: number },
) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useInfiniteQuery({
    queryKey: queryKeys.archives.works.list({ ...params }),
    queryFn: ({ pageParam }) =>
      getArchivedArtworks({
        ...params,
        cursorId: pageParam,
      }),
    initialPageParam: null as ArchiveArtworkCursorDto | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursorId ?? lastPage.nextCursor ?? null) : null,
    enabled: !!accessToken,
  });
};

export const useArchivedArtists = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useInfiniteQuery({
    queryKey: queryKeys.archives.artists.list(),
    queryFn: ({ pageParam }) => getArchivedArtists({ cursorId: pageParam ?? undefined }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
    enabled: !!accessToken,
  });
};

export const useArchivedExhibition = (savedExhibitionId: number) =>
  useQuery({
    queryKey: queryKeys.archives.displays.detail(savedExhibitionId),
    queryFn: () => getArchivedExhibition(savedExhibitionId),
    enabled: Number.isFinite(savedExhibitionId),
  });

export const useArchivedArtwork = (savedArtworkId: number) =>
  useQuery({
    queryKey: queryKeys.archives.works.detail(savedArtworkId),
    queryFn: () => getArchivedArtwork(savedArtworkId),
    enabled: Number.isFinite(savedArtworkId),
  });

export const useArchivedArtist = (savedArtistId: number) =>
  useQuery({
    queryKey: queryKeys.archives.artists.detail(savedArtistId),
    queryFn: () => getArchivedArtist(savedArtistId),
    enabled: Number.isFinite(savedArtistId),
  });

export const useArchiveExhibition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveExhibition,
    onMutate: async (exhibitionId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.archives.displays.all() });

      const previousList = queryClient.getQueryData<GetArchivedExhibitionsResponseDataDto>(
        queryKeys.archives.displays.list(),
      );

      const newItem = { displayId: exhibitionId } as ArchivedExhibitionDto;

      queryClient.setQueryData<GetArchivedExhibitionsResponseDataDto>(
        queryKeys.archives.displays.list(),
        (old) => ({
          ...old,
          savedExhibitions: [...(old?.savedExhibitions ?? []), newItem],
        }),
      );

      return { previousList };
    },
    onError: (_, __, context) => {
      if (context?.previousList !== undefined) {
        queryClient.setQueryData(queryKeys.archives.displays.list(), context.previousList);
      } else {
        queryClient.removeQueries({ queryKey: queryKeys.archives.displays.list() });
      }
    },
    onSuccess: (_, exhibitionId) => {
      /* 좋아요 상태 등 다른 필드를 건드리지 않도록, 전체 재조회 대신 isArchived만 직접 patch합니다. */
      queryClient.setQueryData(
        queryKeys.displays.detail(exhibitionId),
        (current: DisplayDetailDto | undefined) =>
          current ? { ...current, isArchived: true } : current,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.displays.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
    },
  });
};

export const useUnarchiveExhibition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unarchiveExhibition,
    onMutate: async (exhibitionId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.archives.displays.all() });

      const previousList = queryClient.getQueryData<GetArchivedExhibitionsResponseDataDto>(
        queryKeys.archives.displays.list(),
      );

      queryClient.setQueryData<GetArchivedExhibitionsResponseDataDto>(
        queryKeys.archives.displays.list(),
        (old) => ({
          ...old,
          savedExhibitions:
            old?.savedExhibitions?.filter((s) => s.displayId !== exhibitionId) ?? [],
        }),
      );

      return { previousList };
    },
    onError: (_, __, context) => {
      if (context?.previousList !== undefined) {
        queryClient.setQueryData(queryKeys.archives.displays.list(), context.previousList);
      } else {
        queryClient.removeQueries({ queryKey: queryKeys.archives.displays.list() });
      }
    },
    onSuccess: (_, exhibitionId) => {
      /* 좋아요 상태 등 다른 필드를 건드리지 않도록, 전체 재조회 대신 isArchived만 직접 patch합니다. */
      queryClient.setQueryData(
        queryKeys.displays.detail(exhibitionId),
        (current: DisplayDetailDto | undefined) =>
          current ? { ...current, isArchived: false } : current,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.displays.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
    },
  });
};

export const useArchiveArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveArtwork,
    onSuccess: (_, artworkId) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.archives.works.all() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.detail(artworkId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.lists() }),
      ]),
  });
};

export const useUnarchiveArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unarchiveArtwork,
    onSuccess: (_, artworkId) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.archives.works.all() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.detail(artworkId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.lists() }),
      ]),
  });
};

export const useArchivePersonalArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archivePersonalArtwork,
    onSuccess: (_, personalArtworkId) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.archives.works.all() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.personalArtworks.detail(personalArtworkId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.personalArtworks.lists() }),
      ]),
  });
};

export const useUnarchivePersonalArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unarchivePersonalArtwork,
    onSuccess: (_, personalArtworkId) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.archives.works.all() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.personalArtworks.detail(personalArtworkId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.personalArtworks.lists() }),
      ]),
  });
};

export const useArchiveArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveArtist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.archives.artists.all() }),
  });
};

export const useUnarchiveArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unarchiveArtist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.archives.artists.all() }),
  });
};

export const useUpdateArchivedExhibitionMemo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      archiveDisplayId,
      body,
    }: {
      archiveDisplayId: number;
      body: ArchiveMemoRequestDto;
    }) => updateArchivedExhibitionMemo(archiveDisplayId, body),
    onSuccess: (_, { archiveDisplayId, body }) => {
      queryClient.setQueryData<GetArchivedExhibitionsResponseDataDto>(
        queryKeys.archives.displays.list(),
        (previous) =>
          previous
            ? {
                ...previous,
                savedExhibitions:
                  previous.savedExhibitions?.map((exhibition) =>
                    exhibition.savedExhibitionId === archiveDisplayId
                      ? { ...exhibition, memo: body.memo }
                      : exhibition,
                  ) ?? [],
              }
            : previous,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.displays.all() });
    },
  });
};

export const useDeleteArchivedExhibitionMemo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (archiveDisplayId: number) => deleteArchivedExhibitionMemo(archiveDisplayId),
    onSuccess: (_, archiveDisplayId) => {
      queryClient.setQueryData<GetArchivedExhibitionsResponseDataDto>(
        queryKeys.archives.displays.list(),
        (previous) =>
          previous
            ? {
                ...previous,
                savedExhibitions:
                  previous.savedExhibitions?.map((exhibition) =>
                    exhibition.savedExhibitionId === archiveDisplayId
                      ? { ...exhibition, memo: null }
                      : exhibition,
                  ) ?? [],
              }
            : previous,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.displays.all() });
    },
  });
};

export const useUpdateArchivedArtworkMemo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ archiveWorkId, body }: { archiveWorkId: number; body: ArchiveMemoRequestDto }) =>
      updateArchivedArtworkMemo(archiveWorkId, body),
    onSuccess: (_, { archiveWorkId, body }) => {
      queryClient.setQueryData<GetArchivedArtworksResponseDataDto>(
        queryKeys.archives.works.list(),
        (previous) =>
          previous
            ? {
                ...previous,
                works: previous.works.map((artwork) =>
                  artwork.archiveWorkId === archiveWorkId
                    ? { ...artwork, memo: body.memo }
                    : artwork,
                ),
              }
            : previous,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.works.all() });
    },
  });
};

export const useDeleteArchivedArtworkMemo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (archiveWorkId: number) => deleteArchivedArtworkMemo(archiveWorkId),
    onSuccess: (_, archiveWorkId) => {
      queryClient.setQueryData<GetArchivedArtworksResponseDataDto>(
        queryKeys.archives.works.list(),
        (previous) =>
          previous
            ? {
                ...previous,
                works: previous.works.map((artwork) =>
                  artwork.archiveWorkId === archiveWorkId ? { ...artwork, memo: null } : artwork,
                ),
              }
            : previous,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.works.all() });
    },
  });
};
