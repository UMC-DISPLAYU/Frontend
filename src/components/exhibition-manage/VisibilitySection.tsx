import { ChevronRight } from 'lucide-react';

import { VISIBILITY_LABEL, type VisibilityType } from '@/constants/visibility';

interface VisibilitySectionProps {
  artworkVisibility: VisibilityType;
  onSettingsClick: () => void;
}

export function VisibilitySection({ artworkVisibility, onSettingsClick }: VisibilitySectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="typo-body-sm-bold text-main">공개 시점</span>
        <button type="button" onClick={onSettingsClick} className="flex items-center gap-0.5">
          <span className="typo-body-xs-semibold text-hint">설정하기</span>
          <ChevronRight className="size-3 text-hint" strokeWidth={1} />
        </button>
      </div>
      <div className="flex flex-col">
        <div className="flex items-start justify-between border-b border-faint py-3">
          <span className="typo-body-sm-regular text-hint">전시작</span>
          <span className="typo-body-sm-regular text-main">{VISIBILITY_LABEL[artworkVisibility]}</span>
        </div>
        <div className="flex items-start justify-between py-3">
          <span className="typo-body-sm-regular text-hint">전시 콘텐츠</span>
          <span className="typo-body-sm-regular text-main">전시 등록과 동시에 공개</span>
        </div>
      </div>
    </section>
  );
}
