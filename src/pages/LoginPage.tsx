import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import displayuLogo from '@/assets/DUfontlogo.svg';
import googleOriginal from '@/assets/google-original.svg';
import kakaoTalk from '@/assets/kakao-talk.svg';
import onboardingSplash from '@/assets/onboarding-splash.svg';

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

function LoginContent({ onNavigate }: { onNavigate: (path: string) => void }) {
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
          onClick={() => onNavigate('/onboarding')}
          className="typo-body-md-regular flex h-[60px] w-full items-center justify-center gap-[10px] rounded-2xl border border-line-soft bg-card text-main"
        >
          <img src={kakaoTalk} alt="" className="h-6 w-[26.65px]" />
          카카오로 시작
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/onboarding')}
          className="typo-body-md-regular flex h-[60px] w-full items-center justify-center gap-[10px] rounded-2xl border border-line-soft bg-card text-main"
        >
          <img src={googleOriginal} alt="" className="h-6 w-[26.65px]" />
          Google로 시작
        </button>
      </section>

      <button
        type="button"
        onClick={() => onNavigate('/home')}
        className="typo-body-sm-regular mt-[184px] text-center text-faint underline max-[420px]:mt-[21vh]"
      >
        비회원으로 감상하기
      </button>
    </main>
  );
}

export function LoginPage() {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

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
            <LoginContent onNavigate={() => undefined} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#f0f0f0] font-[Pretendard,sans-serif]">
      <LoginContent onNavigate={(path) => navigate(path)} />
    </div>
  );
}
