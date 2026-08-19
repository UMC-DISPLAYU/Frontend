import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

type FlowState = {
  completedSteps: string[];
  currentFlow: string;
};

type FlowContextValue = FlowState & {
  startFlow: (flowId: string, entryHistoryIndex?: number | null) => void;
  completeFlow: () => number | null;
  consumeCompletedFlowBackIndex: () => number | null;
  completeStep: (stepId: string) => void;
  resetFlow: (flowId: string) => void;
  isStepCompleted: (stepId: string) => boolean;
};

const FlowContext = createContext<FlowContextValue | null>(null);

type FlowProviderProps = {
  children: ReactNode;
  initialEntryHistoryIndex?: number | null;
  initialFlow?: string;
};

export function FlowProvider({
  children,
  initialEntryHistoryIndex = null,
  initialFlow = '',
}: FlowProviderProps) {
  const [state, setState] = useState<FlowState>({
    completedSteps: [],
    currentFlow: initialFlow,
  });
  const entryHistoryIndexRef = useRef<number | null>(initialEntryHistoryIndex);
  const completedBackHistoryIndexRef = useRef<number | null>(null);

  const startFlow = useCallback((flowId: string, entryHistoryIndex: number | null = null) => {
    entryHistoryIndexRef.current = entryHistoryIndex;
    completedBackHistoryIndexRef.current = null;

    setState({
      completedSteps: [],
      currentFlow: flowId,
    });
  }, []);

  const completeFlow = useCallback(() => {
    const completedBackHistoryIndex =
      entryHistoryIndexRef.current === null ? null : Math.max(entryHistoryIndexRef.current - 1, 0);

    completedBackHistoryIndexRef.current = completedBackHistoryIndex;

    return completedBackHistoryIndex;
  }, []);

  const consumeCompletedFlowBackIndex = useCallback(() => {
    const completedBackHistoryIndex = completedBackHistoryIndexRef.current;
    completedBackHistoryIndexRef.current = null;
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
    entryHistoryIndexRef.current = null;
    completedBackHistoryIndexRef.current = null;

    setState({
      completedSteps: [],
      currentFlow: flowId,
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
      state.completedSteps,
      state.currentFlow,
    ],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFlowContextValue() {
  const context = useContext(FlowContext);

  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }

  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOptionalFlowContextValue() {
  return useContext(FlowContext);
}
