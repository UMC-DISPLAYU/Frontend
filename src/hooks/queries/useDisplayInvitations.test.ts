import { QueryClient, useMutation } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import type { MyDisplayInvitationListResponseDataDto } from '@/api/dto';
import { queryKeys } from '@/api/queryKeys';

import { useAcceptDisplayInvitation, useRejectDisplayInvitation } from './useDisplayInvitations';

const h = vi.hoisted(() => ({ queryClient: null as unknown as QueryClient }));

vi.mock('@tanstack/react-query', async (original) => ({
  ...(await original<typeof import('@tanstack/react-query')>()),
  useMutation: vi.fn(),
  useQueryClient: () => h.queryClient,
}));
vi.mock('@/api/endpoints', () => ({
  acceptDisplayInvitation: vi.fn(),
  getMyDisplayInvitations: vi.fn(),
  rejectDisplayInvitation: vi.fn(),
}));

const invitation = (invitationId: number) => ({
  invitationId,
  displayId: 100 + invitationId,
  thumbnailUrl: null,
  startDate: '2026-11-12',
  endDate: '2026-11-18',
  location: 'SEOUL',
  leaderName: '고상준',
  title: `전시 ${invitationId}`,
  placeName: '디자인관 1층',
});

// useMutation 을 mock 해 훅이 넘긴 옵션의 onSuccess 만 실행한다
const mutationOptions = (useHook: () => unknown) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useHook();
  return vi.mocked(useMutation).mock.calls[0][0] as {
    onSuccess: (data: unknown, variables: unknown) => void;
  };
};

const cachedIds = () =>
  h.queryClient
    .getQueryData<MyDisplayInvitationListResponseDataDto>(queryKeys.displayInvitations.me())
    ?.invitations.map((item) => item.invitationId);

let invalidated: unknown[][] = [];

beforeEach(() => {
  h.queryClient = new QueryClient();
  h.queryClient.setQueryData(queryKeys.displayInvitations.me(), {
    invitations: [invitation(1), invitation(2)],
  });
  invalidated = [];
  vi.spyOn(h.queryClient, 'invalidateQueries').mockImplementation(async (filters) => {
    invalidated.push([...(filters?.queryKey ?? [])]);
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

it('수락하면 그 초대만 목록에서 빼고 초대 · 내 전시 · 전시 상세 · 팀원 목록을 다시 불러온다', () => {
  const { onSuccess } = mutationOptions(useAcceptDisplayInvitation);

  onSuccess({ invitationId: 2, displayId: 102 }, { invitationId: 2, displayNickname: '김디유' });

  expect(cachedIds()).toEqual([1]);
  expect(invalidated).toEqual([
    [...queryKeys.displayInvitations.all],
    [...queryKeys.displays.lists()],
    [...queryKeys.displays.detail(102)],
    [...queryKeys.displayMembers.byDisplayId(102)],
  ]);
});

it('거절하면 그 초대만 목록에서 빼고 초대 목록을 다시 불러온다', () => {
  const { onSuccess } = mutationOptions(useRejectDisplayInvitation);

  onSuccess({ invitationId: 1, displayId: 101 }, 1);

  expect(cachedIds()).toEqual([2]);
  expect(invalidated).toEqual([[...queryKeys.displayInvitations.all]]);
});

it('마지막 초대를 처리하면 빈 목록이 된다(마이의 받은 초대 줄이 사라진다)', () => {
  h.queryClient.setQueryData(queryKeys.displayInvitations.me(), { invitations: [invitation(1)] });
  const { onSuccess } = mutationOptions(useRejectDisplayInvitation);

  onSuccess({ invitationId: 1, displayId: 101 }, 1);

  expect(cachedIds()).toEqual([]);
});

it('목록을 아직 불러오지 않았으면 캐시를 만들지 않는다', () => {
  h.queryClient.removeQueries({ queryKey: queryKeys.displayInvitations.me() });
  const { onSuccess } = mutationOptions(useRejectDisplayInvitation);

  onSuccess({ invitationId: 1, displayId: 101 }, 1);

  expect(h.queryClient.getQueryData(queryKeys.displayInvitations.me())).toBeUndefined();
});
