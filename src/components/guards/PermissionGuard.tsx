import { type ReactNode, useEffect } from 'react';

import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { NotFoundView } from '@/components/error-page';
import { useIsUserMePending, useUserMe } from '@/hooks/queries/useUserProfile';
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
  /** 들어갈 수 없을 때 보낼 경로. 없으면 이 주소에서 404 화면을 보여 준다(권한 없는 화면이 있는지 알리지 않는다) */
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
  fallback,
  policy,
  children,
}: PermissionGuardProps<Resource>) {
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const waitingForUser = useIsUserMePending();
  const { error, refetch } = useUserMe();
  const artistPolicy = useArtistPolicy();
  // 이 화면은 인증 없이 보여줄 내용이 없어, 모달을 닫으면 로그인 안내(AuthGuard)처럼 홈으로 보낸다
  const { artistVerificationModal, openArtistVerificationModal } =
    useArtistVerificationRequiredModal({
      title: '이 화면을 보려면\n작가 인증이 필요해요',
      description: '학교 이메일로 인증한 뒤\n이용할 수 있어요',
      onCancel: () => void navigate('/home', { replace: true }),
    });

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

  const denied = fallback ? <Navigate to={fallback} replace /> : <NotFoundView />;

  if (!satisfiesState) return denied;

  if (shouldShowArtistModal) {
    return <>{artistVerificationModal}</>;
  }

  if (!canEnter) return denied;

  return <>{children}</>;
}
