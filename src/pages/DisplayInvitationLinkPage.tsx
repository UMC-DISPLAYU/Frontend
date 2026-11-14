import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { ApiError } from '@/api/apiError';
import { getDisplayInvitationByToken } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import { getErrorMessage } from '@/utils/error';

/* 받은 초대 경로. 마이로 이동해 받은 초대 시트를 엽니다. */
const INVITATION_LIST_PATH = '/invitation-request';

const INVALID_LINK_CODES = [
  'INVALID_DISPLAY_INVITATION_TOKEN',
  'DISPLAY_INVITATION_DISABLED',
  'DISPLAY_INVITATION_NOT_ISSUED',
];

const isInvalidLinkError = (error: unknown) =>
  error instanceof ApiError &&
  INVALID_LINK_CODES.includes(error.code ?? '') &&
  (error.status ?? 0) < 500;

/* 프로토타입 큰 버튼(.big): 높이 48, 검정, 16px · 600 */
const BIG_BUTTON_CLASS =
  'mt-6 flex h-12 w-full items-center justify-center rounded-[12px] bg-[#18181b] text-[16px] font-semibold tracking-[-0.03em] text-[#fff] transition-[background-color,transform] duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-[#2f2f35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-[.99] disabled:cursor-default disabled:bg-[#f4f4f5] disabled:text-[#d4d4d8] disabled:active:scale-100';

/*
 * 백엔드가 발급하는 초대 URL(/display/invitation/{token})의 착지 지점입니다.
 * 토큰으로 전시를 확인한 뒤(이때 서버가 대기 중인 초대를 만듭니다) 마이의 받은 초대 시트로 넘깁니다.
 * 마이는 보호 화면이라, 비로그인이면 AuthGuard가 그 위에 로그인 모달을 띄우고 로그인 후 돌아옵니다.
 */
export function DisplayInvitationLinkPage() {
  const { token = '' } = useParams();

  const { isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.displayInvitations.byToken(token),
    queryFn: () => getDisplayInvitationByToken(token),
    enabled: token.length > 0,
    retry: false,
  });

  if (!token) return <Navigate to={INVITATION_LIST_PATH} replace />;

  if (isLoading) {
    return (
      <InvitationLinkState
        busy
        title="초대 링크를 확인하고 있어요"
        description="잠시만 기다려 주세요"
      />
    );
  }

  if (error && !isInvalidLinkError(error)) {
    return (
      <InvitationLinkState
        title="초대 링크를 확인하지 못했어요"
        description={getErrorMessage(error, '잠시 후 다시 시도해 주세요')}
        retryDisabled={isFetching}
        onRetry={() => void refetch()}
      />
    );
  }

  if (error) {
    return (
      <InvitationLinkState
        title="유효하지 않은 초대 링크예요"
        description="링크가 만료되었거나 대표자가 초대 링크를 껐어요"
        action={
          <Link to="/home" replace className={BIG_BUTTON_CLASS}>
            홈으로 가기
          </Link>
        }
      />
    );
  }

  return <Navigate to={INVITATION_LIST_PATH} replace />;
}

/* 프로토타입 빈 상태(.none · .mnone)와 큰 버튼(.big) 값으로 만든 화면 가운데 안내 */
function InvitationLinkState({
  title,
  description,
  busy = false,
  action,
  retryDisabled = false,
  onRetry,
}: {
  title: string;
  description: string;
  busy?: boolean;
  action?: ReactNode;
  retryDisabled?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#fff] px-5 tablet:px-8 desktop:px-10">
      <section
        role={busy ? 'status' : undefined}
        aria-busy={busy || undefined}
        className="flex w-full max-w-[440px] flex-col items-center text-center tracking-[-0.03em] break-keep tablet:max-w-[592px]"
      >
        <h1 className="text-[16px] leading-[1.4] font-semibold tracking-[-0.03em] text-[#18181b]">
          {title}
        </h1>
        <p className="mt-1 text-[14px] leading-[1.4] font-medium tracking-[-0.03em] text-[#71717b]">
          {description}
        </p>
        {onRetry && (
          <button
            type="button"
            disabled={retryDisabled}
            onClick={onRetry}
            className={BIG_BUTTON_CLASS}
          >
            다시 시도
          </button>
        )}
        {action}
      </section>
    </div>
  );
}
