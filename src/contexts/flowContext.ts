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
};

type FlowContextValue = FlowState & {
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
  });

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
      completeStep,
      resetFlow,
      isStepCompleted,
    }),
    [completeStep, isStepCompleted, resetFlow, state.completedSteps, state.currentFlow],
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
