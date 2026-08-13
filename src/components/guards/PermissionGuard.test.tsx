import { describe, expect, it, vi } from 'vitest';

import type { PermissionMap } from '@/types/policy';

import { PermissionGuard } from './PermissionGuard';

const mocks = vi.hoisted(() => ({
  locationState: undefined as unknown,
  artistPolicy: { view: () => true } as PermissionMap<'view'>,
  openArtistVerificationModal: vi.fn(),
}));

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
}));

vi.mock('@/hooks/usePolicy', () => ({
  useArtistPolicy: () => mocks.artistPolicy,
}));

vi.mock('@/hooks/usePermissionRequiredModal', () => ({
  useArtistVerificationRequiredModal: () => ({
    artistVerificationModal: <div>Artist Verification Modal</div>,
    openArtistVerificationModal: mocks.openArtistVerificationModal,
  }),
}));

function artworkPolicy(
  canCreate: boolean,
): PermissionMap<'create' | 'edit' | 'delete' | 'reorder'> {
  return {
    create: () => canCreate,
    edit: () => false,
    delete: () => false,
    reorder: () => false,
  };
}

describe('PermissionGuard', () => {
  it('권한이 있으면 children을 렌더링한다', () => {
    mocks.locationState = undefined;

    const element = PermissionGuard({
      resource: 'artwork',
      action: 'create',
      fallback: '/403',
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
      fallback: '/403',
      policy: artworkPolicy(false),
      children: <div>Permission Content</div>,
    });

    expect(element.type).toBeTypeOf('function');
    expect(element.props).toMatchObject({
      to: '/403',
      replace: true,
    });
  });

  it('필수 location.state가 없으면 권한이 있어도 fallback으로 replace 이동한다', () => {
    mocks.locationState = undefined;

    const element = PermissionGuard({
      resource: 'artwork',
      action: 'create',
      requireState: 'display',
      fallback: '/403',
      policy: artworkPolicy(true),
      children: <div>Permission Content</div>,
    });

    expect(element.props).toMatchObject({
      to: '/403',
      replace: true,
    });
  });

  it('필수 location.state 배열 중 일부가 없으면 fallback으로 replace 이동한다', () => {
    mocks.locationState = { display: { id: 1 } };

    const element = PermissionGuard({
      resource: 'artwork',
      action: 'create',
      requireState: ['display', 'artwork'],
      fallback: '/403',
      policy: artworkPolicy(true),
      children: <div>Permission Content</div>,
    });

    expect(element.props).toMatchObject({
      to: '/403',
      replace: true,
    });
  });

  it('필수 location.state가 모두 있으면 권한 확인 후 children을 렌더링한다', () => {
    mocks.locationState = { display: { id: 1 }, artwork: { id: 2 } };

    const element = PermissionGuard({
      resource: 'artwork',
      action: 'create',
      requireState: ['display', 'artwork'],
      fallback: '/403',
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
      fallback: '/403',
      children: <div>Artist Content</div>,
    });

    expect(element.props.children.props.children).toBe('Artist Verification Modal');
    expect(mocks.openArtistVerificationModal).toHaveBeenCalledTimes(1);
  });
});
