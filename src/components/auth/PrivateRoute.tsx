import { useState } from 'react';

import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { LoginConfirmModal } from '@/components/common/LoginConfirmModal';
import { useGoBackOrHome } from '@/hooks/useGoBackOrHome';
import { useAuthStore } from '@/stores/authStore';

export function PrivateRoute({ children }: { children?: React.ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();
  const navigate = useNavigate();
  const goBackOrHome = useGoBackOrHome();
  const [isModalOpen, setIsModalOpen] = useState(true);

  if (!accessToken) {
    return (
      <LoginConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          goBackOrHome();
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
