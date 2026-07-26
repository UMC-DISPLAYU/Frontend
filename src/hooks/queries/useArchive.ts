import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ArchiveMemoRequestDto } from '@/api/dto';
import {
  archiveArtist,
  archiveArtwork,
  archiveExhibition,
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
  updateArchivedArtworkMemo,
  updateArchivedExhibitionMemo,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useArchivedExhibitions = (options: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: queryKeys.archives.displays.list(),
    queryFn: getArchivedExhibitions,
    enabled: options.enabled,
  });

export const useArchivedArtworks = (options: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: queryKeys.archives.works.list(),
    queryFn: getArchivedArtworks,
    enabled: options.enabled,
  });

export const useArchivedArtists = (options: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: queryKeys.archives.artists.list(),
    queryFn: getArchivedArtists,
    enabled: options.enabled,
  });

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
    onSuccess: (_, exhibitionId) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.archives.displays.all() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(exhibitionId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() }),
      ]),
  });
};

export const useUnarchiveExhibition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unarchiveExhibition,
    onSuccess: (_, exhibitionId) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.archives.displays.all() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(exhibitionId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() }),
      ]),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.displays.all() });
    },
  });
};

export const useDeleteArchivedExhibitionMemo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (archiveDisplayId: number) => deleteArchivedExhibitionMemo(archiveDisplayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.displays.all() });
    },
  });
};

export const useUpdateArchivedArtworkMemo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ archiveWorkId, body }: { archiveWorkId: number; body: ArchiveMemoRequestDto }) =>
      updateArchivedArtworkMemo(archiveWorkId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.works.all() });
    },
  });
};

export const useDeleteArchivedArtworkMemo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (archiveWorkId: number) => deleteArchivedArtworkMemo(archiveWorkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.works.all() });
    },
  });
};
