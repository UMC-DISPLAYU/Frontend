import { type ReactNode, useEffect } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { useArtistVerificationRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArtistPolicy } from '@/hooks/usePolicy';
import type { PermissionMap, PolicyAction, PolicyResource } from '@/types/policy';
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
  const artistPolicy = useArtistPolicy();
  const { artistVerificationModal, openArtistVerificationModal } =
    useArtistVerificationRequiredModal();

  const satisfiesState = hasRequiredState(location.state, requireState);
  const resolvedPolicy = resource === 'artist' ? artistPolicy : policy;
  const canEnter = resolvedPolicy
    ? hasPermission(resolvedPolicy as PermissionMap, action as keyof PermissionMap)
    : false;
  const shouldShowArtistModal = resource === 'artist' && action === 'view' && !canEnter;

  useEffect(() => {
    if (shouldShowArtistModal) {
      openArtistVerificationModal();
    }
  }, [openArtistVerificationModal, shouldShowArtistModal]);

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
