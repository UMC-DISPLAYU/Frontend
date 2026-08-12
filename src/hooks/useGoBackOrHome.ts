import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

export function useGoBackOrHome() {
  const navigate = useNavigate();

  return useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/', { replace: true });
  }, [navigate]);
}
