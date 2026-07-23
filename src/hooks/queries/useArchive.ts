import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { GetArchiveCalendarDayRequestDto, GetArchiveCalendarRequestDto } from '@/api/dto';
import {
  archiveArtist,
  archiveArtwork,
  archiveExhibition,
  getArchiveCalendar,
  getArchiveCalendarDay,
  getArchivedArtists,
  getArchivedArtworks,
  getArchivedExhibitions,
  unarchiveArtist,
  unarchiveArtwork,
  unarchiveExhibition,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useArchiveCalendar = (params: GetArchiveCalendarRequestDto) =>
  useQuery({
    queryKey: queryKeys.archives.calendar(params),
    queryFn: () => getArchiveCalendar(params),
  });

export const useArchiveCalendarDay = (params: GetArchiveCalendarDayRequestDto) =>
  useQuery({
    queryKey: queryKeys.archives.calendarDay(params),
    queryFn: () => getArchiveCalendarDay(params),
  });

export const useArchivedExhibitions = () =>
  useQuery({
    queryKey: queryKeys.archives.displays.list(),
    queryFn: getArchivedExhibitions,
  });

export const useArchivedArtworks = () =>
  useQuery({
    queryKey: queryKeys.archives.works.list(),
    queryFn: getArchivedArtworks,
  });

export const useArchivedArtists = () =>
  useQuery({
    queryKey: queryKeys.archives.artists.list(),
    queryFn: getArchivedArtists,
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
