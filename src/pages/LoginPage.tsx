import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import displayuLogo from '@/assets/DUfontlogo.svg';
import googleOriginal from '@/assets/google-original.svg';
import kakaoTalk from '@/assets/kakao-talk.svg';
import onboardingSplash from '@/assets/onboarding-splash.svg';
import { useGoogleAuthorizationUrl, useKakaoAuthorizationUrl } from '@/hooks/queries/useAuth';

const LOGIN_ASSETS = [displayuLogo, kakaoTalk, googleOriginal, onboardingSplash];

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
  isStartingOAuth = false,
  onGuest,
  onGoogle,
  onKakao,
  error,
}: {
  isStartingOAuth?: boolean;
  onGuest: () => void;
  onGoogle: () => void;
  onKakao: () => void;
  error?: string;
}) {
  return (
    <main className="flex min-h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-page px-5 pb-10 pt-[18vh]">
      <section className="flex flex-col items-center">
        <div className="flex h-[70px] w-[114px] items-center justify-center">
          <img src={displayuLogo} alt="Display U" className="h-[55px] w-[113px]" />
        </div>
        <p className="-mt-[1px] font-['Aldrich'] text-[14px] leading-[20px] tracking-[6.02px] text-[#111]">
          Display U
        </p>
      </section>

      <div className="flex-1" />

      <section className="flex w-full flex-col gap-[10px]">
        <button
          type="button"
          onClick={onKakao}
          disabled={isStartingOAuth}
          className="typo-body-md-regular flex h-[60px] w-full items-center justify-center gap-[10px] rounded-2xl border border-line-soft bg-card text-main"
        >
          <img src={kakaoTalk} alt="" className="h-6 w-[26.65px]" />
          카카오로 시작
        </button>

        <button
          type="button"
          onClick={onGoogle}
          disabled={isStartingOAuth}
          className="typo-body-md-regular flex h-[60px] w-full items-center justify-center gap-[10px] rounded-2xl border border-line-soft bg-card text-main"
        >
          <img src={googleOriginal} alt="" className="h-6 w-[26.65px]" />
          Google로 시작
        </button>
      </section>

      {error ? (
        <p className="mt-3 text-center text-[12px] font-medium leading-[16.8px] tracking-[-0.36px] text-[#ef4444]">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onGuest}
        className="typo-body-sm-regular mt-[184px] text-center text-faint underline max-[420px]:mt-[21vh]"
      >
        비회원으로 감상하기
      </button>
    </main>
  );
}

export function LoginPage() {
  const [showSplash, setShowSplash] = useState(true);
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

    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-[#f0f0f0] font-[Pretendard,sans-serif]">
        <main className="relative h-dvh w-full max-w-[402px] overflow-hidden bg-[#f0f0f3]">
          <img
            src={onboardingSplash}
            alt="Welcome Display U"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute opacity-0">
            <LoginContent
              onGuest={() => undefined}
              onGoogle={() => undefined}
              onKakao={() => undefined}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#f0f0f0] font-[Pretendard,sans-serif]">
      <LoginContent
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
