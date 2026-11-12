import googleIcon from '@/assets/onboarding/googleIcon.svg';
import kakaoIcon from '@/assets/onboarding/kakaoIcon.svg';
import { Overlay } from '@/components/ui';
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

const SOCIAL_BUTTON =
  'relative flex h-13.5 w-full cursor-pointer items-center justify-center rounded-12 typography-body-xl-semibold transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-secondary disabled:text-disable';

export function LoginConfirmModal({
  open,
  onClose,
  onLogin,
  isPending = false,
  error,
}: LoginConfirmModalProps) {
  return (
    <Overlay
      open={open}
      onClose={onClose}
      title="로그인이 필요해요"
      size="sm"
      showCloseButton={false}
    >
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          disabled={isPending}
          onClick={() => onLogin('kakao')}
          className={cn(SOCIAL_BUTTON, 'bg-kakao text-kakao hover:brightness-[.97]')}
        >
          <img src={kakaoIcon} alt="" aria-hidden="true" className="absolute left-4.5 size-5" />
          카카오로 시작하기
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => onLogin('google')}
          className={cn(
            SOCIAL_BUTTON,
            'border border-primary bg-primary-white text-primary hover:bg-secondary',
          )}
        >
          <img src={googleIcon} alt="" aria-hidden="true" className="absolute left-4.5 size-5" />
          Google로 시작하기
        </button>
      </div>

      {error && (
        <p role="alert" className="typography-body-md-medium mt-3 text-center text-error">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onClose}
        className="typography-body-md-medium mx-auto mt-1.5 flex min-h-11 cursor-pointer items-center px-2 text-tertiary underline underline-offset-3 focus-visible:outline-2 focus-visible:outline-focus"
      >
        비회원으로 계속 둘러보기
      </button>
    </Overlay>
  );
}
