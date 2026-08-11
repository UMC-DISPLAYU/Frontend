import type { CursorPageRequestDto } from '@/api/dto';
import type {
  GetClosingSoonDisplaysRequestDto,
  GetDisplayMapRequestDto,
  GetDuPicksRequestDto,
  SearchDisplaysRequestDto,
} from '@/api/dto/display.dto';
import type { GetArtworkPreviewRequestDto } from '@/api/dto/displayArtwork.dto';
import type { GetLoungePostsRequestDto } from '@/api/dto/lounge.dto';
import type { NearbyParams } from '@/hooks/useNearbyDisplays';

type ListParams = Record<string, unknown>;

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
  },

  agreements: {
    all: ['agreements'] as const,
    signup: () => [...queryKeys.agreements.all, 'signup'] as const,
  },

  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
    search: (nickname: string) => [...queryKeys.users.all, 'search', nickname] as const,
    artistProfile: () => [...queryKeys.users.me(), 'artist-profile'] as const,
    userArtistProfile: (userId: number) =>
      [...queryKeys.users.all, userId, 'artist-profile'] as const,
  },

  schools: {
    all: ['schools'] as const,
    search: (keyword?: string) => [...queryKeys.schools.all, 'search', keyword ?? ''] as const,
  },

  health: {
    all: ['health'] as const,
  },

  displays: {
    all: ['displays'] as const,
    lists: () => [...queryKeys.displays.all, 'list'] as const,
    search: (params: SearchDisplaysRequestDto) =>
      [...queryKeys.displays.lists(), 'search', params] as const,
    map: (params: GetDisplayMapRequestDto) =>
      [...queryKeys.displays.lists(), 'map', params] as const,
    nearby: (params: NearbyParams | null) =>
      [...queryKeys.displays.lists(), 'nearby', params] as const,
    closingSoon: (params?: GetClosingSoonDisplaysRequestDto) =>
      [...queryKeys.displays.lists(), 'closing-soon', params ?? {}] as const,
    graduation: (params?: { size?: number }) =>
      [...queryKeys.displays.lists(), 'graduation', params ?? {}] as const,
    duPicks: (params?: GetDuPicksRequestDto) =>
      [...queryKeys.displays.lists(), 'du-picks', params ?? {}] as const,
    details: () => [...queryKeys.displays.all, 'detail'] as const,
    detail: (displayId: number) => [...queryKeys.displays.details(), displayId] as const,
    likeStatus: (displayId: number) =>
      [...queryKeys.displays.all, 'like-status', displayId] as const,
    reviews: (displayId: number) => [...queryKeys.displays.all, 'reviews', displayId] as const,
    reviewReplies: (displayId: number, displayReviewId: number) =>
      [...queryKeys.displays.all, 'reviews', displayId, 'replies', displayReviewId] as const,
    // 가짜 쿼리 키: 백엔드에 공개 시점 설정 API가 생기기 전까지 공개 설정 화면에서 사용합니다.
  },

  displayInvitations: {
    all: ['displayInvitations'] as const,
    lists: () => [...queryKeys.displayInvitations.all, 'list'] as const,
    me: () => [...queryKeys.displayInvitations.lists(), 'me'] as const,
    byToken: (token: string) => [...queryKeys.displayInvitations.all, 'token', token] as const,
  },

  displayMembers: {
    all: ['displayMembers'] as const,
    lists: () => [...queryKeys.displayMembers.all, 'list'] as const,
    byDisplayId: (displayId: number) => [...queryKeys.displayMembers.lists(), displayId] as const,
  },

  displayArtworks: {
    all: ['displayArtworks'] as const,
    lists: () => [...queryKeys.displayArtworks.all, 'list'] as const,
    byDisplayId: (displayId: number) =>
      [...queryKeys.displayArtworks.lists(), 'display', displayId] as const,
    preview: (params?: GetArtworkPreviewRequestDto) =>
      [...queryKeys.displayArtworks.lists(), 'preview', params ?? {}] as const,
    me: () => [...queryKeys.displayArtworks.lists(), 'me'] as const,
    byUserId: (userId: number) => [...queryKeys.displayArtworks.lists(), 'user', userId] as const,
    details: () => [...queryKeys.displayArtworks.all, 'detail'] as const,
    detail: (artworkId: number) => [...queryKeys.displayArtworks.details(), artworkId] as const,
  },

  personalArtworks: {
    all: ['personalArtworks'] as const,
    lists: () => [...queryKeys.personalArtworks.all, 'list'] as const,
    list: () => [...queryKeys.personalArtworks.lists()] as const,
    details: () => [...queryKeys.personalArtworks.all, 'detail'] as const,
    detail: (personalArtworkId: number) =>
      [...queryKeys.personalArtworks.details(), personalArtworkId] as const,
  },

  artworkFeelings: {
    all: ['artworkFeelings'] as const,
    lists: () => [...queryKeys.artworkFeelings.all, 'list'] as const,
    list: (artworkId: number) => [...queryKeys.artworkFeelings.lists(), artworkId] as const,
    replies: (artworkId: number, feelingId: number) =>
      [...queryKeys.artworkFeelings.all, 'replies', artworkId, feelingId] as const,
  },

  artworkQuestions: {
    all: ['artworkQuestions'] as const,
    lists: () => [...queryKeys.artworkQuestions.all, 'list'] as const,
    list: (artworkId: number) => [...queryKeys.artworkQuestions.lists(), artworkId] as const,
    // 가짜 쿼리 키: 백엔드에 내 작품 질문 조회 API가 생기기 전까지 답변할 질문 화면에서 사용합니다.
    me: () => [...queryKeys.artworkQuestions.lists(), 'me'] as const,
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

  loungeMe: {
    all: ['loungeMe'] as const,
    posts: (params?: CursorPageRequestDto) =>
      [...queryKeys.loungeMe.all, 'posts', params ?? {}] as const,
    scraps: (params?: CursorPageRequestDto) =>
      [...queryKeys.loungeMe.all, 'scraps', params ?? {}] as const,
    comments: (params?: CursorPageRequestDto) =>
      [...queryKeys.loungeMe.all, 'comments', params ?? {}] as const,
  },

  archives: {
    all: ['archives'] as const,

    displays: {
      all: () => [...queryKeys.archives.all, 'displays'] as const,
      lists: () => [...queryKeys.archives.displays.all(), 'list'] as const,
      list: (params?: ListParams) =>
        [...queryKeys.archives.displays.lists(), params ?? {}] as const,
      detail: (savedExhibitionId: number) =>
        [...queryKeys.archives.displays.all(), 'detail', savedExhibitionId] as const,
    },

    works: {
      all: () => [...queryKeys.archives.all, 'works'] as const,
      lists: () => [...queryKeys.archives.works.all(), 'list'] as const,
      list: (params?: ListParams) => [...queryKeys.archives.works.lists(), params ?? {}] as const,
      detail: (savedArtworkId: number) =>
        [...queryKeys.archives.works.all(), 'detail', savedArtworkId] as const,
    },

    artists: {
      all: () => [...queryKeys.archives.all, 'artists'] as const,
      lists: () => [...queryKeys.archives.artists.all(), 'list'] as const,
      list: (params?: ListParams) => [...queryKeys.archives.artists.lists(), params ?? {}] as const,
      detail: (savedArtistId: number) =>
        [...queryKeys.archives.artists.all(), 'detail', savedArtistId] as const,
    },
  },
} as const;
