import { useCallback } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useOptionalFlowContextValue } from '@/contexts/FlowContext';

type CompletedFlowLocationState = {
  completedFlowBackIndex?: number | null;
};

export function useFlowBack() {
  const location = useLocation();
  const navigate = useNavigate();
  const flow = useOptionalFlowContextValue();

  return useCallback(() => {
    const currentHistoryIndex = window.history.state?.idx;
    const completedBackHistoryIndex =
      flow?.consumeCompletedFlowBackIndex() ??
      (location.state as CompletedFlowLocationState | null)?.completedFlowBackIndex;

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
  }, [flow, location.state, navigate]);
}
