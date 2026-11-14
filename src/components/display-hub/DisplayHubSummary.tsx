import './displayHub.css';

import { Link } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import { DisplayPublishStatusLabel } from '@/components/common/DisplayPublishStatusLabel';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

import { DisplayHubIcon } from './DisplayHubIcon';
import {
  DISPLAY_HUB_STATUS_META,
  type DisplayHubStatus,
  formatDisplayHubPeriod,
} from './displayHubStatus';

const RISE_CLASS = 'animate-[display-hub-rise_450ms_cubic-bezier(0.16,1,0.3,1)_backwards]';

interface DisplayHubSummaryProps {
  display: DisplayDetailDto;
  status: DisplayHubStatus;
  className?: string;
}

export function DisplayHubSummary({ display, status, className }: DisplayHubSummaryProps) {
  const poster = display.images.find((image) => image.imageType === 'MAIN') ?? display.images[0];

  return (
    <section aria-label="전시 요약" className={className}>
      <div
        className={cn(
          'mt-2 grid grid-cols-[82px_minmax(0,1fr)] gap-x-3.5 rounded-12 border border-primary p-3',
          RISE_CLASS,
        )}
      >
        <div className="aspect-402/568 w-[82px] overflow-hidden bg-[#000]">
          <OptimizedImage
            src={poster?.imageUrl}
            alt={`${display.title} 포스터`}
            displayWidth={82}
            skeleton
            loading="eager"
            frameClassName="h-full w-full"
            className="object-cover"
          />
        </div>
        <div className="grid min-w-0 content-start gap-0.5">
          <div className="flex items-center justify-between gap-2 text-primary">
            <DisplayPublishStatusLabel status={status} />
            {/* 보이는 크기는 프로토타입 그대로 두고, 누르는 영역만 가상 요소로 위아래 44px 까지 넓힌다 */}
            <Link
              to={`/exhibition/${display.displayId}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              className="typography-body-md-semibold group relative inline-flex items-center gap-0.5 whitespace-nowrap text-primary after:absolute after:-inset-x-1 after:-inset-y-3.5 after:content-[''] focus-visible:rounded-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              전시 미리보기
              <DisplayHubIcon
                name="chevron"
                className="size-3.5 transition-transform duration-base ease-standard group-hover:translate-x-0.5"
              />
            </Link>
          </div>
          <h2 className="typography-body-xl-semibold mt-1 break-words text-primary">
            {display.title}
          </h2>
          <p className="typography-body-md-medium text-secondary">
            {[display.organization, display.department].filter(Boolean).join(' ')}
          </p>
          <p className="typography-body-md-regular2 mt-0.5 truncate text-secondary">
            {formatDisplayHubPeriod(display.period.startDate, display.period.endDate)}
          </p>
          <p className="typography-body-md-medium truncate text-secondary">
            {display.location.placeName}
          </p>
        </div>
      </div>
    </section>
  );
}

interface DisplayHubStatusBannerProps {
  status: DisplayHubStatus;
  rejectionReason?: string;
  className?: string;
}

export function DisplayHubStatusBanner({
  status,
  rejectionReason,
  className,
}: DisplayHubStatusBannerProps) {
  const meta = DISPLAY_HUB_STATUS_META[status];
  const description = rejectionReason ? `${rejectionReason} ${meta.description}` : meta.description;

  return (
    <div className={className}>
      <div role="status" className={cn('mt-4 rounded-12 p-4', meta.noticeClassName, RISE_CLASS)}>
        <p className={cn('typography-body-lg-semibold', meta.noticeTitleClassName)}>{meta.title}</p>
        <p className="typography-body-md-medium mt-1 whitespace-pre-line text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}
