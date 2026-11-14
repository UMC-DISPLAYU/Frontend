import { Link } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import ChevronIcon from '@/assets/exhibition-work/ChevronIcon.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

import {
  DISPLAY_HUB_STATUS_META,
  type DisplayHubStatus,
  formatDisplayHubPeriod,
} from './displayHubStatus';

interface DisplayHubSummaryProps {
  display: DisplayDetailDto;
  status: DisplayHubStatus;
  rejectionReason?: string;
}

export function DisplayHubSummary({ display, status, rejectionReason }: DisplayHubSummaryProps) {
  const meta = DISPLAY_HUB_STATUS_META[status];
  const poster = display.images.find((image) => image.imageType === 'MAIN') ?? display.images[0];
  const description = rejectionReason ? `${rejectionReason} ${meta.description}` : meta.description;

  return (
    <section aria-label="전시 요약" className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-12 border border-primary p-3">
        <div className="aspect-402/568 w-21 shrink-0 overflow-hidden bg-secondary">
          <OptimizedImage
            src={poster?.imageUrl}
            alt={`${display.title} 포스터`}
            displayWidth={84}
            skeleton
            loading="eager"
            frameClassName="h-full w-full"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-h-5 items-center justify-between gap-1">
            <p
              className={cn(
                'typography-body-md-semibold flex shrink-0 items-center gap-1.5',
                meta.labelClassName,
              )}
            >
              <span aria-hidden="true" className="size-2 rounded-circle bg-current" />
              {meta.label}
            </p>
            <Link
              to={`/display/${display.displayId}`}
              className="typography-body-md-semibold group -my-3 -mr-1 flex min-h-11 items-center gap-2 rounded-8 px-1 text-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
            >
              전시 미리보기
              <img
                src={ChevronIcon}
                alt=""
                className="transition-transform duration-fast ease-standard group-hover:translate-x-0.5"
              />
            </Link>
          </div>
          <p className="typography-body-lg-semibold truncate text-primary">{display.title}</p>
          <p className="typography-body-md-medium truncate text-secondary">
            {[display.organization, display.department].filter(Boolean).join(' ')}
          </p>
          <p className="typography-body-md-medium truncate text-secondary">
            {formatDisplayHubPeriod(display.period.startDate, display.period.endDate)}
          </p>
          <p className="typography-body-md-medium truncate text-secondary">
            {display.location.placeName}
          </p>
        </div>
      </div>

      <div className={cn('flex flex-col gap-1 rounded-12 p-4', meta.noticeClassName)}>
        <p className={cn('typography-body-lg-semibold', meta.noticeTitleClassName)}>{meta.title}</p>
        <p className="typography-body-md-medium whitespace-pre-line text-secondary">
          {description}
        </p>
      </div>
    </section>
  );
}
