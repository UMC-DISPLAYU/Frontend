import { useEffect, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

import { VerifyActionButton } from './VerifyActionButton';
import { VerifyField, VerifyHelperText } from './VerifyField';
import { VerifyInput } from './VerifyInput';

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

/** 메일을 (다시) 보내면 부모가 key를 바꿔 타이머를 새로 시작하고 입력칸에 포커스한다. */
export function VerificationCodeField({
  value,
  onChange,
  onConfirm,
  error,
  isConfirming = false,
}: VerificationCodeFieldProps) {
  const [deadline] = useState(() => Date.now() + VERIFICATION_TIMEOUT_MS);
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(deadline));
  const inputRef = useRef<HTMLInputElement>(null);
  const isExpired = secondsLeft === 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isExpired) return;
    // 백그라운드 탭에서 interval이 늦어져도 남은 시간이 틀리지 않게 마감 시각 기준으로 계산한다
    const interval = window.setInterval(() => setSecondsLeft(getSecondsLeft(deadline)), 1000);
    return () => window.clearInterval(interval);
  }, [deadline, isExpired]);

  const errorText = isExpired ? '인증 시간이 지났어요. 인증 메일을 다시 받아주세요.' : error;
  const canConfirm = value.length === CODE_LENGTH && !isExpired && !isConfirming;

  return (
    <VerifyField htmlFor="verification-code" label="인증번호">
      <div className="mt-1 flex items-center gap-2">
        <VerifyInput
          aria-describedby={errorText ? STATUS_ID : undefined}
          autoComplete="one-time-code"
          disabled={isExpired}
          id="verification-code"
          inputMode="numeric"
          invalid={Boolean(errorText)}
          maxLength={CODE_LENGTH}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            if (canConfirm) onConfirm();
          }}
          pattern="[0-9]*"
          placeholder="인증번호 6자리"
          ref={inputRef}
          right={
            <span
              aria-live="off"
              className={cn(
                'ml-2 shrink-0 text-[16px] font-medium tabular-nums',
                errorText ? 'text-[#fb2c36]' : 'text-[#3f3f47]',
              )}
              role="timer"
            >
              {formatTime(secondsLeft)}
            </span>
          }
          // 시간이 지나면 프로토타입처럼 입력한 번호를 비워 보여준다. 다시 보내면 부모가 번호를 초기화한다
          value={isExpired ? '' : value}
        />
        <VerifyActionButton disabled={!canConfirm} onClick={onConfirm}>
          인증 확인
        </VerifyActionButton>
      </div>
      {errorText ? (
        <VerifyHelperText error id={STATUS_ID}>
          {errorText}
        </VerifyHelperText>
      ) : null}
    </VerifyField>
  );
}
