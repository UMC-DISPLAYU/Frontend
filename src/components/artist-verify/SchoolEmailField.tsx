import type { Ref } from 'react';

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
  /** 학교를 목록에서 고르기 전에는 칸은 보이되 입력할 수 없다 */
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
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
  disabled = false,
  inputRef,
}: SchoolEmailFieldProps) {
  const helper =
    error ?? (verified ? '학교 이메일 인증이 완료됐어요' : sent ? '인증 메일을 발송했어요' : null);

  return (
    <div className="flex items-start gap-2">
      <ArtistVerifyField className="flex-1" htmlFor="school-email" label="학교 이메일">
        <ArtistVerifyInput
          aria-describedby={helper ? HELPER_ID : undefined}
          autoComplete="email"
          className="disabled:cursor-default"
          disabled={disabled}
          id="school-email"
          inputMode="email"
          invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
          placeholder="school@univ.ac.kr"
          readOnly={verified}
          ref={inputRef}
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
