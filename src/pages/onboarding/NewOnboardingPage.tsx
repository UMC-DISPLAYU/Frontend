import { useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { PageContainer } from '@/components/layout';
import {
  NicknameScreen,
  SignupCompleteScreen,
  TermsAgreementScreen,
  type TermState,
} from '@/components/onboarding';

import { hasRequiredTerms } from './signupAgreements';
import { useOnboardingSignup } from './useOnboardingSignup';

type Step = 'terms' | 'nickname' | 'done';

type OnboardingHistoryState = { step?: Step } | null;

const TERMS_STORAGE_KEY = 'du.onboard.terms';

/* 약관 문서를 보고 돌아오면 이 화면이 다시 마운트되므로, 체크 상태를 탭 안에서만 잠깐 보관한다(프로토타입) */
const readSavedTerms = (): TermState => {
  const initial: TermState = { service: false, over14: false };
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(TERMS_STORAGE_KEY) ?? 'null');
    if (saved && typeof saved === 'object') {
      const { service, over14 } = saved as Partial<Record<keyof TermState, unknown>>;
      return { service: service === true, over14: over14 === true };
    }
  } catch {
    /* 저장소를 못 쓰면 처음 상태로 시작한다 */
  }
  return initial;
};

const saveTerms = (terms: TermState | null) => {
  try {
    if (terms) sessionStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(terms));
    else sessionStorage.removeItem(TERMS_STORAGE_KEY);
  } catch {
    /* 저장하지 못해도 화면 동작은 같다 */
  }
};

export function NewOnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [terms, setTerms] = useState<TermState>(readSavedTerms);
  const signup = useOnboardingSignup(terms);

  /*
   * 단계는 history state 에 둬서 브라우저 뒤로가기로 이전 단계로 돌아간다(프로토타입 동작).
   * 새로고침하면 약관 동의 상태가 사라지므로, 동의 없이 닉네임 단계로 오면 약관부터 보여준다.
   */
  const historyState = location.state as OnboardingHistoryState;
  const requestedStep = historyState?.step ?? 'terms';
  const step: Step =
    requestedStep === 'nickname' && !hasRequiredTerms(terms) ? 'terms' : requestedStep;

  const goTo = (next: OnboardingHistoryState, options?: { replace?: boolean }) =>
    navigate({ pathname: location.pathname, search: location.search }, { ...options, state: next });

  return (
    /* 프로토타입처럼 화면 전체를 흰 배경으로 두고, 모바일에서도 최대 480px 로 가운데 정렬한다 */
    <div className="bg-primary-white">
      <PageContainer variant="form" className="max-w-120 bg-primary-white">
        {step === 'terms' ? (
          <TermsAgreementScreen
            terms={terms}
            onChange={(next) => {
              setTerms(next);
              saveTerms(next);
            }}
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
              if (await signup.submit(nickname)) {
                saveTerms(null);
                goTo({ step: 'done' }, { replace: true });
              }
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
