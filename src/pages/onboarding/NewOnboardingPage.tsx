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

type OnboardingHistoryState = { step?: Step; terms?: TermState } | null;

const readTerms = (state: OnboardingHistoryState): TermState => ({
  service: state?.terms?.service === true,
  over14: state?.terms?.over14 === true,
});

export function NewOnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  /*
   * 단계와 약관 체크는 history state 에 둔다. 브라우저 뒤로가기로 이전 단계로 돌아가고(프로토타입 동작),
   * 약관 문서를 보고 돌아와도 체크가 남는다. 소셜 로그인 뒤에는 새 기록으로 들어오므로 다른 계정의 체크가 남지 않는다.
   * 동의 없이 닉네임 단계로 오면 약관부터 보여준다.
   */
  const historyState = location.state as OnboardingHistoryState;
  const terms = readTerms(historyState);
  const signup = useOnboardingSignup(terms);
  const requestedStep = historyState?.step ?? 'terms';
  const step: Step =
    requestedStep === 'nickname' && !hasRequiredTerms(terms) ? 'terms' : requestedStep;

  const goTo = (next: OnboardingHistoryState, options?: { replace?: boolean }) =>
    navigate(
      { pathname: location.pathname, search: location.search },
      { ...options, state: next, preventScrollReset: options?.replace },
    );

  return (
    /* 프로토타입처럼 화면 전체를 흰 배경으로 두고, 모바일에서도 최대 480px 로 가운데 정렬한다 */
    <div className="bg-primary-white">
      <PageContainer variant="form" className="max-w-120 bg-primary-white">
        {step === 'terms' ? (
          <TermsAgreementScreen
            terms={terms}
            onChange={(next) => goTo({ step: 'terms', terms: next }, { replace: true })}
            onBack={() => navigate('/home')}
            onNext={() => goTo({ step: 'nickname', terms })}
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
