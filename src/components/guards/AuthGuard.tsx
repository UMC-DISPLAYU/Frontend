import { type ReactNode, useState } from 'react';

import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { LoginConfirmModal } from '@/components/common/LoginConfirmModal';
import { useAuthStore } from '@/stores/authStore';

type AuthGuardProps = {
  children?: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);

  if (!accessToken) {
    return (
      <LoginConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (window.history.length > 2) {
            navigate(-1);
          } else {
            navigate('/home', { replace: true });
          }
        }}
        onConfirm={() => {
          setIsModalOpen(false);
          navigate('/login', { state: { from: location } });
        }}
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
