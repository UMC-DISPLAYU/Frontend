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
  'flex h-12 w-full cursor-pointer items-center justify-center rounded-[12px] bg-[#18181b] text-[16px] font-semibold tracking-[-0.03em] text-[#fff] transition-[background-color,transform] duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-[#2f2f35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-[.99] disabled:cursor-default disabled:bg-[#f4f4f5] disabled:text-[#d4d4d8] disabled:active:scale-100';

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

/*
 * 프로토타입 빈 상태(.none · .mnone) 안내를 가운데에 두고, 버튼은 다른 화면처럼 아래 .cta 자리에 붙인다.
 * .page: 폰 최대 480 · 태블릿부터 672, .cta: sticky 아래, 위 20 · 아래 max(16px, safe area), 흰 그라데이션.
 */
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
  const hasButton = Boolean(onRetry || action);

  return (
    <div className="min-h-dvh bg-[#fff]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 tracking-[-0.03em] break-keep tablet:max-w-[672px] tablet:px-8 desktop:px-10">
        <section
          role={busy ? 'status' : undefined}
          aria-busy={busy || undefined}
          className="flex flex-1 flex-col items-center justify-center text-center"
        >
          <h1 className="text-[16px] leading-[1.4] font-semibold tracking-[-0.03em] text-[#18181b]">
            {title}
          </h1>
          <p className="mt-1 text-[14px] leading-[1.4] font-medium tracking-[-0.03em] text-[#71717b]">
            {description}
          </p>
        </section>
        {hasButton && (
          <div className="sticky bottom-0 z-5 bg-linear-to-b from-[rgba(255,255,255,0)] to-[#fff] to-28% pt-5 pb-[max(16px,env(safe-area-inset-bottom))]">
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
          </div>
        )}
      </div>
    </div>
  );
}
