import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/apiError';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { NotFoundView } from '@/components/error-page';
import type { PermissionMap } from '@/types/policy';

import { PermissionGuard } from './PermissionGuard';

const mocks = vi.hoisted(() => ({
  accessToken: null as string | null,
  isPending: false,
  error: null as Error | null,
  refetch: vi.fn(),
  locationState: undefined as unknown,
  artistPolicy: { view: () => true } as PermissionMap<'view'>,
  openArtistVerificationModal: vi.fn(),
  navigate: vi.fn(),
  artistModalOptions: undefined as { onCancel?: () => void } | undefined,
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (state: typeof mocks) => unknown) => selector(mocks),
}));
vi.mock('@/hooks/queries/useUserProfile', () => ({
  useIsUserMePending: () => !!mocks.accessToken && mocks.isPending,
  useUserMe: () => ({ isPending: mocks.isPending, error: mocks.error, refetch: mocks.refetch }),
}));
beforeEach(() => {
  mocks.accessToken = null;
  mocks.isPending = false;
  mocks.error = null;
  mocks.refetch.mockClear();
  mocks.openArtistVerificationModal.mockClear();
});

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();

  return {
    ...actual,
    useEffect: (effect: () => void) => effect(),
  };
});

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
    <div data-testid="navigate" data-replace={String(replace)} data-to={to} />
  ),
  useLocation: () => ({ pathname: '/target', state: mocks.locationState }),
  useNavigate: () => mocks.navigate,
}));

vi.mock('@/components/error-page', () => ({ NotFoundView: () => null }));

vi.mock('@/hooks/usePolicy', () => ({
  useArtistPolicy: () => mocks.artistPolicy,
}));

vi.mock('@/hooks/usePermissionRequiredModal', () => ({
  useArtistVerificationRequiredModal: (options?: { onCancel?: () => void }) => {
    mocks.artistModalOptions = options;
    return {
      artistVerificationModal: <div>Artist Verification Modal</div>,
      openArtistVerificationModal: mocks.openArtistVerificationModal,
    };
  },
}));

function artworkPolicy(
  canCreate: boolean,
): PermissionMap<'create' | 'edit' | 'delete' | 'proxy' | 'reorder'> {
  return {
    create: () => canCreate,
    edit: () => false,
    delete: () => false,
    proxy: () => false,
    reorder: () => false,
  };
}

describe('PermissionGuard', () => {
  it('사용자 조회 장애는 인증/권한 부족으로 처리하지 않고 재조회한다', () => {
    mocks.accessToken = 'token';
    mocks.error = new ApiError('internal', { status: 500 });
    const element = PermissionGuard({ resource: 'artist', action: 'view', children: <div /> });
    expect(element.type).toBe(ErrorView);
    expect(element.props.message).toContain('서버');
    expect(mocks.openArtistVerificationModal).not.toHaveBeenCalled();
    element.props.onRetry();
    expect(mocks.refetch).toHaveBeenCalledTimes(1);
  });
  it.each(['artist', 'artwork'] as const)(
    '%s: 로그인 사용자 조회 중에는 권한을 거부하지 않는다',
    (resource) => {
      mocks.accessToken = 'token';
      mocks.isPending = true;
      mocks.artistPolicy = { view: () => false };
      const element = PermissionGuard({ resource, action: 'view' as never, children: <div /> });
      expect(element.type).toBe(LoadingView);
      expect(mocks.openArtistVerificationModal).not.toHaveBeenCalled();
    },
  );

  it('권한이 있으면 children을 렌더링한다', () => {
    mocks.locationState = undefined;

    const element = PermissionGuard({
      resource: 'artwork',
      action: 'create',
      fallback: '/home',
      policy: artworkPolicy(true),
      children: <div>Permission Content</div>,
    });

    expect(element.props.children.props.children).toBe('Permission Content');
  });

  it('권한이 없으면 fallback으로 replace 이동한다', () => {
    mocks.locationState = undefined;

    const element = PermissionGuard({
      resource: 'artwork',
      action: 'create',
      fallback: '/home',
      policy: artworkPolicy(false),
      children: <div>Permission Content</div>,
    });

    expect(element.type).toBeTypeOf('function');
    expect(element.props).toMatchObject({
      to: '/home',
      replace: true,
    });
  });

  it('fallback이 없으면 권한이 없을 때 이동하지 않고 이 주소에서 404 화면을 보여 준다', () => {
    mocks.locationState = undefined;

    const element = PermissionGuard({
      resource: 'artwork',
      action: 'create',
      policy: artworkPolicy(false),
      children: <div>Permission Content</div>,
    });

    expect(element.type).toBe(NotFoundView);
  });

  it('fallback이 없으면 필수 location.state가 없을 때도 404 화면을 보여 준다', () => {
    mocks.locationState = undefined;

    const element = PermissionGuard({
      resource: 'artwork',
      action: 'create',
      requireState: 'display',
      policy: artworkPolicy(true),
      children: <div>Permission Content</div>,
    });

    expect(element.type).toBe(NotFoundView);
  });

  it('필수 location.state가 없으면 권한이 있어도 fallback으로 replace 이동한다', () => {
    mocks.locationState = undefined;

    const element = PermissionGuard({
      resource: 'artwork',
      action: 'create',
      requireState: 'display',
      fallback: '/home',
      policy: artworkPolicy(true),
      children: <div>Permission Content</div>,
    });

    expect(element.props).toMatchObject({
      to: '/home',
      replace: true,
    });
  });

  it('필수 location.state 배열 중 일부가 없으면 fallback으로 replace 이동한다', () => {
    mocks.locationState = { display: { id: 1 } };

    const element = PermissionGuard({
      resource: 'artwork',
      action: 'create',
      requireState: ['display', 'artwork'],
      fallback: '/home',
      policy: artworkPolicy(true),
      children: <div>Permission Content</div>,
    });

    expect(element.props).toMatchObject({
      to: '/home',
      replace: true,
    });
  });

  it('필수 location.state가 모두 있으면 권한 확인 후 children을 렌더링한다', () => {
    mocks.locationState = { display: { id: 1 }, artwork: { id: 2 } };

    const element = PermissionGuard({
      resource: 'artwork',
      action: 'create',
      requireState: ['display', 'artwork'],
      fallback: '/home',
      policy: artworkPolicy(true),
      children: <div>Permission Content</div>,
    });

    expect(element.props.children.props.children).toBe('Permission Content');
  });

  it('artist.view 권한이 없으면 fallback 대신 작가 인증 모달을 렌더링한다', () => {
    mocks.artistPolicy = { view: () => false };
    mocks.openArtistVerificationModal.mockClear();

    const element = PermissionGuard({
      resource: 'artist',
      action: 'view',
      fallback: '/home',
      children: <div>Artist Content</div>,
    });

    expect(element.props.children.props.children).toBe('Artist Verification Modal');
    expect(mocks.openArtistVerificationModal).toHaveBeenCalledTimes(1);
  });

  it('작가 인증 모달을 닫으면 들어갈 수 없는 화면에 남기지 않고 홈으로 replace 이동한다', () => {
    mocks.artistPolicy = { view: () => false };
    mocks.navigate.mockClear();

    PermissionGuard({
      resource: 'artist',
      action: 'view',
      fallback: '/home',
      children: <div>Artist Content</div>,
    });
    mocks.artistModalOptions?.onCancel?.();

    expect(mocks.navigate).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).toHaveBeenCalledWith('/home', { replace: true });
  });
});
