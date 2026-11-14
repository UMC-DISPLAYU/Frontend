import { useId } from 'react';

import googleIcon from '@/assets/onboarding/googleIcon.svg';
import kakaoIcon from '@/assets/onboarding/kakaoIcon.svg';
import { type DialogEnterAnimation, useModalDialog } from '@/hooks/useModalDialog';
import { cn } from '@/utils/cn';

type LoginProvider = 'kakao' | 'google';

type LoginConfirmModalProps = {
  open: boolean;
  /** 비회원으로 계속 둘러보기 · 배경 탭 · ESC · 뒤로가기 */
  onClose: () => void;
  onLogin: (provider: LoginProvider) => void;
  isPending?: boolean;
  error?: string;
};

// 프로토타입 auth.js: 768px 미만은 아래에서 올라오는 바텀시트, 이상은 가운데 모달
const EASE = 'cubic-bezier(.2,.8,.2,1)';
const getEnterAnimation = (): DialogEnterAnimation =>
  window.matchMedia('(min-width: 768px)').matches
    ? {
        keyframes: [{ opacity: 0, transform: 'translateY(8px) scale(.98)' }, {}],
        options: { duration: 220, easing: EASE },
      }
    : {
        keyframes: [{ transform: 'translateY(100%)' }, {}],
        options: { duration: 300, easing: EASE },
      };

const SOCIAL_BUTTON =
  'relative flex h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] text-[16px] font-semibold [transition:transform_.15s,filter_.2s] active:scale-98 disabled:cursor-default disabled:bg-secondary disabled:text-disable';

export function LoginConfirmModal({
  open,
  onClose,
  onLogin,
  isPending = false,
  error,
}: LoginConfirmModalProps) {
  const titleId = useId();
  const { dialogRef, requestClose, handleCancel, handleBackdropClick } = useModalDialog(
    open,
    onClose,
    getEnterAnimation,
  );

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className="fixed inset-x-0 top-auto bottom-0 m-0 w-full max-w-full rounded-t-[20px] border-0 bg-[#fff] px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] text-left text-[12px] leading-[1.4] font-medium tracking-[-0.03em] text-[#18181b] [&_*]:tracking-[-0.03em] backdrop:bg-[rgba(0,0,0,0.45)] tablet:inset-0 tablet:m-auto tablet:w-[min(322px,calc(100vw-80px))] tablet:max-w-none tablet:rounded-[20px] tablet:pt-6 tablet:pb-5 tablet:shadow-[0_10px_40px_rgba(0,0,0,0.12)]"
    >
      <span
        aria-hidden="true"
        className="mx-auto mb-5 block h-1 w-9 rounded-[9999px] bg-[#e4e4e7] tablet:hidden"
      />
      <h2 id={titleId} className="text-[20px] leading-[1.4] font-semibold">
        로그인이 필요해요
      </h2>

      <div className="mt-5 grid gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => onLogin('kakao')}
          className={cn(
            SOCIAL_BUTTON,
            'bg-[#fee500] text-[rgba(0,0,0,0.85)] hover:brightness-[.97]',
          )}
        >
          <img src={kakaoIcon} alt="" aria-hidden="true" className="absolute left-[18px] size-5" />
          카카오로 시작하기
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => onLogin('google')}
          className={cn(
            SOCIAL_BUTTON,
            'border border-[#d4d4d8] bg-[#fff] text-[#18181b] hover:bg-[#f4f4f5]',
          )}
        >
          <img src={googleIcon} alt="" aria-hidden="true" className="absolute left-[18px] size-5" />
          Google로 시작하기
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-center text-[12px] font-medium text-error">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={requestClose}
        className="mx-auto mt-4 block cursor-pointer px-2 py-1 text-[12px] font-medium text-[#71717b] underline underline-offset-3"
      >
        비회원으로 계속 둘러보기
      </button>
    </dialog>
  );
}
