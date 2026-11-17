import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CheckNicknameRequestDto,
  CreateArtistProfileRequestDto,
  UpdateArtistProfileRequestDto,
  UpdateMyProfileRequestDto,
  UpdateNicknameRequestDto,
} from '@/api/dto';
import {
  checkNickname,
  createMyArtistProfile,
  deleteUserMe,
  getMyArtistProfile,
  getUserArtistProfile,
  getUserMe,
  updateMyArtistProfile,
  updateNickname,
  updateUserMe,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';

import { refetchForNextScreen } from './refetchForNextScreen';

/* 비로그인 상태에서는 호출하지 않고, 호출부에서 추가 조건을 줄 수 있습니다. */
export const useUserMe = (options: { enabled?: boolean } = {}) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getUserMe,
    enabled: !!accessToken && (options.enabled ?? true),
  });
};

/* 로그인 상태에서 사용자 정보를 아직 받지 못했는지 여부입니다. 권한 판단 전에 대기할 때 씁니다. */
export const useIsUserMePending = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { isPending } = useUserMe();

  return !!accessToken && isPending;
};

export const useCheckNickname = () =>
  useMutation({
    mutationFn: (params: CheckNicknameRequestDto) => checkNickname(params),
  });

export const useMyArtistProfile = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: queryKeys.users.artistProfile(),
    queryFn: getMyArtistProfile,
    enabled: !!accessToken && enabled,
  });
};

export const useUserArtistProfile = (userId: number) =>
  useQuery({
    queryKey: queryKeys.users.userArtistProfile(userId),
    queryFn: () => getUserArtistProfile(userId),
    enabled: Number.isFinite(userId) && userId > 0,
  });

/*
 * 내 닉네임 · 프로필 사진은 내가 쓴 글의 작성자 정보로도 담겨 온다(라운지 글 · 댓글, 전시 후기 · 답글,
 * 작품 · 개인 작품 감상평, 팀원 목록의 기본 닉네임). 같이 무효화하지 않으면 staleTime 동안 예전 사진 · 이름이 남는다.
 */
const invalidateMyAuthorInfo = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.loungeComments.all });
  queryClient.invalidateQueries({ queryKey: [...queryKeys.displays.all, 'reviews'] });
  queryClient.invalidateQueries({ queryKey: queryKeys.artworkFeelings.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.personalArtworks.details() });
  queryClient.invalidateQueries({ queryKey: queryKeys.displayMembers.all });
  // 저장 뒤 돌아가는 마이 화면이 예전 사진 · 닉네임을 먼저 그리지 않게 한다
  return refetchForNextScreen(queryClient, [queryKeys.users.me()]);
};

export const useUpdateNickname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateNicknameRequestDto) => updateNickname(body),
    onSuccess: () => invalidateMyAuthorInfo(queryClient),
  });
};

export const useUpdateUserMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateMyProfileRequestDto) => updateUserMe(body),
    onSuccess: () => invalidateMyAuthorInfo(queryClient),
  });
};

export const useUpdateMyArtistProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateArtistProfileRequestDto) => updateMyArtistProfile(body),
    onSuccess: () => {
      // 작가 프로필 화면(/artist/:userId)은 userId 기준 key 를 쓴다
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey[0] === queryKeys.users.all[0] && queryKey[2] === 'artist-profile',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.all });
      // 저장 뒤 돌아가는 마이 화면이 예전 작가 사진 · 작가명을 먼저 그리지 않게 한다
      return refetchForNextScreen(queryClient, [queryKeys.users.artistProfile()]);
    },
  });
};

export const useCreateMyArtistProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateArtistProfileRequestDto) => createMyArtistProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.artistProfile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
};

export const useDeleteUserMe = () => {
  return useMutation({
    mutationFn: deleteUserMe,
    onSuccess: () => {
      useAuthStore.getState().clearAccessToken();
    },
  });
};
