import type { Exhibition } from './types';

type ExhibitionCardProps = {
  exhibition: Exhibition;
};

const formatDateRange = (startedAt: string, endedAt: string) => {
  const formatDate = (dateText: string) => {
    const date = new Date(dateText);

    if (Number.isNaN(date.getTime())) {
      return dateText;
    }

    return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(
      2,
      '0',
    )}`;
  };

  return `${formatDate(startedAt)} - ${formatDate(endedAt)}`;
};

export function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[10px] bg-neutral-50">
      <div className="flex flex-col items-start gap-2.5 px-2 py-3 shadow-[0px_4px_18px_0px_rgba(67,0,209,0.04)]">
        <img
          alt=""
          className="h-56 w-full rounded-xl bg-neutral-200 object-cover shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)]"
          src={exhibition.posterImageUrl}
        />

        <div className="flex w-full flex-col gap-0.5">
          <p className="text-sm font-semibold text-neutral-900">{exhibition.title}</p>
          <div className="flex flex-col">
            {exhibition.dayLeft !== undefined ? (
              <p className="text-xs text-neutral-800">D-{exhibition.dayLeft}</p>
            ) : null}
            <p className="text-xs text-neutral-500">
              {formatDateRange(exhibition.startedAt, exhibition.endedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
