import { Link } from 'react-router-dom';

import type { Exhibition } from '../types';

type ExhibitionCardProps = {
  exhibition: Exhibition;
};

const formatDateRange = (startedAt: string, endedAt: string) => {
  const formatDate = (dateText: string) => {
    const date = new Date(dateText);

    if (Number.isNaN(date.getTime())) {
      return dateText;
    }

    return `${String(date.getUTCMonth() + 1).padStart(2, '0')}.${String(date.getUTCDate()).padStart(
      2,
      '0',
    )}`;
  };

  return `${formatDate(startedAt)} - ${formatDate(endedAt)}`;
};

export function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  return (
    <Link
      to={`/display/${exhibition.displayId}`}
      className="flex flex-col overflow-hidden rounded-xl bg-neutral-50 no-underline"
    >
      <div className="flex flex-col items-start gap-2.5 px-2 py-3 shadow-[0px_4px_18px_0px_rgba(67,0,209,0.04)]">
        <img
          alt=""
          className="h-55 w-full rounded-xl bg-neutral-200 object-cover shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)]"
          src={exhibition.posterImageUrl}
        />

        <div className="flex w-full flex-col gap-0.5">
          <p className="typo-body-sm-bold text-main">{exhibition.title}</p>
          <div className="flex flex-col">
            {exhibition.schoolDepartmentName ? (
              <p className="typo-body-xs-regular text-sub700 truncate">
                {exhibition.schoolDepartmentName}
              </p>
            ) : null}
            <p className="typo-body-xs-regular text-hint">
              {formatDateRange(exhibition.startedAt, exhibition.endedAt)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
