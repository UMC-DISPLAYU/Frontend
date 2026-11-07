import { ArtistVerifyActionButton } from './ArtistVerifyActionButton';
import { ArtistVerifyField, ArtistVerifyHelperText } from './ArtistVerifyField';
import { ArtistVerifyInput } from './ArtistVerifyInput';

type SchoolEmailFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  canSend: boolean;
  sent: boolean;
  verified: boolean;
  error?: string;
  isSending?: boolean;
};

const HELPER_ID = 'school-email-helper';

export function SchoolEmailField({
  value,
  onChange,
  onSend,
  canSend,
  sent,
  verified,
  error,
  isSending = false,
}: SchoolEmailFieldProps) {
  const helper =
    error ?? (verified ? '학교 이메일 인증이 완료됐어요' : sent ? '인증 메일을 발송했어요' : null);

  return (
    <div className="flex items-start gap-2">
      <ArtistVerifyField className="flex-1" htmlFor="school-email" label="학교 이메일">
        <ArtistVerifyInput
          aria-describedby={helper ? HELPER_ID : undefined}
          autoComplete="email"
          id="school-email"
          inputMode="email"
          invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
          placeholder="school@univ.ac.kr"
          readOnly={verified}
          value={value}
        />
        {helper ? (
          <ArtistVerifyHelperText error={Boolean(error)} id={HELPER_ID}>
            {helper}
          </ArtistVerifyHelperText>
        ) : null}
      </ArtistVerifyField>

      {verified ? null : (
        <ArtistVerifyActionButton disabled={!canSend || isSending} onClick={onSend}>
          {sent ? '재발송' : '메일발송'}
        </ArtistVerifyActionButton>
      )}
    </div>
  );
}
