import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';

import { ArtistVerifyActionButton } from './ArtistVerifyActionButton';
import { ArtistVerifyField, ArtistVerifyHelperText } from './ArtistVerifyField';
import { ArtistVerifyInput } from './ArtistVerifyInput';

const VERIFICATION_TIMEOUT_MS = 5 * 60 * 1000;
const CODE_LENGTH = 6;
const STATUS_ID = 'verification-code-status';

const getSecondsLeft = (deadline: number) => Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

type VerificationCodeFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  error?: string;
  isConfirming?: boolean;
};

/** 메일을 다시 보내면 부모가 key를 바꿔 타이머를 새로 시작한다. */
export function VerificationCodeField({
  value,
  onChange,
  onConfirm,
  error,
  isConfirming = false,
}: VerificationCodeFieldProps) {
  const [deadline] = useState(() => Date.now() + VERIFICATION_TIMEOUT_MS);
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(deadline));
  const isExpired = secondsLeft === 0;

  useEffect(() => {
    if (isExpired) return;
    // 백그라운드 탭에서 interval이 늦어져도 남은 시간이 틀리지 않게 마감 시각 기준으로 계산한다
    const interval = window.setInterval(() => setSecondsLeft(getSecondsLeft(deadline)), 1000);
    return () => window.clearInterval(interval);
  }, [deadline, isExpired]);

  const errorText = isExpired ? '인증 시간이 지났어요. 인증 메일을 다시 받아주세요.' : error;

  return (
    <div className="flex items-start gap-2">
      <ArtistVerifyField className="flex-1" htmlFor="verification-code" label="인증번호">
        <ArtistVerifyInput
          aria-describedby={errorText ? STATUS_ID : undefined}
          autoComplete="one-time-code"
          disabled={isExpired}
          id="verification-code"
          inputMode="numeric"
          invalid={Boolean(errorText)}
          maxLength={CODE_LENGTH}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
          placeholder="인증번호 6자리"
          right={
            <span
              className={cn(
                'typography-body-xl-regular shrink-0',
                isExpired ? 'text-error' : 'text-secondary',
              )}
            >
              {formatTime(secondsLeft)}
            </span>
          }
          value={value}
        />
        {errorText ? (
          <ArtistVerifyHelperText error id={STATUS_ID}>
            {errorText}
          </ArtistVerifyHelperText>
        ) : null}
      </ArtistVerifyField>

      <ArtistVerifyActionButton
        disabled={value.length !== CODE_LENGTH || isExpired || isConfirming}
        onClick={onConfirm}
      >
        인증 확인
      </ArtistVerifyActionButton>
    </div>
  );
}
