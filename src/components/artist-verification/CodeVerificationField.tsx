import { useEffect, useState } from 'react';

import { ArtistVerificationField } from './ArtistVerificationField';

interface CodeVerificationFieldProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onResend: () => void;
  confirmed: boolean;
  disabled?: boolean;
  error?: string;
  isConfirming?: boolean;
  isResending?: boolean;
}

const VERIFICATION_TIMEOUT_SECONDS = 5 * 60;

export function CodeVerificationField({
  value,
  onChange,
  onConfirm,
  onResend,
  confirmed,
  disabled = false,
  error,
  isConfirming = false,
  isResending = false,
}: CodeVerificationFieldProps) {
  const [timeLeft, setTimeLeft] = useState(VERIFICATION_TIMEOUT_SECONDS);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (confirmed || isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [confirmed, isExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = () => {
    setTimeLeft(VERIFICATION_TIMEOUT_SECONDS);
    setIsExpired(false);
    onResend();
  };

  return (
    <ArtistVerificationField label="인증번호" htmlFor="verification-code" className="mt-4">
      <div className="flex gap-2">
        <div
          className={`flex h-10 min-w-0 flex-1 items-center justify-between border-b px-4 ${
            error ? 'border-error' : 'border-hint'
          }`}
        >
          <input
            id="verification-code"
            value={value}
            maxLength={6}
            inputMode="numeric"
            onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
            placeholder="인증번호 6자리"
            disabled={disabled || isExpired}
            className={`min-w-0 flex-1 bg-transparent typo-body-sm-regular outline-none placeholder:text-line ${
              disabled || isExpired ? 'text-line cursor-not-allowed' : 'text-main'
            }`}
          />
          <span
            className={`ml-3 shrink-0 typo-body-sm-regular ${isExpired ? 'text-error' : 'text-slate-700'}`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isConfirming || isExpired}
          className="h-10 w-[84px] shrink-0 rounded-xl bg-bt-black typo-body-sm-regular text-white disabled:bg-gray-300"
        >
          {isConfirming ? '확인중' : '인증 확인'}
        </button>
      </div>
      {isExpired ? (
        <p className="mt-1 typo-body-xxs-regular text-error">인증 시간이 만료되었습니다.</p>
      ) : error ? (
        <p className="mt-1 typo-body-xxs-regular text-error">{error}</p>
      ) : confirmed ? (
        <p className="mt-1 typo-body-xxs-regular text-link">인증 확인</p>
      ) : null}
      <button
        type="button"
        onClick={handleResend}
        disabled={isResending}
        className="mt-1 typo-body-xxs-regular text-faint underline"
      >
        {isResending ? '재발송 중' : '인증번호 재발송'}
      </button>
    </ArtistVerificationField>
  );
}
