import { Link } from 'react-router-dom';

import calendarIcon from '@/assets/icons/CalendarIcon.svg';
import locationIcon from '@/assets/icons/LocationIcon.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

interface MapExhibitionCardProps {
  title: string;
  posterImageUrl: string;
  organization?: string;
  period: string;
  location: string;
  distance?: string;
  selected?: boolean;
  /** 있으면 상세로 가는 링크, 없으면 onClick 버튼 */
  to?: string;
  onClick?: () => void;
}

export function MapExhibitionCard({
  title,
  posterImageUrl,
  organization,
  period,
  location,
  distance,
  selected = false,
  to,
  onClick,
}: MapExhibitionCardProps) {
  const className = cn(
    'relative grid h-31 w-full grid-cols-[86px_minmax(0,1fr)] overflow-hidden rounded-12 border bg-interactive-primary text-left text-[#d4d4d8] transition-[border-color,scale] duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:border-[#3f3f46] active:scale-99',
    selected
      ? 'border-2 border-interactive-inverse hover:border-interactive-inverse'
      : 'border-[#27272a]',
  );

  const content = (
    <>
      <span className="relative bg-[#797979]">
        <OptimizedImage
          src={posterImageUrl}
          displayWidth={86}
          alt=""
          draggable={false}
          className="absolute inset-0 size-full object-cover outline -outline-offset-1 outline-[rgba(255,255,255,.1)]"
        />
      </span>
      <span className="flex min-w-0 flex-col justify-between p-3">
        <span className="min-w-0">
          <span className="typography-body-xl-semibold block truncate pr-14 text-interactive-inverse">
            {title}
          </span>
          {organization ? (
            <span className="typography-body-md-medium mt-0.5 block truncate">{organization}</span>
          ) : null}
        </span>
        <span className="typography-body-md-medium grid gap-0.5 text-tertiary">
          <span className="flex min-w-0 items-center gap-0.5">
            <img alt="" className="size-3.5 shrink-0" src={calendarIcon} />
            <span className="truncate">{period}</span>
          </span>
          <span className="flex min-w-0 items-center gap-0.5">
            <img alt="" className="size-3.5 shrink-0" src={locationIcon} />
            <span className="truncate">{location}</span>
          </span>
        </span>
        {distance ? (
          <span className="typography-body-md-medium absolute top-3 right-3 inline-flex h-6.25 items-center rounded-circle bg-[rgba(255,255,255,.12)] px-2.25 tabular-nums">
            {distance}
          </span>
        ) : null}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={selected ? `${title} (선택됨, 한 번 더 누르면 상세로 이동)` : undefined}
      className={className}
    >
      {content}
    </button>
  );
}
