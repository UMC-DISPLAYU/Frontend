import { afterEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/api/queryKeys';

import {
  useChangeDisplayMemberRole,
  useInviteDisplayMember,
  useRemoveDisplayMember,
  useToggleDisplayInvitationLink,
  useTransferDisplayLeader,
} from './useDisplayMembers';

const h = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  api: {
    changeDisplayMemberRole: vi.fn(),
    createDisplayInvitation: vi.fn(),
    disableDisplayInvitation: vi.fn(),
    getDisplayMembers: vi.fn(),
    inviteDisplayMember: vi.fn(),
    removeDisplayMember: vi.fn(),
    transferDisplayLeader: vi.fn(),
  },
}));

// 훅이 만든 옵션만 꺼내 보려고 useMutation 이 옵션을 그대로 돌려주게 한다
vi.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => options,
  useQuery: (options: unknown) => options,
  useQueryClient: () => ({ invalidateQueries: h.invalidateQueries }),
}));
vi.mock('@/api/endpoints', () => h.api);

type MutationOptions = {
  mutationFn: (variables?: unknown) => unknown;
  onSuccess: () => unknown;
};
const options = (hook: unknown) => hook as MutationOptions;
const invalidatedKeys = () =>
  h.invalidateQueries.mock.calls.map(([filters]) => (filters as { queryKey: unknown }).queryKey);

afterEach(() => {
  vi.clearAllMocks();
});

describe('useInviteDisplayMember', () => {
  it('팀원 목록 · 전시 상세를 다시 받을 때까지 요청 중으로 남는다', async () => {
    let finishRefetch = () => {};
    h.invalidateQueries.mockReturnValue(new Promise<void>((resolve) => (finishRefetch = resolve)));
    const { mutationFn, onSuccess } = options(useInviteDisplayMember(7));

    await mutationFn(42);
    expect(h.api.inviteDisplayMember).toHaveBeenCalledWith(7, {
      inviteeUserId: 42,
      role: 'TEAM_MEM',
    });

    let settled = false;
    void Promise.resolve(onSuccess()).then(() => (settled = true));
    await Promise.resolve();
    expect(settled).toBe(false);

    finishRefetch();
    await vi.waitFor(() => expect(settled).toBe(true));
    expect(invalidatedKeys()).toEqual([
      queryKeys.displayInvitations.all,
      queryKeys.displayMembers.byDisplayId(7),
      queryKeys.displays.detail(7),
    ]);
  });
});

describe('useToggleDisplayInvitationLink', () => {
  it('켜면 링크를 발급하고 끄면 비활성화한다', async () => {
    const { mutationFn } = options(useToggleDisplayInvitationLink(7));

    await mutationFn(true);
    expect(h.api.createDisplayInvitation).toHaveBeenCalledWith(7);
    expect(h.api.disableDisplayInvitation).not.toHaveBeenCalled();

    await mutationFn(false);
    expect(h.api.disableDisplayInvitation).toHaveBeenCalledWith(7);
  });

  it('새 토큰이 담긴 전시 상세를 기다린다', async () => {
    h.invalidateQueries.mockResolvedValue(undefined);
    const { onSuccess } = options(useToggleDisplayInvitationLink(7));

    await expect(onSuccess()).resolves.toBeUndefined();
    expect(invalidatedKeys()).toEqual([queryKeys.displays.detail(7)]);
  });
});

describe('useChangeDisplayMemberRole', () => {
  it.each(['MANAGER', 'TEAM_MEM'] as const)('%s 로 바꾼다', async (role) => {
    const { mutationFn } = options(useChangeDisplayMemberRole(7));

    await mutationFn({ memberId: 3, role });
    expect(h.api.changeDisplayMemberRole).toHaveBeenCalledWith(7, 3, { role });
  });
});

describe('useRemoveDisplayMember', () => {
  it('내보낸 팀원의 작품이 지워지므로 전시 작품 목록도 다시 받는다', async () => {
    h.invalidateQueries.mockResolvedValue(undefined);
    const { mutationFn, onSuccess } = options(useRemoveDisplayMember(7));

    await mutationFn(3);
    await onSuccess();
    expect(h.api.removeDisplayMember).toHaveBeenCalledWith(7, 3);
    expect(invalidatedKeys()).toContainEqual(queryKeys.displayArtworks.byDisplayId(7));
    expect(invalidatedKeys()).toContainEqual(queryKeys.displayMembers.byDisplayId(7));
  });
});

describe('useTransferDisplayLeader', () => {
  it('다시 불러오기를 기다리지 않고 바로 끝난다(완료 화면으로 먼저 넘어가야 한다)', async () => {
    h.invalidateQueries.mockReturnValue(new Promise(() => {}));
    const { mutationFn, onSuccess } = options(useTransferDisplayLeader(7));

    await mutationFn(5);
    expect(h.api.transferDisplayLeader).toHaveBeenCalledWith(7, { targetMemberId: 5 });
    expect(onSuccess()).toBeUndefined();
    expect(invalidatedKeys()).toEqual([
      queryKeys.displayMembers.byDisplayId(7),
      queryKeys.displays.detail(7),
      queryKeys.displays.lists(),
    ]);
  });
});
