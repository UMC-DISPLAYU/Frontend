import { describe, expect, it } from 'vitest';

import { resolveOnboardingStep } from './onboardingStep';

describe('resolveOnboardingStep', () => {
  describe('로그인 전(가입 중인 새 회원)', () => {
    it('단계 기록이 없으면 약관부터 보여준다', () => {
      expect(
        resolveOnboardingStep({
          requestedStep: undefined,
          hasRequiredTerms: false,
          isLoggedIn: false,
        }),
      ).toBe('terms');
    });

    it('필수 약관에 동의했으면 닉네임 단계를 보여준다', () => {
      expect(
        resolveOnboardingStep({
          requestedStep: 'nickname',
          hasRequiredTerms: true,
          isLoggedIn: false,
        }),
      ).toBe('nickname');
    });

    it('동의 없이 닉네임 단계로 오면(새로고침) 약관으로 돌려보낸다', () => {
      expect(
        resolveOnboardingStep({
          requestedStep: 'nickname',
          hasRequiredTerms: false,
          isLoggedIn: false,
        }),
      ).toBe('terms');
    });
  });

  describe('로그인 후(가입한 회원)', () => {
    it('약관 단계로 돌아오면 홈으로 보낸다', () => {
      expect(
        resolveOnboardingStep({
          requestedStep: undefined,
          hasRequiredTerms: false,
          isLoggedIn: true,
        }),
      ).toBeNull();
    });

    it('같은 화면에서 약관 동의 상태가 남아 있어도 약관 단계면 홈으로 보낸다', () => {
      expect(
        resolveOnboardingStep({ requestedStep: 'terms', hasRequiredTerms: true, isLoggedIn: true }),
      ).toBeNull();
    });

    it('닉네임 기록으로 새로 들어오면 약관으로 바뀌므로 홈으로 보낸다', () => {
      expect(
        resolveOnboardingStep({
          requestedStep: 'nickname',
          hasRequiredTerms: false,
          isLoggedIn: true,
        }),
      ).toBeNull();
    });

    it('가입 직후 완료 화면으로 바뀌기 전 닉네임 단계는 그대로 둔다', () => {
      expect(
        resolveOnboardingStep({
          requestedStep: 'nickname',
          hasRequiredTerms: true,
          isLoggedIn: true,
        }),
      ).toBe('nickname');
    });

    it('완료 화면은 그대로 보여준다', () => {
      expect(
        resolveOnboardingStep({ requestedStep: 'done', hasRequiredTerms: true, isLoggedIn: true }),
      ).toBe('done');
    });

    it('완료 화면에서 새로고침해 약관 동의 상태가 없어도 완료 화면을 보여준다', () => {
      expect(
        resolveOnboardingStep({ requestedStep: 'done', hasRequiredTerms: false, isLoggedIn: true }),
      ).toBe('done');
    });
  });
});
