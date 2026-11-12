import { type FormEvent, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { useCheckNickname } from '@/hooks/queries/useUserProfile';
import {
  type OnboardingNicknameFormValues,
  onboardingNicknameSchema,
} from '@/pages/onboarding/onboarding.schema';
import { cn } from '@/utils/cn';

import { focusOnMount } from './focusOnMount';
import {
  getNicknameHelper,
  isNicknameValid,
  type NicknameCheckStatus,
  type NicknameHelperTone,
} from './nicknameHelper';
import { OnboardingBottomButton } from './OnboardingBottomButton';
import { OnboardingHeader } from './OnboardingHeader';

const FORM_ID = 'onboarding-nickname-form';
const HELPER_ID = 'onboarding-nickname-helper';

const HELPER_TONE_CLASS: Record<NicknameHelperTone, string> = {
  default: 'text-secondary',
  pending: 'text-tertiary',
  error: 'text-error',
  success: 'text-success',
};

export function NicknameScreen({
  isSubmitting,
  submitError,
  onBack,
  onSubmit,
}: {
  isSubmitting: boolean;
  submitError?: string;
  onBack: () => void;
  onSubmit: (nickname: string) => void;
}) {
  const [status, setStatus] = useState<NicknameCheckStatus>('idle');
  const checkNickname = useCheckNickname();

  const { register, handleSubmit, control, getValues } = useForm<OnboardingNicknameFormValues>({
    resolver: zodResolver(onboardingNicknameSchema),
    mode: 'onChange',
    defaultValues: { nickname: '' },
  });

  const nickname = useWatch({ control, name: 'nickname' }) ?? '';
  const isValid = isNicknameValid(nickname);
  const helper = getNicknameHelper(nickname, status);
  const isInvalid = helper.tone === 'error';
  const isChecked = status === 'available';
  const canCheck = isValid && !isChecked && !checkNickname.isPending;
  const canSubmit = isValid && isChecked && !isSubmitting;

  const handleCheckNickname = async () => {
    if (!canCheck) return;

    const targetNickname = nickname;

    try {
      const result = await checkNickname.mutateAsync({ nickname: targetNickname });
      /* 응답을 기다리는 동안 입력이 바뀌었으면 이전 닉네임의 결과를 버린다 */
      if (getValues('nickname') !== targetNickname) return;
      setStatus(result.isAvailable ? 'available' : 'unavailable');
    } catch {
      if (getValues('nickname') !== targetNickname) return;
      setStatus('error');
    }
  };

  const submitNickname = handleSubmit((data) => onSubmit(data.nickname));

  /* 입력창에서 Enter 를 누르면 확인 전에는 중복 확인, 확인 후에는 가입을 진행한다 (프로토타입 동작) */
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (canSubmit) {
      void submitNickname(event);
      return;
    }
    event.preventDefault();
    void handleCheckNickname();
  };

  return (
    <>
      <OnboardingHeader onBack={onBack} />

      <main className="flex-1">
        <h1
          ref={focusOnMount}
          tabIndex={-1}
          className="typography-title-xs mt-2 text-primary outline-none"
        >
          디유에서 사용할
          <br />
          닉네임을 정해주세요
        </h1>
        <p className="typography-body-lg-regular mt-2 text-secondary">
          방명록, 게시판, 프로필에서 표시되는 이름이에요.
        </p>

        <form
          id={FORM_ID}
          noValidate
          onSubmit={handleFormSubmit}
          className="mt-8 flex items-start gap-2"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div
              className={cn(
                'flex h-11.75 items-center border-b transition-colors duration-fast',
                isInvalid
                  ? 'border-error'
                  : 'border-primary focus-within:border-interactive-primary',
              )}
            >
              <input
                id="nickname"
                aria-label="닉네임"
                aria-describedby={HELPER_ID}
                aria-invalid={isInvalid || undefined}
                maxLength={15}
                placeholder="닉네임"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="done"
                className="typography-body-xl-regular h-full min-w-0 flex-1 bg-transparent text-primary outline-none placeholder:text-tertiary"
                {...register('nickname', { onChange: () => setStatus('idle') })}
              />
            </div>
            <p
              id={HELPER_ID}
              aria-live="polite"
              className={cn('typography-body-md-medium', HELPER_TONE_CLASS[helper.tone])}
            >
              {helper.text}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCheckNickname}
            disabled={!canCheck}
            className="typography-body-lg-semibold h-11 min-w-22 shrink-0 cursor-pointer rounded-12 bg-interactive-primary px-4 text-center whitespace-nowrap text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-97 active:bg-interactive-primary-press disabled:cursor-default disabled:bg-disable disabled:text-disable disabled:active:scale-100"
          >
            {isChecked ? '확인 완료' : checkNickname.isPending ? '확인 중' : '중복 확인'}
          </button>
        </form>
      </main>

      {submitError ? (
        <p role="alert" className="typography-body-md-medium shrink-0 pb-3 text-center text-error">
          {submitError}
        </p>
      ) : null}

      <OnboardingBottomButton type="submit" form={FORM_ID} disabled={!canSubmit}>
        {isSubmitting ? '가입 중' : '완료'}
      </OnboardingBottomButton>
    </>
  );
}
