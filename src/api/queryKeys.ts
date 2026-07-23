import type {
  GetArtworkPreviewRequestDto,
  GetDuPicksRequestDto,
  GetLoungePostsRequestDto,
} from '@/api/dto';

export const queryKeys = {
  displays: {
    all: ['displays'] as const,
    lists: () => [...queryKeys.displays.all, 'list'] as const,
    graduation: (params?: { size?: number }) =>
      [...queryKeys.displays.lists(), 'graduation', params ?? {}] as const,
    closingSoon: () => [...queryKeys.displays.lists(), 'closing-soon'] as const,
    duPicks: (params?: GetDuPicksRequestDto) =>
      [...queryKeys.displays.lists(), 'du-picks', params ?? {}] as const,
  },

  displayArtworks: {
    all: ['displayArtworks'] as const,
    lists: () => [...queryKeys.displayArtworks.all, 'list'] as const,
    preview: (params?: GetArtworkPreviewRequestDto) =>
      [...queryKeys.displayArtworks.lists(), 'preview', params ?? {}] as const,
  },

  loungePosts: {
    all: ['loungePosts'] as const,
    lists: () => [...queryKeys.loungePosts.all, 'list'] as const,
    list: (params?: GetLoungePostsRequestDto) =>
      [...queryKeys.loungePosts.lists(), params ?? {}] as const,
  },
} as const;
