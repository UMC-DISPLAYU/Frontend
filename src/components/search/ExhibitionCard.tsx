import bookmarkIcon from '../../assets/bookmark.svg';
import bookmarkFilledIcon from '../../assets/bookmark_filled.svg';

import type { Exhibition, ExhibitionStatus } from './types';

const STATUS_META: Record<ExhibitionStatus, { badgeClassName: string; label: string }> = {
  ended: { badgeClassName: 'bg-neutral-400 text-neutral-50', label: '종료' },
  endingSoon: { badgeClassName: 'bg-amber-500 text-neutral-50', label: '종료예정' },
  ongoing: { badgeClassName: 'bg-[#2483C3] text-neutral-50', label: '전시중' },
  upcoming: { badgeClassName: 'bg-neutral-300 text-neutral-50', label: '전시예정' },
};

type ExhibitionCardProps = {
  bookmarked: boolean;
  exhibition: Exhibition;
  onToggleBookmark: (id: string) => void;
};

export function ExhibitionCard({ bookmarked, exhibition, onToggleBookmark }: ExhibitionCardProps) {
  const status = STATUS_META[exhibition.status];

  return (
    <div className="flex items-start gap-2.5 overflow-hidden rounded-2xl px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] outline outline-1 -outline-offset-1 outline-neutral-400">
      <div className="flex h-32 flex-1 items-start gap-3">
        <div
          className={`h-32 w-24 shrink-0 rounded-xl shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)] ${exhibition.posterClassName}`}
        />

        <div className="flex h-full flex-col justify-between gap-4">
          <span
            className={`inline-flex w-fit rounded-[4px] px-2 py-0.5 text-[10px] leading-3 ${status.badgeClassName}`}
          >
            {status.label}
          </span>

          <div className="flex flex-col gap-2.5">
            <p className="text-base font-bold text-neutral-900">{exhibition.title}</p>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-neutral-800">{exhibition.department}</p>
                <p className="text-xs text-neutral-500">{exhibition.dateRange}</p>
              </div>
              <p className="text-[10px] leading-3 text-neutral-400">{exhibition.location}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        aria-label={bookmarked ? '저장 취소' : '저장'}
        aria-pressed={bookmarked}
        className="shrink-0 shadow-[0px_0px_18px_0px_rgba(67,0,209,0.06)]"
        onClick={() => onToggleBookmark(exhibition.id)}
        type="button"
      >
        <img alt="" className="size-4" src={bookmarked ? bookmarkFilledIcon : bookmarkIcon} />
      </button>
    </div>
  );
}
