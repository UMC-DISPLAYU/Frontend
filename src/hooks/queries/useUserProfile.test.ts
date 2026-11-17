import { afterEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/api/queryKeys';

import { useUpdateNickname, useUpdateUserMe } from './useUserProfile';

const h = vi.hoisted(() => ({ invalidateQueries: vi.fn() }));

// 훅이 만든 옵션만 꺼내 보려고 useMutation 이 옵션을 그대로 돌려주게 한다
vi.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => options,
  useQuery: (options: unknown) => options,
  useQueryClient: () => ({ invalidateQueries: h.invalidateQueries }),
}));
vi.mock('@/api/endpoints', () => ({}));

const invalidatedKeys = () =>
  h.invalidateQueries.mock.calls.map(([filters]) => (filters as { queryKey: unknown }).queryKey);

// 내 사진 · 닉네임이 작성자 정보로 실리는 곳
const AUTHOR_INFO_KEYS = [
  queryKeys.users.me(),
  queryKeys.loungePosts.all,
  queryKeys.loungeComments.all,
  [...queryKeys.displays.all, 'reviews'],
  queryKeys.artworkFeelings.all,
  queryKeys.personalArtworks.details(),
  queryKeys.displayMembers.all,
];

afterEach(() => {
  vi.clearAllMocks();
});

describe('내 프로필 변경 후 캐시 무효화', () => {
  it('프로필 사진 · 닉네임을 바꾸면 작성자 정보가 실린 후기 · 감상평 · 댓글 · 팀원 목록도 다시 받는다', () => {
    (useUpdateUserMe() as unknown as { onSuccess: () => void }).onSuccess();

    expect(invalidatedKeys()).toEqual(expect.arrayContaining(AUTHOR_INFO_KEYS));
  });

  it('닉네임만 바꿔도 같은 곳을 다시 받는다', () => {
    (useUpdateNickname() as unknown as { onSuccess: () => void }).onSuccess();

    expect(invalidatedKeys()).toEqual(expect.arrayContaining(AUTHOR_INFO_KEYS));
  });
});
