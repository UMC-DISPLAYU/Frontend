import { Chip, RequiredLabel } from '@/components/ui';

const FIELD_ROWS = [
  ['회화', '디자인', '사진', '건축', '영상', '조소', '패션'],
  ['일러스트', '공예', '기타'],
];

interface ArtistFieldSelectorProps {
  selectedFields: string[];
  onToggle: (field: string) => void;
}

export function ArtistFieldSelector({ selectedFields, onToggle }: ArtistFieldSelectorProps) {
  return (
    <section className="mt-8">
      <RequiredLabel required>전시분야</RequiredLabel>
      <p className="mt-0.5 typo-body-xs-regular text-sub600">
        주요 활동 분야를 최대 2개까지 선택해주세요.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {FIELD_ROWS.map((row) => (
          <div key={row.join()} className="flex flex-wrap gap-2">
            {row.map((field) => (
              <Chip
                key={field}
                label={field}
                selected={selectedFields.includes(field)}
                onClick={() => onToggle(field)}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
