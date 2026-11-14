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
  'relative flex h-13.5 w-full cursor-pointer items-center justify-center rounded-12 typography-body-xl-semibold transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-[.98] disabled:cursor-default disabled:bg-secondary disabled:text-disable';

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
      // 공용 Overlay 제목(700)과 달리 프로토타입 로그인 안내 제목은 600이다
      title={<span className="font-semibold">로그인이 필요해요</span>}
      size="sm"
      showCloseButton={false}
      // 프로토타입: 모달 폭 322px · 그림자, 바텀시트 하단 여백 20px + safe area
      className="pb-[calc(20px+env(safe-area-inset-bottom))] tablet:max-w-80.5 tablet:shadow-[0_10px_40px_rgba(0,0,0,0.12)]"
      footer={
        // 터치 영역(44px)은 유지하고, 보이는 글자 위아래 간격은 프로토타입(버튼과 20px, 하단 24px)에 맞춘다
        <button
          type="button"
          onClick={onClose}
          className="typography-body-md-medium mx-auto -mt-3.5 -mb-2.5 flex min-h-11 cursor-pointer items-center px-2 text-tertiary underline underline-offset-3 focus-visible:outline-2 focus-visible:outline-focus"
        >
          비회원으로 계속 둘러보기
        </button>
      }
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
    </Overlay>
  );
}
