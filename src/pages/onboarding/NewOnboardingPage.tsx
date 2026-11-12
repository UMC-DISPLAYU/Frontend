import { useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { PageContainer } from '@/components/layout';
import {
  NicknameScreen,
  type PolicyTermKey,
  SignupCompleteScreen,
  TermDetailScreen,
  TermsAgreementScreen,
  type TermState,
} from '@/components/onboarding';

import { findAgreement, hasRequiredTerms } from './signupAgreements';
import { useOnboardingSignup } from './useOnboardingSignup';

type Step = 'terms' | 'termDetail' | 'nickname' | 'done';

type OnboardingHistoryState = { step?: Step; term?: PolicyTermKey } | null;

const INITIAL_TERMS: TermState = { over14: false, service: false, privacy: false, location: false };

export function NewOnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [terms, setTerms] = useState<TermState>(INITIAL_TERMS);
  const signup = useOnboardingSignup(terms);

  /*
   * 단계는 history state 에 둬서 브라우저 뒤로가기로 이전 단계로 돌아간다(프로토타입 동작).
   * 새로고침하면 약관 동의 상태가 사라지므로, 동의 없이 닉네임 단계로 오면 약관부터 보여준다.
   */
  const historyState = location.state as OnboardingHistoryState;
  const requestedStep = historyState?.step ?? 'terms';
  const step: Step =
    requestedStep === 'nickname' && !hasRequiredTerms(terms) ? 'terms' : requestedStep;
  const selectedTerm = historyState?.term ?? 'service';

  const goTo = (next: OnboardingHistoryState, options?: { replace?: boolean }) =>
    navigate({ pathname: location.pathname, search: location.search }, { ...options, state: next });

  return (
    /* 프로토타입처럼 화면 전체를 흰 배경으로 두고, 모바일에서도 최대 480px 로 가운데 정렬한다 */
    <div className="bg-primary-white">
      <PageContainer variant="form" className="max-w-120 bg-primary-white">
        {step === 'terms' ? (
          <TermsAgreementScreen
            terms={terms}
            onChange={setTerms}
            onBack={() => navigate('/login')}
            onOpenDetail={(term) => goTo({ step: 'termDetail', term })}
            onNext={() => goTo({ step: 'nickname' })}
          />
        ) : null}

        {step === 'termDetail' ? (
          <TermDetailScreen
            termKey={selectedTerm}
            agreement={findAgreement(signup.agreements, selectedTerm)}
            isLoading={signup.isAgreementsLoading}
            onRetry={() => void signup.refetchAgreements()}
            onBack={() => navigate(-1)}
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
