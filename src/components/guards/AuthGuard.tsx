import { type ReactNode, useState } from 'react';

import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { LoadingView } from '@/components/common/LoadingView';
import { LoginConfirmModal } from '@/components/common/LoginConfirmModal';
import { useIsUserMePending } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useAuthStore } from '@/stores/authStore';

type AuthGuardProps = {
  children?: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();
  const navigate = useNavigate();
  const flowBack = useFlowBack();
  const [isModalOpen, setIsModalOpen] = useState(true);
  /* 보호된 화면은 소유자·팀원 여부로 UI가 갈리므로 사용자 정보를 받은 뒤 렌더링합니다. */
  const isUserPending = useIsUserMePending();

  if (!accessToken) {
    return (
      <LoginConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          flowBack();
        }}
        onConfirm={() => {
          setIsModalOpen(false);
          navigate('/login', { state: { from: location } });
        }}
      />
    );
  }

  if (isUserPending) return <LoadingView />;

  return children ? <>{children}</> : <Outlet />;
}
