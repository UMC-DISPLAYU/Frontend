import type { Exhibition } from './types';

type ExhibitionCardProps = {
  exhibition: Exhibition;
};

export function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[10px] bg-neutral-50">
      <div className="flex flex-col items-start gap-2.5 px-2 py-3 shadow-[0px_4px_18px_0px_rgba(67,0,209,0.04)]">
        <div
          className={`relative h-56 w-full overflow-hidden rounded-xl shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)] ${exhibition.posterClassName}`}
        />

        <div className="flex w-full flex-col gap-0.5">
          <p className="text-sm font-semibold text-neutral-900">{exhibition.title}</p>
          <div className="flex flex-col">
            <p className="text-xs text-neutral-800">{exhibition.department}</p>
            <p className="text-xs text-neutral-500">{exhibition.dateRange}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
