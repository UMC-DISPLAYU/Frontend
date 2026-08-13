import {
  createContext,
  createElement,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type FlowState = {
  completedSteps: string[];
  currentFlow: string;
  entryHistoryIndex: number | null;
  completedBackHistoryIndex: number | null;
};

type FlowContextValue = FlowState & {
  startFlow: (flowId: string, entryHistoryIndex?: number | null) => void;
  completeFlow: () => void;
  consumeCompletedFlowBackIndex: () => number | null;
  completeStep: (stepId: string) => void;
  resetFlow: (flowId: string) => void;
  isStepCompleted: (stepId: string) => boolean;
};

const FlowContext = createContext<FlowContextValue | null>(null);

type FlowProviderProps = {
  children: ReactNode;
  initialFlow?: string;
};

export function FlowProvider({ children, initialFlow = '' }: FlowProviderProps) {
  const [state, setState] = useState<FlowState>({
    completedSteps: [],
    currentFlow: initialFlow,
    entryHistoryIndex: null,
    completedBackHistoryIndex: null,
  });

  const startFlow = useCallback((flowId: string, entryHistoryIndex: number | null = null) => {
    setState({
      completedSteps: [],
      currentFlow: flowId,
      entryHistoryIndex,
      completedBackHistoryIndex: null,
    });
  }, []);

  const completeFlow = useCallback(() => {
    setState((prev) => ({
      ...prev,
      completedBackHistoryIndex:
        prev.entryHistoryIndex === null ? null : Math.max(prev.entryHistoryIndex - 1, 0),
    }));
  }, []);

  const consumeCompletedFlowBackIndex = useCallback(() => {
    let completedBackHistoryIndex: number | null = null;

    setState((prev) => {
      completedBackHistoryIndex = prev.completedBackHistoryIndex;

      if (completedBackHistoryIndex === null) return prev;

      return {
        ...prev,
        completedBackHistoryIndex: null,
      };
    });

    return completedBackHistoryIndex;
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setState((prev) => {
      if (prev.completedSteps.includes(stepId)) return prev;

      return {
        ...prev,
        completedSteps: [...prev.completedSteps, stepId],
      };
    });
  }, []);

  const resetFlow = useCallback((flowId: string) => {
    setState({
      completedSteps: [],
      currentFlow: flowId,
      entryHistoryIndex: null,
      completedBackHistoryIndex: null,
    });
  }, []);

  const isStepCompleted = useCallback(
    (stepId: string) => state.completedSteps.includes(stepId),
    [state.completedSteps],
  );

  const value = useMemo(
    () => ({
      completedSteps: state.completedSteps,
      currentFlow: state.currentFlow,
      entryHistoryIndex: state.entryHistoryIndex,
      completedBackHistoryIndex: state.completedBackHistoryIndex,
      startFlow,
      completeFlow,
      consumeCompletedFlowBackIndex,
      completeStep,
      resetFlow,
      isStepCompleted,
    }),
    [
      completeFlow,
      completeStep,
      consumeCompletedFlowBackIndex,
      isStepCompleted,
      resetFlow,
      startFlow,
      state.completedBackHistoryIndex,
      state.completedSteps,
      state.currentFlow,
      state.entryHistoryIndex,
    ],
  );

  return createElement(FlowContext.Provider, { value }, children);
}

export function useFlowContextValue() {
  const context = useContext(FlowContext);

  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }

  return context;
}

export function useOptionalFlowContextValue() {
  return useContext(FlowContext);
}
