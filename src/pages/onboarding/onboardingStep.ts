export type OnboardingStep = 'terms' | 'nickname' | 'done';

interface ResolveOnboardingStepParams {
  requestedStep: OnboardingStep | undefined;
  hasRequiredTerms: boolean;
  isLoggedIn: boolean;
}

/** 보여줄 온보딩 단계. `null`이면 화면 대신 홈으로 보낸다. */
export function resolveOnboardingStep({
  requestedStep = 'terms',
  hasRequiredTerms,
  isLoggedIn,
}: ResolveOnboardingStepParams): OnboardingStep | null {
  /* 새로고침하면 약관 동의 상태가 사라지므로, 동의 없이 닉네임 단계로 오면 약관부터 보여준다 */
  const step = requestedStep === 'nickname' && !hasRequiredTerms ? 'terms' : requestedStep;

  /*
   * 가입을 마치면 기록에 약관 단계가 남아, 홈·완료 화면에서 뒤로가기를 하면 이곳으로 돌아온다.
   * 가입한 사람은 약관 단계일 때만 홈으로 보낸다. 닉네임 단계는 가입 직후 토큰이 저장된 뒤
   * 완료 화면으로 바뀌기 전 잠깐 지나가므로 보내지 않는다.
   */
  if (isLoggedIn && step === 'terms') return null;

  return step;
}
