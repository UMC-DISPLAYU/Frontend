import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useGoogleAuthorizationUrl, useKakaoAuthorizationUrl } from '@/hooks/queries/useAuth';

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 3C6.134 3 3 5.463 3 8.5c0 1.951 1.268 3.667 3.178 4.685l-.81 3.01c-.072.267.235.48.467.322L9.59 14.18c.134.01.27.02.41.02 3.866 0 7-2.463 7-5.5S13.866 3 10 3z"
        fill="#191600"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.79h5.38a4.6 4.6 0 01-2 3.02v2.5h3.23c1.9-1.75 3-4.33 3-7.31z"
        fill="#4285F4"
      />
      <path
        d="M10 20c2.7 0 4.96-.9 6.61-2.43l-3.23-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.58-4.11H1.1v2.58A10 10 0 0010 20z"
        fill="#34A853"
      />
      <path
        d="M4.42 11.92A6.01 6.01 0 014.1 10c0-.67.12-1.32.32-1.92V5.5H1.1A10 10 0 000 10c0 1.6.38 3.12 1.1 4.5l3.32-2.58z"
        fill="#FBBC05"
      />
      <path
        d="M10 3.96c1.47 0 2.79.5 3.83 1.49l2.86-2.86C14.96.9 12.7 0 10 0A10 10 0 001.1 5.5l3.32 2.58C5.2 5.71 7.4 3.96 10 3.96z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginPage() {
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();
  const kakaoAuthorizationUrlMutation = useKakaoAuthorizationUrl();
  const googleAuthorizationUrlMutation = useGoogleAuthorizationUrl();

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

  const isStartingOAuth =
    kakaoAuthorizationUrlMutation.isPending || googleAuthorizationUrlMutation.isPending;

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#f0f0f0] font-[Pretendard,sans-serif]">
      <div className="relative h-dvh w-full max-w-[375px] overflow-hidden bg-white">
        <div className="flex h-full flex-col bg-white">
          <div className="h-14 shrink-0 border-b border-[#e8eaed]" />

          <div className="flex flex-1 flex-col overflow-auto px-6">
            <div className="flex items-end justify-center pb-12 pt-14">
              <span className="text-[26px] font-extrabold leading-[39px] tracking-[-1.04px] text-[#0d0d0d]">
                display
              </span>
              <div className="relative">
                <span className="text-[26px] font-extrabold leading-[39px] tracking-[-1.04px] text-[#0d0d0d]">
                  U
                </span>
                <div className="absolute bottom-0 left-0 right-0 border-b-[3px] border-[#0d0d0d]" />
              </div>
            </div>

            <div className="h-[42px]" />

            <div className="mb-7 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  void startOAuthLogin('kakao');
                }}
                disabled={isStartingOAuth}
                className="flex h-[54px] w-full items-center justify-center gap-[9px] rounded-xl bg-[#fee500] disabled:opacity-50"
              >
                <KakaoIcon />
                <span className="text-[15px] font-bold tracking-[-0.15px] text-[#191600]">
                  카카오로 시작하기
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  void startOAuthLogin('google');
                }}
                disabled={isStartingOAuth}
                className="flex h-[54px] w-full items-center justify-center gap-[9px] rounded-xl border-[1.5px] border-[#d1d5db] bg-white disabled:opacity-50"
              >
                <GoogleIcon />
                <span className="text-[15px] font-medium tracking-[-0.15px] text-[#3d3d3d]">
                  Google로 시작하기
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-[#f2f3f5] px-4 py-[14px]">
              <div className="mt-px shrink-0">
                <div className="h-1 w-1 rounded-sm bg-[#a0a5af]" />
              </div>
              <p className="text-[12px] font-normal text-[#6b7280]">
                비회원은 전시와 작품 감상까지 이용할 수 있어요.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="mt-0 flex h-11 items-center justify-center"
            >
              <span className="text-[14px] font-medium tracking-[-0.14px] text-[#6b7280]">
                비회원으로 감상하기
              </span>
            </button>
          </div>
        </div>

        {authError ? (
          <div className="absolute bottom-5 left-6 right-6 rounded-lg bg-[#fee2e2] px-4 py-3 text-center text-[12px] font-medium text-[#b91c1c]">
            {authError}
          </div>
        ) : null}
      </div>
    </div>
  );
}
