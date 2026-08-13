import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import { useOptionalFlowContextValue } from '@/contexts/flowContext';

export function useFlowBack() {
  const navigate = useNavigate();
  const flow = useOptionalFlowContextValue();

  return useCallback(() => {
    const currentHistoryIndex = window.history.state?.idx;
    const completedBackHistoryIndex = flow?.consumeCompletedFlowBackIndex();

    if (
      typeof currentHistoryIndex === 'number' &&
      typeof completedBackHistoryIndex === 'number' &&
      completedBackHistoryIndex < currentHistoryIndex
    ) {
      navigate(completedBackHistoryIndex - currentHistoryIndex);
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/', { replace: true });
  }, [flow, navigate]);
}
