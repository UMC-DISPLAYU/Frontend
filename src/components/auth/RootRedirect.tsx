import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

export function RootRedirect() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return <Navigate to={accessToken ? '/home' : '/login'} replace />;
}
