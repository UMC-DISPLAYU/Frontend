import { type ReactNode } from 'react';

import { Outlet, useNavigate } from 'react-router-dom';

import { LoadingView } from '@/components/common/LoadingView';
import { LoginConfirmModal } from '@/components/common/LoginConfirmModal';
import { useIsUserMePending } from '@/hooks/queries/useUserProfile';
import { useSocialLogin } from '@/hooks/useSocialLogin';
import { useAuthStore } from '@/stores/authStore';

type AuthGuardProps = {
  children?: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();
  /* 로그인하면 지금 들어온 보호 화면으로 돌아옵니다. */
  const { startLogin, isPending, error } = useSocialLogin();
  /* 보호된 화면은 소유자·팀원 여부로 UI가 갈리므로 사용자 정보를 받은 뒤 렌더링합니다. */
  const isUserPending = useIsUserMePending();

  if (!accessToken) {
    /* 보호 화면은 로그인 없이 그릴 데이터가 없어 모달만 띄우고, 건너뛰면 홈으로 보냅니다. */
    return (
      <LoginConfirmModal
        open
        onClose={() => navigate('/home', { replace: true })}
        onLogin={(provider) => void startLogin(provider)}
        isPending={isPending}
        error={error}
      />
    );
  }

  if (isUserPending) return <LoadingView />;

  return children ? <>{children}</> : <Outlet />;
}
