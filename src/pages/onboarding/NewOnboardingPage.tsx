import { useState } from 'react';

import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { PageContainer } from '@/components/layout';
import {
  NicknameScreen,
  SignupCompleteScreen,
  TermsAgreementScreen,
  type TermState,
} from '@/components/onboarding';
import { useAuthStore } from '@/stores/authStore';

import { type OnboardingStep, resolveOnboardingStep } from './onboardingStep';
import { hasRequiredTerms } from './signupAgreements';
import { useOnboardingSignup } from './useOnboardingSignup';

type OnboardingHistoryState = { step?: OnboardingStep } | null;

const INITIAL_TERMS: TermState = { over14: false, service: false, privacy: false, location: false };

export function NewOnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [terms, setTerms] = useState<TermState>(INITIAL_TERMS);
  const signup = useOnboardingSignup(terms);
  const isLoggedIn = useAuthStore((state) => Boolean(state.accessToken));

  /* 단계는 history state 에 둬서 브라우저 뒤로가기로 이전 단계로 돌아간다(프로토타입 동작) */
  const historyState = location.state as OnboardingHistoryState;
  const step = resolveOnboardingStep({
    requestedStep: historyState?.step,
    hasRequiredTerms: hasRequiredTerms(terms),
    isLoggedIn,
  });

  const goTo = (next: OnboardingHistoryState, options?: { replace?: boolean }) =>
    navigate({ pathname: location.pathname, search: location.search }, { ...options, state: next });

  if (!step) return <Navigate replace to="/home" />;

  return (
    /* 프로토타입처럼 화면 전체를 흰 배경으로 두고, 모바일에서도 최대 480px 로 가운데 정렬한다 */
    <div className="bg-primary-white">
      <PageContainer variant="form" className="max-w-120 bg-primary-white">
        {step === 'terms' ? (
          <TermsAgreementScreen
            terms={terms}
            onChange={setTerms}
            onBack={() => navigate('/home')}
            onNext={() => goTo({ step: 'nickname' })}
          />
        ) : null}

        {step === 'nickname' ? (
          <NicknameScreen
            isSubmitting={signup.isSubmitting}
            submitError={signup.error}
            onBack={() => navigate(-1)}
            onSubmit={async (nickname) => {
              /* 가입 후 뒤로가기로 닉네임 입력에 돌아가지 않도록 현재 기록을 바꾼다 */
              if (await signup.submit(nickname)) goTo({ step: 'done' }, { replace: true });
            }}
          />
        ) : null}

        {step === 'done' ? (
          <SignupCompleteScreen onNext={() => navigate('/home', { replace: true })} />
        ) : null}
      </PageContainer>
    </div>
  );
}
