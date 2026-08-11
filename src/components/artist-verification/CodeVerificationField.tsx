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
            disabled={disabled}
            className={`min-w-0 flex-1 bg-transparent typo-body-sm-regular outline-none placeholder:text-line ${
              disabled ? 'text-line cursor-not-allowed' : 'text-main'
            }`}
          />
          <span className="ml-3 shrink-0 typo-body-sm-regular text-slate-700">04:59</span>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isConfirming}
          className="h-10 w-[84px] shrink-0 rounded-xl bg-bt-black typo-body-sm-regular text-white"
        >
          {isConfirming ? '확인중' : '인증 확인'}
        </button>
      </div>
      {error ? (
        <p className="mt-1 typo-body-xxs-regular text-error">{error}</p>
      ) : confirmed ? (
        <p className="mt-1 typo-body-xxs-regular text-link">인증 확인</p>
      ) : null}
      <button
        type="button"
        onClick={onResend}
        disabled={isResending}
        className="mt-1 typo-body-xxs-regular text-faint underline"
      >
        {isResending ? '재발송 중' : '인증번호 재발송'}
      </button>
    </ArtistVerificationField>
  );
}
