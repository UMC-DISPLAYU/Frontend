import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoadingView } from '@/components/common/LoadingView';
import { LoginConfirmModal } from '@/components/common/LoginConfirmModal';

import { AuthGuard } from './AuthGuard';

const mocks = vi.hoisted(() => ({
  accessToken: null as string | null,
  isUserPending: false,
  navigate: vi.fn(),
  startLogin: vi.fn(),
  socialLogin: { isPending: false, error: '' },
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (state: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: mocks.accessToken }),
}));

vi.mock('@/hooks/queries/useUserProfile', () => ({
  useIsUserMePending: () => mocks.isUserPending,
}));

vi.mock('@/hooks/useSocialLogin', () => ({
  useSocialLogin: () => ({
    startLogin: mocks.startLogin,
    isPending: mocks.socialLogin.isPending,
    error: mocks.socialLogin.error,
    resetError: vi.fn(),
  }),
}));

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet" />,
  useNavigate: () => mocks.navigate,
}));

vi.mock('@/components/common/LoginConfirmModal', () => ({
  LoginConfirmModal: () => null,
}));

beforeEach(() => {
  mocks.accessToken = null;
  mocks.isUserPending = false;
  mocks.socialLogin = { isPending: false, error: '' };
  vi.clearAllMocks();
});

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

  it('로그인 사용자 정보를 받는 중에는 children 대신 로딩 화면을 렌더링한다', () => {
    mocks.accessToken = 'access-token';
    mocks.isUserPending = true;

    const element = AuthGuard({ children: <div>Protected Content</div> });

    expect(element.type).toBe(LoadingView);
  });

  it('accessToken이 없으면 보호 화면 대신 열린 로그인 모달만 렌더링한다', () => {
    const element = AuthGuard({ children: <div>Protected Content</div> });

    expect(element.type).toBe(LoginConfirmModal);
    expect(element.props.open).toBe(true);
    expect(element.props.children).toBeUndefined();
  });

  it('빈 문자열 accessToken도 비로그인으로 보고 로그인 모달을 띄운다', () => {
    mocks.accessToken = '';

    const element = AuthGuard({ children: <div>Protected Content</div> });

    expect(element.type).toBe(LoginConfirmModal);
  });

  it('비로그인 상태에서는 사용자 정보를 받는 중이어도 로딩 대신 로그인 모달을 띄운다', () => {
    mocks.isUserPending = true;

    const element = AuthGuard({ children: <div>Protected Content</div> });

    expect(element.type).toBe(LoginConfirmModal);
  });

  it.each(['kakao', 'google'] as const)('%s 버튼을 누르면 소셜 로그인을 시작한다', (provider) => {
    const element = AuthGuard({ children: <div>Protected Content</div> });

    element.props.onLogin(provider);

    expect(mocks.startLogin).toHaveBeenCalledWith(provider);
  });

  it('비회원으로 계속 둘러보면 보호 화면 기록을 홈으로 바꾼다', () => {
    const element = AuthGuard({ children: <div>Protected Content</div> });

    element.props.onClose();

    expect(mocks.navigate).toHaveBeenCalledWith('/home', { replace: true });
    expect(mocks.startLogin).not.toHaveBeenCalled();
  });

  it('로그인 요청 중 상태와 오류 문구를 모달에 넘긴다', () => {
    mocks.socialLogin = { isPending: true, error: '로그인 연결에 실패했어요.' };

    const element = AuthGuard({ children: <div>Protected Content</div> });

    expect(element.props.isPending).toBe(true);
    expect(element.props.error).toBe('로그인 연결에 실패했어요.');
  });
});
