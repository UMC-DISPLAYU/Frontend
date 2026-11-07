import calendarIcon from '@/assets/icons/CalendarIcon.svg';
import locationIcon from '@/assets/icons/LocationIcon.svg';
import { cn } from '@/utils/cn';

type CardMetaListProps = {
  period?: string;
  location?: string;
  className?: string;
};

export function CardMetaList({ period, location, className }: CardMetaListProps) {
  if (!period && !location) return null;

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      {period ? (
        <p className="flex items-center gap-0.5">
          <img alt="" className="size-3.5 shrink-0" src={calendarIcon} />
          <span className="typography-body-md-medium text-tertiary">{period}</span>
        </p>
      ) : null}
      {location ? (
        <p className="flex max-w-full min-w-0 items-center gap-0.5">
          <img alt="" className="size-3.5 shrink-0" src={locationIcon} />
          <span className="typography-body-md-medium truncate text-tertiary">{location}</span>
        </p>
      ) : null}
    </div>
  );
}
