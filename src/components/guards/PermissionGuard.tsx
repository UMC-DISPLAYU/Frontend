import { type ReactNode, useEffect } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useArtistVerificationRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArtistPolicy } from '@/hooks/usePolicy';
import { useAuthStore } from '@/stores/authStore';
import type { PermissionMap, PolicyAction, PolicyResource } from '@/types/policy';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';

type LocationStateRequirement = string | string[];

type PermissionGuardProps<Resource extends PolicyResource> = {
  resource: Resource;
  action: PolicyAction<Resource>;
  requireState?: LocationStateRequirement;
  fallback?: string;
  policy?: PermissionMap<PolicyAction<Resource>>;
  children: ReactNode;
};

function hasRequiredState(state: unknown, requireState: LocationStateRequirement | undefined) {
  if (!requireState) return true;
  if (!state || typeof state !== 'object') return false;

  const stateRecord = state as Record<string, unknown>;
  const requiredKeys = Array.isArray(requireState) ? requireState : [requireState];

  return requiredKeys.every((key) => stateRecord[key] !== undefined && stateRecord[key] !== null);
}

export function PermissionGuard<Resource extends PolicyResource>({
  resource,
  action,
  requireState,
  fallback = '/403',
  policy,
  children,
}: PermissionGuardProps<Resource>) {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { isPending, error, refetch } = useUserMe();
  const waitingForUser = !!accessToken && isPending;
  const artistPolicy = useArtistPolicy();
  const { artistVerificationModal, openArtistVerificationModal } =
    useArtistVerificationRequiredModal();

  const satisfiesState = hasRequiredState(location.state, requireState);
  const resolvedPolicy = resource === 'artist' ? artistPolicy : policy;
  const canEnter = resolvedPolicy
    ? hasPermission(resolvedPolicy as PermissionMap, action as keyof PermissionMap)
    : false;
  const shouldShowArtistModal =
    !waitingForUser && !error && resource === 'artist' && action === 'view' && !canEnter;

  useEffect(() => {
    if (shouldShowArtistModal) {
      openArtistVerificationModal();
    }
  }, [openArtistVerificationModal, shouldShowArtistModal]);

  if (waitingForUser) return <LoadingView />;
  if (accessToken && error)
    return (
      <ErrorView
        message={getErrorMessage(error, '사용자 정보를 확인하지 못했어요. 다시 시도해주세요.')}
        onRetry={() => {
          void refetch();
        }}
      />
    );

  if (!satisfiesState) {
    return <Navigate to={fallback} replace />;
  }

  if (shouldShowArtistModal) {
    return <>{artistVerificationModal}</>;
  }

  if (!canEnter) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
