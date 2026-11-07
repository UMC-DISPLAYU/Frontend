import checkIcon from '@/assets/icons/CheckIcon.svg';
import {
  EXHIBITION_FIELD_LABELS,
  type ExhibitionField,
  MAX_ARTIST_FIELDS,
} from '@/constants/exhibition';
import { cn } from '@/utils/cn';

import { ArtistVerifyLabel } from './ArtistVerifyField';

/*
 * 피그마 개선안의 분야(그래픽·브랜딩·제품·가구·공간·UXUI)는 서버 enum에 없어 보낼 수 없다.
 * 서버가 받는 분야만 피그마 순서에 맞춰 배치한다.
 */
const ACTIVITY_FIELD_ORDER: readonly ExhibitionField[] = [
  'PAINTING',
  'SCULPTURE',
  'PHOTOGRAPHY',
  'DESIGN',
  'ILLUSTRATION',
  'VIDEO',
  'FASHION',
  'ARCHITECTURE',
  'CRAFT',
  'ETC',
];

type ActivityFieldSelectorProps = {
  selected: ExhibitionField[];
  onChange: (fields: ExhibitionField[]) => void;
  onMaxSelectExceeded: () => void;
};

export function ActivityFieldSelector({
  selected,
  onChange,
  onMaxSelectExceeded,
}: ActivityFieldSelectorProps) {
  const toggle = (field: ExhibitionField) => {
    if (selected.includes(field)) {
      onChange(selected.filter((item) => item !== field));
      return;
    }
    if (selected.length >= MAX_ARTIST_FIELDS) {
      onMaxSelectExceeded();
      return;
    }
    onChange([...selected, field]);
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <ArtistVerifyLabel id="activity-field-label">작가 분야</ArtistVerifyLabel>
        <span className="typography-body-md-medium text-secondary">
          {selected.length} / {MAX_ARTIST_FIELDS}
        </span>
      </div>
      <div aria-labelledby="activity-field-label" className="grid grid-cols-4 gap-1.5" role="group">
        {ACTIVITY_FIELD_ORDER.map((field) => {
          const isSelected = selected.includes(field);
          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                'typography-body-lg-medium flex h-11 cursor-pointer items-center justify-center gap-1 rounded-8 border',
                isSelected
                  ? 'border-transparent bg-interactive-primary text-interactive-inverse'
                  : 'border-primary bg-primary-white text-primary',
              )}
              key={field}
              onClick={() => toggle(field)}
              type="button"
            >
              {isSelected ? <img alt="" className="size-4" src={checkIcon} /> : null}
              {EXHIBITION_FIELD_LABELS[field]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
