import { useQuery } from '@tanstack/react-query';
import { Navigate, useParams } from 'react-router-dom';

import { ApiError } from '@/api/apiError';
import { getDisplayInvitationByToken } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import { ErrorView } from '@/components/common/ErrorView';
import { getErrorMessage } from '@/utils/error';

/* 초대 링크로 들어온 전시를 목록에서 찾을 수 있도록 displayId를 붙입니다. */
const toInvitationListPath = (displayId?: number) =>
  displayId ? `/invitation-request?displayId=${displayId}` : '/invitation-request';

/*
 * 백엔드가 발급하는 초대 URL(/display/invitation/{token})의 착지 지점입니다.
 * 토큰으로 전시를 확인한 뒤 받은 초대 목록 화면으로 넘깁니다.
 * 초대 목록은 보호 화면이라, 비로그인이면 AuthGuard가 그 위에 로그인 모달을 띄우고 로그인 후 돌아옵니다.
 */
export function DisplayInvitationLinkPage() {
  const { token = '' } = useParams();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.displayInvitations.byToken(token),
    queryFn: () => getDisplayInvitationByToken(token),
    enabled: token.length > 0,
    retry: false,
  });

  const invitationListPath = toInvitationListPath(data?.displayId);

  if (!token) return <Navigate to="/invitation-request" replace />;

  if (isLoading) {
    return (
      <div className="w-96 mx-auto h-dvh bg-page flex items-center justify-center">
        <p className="typo-body-sm-regular text-hint">초대 링크를 확인하는 중이에요.</p>
      </div>
    );
  }

  if (
    error &&
    !(
      error instanceof ApiError &&
      [
        'INVALID_DISPLAY_INVITATION_TOKEN',
        'DISPLAY_INVITATION_DISABLED',
        'DISPLAY_INVITATION_NOT_ISSUED',
      ].includes(error.code ?? '') &&
      (error.status ?? 0) < 500
    )
  ) {
    return (
      <ErrorView
        message={getErrorMessage(error, '초대 링크를 확인하지 못했어요. 다시 시도해주세요.')}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (error) {
    return (
      <div className="w-96 mx-auto h-dvh bg-page flex flex-col items-center justify-center gap-2 px-5">
        <p className="typo-body-md-bold text-main">유효하지 않은 초대 링크예요</p>
        <p className="typo-body-xs-regular text-center text-hint">
          링크가 만료되었거나 대표자가 초대 링크를 비활성화했어요.
        </p>
      </div>
    );
  }

  return <Navigate to={invitationListPath} replace />;
}
