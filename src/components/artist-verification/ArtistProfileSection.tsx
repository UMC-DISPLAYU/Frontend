import { ArtistVerificationField } from './ArtistVerificationField';
import { VerificationTextField } from './VerificationTextField';

interface ArtistProfileSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function ArtistProfileSection({ value, onChange }: ArtistProfileSectionProps) {
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
      />
    </ArtistVerificationField>
  );
}
