import { useQuery } from '@tanstack/react-query';
import { Navigate, useParams } from 'react-router-dom';

import { getDisplayInvitationByToken } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import { useReserveRedirectAfterLogin } from '@/hooks/usePendingRedirect';
import { useAuthStore } from '@/stores/authStore';

/* 초대 링크로 들어온 전시를 목록에서 찾을 수 있도록 displayId를 붙입니다. */
const toInvitationListPath = (displayId?: number) =>
  displayId ? `/invitation-request?displayId=${displayId}` : '/invitation-request';

/*
 * 백엔드가 발급하는 초대 URL(/display/invitation/{token})의 착지 지점입니다.
 * 토큰으로 전시를 확인한 뒤 받은 초대 목록 화면으로 넘깁니다.
 * 비로그인 상태면 로그인 후 돌아올 수 있도록 복귀 경로를 남겨둡니다.
 */
export function DisplayInvitationLinkPage() {
  const { token = '' } = useParams();
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.displayInvitations.byToken(token),
    queryFn: () => getDisplayInvitationByToken(token),
    enabled: token.length > 0,
    retry: false,
  });

  const invitationListPath = toInvitationListPath(data?.displayId);

  //복귀 경로 예약
  useReserveRedirectAfterLogin(data ? invitationListPath : null);

  if (!token) return <Navigate to="/invitation-request" replace />;

  if (isLoading) {
    return (
      <div className="w-96 mx-auto h-dvh bg-page flex items-center justify-center">
        <p className="typo-body-sm-regular text-hint">초대 링크를 확인하는 중이에요.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-96 mx-auto h-dvh bg-page flex flex-col items-center justify-center gap-2 px-5">
        <p className="typo-body-md-bold text-main">유효하지 않은 초대 링크예요</p>
        <p className="typo-body-xs-regular text-center text-hint">
          링크가 만료되었거나 대표자가 초대 링크를 비활성화했어요.
        </p>
      </div>
    );
  }

  // 로그인해야 받은 초대 목록을 조회할 수 있습니다.
  if (!accessToken) return <Navigate to="/login" replace />;

  return <Navigate to={invitationListPath} replace />;
}
