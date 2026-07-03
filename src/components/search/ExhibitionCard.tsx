import { BookmarkIcon } from './Icons';
import type { Exhibition, ExhibitionStatus } from './types';

const STATUS_META: Record<ExhibitionStatus, { badgeClassName: string; label: string }> = {
  endingSoon: {
    badgeClassName: 'bg-amber-100 text-amber-800 outline-amber-200',
    label: '종료 임박',
  },
  ongoing: {
    badgeClassName: 'bg-green-50 text-green-700 outline-green-200',
    label: '진행 중',
  },
  upcoming: {
    badgeClassName: 'bg-gray-100 text-gray-700 outline-gray-200',
    label: '전시 예정',
  },
};

type ExhibitionCardProps = {
  bookmarked: boolean;
  exhibition: Exhibition;
  onToggleBookmark: (id: string) => void;
};

export function ExhibitionCard({ bookmarked, exhibition, onToggleBookmark }: ExhibitionCardProps) {
  const status = STATUS_META[exhibition.status];

  return (
    <div className="flex w-full items-start gap-3 rounded-2xl bg-white p-3.5 outline outline-1 -outline-offset-1 outline-gray-200">
      <div className={`h-20 w-16 shrink-0 rounded-2xl ${exhibition.thumbnailClassName}`} />

      <div className="flex min-w-0 flex-1 flex-col pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] leading-4 outline outline-1 -outline-offset-1 ${status.badgeClassName}`}
          >
            {status.label}
          </span>
          <button
            aria-label={bookmarked ? '저장 취소' : '저장'}
            aria-pressed={bookmarked}
            className="shrink-0 text-[#C4C7CD] hover:text-neutral-900"
            onClick={() => onToggleBookmark(exhibition.id)}
            type="button"
          >
            <BookmarkIcon className="size-4" filled={bookmarked} />
          </button>
        </div>

        <p className="truncate pt-1.5 text-sm font-bold text-neutral-900">{exhibition.title}</p>
        <p className="truncate pt-0.5 text-xs text-gray-400">{exhibition.subtitle}</p>
        <p className="pt-1.5 text-xs text-gray-500">{exhibition.dateRange}</p>
        <p className="truncate pt-0.5 text-xs text-gray-400">{exhibition.location}</p>
      </div>
    </div>
  );
}
