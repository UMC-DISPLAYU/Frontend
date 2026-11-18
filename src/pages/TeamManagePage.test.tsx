import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TeamManage } from './TeamManagePage';

const h = vi.hoisted(() => ({ navigate: vi.fn(), TeamHeader: () => null }));
vi.mock('react-router-dom', () => ({
  useNavigate: () => h.navigate,
  useParams: () => ({ displayId: '7' }),
}));
vi.mock('@/components/team-manage', () => ({
  InviteLinkCard: 'section',
  NicknameInviteCard: 'section',
  TeamHeader: h.TeamHeader,
  TeamMemberSection: 'section',
  TeamPage: 'main',
}));
vi.mock('@/hooks/queries/useDisplayDetail', () => ({
  useDisplayDetail: () => ({ data: undefined }),
}));
vi.mock('@/hooks/queries/useDisplayMembers', () => ({
  useDisplayMembers: () => ({ data: [], isPending: false, error: null, refetch: vi.fn() }),
}));
vi.mock('@/hooks/queries/useUserProfile', () => ({ useUserMe: () => ({ data: undefined }) }));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );
const headerOf = (page: ReactNode) => nodes(page).find((node) => node.type === h.TeamHeader)!;

beforeEach(() => vi.clearAllMocks());

describe('팀원 관리 뒤로가기', () => {
  it('어디서 들어왔든 기록을 되돌리지 않고 전시 관리로 간다', () => {
    const header = headerOf(TeamManage());

    expect(header.props.backLabel).toBe('전시 관리로 돌아가기');
    (header.props.onBack as () => void)();
    expect(h.navigate).toHaveBeenCalledOnce();
    expect(h.navigate).toHaveBeenCalledWith('/exhibition/7/manage');
  });
});
