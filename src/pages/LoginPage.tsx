import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import displayuLogo from '@/assets/brand/DUfontlogo.svg';
import googleIcon from '@/assets/onboarding/googleIcon.svg';
import kakaoIcon from '@/assets/onboarding/kakaoIcon.svg';
import onboardingSplash from '@/assets/onboarding/onboarding-splash.svg';
import { useGoogleAuthorizationUrl, useKakaoAuthorizationUrl } from '@/hooks/queries/useAuth';
import { cn } from '@/utils/cn';

const LOGIN_ASSETS = [displayuLogo, kakaoIcon, googleIcon, onboardingSplash];

function preloadImages(srcList: string[]) {
  return Promise.all(
    srcList.map(
      (src) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => {
            if ('decode' in image) {
              image.decode().then(
                () => resolve(),
                () => resolve(),
              );
              return;
            }
            resolve();
          };
          image.onerror = () => resolve();
          image.src = src;
        }),
    ),
  );
}

function LoginContent({
  isLogoVisible,
  isUIReady,
  isStartingOAuth = false,
  onGuest,
  onGoogle,
  onKakao,
  error,
}: {
  isLogoVisible: boolean;
  isUIReady: boolean;
  isStartingOAuth?: boolean;
  onGuest: () => void;
  onGoogle: () => void;
  onKakao: () => void;
  error?: string;
}) {
  return (
    <main className="relative flex h-dvh w-full flex-col overflow-hidden bg-page font-[Pretendard,sans-serif]">
      {/* Background Image - Wall-to-Wall */}
      <img
        src={onboardingSplash}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* DU Logo & Text Overlay - Smooth Fade In */}
      <div
        className={cn(
          'absolute top-[26%] left-1/2 z-10 flex w-64 -translate-x-1/2 flex-col items-center transition-all duration-1000 ease-out will-change-transform',
          isLogoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        )}
      >
        {/* DU Logo with Mask Gradient for metallic reflection */}
        <div
          className={cn(
            'relative z-10 h-12.5 w-full mb-6 drop-shadow-xl',
            'bg-[radial-gradient(ellipse_at_top,#94a3b8_0%,#06032d_50%)]',
            '[-webkit-mask-image:url(/src/assets/brand/DUfontlogo.svg)] [-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center]',
            'mask-[url(/src/assets/brand/DUfontlogo.svg)] mask-size-contain mask-repeat-no-mask mask-position-center',
          )}
          aria-label="Display U"
          role="img"
        />

        {/* Horizontal Line with Gradient */}
        <div className="relative z-10 w-full h-0.5 bg-linear-to-r from-[#06032d] via-slate-500 to-[#06032d] mb-2.5 shadow-[0px_2px_2px_rgba(0,0,0,0.25)] opacity-90" />

        {/* Text with Gradient for metallic reflection */}
        <p className="relative z-10 text-transparent bg-clip-text bg-linear-to-r from-[#1a1b41] via-slate-800 to-[#1a1b41] typo-body-md-bold whitespace-nowrap tracking-tight">
          전시가 끝난 뒤에도 감상은 계속되도록
        </p>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full w-full max-w-md mx-auto flex-col justify-between px-5 pb-10">
        <div className="flex-1" />

        {/* Social Buttons & Error - Staggered Cascade */}
        <div className="flex w-full flex-col gap-2.5">
          {/* 1. Kakao Button */}
          <div
            className={cn(
              'w-full transition-all duration-500 ease-out',
              isUIReady
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6 pointer-events-none',
            )}
          >
            <button
              type="button"
              onClick={onKakao}
              disabled={!isUIReady || isStartingOAuth}
              className="typo-body-sm-regular flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-[#FEE500] px-5 py-3.5 text-center text-neutral-800 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.10),0px_4px_18px_0px_rgba(254,229,0,0.35)] transition-transform duration-150 active:scale-[0.98] hover:brightness-105 disabled:opacity-50"
            >
              <img src={kakaoIcon} alt="" aria-hidden="true" className="size-5" />
              카카오로 시작하기
            </button>
          </div>

          {/* 2. Google Button */}
          <div
            className={cn(
              'w-full transition-all duration-500 delay-100 ease-out',
              isUIReady
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6 pointer-events-none',
            )}
          >
            <button
              type="button"
              onClick={onGoogle}
              disabled={!isUIReady || isStartingOAuth}
              className="typo-body-sm-regular flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-white/70 px-5 py-3.5 text-center text-zinc-800 shadow-[0px_4px_16px_0px_rgba(30,30,60,0.10),inset_0px_2px_0px_0px_rgba(255,255,255,0.90)] outline outline-1 outline-offset-[-1px] outline-gray-300/70 backdrop-blur-sm transition-transform duration-150 active:scale-[0.98] hover:bg-white/80 disabled:opacity-50"
            >
              <img src={googleIcon} alt="" aria-hidden="true" className="size-4" />
              Google로 시작하기
            </button>
          </div>

          {error ? (
            <p className="mt-2 text-center text-xs font-medium leading-4 text-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        {/* 3. Guest Link */}
        <div
          className={cn(
            'mt-12 flex justify-center pb-2 transition-all duration-500 delay-200 ease-out',
            isUIReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none',
          )}
        >
          <button
            type="button"
            onClick={onGuest}
            disabled={!isUIReady}
            className="typo-body-sm-regular cursor-pointer text-center text-sub700 underline transition-opacity hover:opacity-80 active:opacity-60 disabled:cursor-default"
          >
            비회원으로 감상하기
          </button>
        </div>
      </div>
    </main>
  );
}

export function LoginPage() {
  const [isLogoVisible, setIsLogoVisible] = useState(false);
  const [isUIReady, setIsUIReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();
  const kakaoAuthorizationUrlMutation = useKakaoAuthorizationUrl();
  const googleAuthorizationUrlMutation = useGoogleAuthorizationUrl();
  const isStartingOAuth =
    kakaoAuthorizationUrlMutation.isPending || googleAuthorizationUrlMutation.isPending;

  const startOAuthLogin = async (provider: 'kakao' | 'google') => {
    setAuthError('');

    try {
      const { authorizationUrl } =
        provider === 'kakao'
          ? await kakaoAuthorizationUrlMutation.mutateAsync()
          : await googleAuthorizationUrlMutation.mutateAsync();

      window.location.href = authorizationUrl;
    } catch {
      setAuthError('로그인 연결에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    void preloadImages(LOGIN_ASSETS);

    const logoTimer = window.setTimeout(() => {
      setIsLogoVisible(true);
    }, 100);

    const uiTimer = window.setTimeout(() => {
      setIsUIReady(true);
    }, 1000);

    return () => {
      window.clearTimeout(logoTimer);
      window.clearTimeout(uiTimer);
    };
  }, []);

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-page font-[Pretendard,sans-serif]">
      <LoginContent
        isLogoVisible={isLogoVisible}
        isUIReady={isUIReady}
        isStartingOAuth={isStartingOAuth}
        error={authError}
        onGuest={() => navigate('/home')}
        onKakao={() => {
          void startOAuthLogin('kakao');
        }}
        onGoogle={() => {
          void startOAuthLogin('google');
        }}
      />
    </div>
  );
}
