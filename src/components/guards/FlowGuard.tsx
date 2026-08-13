import { type ReactNode, useEffect } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { useFlowContext } from '@/components/guards/useFlowContext';

export type FlowStepDefinition = {
  path: string;
  step: string;
  required?: string[];
  fallback?: string;
};

type FlowGuardProps = {
  required?: string[];
  fallback?: string;
  steps?: FlowStepDefinition[];
  children: ReactNode;
};

const normalizePath = (path: string) => path.replace(/\/+$/, '');
const resolveFlowPath = (currentPath: string, currentFlowPath: string, targetFlowPath: string) => {
  const normalizedCurrentFlowPath = normalizePath(currentFlowPath);
  const normalizedTargetFlowPath = normalizePath(targetFlowPath);
  const flowPathIndex = currentPath.indexOf(normalizedCurrentFlowPath);

  if (flowPathIndex >= 0) {
    return currentPath.slice(0, flowPathIndex) + normalizedTargetFlowPath;
  }

  return normalizedTargetFlowPath;
};

const matchesFlowPath = (currentPath: string, flowPath: string) => {
  const normalizedFlowPath = normalizePath(flowPath);

  return currentPath.endsWith(normalizedFlowPath);
};

export function FlowGuard({ required, fallback, steps, children }: FlowGuardProps) {
  const location = useLocation();
  const { completeStep, isStepCompleted } = useFlowContext();
  const currentPath = normalizePath(location.pathname);
  const currentStep = steps?.find((step) => matchesFlowPath(currentPath, step.path));
  const requiredSteps = currentStep?.required ?? required ?? [];
  const fallbackPath = currentStep?.fallback
    ? resolveFlowPath(currentPath, currentStep.path, currentStep.fallback)
    : fallback;
  const canEnter = requiredSteps.every((stepId) => isStepCompleted(stepId));

  useEffect(() => {
    if (!canEnter || !currentStep) return;

    completeStep(currentStep.step);
  }, [canEnter, completeStep, currentStep]);

  if (!canEnter) {
    return fallbackPath ? <Navigate to={fallbackPath} replace /> : null;
  }

  return <>{children}</>;
}
