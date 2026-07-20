import type { CursorPageRequestDto } from '@/api/dto';
import type {
  GetArchiveCalendarDayRequestDto,
  GetArchiveCalendarRequestDto,
} from '@/api/dto/archive.dto';
import type {
  GetDisplayArtworksRequestDto,
  GetDisplayMapRequestDto,
  GetDisplaysRequestDto,
  SearchDisplaysRequestDto,
} from '@/api/dto/display.dto';
import type { GetArtworkPreviewRequestDto } from '@/api/dto/displayArtwork.dto';
import type { GetLoungePostsRequestDto } from '@/api/dto/lounge.dto';

type ListParams = Record<string, unknown>;

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
  },

  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
    nicknameCheck: (nickname: string) =>
      [...queryKeys.users.all, 'nickname-check', nickname] as const,
  },

  displays: {
    all: ['displays'] as const,
    lists: () => [...queryKeys.displays.all, 'list'] as const,
    list: (params?: GetDisplaysRequestDto) =>
      [...queryKeys.displays.lists(), params ?? {}] as const,
    search: (params: SearchDisplaysRequestDto) =>
      [...queryKeys.displays.lists(), 'search', params] as const,
    map: (params: GetDisplayMapRequestDto) =>
      [...queryKeys.displays.lists(), 'map', params] as const,
    closingSoon: () => [...queryKeys.displays.lists(), 'closing-soon'] as const,
    graduation: () => [...queryKeys.displays.lists(), 'graduation'] as const,
    duPicks: () => [...queryKeys.displays.lists(), 'du-picks'] as const,
    details: () => [...queryKeys.displays.all, 'detail'] as const,
    detail: (displayId: number) => [...queryKeys.displays.details(), displayId] as const,
    reviewLists: (displayId: number) =>
      [...queryKeys.displays.detail(displayId), 'reviews'] as const,
    reviews: (displayId: number, params: { page: number; size: number }) =>
      [...queryKeys.displays.reviewLists(displayId), params] as const,
  },

  displayArtworks: {
    all: ['displayArtworks'] as const,
    lists: () => [...queryKeys.displayArtworks.all, 'list'] as const,
    listPrefix: (displayId: number) => [...queryKeys.displayArtworks.lists(), displayId] as const,
    list: (displayId: number, params: GetDisplayArtworksRequestDto) =>
      [...queryKeys.displayArtworks.listPrefix(displayId), params] as const,
    preview: (params?: GetArtworkPreviewRequestDto) =>
      [...queryKeys.displayArtworks.lists(), 'preview', params ?? {}] as const,
    details: () => [...queryKeys.displayArtworks.all, 'detail'] as const,
    detail: (artworkId: number) => [...queryKeys.displayArtworks.details(), artworkId] as const,
  },

  displayCategories: {
    all: ['displayCategories'] as const,
  },

  displayMembers: {
    all: ['displayMembers'] as const,
    lists: () => [...queryKeys.displayMembers.all, 'list'] as const,
    list: (displayId: number) => [...queryKeys.displayMembers.lists(), displayId] as const,
    inviteLink: (displayId: number) =>
      [...queryKeys.displayMembers.all, 'invite-link', displayId] as const,
  },

  artworkFeelings: {
    all: ['artworkFeelings'] as const,
    lists: () => [...queryKeys.artworkFeelings.all, 'list'] as const,
    list: (artworkId: number) => [...queryKeys.artworkFeelings.lists(), artworkId] as const,
  },

  artworkQuestions: {
    all: ['artworkQuestions'] as const,
    lists: () => [...queryKeys.artworkQuestions.all, 'list'] as const,
    list: (artworkId: number) => [...queryKeys.artworkQuestions.lists(), artworkId] as const,
  },

  loungePosts: {
    all: ['loungePosts'] as const,
    lists: () => [...queryKeys.loungePosts.all, 'list'] as const,
    list: (params?: GetLoungePostsRequestDto) =>
      [...queryKeys.loungePosts.lists(), params ?? {}] as const,
    details: () => [...queryKeys.loungePosts.all, 'detail'] as const,
    detail: (postId: number) => [...queryKeys.loungePosts.details(), postId] as const,
  },

  loungeComments: {
    all: ['loungeComments'] as const,
    lists: () => [...queryKeys.loungeComments.all, 'list'] as const,
    listPrefix: (postId: number) => [...queryKeys.loungeComments.lists(), postId] as const,
    list: (postId: number, params?: CursorPageRequestDto) =>
      [...queryKeys.loungeComments.listPrefix(postId), params ?? {}] as const,
    replyLists: (commentId: number) =>
      [...queryKeys.loungeComments.all, 'replies', commentId] as const,
    replies: (commentId: number, params?: CursorPageRequestDto) =>
      [...queryKeys.loungeComments.replyLists(commentId), params ?? {}] as const,
  },

  archives: {
    all: ['archives'] as const,
    calendar: (params: GetArchiveCalendarRequestDto) =>
      [...queryKeys.archives.all, 'calendar', params] as const,
    calendarDay: (params: GetArchiveCalendarDayRequestDto) =>
      [...queryKeys.archives.all, 'calendar-day', params] as const,

    displays: {
      all: () => [...queryKeys.archives.all, 'displays'] as const,
      lists: () => [...queryKeys.archives.displays.all(), 'list'] as const,
      list: (params?: ListParams) =>
        [...queryKeys.archives.displays.lists(), params ?? {}] as const,
    },

    works: {
      all: () => [...queryKeys.archives.all, 'works'] as const,
      lists: () => [...queryKeys.archives.works.all(), 'list'] as const,
      list: (params?: ListParams) => [...queryKeys.archives.works.lists(), params ?? {}] as const,
    },

    artists: {
      all: () => [...queryKeys.archives.all, 'artists'] as const,
      lists: () => [...queryKeys.archives.artists.all(), 'list'] as const,
      list: (params?: ListParams) => [...queryKeys.archives.artists.lists(), params ?? {}] as const,
    },
  },
} as const;
