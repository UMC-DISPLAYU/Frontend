import type { Exhibition, ExhibitionStatus } from './types';

const STATUS_META: Record<ExhibitionStatus, { badgeClassName: string; label: string }> = {
  ended: { badgeClassName: 'bg-neutral-400 text-neutral-50', label: '종료' },
  endingSoon: { badgeClassName: 'bg-amber-500 text-neutral-50', label: '종료예정' },
  ongoing: { badgeClassName: 'bg-[#2483C3] text-neutral-50', label: '전시중' },
  upcoming: { badgeClassName: 'bg-neutral-300 text-neutral-50', label: '전시예정' },
};

type ExhibitionCardProps = {
  exhibition: Exhibition;
};

export function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  const status = STATUS_META[exhibition.status];

  return (
    <div className="flex flex-col overflow-hidden rounded-[10px] bg-neutral-50">
      <div className="flex flex-col items-start gap-2.5 px-2 py-3 shadow-[0px_4px_18px_0px_rgba(67,0,209,0.04)]">
        <div
          className={`relative h-56 w-full overflow-hidden rounded-xl shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)] ${exhibition.posterClassName}`}
        >
          <span
            className={`absolute top-2 left-2 inline-flex w-fit rounded-[4px] px-2 py-0.5 text-[10px] leading-3 ${status.badgeClassName}`}
          >
            {status.label}
          </span>
        </div>

        <div className="flex w-full flex-col gap-0.5">
          <p className="text-sm font-semibold text-neutral-900">{exhibition.title}</p>
          <div className="flex flex-col">
            <p className="text-xs text-neutral-800">{exhibition.department}</p>
            <p className="text-xs text-neutral-500">{exhibition.dateRange}</p>
          </div>
          <p className="text-[10px] leading-3 text-neutral-400">{exhibition.location}</p>
        </div>
      </div>
    </div>
  );
}
