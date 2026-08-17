import { Link } from 'react-router-dom';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { formatDate } from '@/utils/date';

import type { Exhibition } from '../types';

type ExhibitionCardProps = {
  exhibition: Exhibition;
};

const formatDateRange = (startedAt: string, endedAt: string) =>
  `${formatDate(startedAt)} - ${formatDate(endedAt)}`;

export function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  return (
    <Link
      to={`/display/${exhibition.displayId}`}
      className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-neutral-50 no-underline shadow-[0px_4px_18px_0px_rgba(67,0,209,0.04)]"
    >
      <div className="flex h-full w-full flex-col items-start gap-2.5 px-2 py-3">
        <OptimizedImage
          alt=""
          className="h-55 w-full rounded-xl bg-neutral-200 object-cover shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)]"
          src={exhibition.posterImageUrl}
          displayWidth={200}
        />

        <div className="flex w-full flex-1 flex-col justify-between gap-0.5">
          <div>
            <p className="typo-body-sm-bold text-main">{exhibition.title}</p>
            {exhibition.schoolDepartmentName ? (
              <p className="typo-body-xs-regular text-sub700 truncate">
                {exhibition.schoolDepartmentName}
              </p>
            ) : null}
          </div>
          <p className="typo-body-xs-regular text-hint mt-0.5">
            {formatDateRange(exhibition.startedAt, exhibition.endedAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
