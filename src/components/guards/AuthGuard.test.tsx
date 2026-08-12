import { describe, expect, it, vi } from 'vitest';

import { AuthGuard } from './AuthGuard';

const mocks = vi.hoisted(() => ({
  accessToken: null as string | null,
  location: { pathname: '/private' },
  navigate: vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (state: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: mocks.accessToken }),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();

  return {
    ...actual,
    useState: <T,>(initialValue: T) => [initialValue, vi.fn()] as const,
  };
});

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet" />,
  useLocation: () => mocks.location,
  useNavigate: () => mocks.navigate,
}));

vi.mock('@/components/common/LoginConfirmModal', () => ({
  LoginConfirmModal: ({
    isOpen,
    onClose,
    onConfirm,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
  }) => (
    <div data-testid="login-confirm-modal" data-open={String(isOpen)}>
      <button type="button" onClick={onClose}>
        close
      </button>
      <button type="button" onClick={onConfirm}>
        confirm
      </button>
    </div>
  ),
}));

describe('AuthGuard', () => {
  it('accessToken이 있으면 children을 렌더링한다', () => {
    mocks.accessToken = 'access-token';

    const element = AuthGuard({ children: <div>Protected Content</div> });

    expect(element.props.children.props.children).toBe('Protected Content');
  });

  it('children이 없고 accessToken이 있으면 Outlet을 렌더링한다', () => {
    mocks.accessToken = 'access-token';

    const element = AuthGuard({});

    expect(element.type).toBeTypeOf('function');
    expect(element.type()).toEqual(<div data-testid="outlet" />);
  });

  it('accessToken이 없으면 로그인 확인 모달을 렌더링한다', () => {
    mocks.accessToken = null;

    const element = AuthGuard({ children: <div>Protected Content</div> });

    expect(element.type).toBeTypeOf('function');
    expect(element.props.isOpen).toBe(true);
  });

  it('로그인 확인 시 현재 위치를 state에 담아 로그인 페이지로 이동한다', () => {
    mocks.accessToken = null;
    mocks.location = { pathname: '/private' };
    mocks.navigate.mockClear();

    const element = AuthGuard({ children: <div>Protected Content</div> });

    element.props.onConfirm();

    expect(mocks.navigate).toHaveBeenCalledWith('/login', {
      state: { from: { pathname: '/private' } },
    });
  });
});
