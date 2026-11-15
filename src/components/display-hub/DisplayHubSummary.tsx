import './displayHub.css';

import { cn } from '@/utils/cn';

import { DISPLAY_HUB_STATUS_META, type DisplayHubStatus } from './displayHubStatus';

const RISE_CLASS = 'animate-[display-hub-rise_450ms_cubic-bezier(0.16,1,0.3,1)_backwards]';

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
