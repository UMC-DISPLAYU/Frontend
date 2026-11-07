import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import { useCheckNickname } from '@/hooks/queries/useUserProfile';
import {
  type OnboardingNicknameFormValues,
  onboardingNicknameSchema,
} from '@/pages/onboarding/onboarding.schema';
import { cn } from '@/utils/cn';

import { InfoNotice } from './InfoNotice';
import { OnboardingBottomButton } from './OnboardingBottomButton';
import { OnboardingHeader } from './OnboardingHeader';

type NicknameStatus = 'idle' | 'available' | 'unavailable' | 'error';

const FORM_ID = 'onboarding-nickname-form';

const NICKNAME_RULES = ['한글 · 영문 · 숫자', '2 ~ 15자', '특수문자 불가', '공백 불가'];

const STATUS_MESSAGES: Record<Exclude<NicknameStatus, 'idle'>, string> = {
  available: '사용 가능한 닉네임이에요.',
  unavailable: '이미 사용 중인 닉네임이에요.',
  error: '중복 확인에 실패했어요.',
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
  const [status, setStatus] = useState<NicknameStatus>('idle');
  const [checkedNickname, setCheckedNickname] = useState('');
  const checkNickname = useCheckNickname();

  const { register, handleSubmit, control, setValue, getValues } =
    useForm<OnboardingNicknameFormValues>({
      resolver: zodResolver(onboardingNicknameSchema),
      mode: 'onChange',
      defaultValues: { nickname: '' },
    });

  const nickname = useWatch({ control, name: 'nickname' }) ?? '';
  const isNicknameShapeValid = onboardingNicknameSchema.safeParse({ nickname }).success;
  const canSubmit =
    status === 'available' && checkedNickname === nickname && isNicknameShapeValid && !isSubmitting;

  const resetCheck = () => {
    setCheckedNickname('');
    setStatus('idle');
  };

  const handleCheckNickname = async () => {
    if (!isNicknameShapeValid || checkNickname.isPending) return;

    const targetNickname = nickname;

    try {
      const result = await checkNickname.mutateAsync({ nickname: targetNickname });
      /* 응답을 기다리는 동안 입력이 바뀌었으면 이전 닉네임의 결과를 버린다 */
      if (getValues('nickname') !== targetNickname) return;

      setCheckedNickname(targetNickname);
      setStatus(result.isAvailable ? 'available' : 'unavailable');
    } catch {
      if (getValues('nickname') !== targetNickname) return;
      setStatus('error');
    }
  };

  return (
    <>
      <OnboardingHeader onBack={onBack} />

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-10 pb-6">
        <h1 className="typography-title-md text-main">
          디유에서 사용할
          <br />
          닉네임을 정해주세요
        </h1>
        <p className="mt-1 text-[13px] leading-[1.4] font-normal tracking-[-0.03em] text-hint">
          방명록, 게시판, 프로필에서 표시되는 이름이에요.
        </p>

        <form
          id={FORM_ID}
          onSubmit={handleSubmit((data) => onSubmit(data.nickname))}
          className="mt-10 flex flex-col gap-3"
        >
          <label
            htmlFor="nickname"
            className="text-[14px] leading-[1.4] font-bold tracking-[-0.03em] text-main"
          >
            닉네임
          </label>
          <div className="flex w-full items-center gap-3 border-b border-line">
            <div className="flex h-9.5 min-w-0 flex-1 items-center overflow-hidden px-3">
              <input
                id="nickname"
                maxLength={15}
                placeholder="닉네임"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-main outline-none placeholder:text-faint"
                {...register('nickname', { onChange: resetCheck })}
              />
            </div>
            <div className="flex h-9.5 shrink-0 items-center gap-2.5">
              {nickname ? (
                <button
                  type="button"
                  onClick={() => {
                    setValue('nickname', '', { shouldValidate: true });
                    resetCheck();
                  }}
                  aria-label="닉네임 지우기"
                  className="flex size-5 items-center justify-center rounded-full bg-box200"
                >
                  <X className="size-3 text-white" strokeWidth={2.5} />
                </button>
              ) : null}
              <span aria-hidden="true" className="h-4.5 w-px bg-box200" />
              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={!isNicknameShapeValid || checkNickname.isPending}
                className="h-8 rounded-lg border border-hint px-3 text-[12px] leading-[1.4] font-semibold tracking-[-0.03em] text-main disabled:border-box200 disabled:text-faint"
              >
                {checkNickname.isPending ? '확인 중' : '중복 확인'}
              </button>
            </div>
          </div>
        </form>

        <p
          aria-live="polite"
          className={cn(
            'mt-1 min-h-3.5 text-[10px] leading-[1.4] font-normal tracking-[-0.03em]',
            /* 실패 상태는 피그마에 없어 기존 에러 색을 쓴다 */
            status === 'available' ? 'text-link' : 'text-error',
          )}
        >
          {status === 'idle' ? '' : STATUS_MESSAGES[status]}
        </p>

        <ul className="mt-7 flex flex-col gap-2">
          {NICKNAME_RULES.map((rule) => (
            <li
              key={rule}
              className="text-[12px] leading-[1.4] font-normal tracking-[-0.03em] text-faint"
            >
              {rule}
            </li>
          ))}
        </ul>
      </main>

      <div className="shrink-0 px-5 pb-8">
        <InfoNotice>닉네임은 이후 마이페이지에서 변경할 수 있어요.</InfoNotice>
        {submitError ? (
          <p
            role="alert"
            className="mt-3 text-center text-[12px] leading-[1.4] font-medium tracking-[-0.03em] text-error"
          >
            {submitError}
          </p>
        ) : null}
      </div>

      <OnboardingBottomButton type="submit" form={FORM_ID} disabled={!canSubmit}>
        {isSubmitting ? '가입 중' : '완료'}
      </OnboardingBottomButton>
    </>
  );
}
