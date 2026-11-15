import './displaySummaryCard.css';

import { Link } from 'react-router-dom';

import type { DisplayDetailDto, DisplayPublishStatus } from '@/api/dto';
import { cn } from '@/utils/cn';
import { formatDisplayPeriod } from '@/utils/displayPeriod';

import { DisplayPublishStatusLabel } from './DisplayPublishStatusLabel';
import { OptimizedImage } from './OptimizedImage';

interface DisplaySummaryCardProps {
  display: DisplayDetailDto;
  status: DisplayPublishStatus;
  /** 공개 상태가 아닌 값을 보일 때 문구만 바꾼다. 색은 `status` 를 따른다 */
  statusLabel?: string;
  className?: string;
}

// 프로토타입 hub.html · works.html `.sumc`. 두 화면 값이 조금씩 달라 전시 관리(hub) 값으로 맞췄다
export function DisplaySummaryCard({
  display,
  status,
  statusLabel,
  className,
}: DisplaySummaryCardProps) {
  const poster = display.images.find((image) => image.imageType === 'MAIN') ?? display.images[0];

  return (
    <section aria-label="전시 요약" className={className}>
      <div className="mt-2 grid animate-[display-summary-rise_450ms_cubic-bezier(0.16,1,0.3,1)_backwards] grid-cols-[82px_minmax(0,1fr)] gap-x-3.5 rounded-12 border border-primary p-3">
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
            <DisplayPublishStatusLabel status={status} label={statusLabel} />
            {/* 보이는 크기는 프로토타입 그대로 두고, 누르는 영역만 가상 요소로 위아래 44px 까지 넓힌다 */}
            <Link
              to={`/exhibition/${display.displayId}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              className="typography-body-md-semibold group relative inline-flex items-center gap-0.5 whitespace-nowrap text-primary after:absolute after:-inset-x-1 after:-inset-y-3.5 after:content-[''] focus-visible:rounded-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              전시 미리보기
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-3.5 shrink-0 transition-transform duration-base ease-standard group-hover:translate-x-0.5"
              >
                <path d="m9 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <h2 className="typography-body-xl-semibold mt-1 break-words text-primary">
            {display.title}
          </h2>
          <p className="typography-body-md-medium text-secondary">
            {[display.organization, display.department].filter(Boolean).join(' ')}
          </p>
          {/* 부모가 자식 전체 자간을 덮어써도(전시 작업 화면) 날짜는 프로토타입 `.dt12` 자간을 지킨다 */}
          <p
            className={cn(
              'typography-body-md-regular2 mt-0.5 truncate text-secondary',
              'tracking-[0.01em]!',
            )}
          >
            {formatDisplayPeriod(display.period.startDate, display.period.endDate)}
          </p>
          <p className="typography-body-md-medium truncate text-secondary">
            {display.location.placeName}
          </p>
        </div>
      </div>
    </section>
  );
}
