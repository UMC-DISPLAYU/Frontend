import { renderToStaticMarkup } from 'react-dom/server';

import { beforeEach, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/apiError';

import {
  ArtworkPermissionGuard,
  DisplayArtistNamePermissionGuard,
  DisplayContentPermissionGuard,
  DisplayInvitationPermissionGuard,
  DisplayPermissionGuard,
} from './RoutePermissionGuards';

const h = vi.hoisted(() => ({
  params: { displayId: '1', artworkId: '2' },
  display: {
    data: undefined as unknown,
    isPending: false,
    error: null as Error | null,
    refetch: vi.fn(),
  },
  member: {
    data: undefined as unknown,
    isPending: false,
    error: null as Error | null,
    refetch: vi.fn(),
  },
  artwork: {
    data: undefined as unknown,
    isPending: false,
    error: null as Error | null,
    refetch: vi.fn(),
  },
}));
vi.mock('react-router-dom', () => ({ useParams: () => h.params, Outlet: () => null }));
vi.mock('@/hooks/queries/useDisplayDetail', () => ({ useDisplayDetail: () => h.display }));
vi.mock('@/hooks/queries/useDisplayMembers', () => ({ useDisplayMembers: () => h.member }));
vi.mock('@/hooks/queries/useArtworkDetail', () => ({ useArtworkDetail: () => h.artwork }));
vi.mock('@/hooks/usePolicy', () => ({
  useDisplayPolicy: () => ({}),
  useDisplayArtistNamePolicy: () => ({}),
  useDisplayContentPolicy: () => ({}),
  useDisplayCreatePolicy: () => ({}),
  useDisplayInvitationPolicy: () => ({}),
  useArtworkPolicy: () => ({}),
  usePersonalArtworkPolicy: () => ({}),
}));
vi.mock('./PermissionGuard', () => ({ PermissionGuard: () => <div>정상 권한 판정</div> }));
beforeEach(() => {
  h.params = { displayId: '1', artworkId: '2' };
  for (const query of [h.display, h.member, h.artwork]) {
    query.data = undefined;
    query.isPending = false;
    query.error = null;
    query.refetch.mockClear();
  }
});

const guards = [
  () => DisplayPermissionGuard({ action: 'edit', children: null }),
  () => DisplayContentPermissionGuard({ action: 'editContent', children: null }),
  () => DisplayInvitationPermissionGuard({ action: 'create', children: null }),
  () => DisplayArtistNamePermissionGuard({ action: 'edit', children: null }),
  () => ArtworkPermissionGuard({ action: 'edit', children: null }),
];
it.each(guards)('전시 조회 장애를 403 이동 대신 오류/재시도로 표시한다', async (guard) => {
  h.display.error = new ApiError('server', { status: 500 });
  h.artwork.isPending = true;
  const element = guard();
  expect(renderToStaticMarkup(element)).toContain('서버에 일시적인 문제');
  await element.props.refetch();
  expect(h.display.refetch).toHaveBeenCalledTimes(1);
  h.display.error = null;
  h.display.data = { ownerUserId: 1, teamMembers: [] };
  h.artwork.isPending = false;
  h.artwork.data = { artistUserId: 1 };
  expect(renderToStaticMarkup(guard())).toContain('정상 권한 판정');
});

it('필요한 팀원 정보를 기다리고 실패/재조회 상태를 보존한다', async () => {
  h.display.data = { ownerUserId: 1 };
  h.member.isPending = true;
  const guard = guards[0];
  expect(renderToStaticMarkup(guard())).toContain('불러오는 중');
  h.member.isPending = false;
  h.member.error = new ApiError('network', { transportCode: 'ERR_NETWORK' });
  const element = guard();
  expect(renderToStaticMarkup(element)).toContain('네트워크');
  await element.props.refetch();
  expect(h.member.refetch).toHaveBeenCalledTimes(1);
});

it('이미 전시 응답에 팀원이 있으면 불필요한 팀원 조회 오류로 접근을 막지 않는다', () => {
  h.display.data = { ownerUserId: 1, teamMembers: [] };
  h.member.error = new ApiError('forbidden', { status: 403 });
  expect(renderToStaticMarkup(guards[0]())).toContain('정상 권한 판정');
});

it.each([403, 404])('리소스의 HTTP %i 오류를 안내한다', (status) => {
  h.display.error = new ApiError('error', { status });
  expect(renderToStaticMarkup(guards[0]())).toContain(status === 403 ? '권한' : '찾을 수');
});

it('잘못된 ID의 비활성 query를 영구 로딩으로 표시하지 않는다', () => {
  h.params.displayId = 'invalid';
  h.display.isPending = true;
  expect(renderToStaticMarkup(guards[0]())).toContain('찾을 수');
});
