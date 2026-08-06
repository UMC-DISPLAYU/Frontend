import { ChipGroup, RequiredLabel } from '@/components/ui';
import {
  EXHIBITION_FIELD_LABELS,
  EXHIBITION_FIELDS,
  MAX_ARTIST_FIELDS,
} from '@/constants/exhibition';

interface ArtistFieldSelectorProps {
  selectedFields: string[];
  onChange: (fields: string[]) => void;
}

export function ArtistFieldSelector({ selectedFields, onChange }: ArtistFieldSelectorProps) {
  return (
    <section className="mt-8">
      <RequiredLabel required>전시분야</RequiredLabel>
      <p id="artist-field-selector-help" className="mt-0.5 typo-body-xs-regular text-sub600">
        주요 활동 분야를 최대 {MAX_ARTIST_FIELDS}개까지 선택해주세요.
      </p>
      <ChipGroup
        options={EXHIBITION_FIELDS}
        labels={EXHIBITION_FIELD_LABELS}
        selected={selectedFields}
        onChange={onChange}
        maxSelect={MAX_ARTIST_FIELDS}
        aria-label="전시분야"
        aria-describedby="artist-field-selector-help"
        className="mt-3 flex flex-wrap gap-2"
      />
    </section>
  );
}
