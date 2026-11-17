import { afterEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/api/queryKeys';

import { useDeleteDisplay, useExitDisplay, useUpdateMyDisplayNickname } from './useMyDisplays';

const h = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  removeQueries: vi.fn(),
}));

// 훅이 만든 옵션만 꺼내 보려고 useMutation 이 옵션을 그대로 돌려주게 한다
vi.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => options,
  useQuery: (options: unknown) => options,
  useQueryClient: () => ({
    invalidateQueries: h.invalidateQueries,
    removeQueries: h.removeQueries,
  }),
}));
vi.mock('@/api/endpoints', () => ({}));

type MutationOptions<TVariables> = {
  onSuccess: (data: unknown, variables: TVariables) => unknown;
};
const options = <TVariables>(hook: unknown) => hook as MutationOptions<TVariables>;
const invalidatedKeys = () =>
  h.invalidateQueries.mock.calls.map(([filters]) => (filters as { queryKey: unknown }).queryKey);

afterEach(() => {
  vi.clearAllMocks();
});

describe('useUpdateMyDisplayNickname', () => {
  it('작가명이 담긴 전시 · 팀원 · 작품 · 보관함 작품을 모두 다시 받는다', () => {
    options<{ displayId: number; displayNickname: string }>(useUpdateMyDisplayNickname()).onSuccess(
      undefined,
      { displayId: 7, displayNickname: '새 이름' },
    );

    expect(invalidatedKeys()).toEqual(
      expect.arrayContaining([
        [...queryKeys.displays.lists(), 'my'],
        [...queryKeys.displays.lists(), 'artist'],
        queryKeys.displays.detail(7),
        queryKeys.displayMembers.byDisplayId(7),
        // 전시 작업 페이지의 작품 카드 · 작품 목록의 작가명
        queryKeys.displayArtworks.lists(),
        queryKeys.archives.works.all(),
      ]),
    );
  });
});

describe('useDeleteDisplay', () => {
  it('지운 전시의 작품이 남지 않게 작품 목록 · 보관함도 다시 받는다', () => {
    options<number>(useDeleteDisplay()).onSuccess(undefined, 7);

    expect(invalidatedKeys()).toEqual(
      expect.arrayContaining([
        queryKeys.displays.lists(),
        queryKeys.displayArtworks.lists(),
        queryKeys.archives.displays.all(),
        queryKeys.archives.works.all(),
      ]),
    );
    expect(h.removeQueries).toHaveBeenCalledWith({ queryKey: queryKeys.displays.detail(7) });
  });
});

describe('useExitDisplay', () => {
  it('나간 전시에 올린 작품이 지워지므로 작품 목록 · 보관함 작품도 다시 받는다', () => {
    options<number>(useExitDisplay()).onSuccess(undefined, 7);

    expect(invalidatedKeys()).toEqual(
      expect.arrayContaining([
        queryKeys.displays.lists(),
        queryKeys.displays.detail(7),
        queryKeys.displayArtworks.lists(),
        queryKeys.archives.works.all(),
      ]),
    );
  });
});
