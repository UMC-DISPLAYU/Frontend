import { ArtistVerificationField } from './ArtistVerificationField';
import { VerificationTextField } from './VerificationTextField';

interface EmailVerificationFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  sent: boolean;
  error?: string;
  isSending?: boolean;
}

export function EmailVerificationField({
  value,
  onChange,
  onSend,
  sent,
  error,
  isSending = false,
}: EmailVerificationFieldProps) {
  return (
    <ArtistVerificationField
      label="학교 이메일"
      htmlFor="school-email"
      helperText={error || (sent ? '인증 메일이 발송됐어요' : undefined)}
      helperTone={error ? 'error' : 'info'}
      className="mt-8"
    >
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <VerificationTextField
            id="school-email"
            value={value}
            onChange={onChange}
            placeholder="학교 이메일을 입력해주세요"
            error={Boolean(error)}
          />
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={isSending}
          className="h-10 w-[84px] shrink-0 rounded-xl bg-bt-black typo-body-sm-regular text-white"
        >
          {isSending ? '발송중' : '메일발송'}
        </button>
      </div>
    </ArtistVerificationField>
  );
}
