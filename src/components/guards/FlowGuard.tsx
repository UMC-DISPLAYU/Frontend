import { type ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { useFlowContext } from '@/components/guards/useFlowContext';

type FlowGuardProps = {
  required: string[];
  fallback: string;
  children: ReactNode;
};

export function FlowGuard({ required, fallback, children }: FlowGuardProps) {
  const { isStepCompleted } = useFlowContext();
  const canEnter = required.every((stepId) => isStepCompleted(stepId));

  if (!canEnter) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
