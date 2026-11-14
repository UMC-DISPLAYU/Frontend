import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import { cn } from '@/utils/cn';

import { DisplayHubIcon, type DisplayHubIconName } from './DisplayHubIcon';

const CARD_CLASS =
  'group block w-full rounded-12 border border-primary bg-primary-white text-left transition-[border-color,transform] duration-[200ms,300ms] ease-standard hover:border-[#a1a1aa] active:scale-[0.995] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

function CardHeader({
  icon,
  children,
  className,
  chevronClassName,
}: {
  icon: DisplayHubIconName;
  children: ReactNode;
  className?: string;
  chevronClassName: string;
}) {
  return (
    <span className={cn('flex items-center gap-2 text-primary', className)}>
      <DisplayHubIcon name={icon} strokeWidth={1.6} />
      {children}
      <DisplayHubIcon
        name="chevron"
        strokeWidth={1.6}
        className={cn(
          'ml-auto transition-transform duration-base ease-standard group-hover:translate-x-[3px]',
          chevronClassName,
        )}
      />
    </span>
  );
}

function Tile({
  icon,
  title,
  children,
  ...linkProps
}: LinkProps & { icon: DisplayHubIconName; title: string; children: ReactNode }) {
  return (
    <Link {...linkProps} className={cn(CARD_CLASS, 'p-4 desktop:px-6 desktop:py-5')}>
      <CardHeader
        icon={icon}
        className="typography-body-lg-semibold"
        chevronClassName="text-tertiary"
      >
        {title}
      </CardHeader>
      <span className="typography-body-lg-regular mt-3.5 grid gap-1 text-secondary">
        {children}
      </span>
    </Link>
  );
}

interface DisplayHubBlocksProps {
  display: DisplayDetailDto;
  artworkCount: number;
  acceptedCount: number;
  pendingCount: number;
}

export function DisplayHubBlocks({
  display,
  artworkCount,
  acceptedCount,
  pendingCount,
}: DisplayHubBlocksProps) {
  const basePath = `/exhibition/${display.displayId}`;
  const contentSectionCount = display.contentCategories.length;
  const isWorkEmpty = artworkCount === 0 && contentSectionCount === 0;

  return (
    <>
      <Link to={`${basePath}/work`} className={cn(CARD_CLASS, 'mt-5 p-5 desktop:mt-0 desktop:p-6')}>
        <CardHeader
          icon="folder"
          className="typography-body-lg-semibold desktop:typography-body-xl-semibold"
          chevronClassName="size-4.5"
        >
          전시 작업
        </CardHeader>
        {isWorkEmpty ? (
          <span className="typography-body-lg-medium mt-3.5 block pl-[34px] text-secondary">
            아직 등록된 작품과 전시 콘텐츠가 없어요
          </span>
        ) : (
          <span className="mt-4 grid min-h-12 grid-cols-[152px_1fr] items-center text-primary desktop:grid-cols-2">
            <DisplayHubStat label="작품" value={artworkCount} unit="점" />
            <DisplayHubStat
              label="전시 콘텐츠"
              value={contentSectionCount}
              unit="섹션"
              className="border-l border-primary pl-4"
            />
          </span>
        )}
      </Link>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Tile to={`${basePath}/team`} icon="team" title="팀원 관리">
          <span>참여 {acceptedCount}명</span>
          {pendingCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
              <span aria-hidden="true" className="size-2 rounded-circle bg-[#f5b800]" />
              초대 대기 {pendingCount}명
            </span>
          ) : (
            <span>초대 대기 0명</span>
          )}
        </Tile>

        <Tile
          to={`${basePath}/edit`}
          state={{ displayDetail: display }}
          icon="pencil"
          title="기본 정보"
        >
          <span>전시명·소개·일정</span>
          <span>장소</span>
        </Tile>
      </div>
    </>
  );
}

function DisplayHubStat({
  label,
  value,
  unit,
  className,
}: {
  label: string;
  value: number;
  unit: string;
  className?: string;
}) {
  return (
    <span className={cn('block', className)}>
      <span className="typography-body-lg-medium mb-0.5 block">{label}</span>
      <span className="typography-body-xxl-semibold tabular-nums desktop:text-[24px]">{value}</span>
      <span className="typography-body-lg-medium ml-0.5">{unit}</span>
    </span>
  );
}
