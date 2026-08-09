import { ArtistVerificationField } from './ArtistVerificationField';
import { VerificationTextField } from './VerificationTextField';

interface ArtistProfileSectionProps {
  value?: string;
  onChange?: (value: string) => void;
  // RHF attributes
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  ref?: React.Ref<HTMLInputElement>;
  error?: boolean;
  registerOnChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export function ArtistProfileSection({
  value,
  onChange,
  name,
  onBlur,
  ref,
  error,
  registerOnChange,
}: ArtistProfileSectionProps) {
  return (
    <ArtistVerificationField
      label="대표 작가 프로필명"
      htmlFor="artist-profile-name"
      className="mt-8"
    >
      <VerificationTextField
        id="artist-profile-name"
        value={value}
        onChange={onChange}
        placeholder="작가 프로필명"
        name={name}
        onBlur={onBlur}
        ref={ref}
        error={error}
        registerOnChange={registerOnChange}
      />
    </ArtistVerificationField>
  );
}
