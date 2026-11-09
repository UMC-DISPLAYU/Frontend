import { CalendarDays, Clock, Heart, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';

import type { DisplayDetailDto } from '@/api/dto';
import { useDisplayLikeStatus, useToggleDisplayLike } from '@/hooks/queries/useDisplayDetail';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArchivePolicy } from '@/hooks/usePolicy';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

import {
  type ExternalLink,
  formatPeriodDate,
  formatPeriodTime,
  toInstagramLink,
  toWebsiteLink,
} from './displayDetail.utils';
import { InstagramIcon, OutIcon, WebsiteIcon } from './LinkIcons';

type Props = {
  display: DisplayDetailDto;
  isPreview: boolean;
  /* 900px 이상에서 정보 아래에 놓이는 저장 · 공유 */
  actions: ReactNode;
};

function LikeButton({ display, disabled }: { display: DisplayDetailDto; disabled: boolean }) {
  const toggleLike = useToggleDisplayLike();
  const { data: likeStatus, isSuccess: isLikeStatusReady } = useDisplayLikeStatus(
    display.displayId,
  );
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const archivePolicy = useArchivePolicy();
  const liked = Boolean(likeStatus?.isLiked);
  const canToggle = hasPermission(archivePolicy, liked ? 'delete' : 'create');
  /* 로그인한 사용자는 실제 좋아요 여부를 받기 전까지 막아 중복 요청을 막는다 */
  const isBlocked = disabled || toggleLike.isPending || (canToggle && !isLikeStatusReady);

  const handleClick = () => {
    if (isBlocked) return;
    if (!canToggle) {
      openLoginModal();
      return;
    }
    toggleLike.mutate({ displayId: display.displayId, liked });
  };

  return (
    <>
      <button
        type="button"
        aria-label="좋아요"
        aria-pressed={liked}
        onClick={handleClick}
        disabled={isBlocked}
        className="-m-2 flex w-11 shrink-0 cursor-pointer flex-col items-center p-2 transition-transform duration-fast ease-standard active:scale-92 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Heart
          aria-hidden="true"
          size={24}
          strokeWidth={1.7}
          className={cn(
            'text-icon-primary transition-transform duration-base ease-standard',
            liked && 'scale-110 fill-current',
          )}
        />
        <span className="typography-body-md-medium text-secondary">
          {disabled ? 0 : (display.likeCount ?? 0)}
        </span>
      </button>
      {loginModal}
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  if (!value) return null;

  return (
    <div className="typography-body-lg-regular grid min-h-5 grid-cols-[14px_28px_1fr] items-center">
      {icon}
      <dt className="pl-1 text-tertiary">{label}</dt>
      <dd className="pl-2 text-secondary">{value}</dd>
    </div>
  );
}

const ICON_PROPS = {
  'aria-hidden': true,
  size: 14,
  strokeWidth: 1.7,
  className: 'text-icon-tertiary',
};

/* 피그마 전시 링크 개선안(11-05): 카드 · 버튼이 아니라 아이콘 + 글자 링크 한 줄, 입력한 것만 보인다 */
function ExternalLinks({ display }: { display: DisplayDetailDto }) {
  const links: (ExternalLink & { name: string; icon: ReactNode })[] = [];
  const instagram = toInstagramLink(display.instagramUrl);
  const website = toWebsiteLink(display.websiteUrl);
  if (instagram) links.push({ ...instagram, name: '인스타그램', icon: <InstagramIcon /> });
  if (website) links.push({ ...website, name: '웹사이트', icon: <WebsiteIcon /> });
  if (links.length === 0) return null;

  return (
    <div aria-label="전시 링크" className="-mt-4 flex flex-wrap gap-x-5 gap-y-1 desktop:mt-1.5">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${link.name} ${link.label} (새 탭에서 열려요)`}
          className="group typography-body-lg-medium relative inline-flex min-h-7 max-w-full items-center gap-1.5 text-primary before:absolute before:-inset-x-1 before:-inset-y-2 focus-visible:outline-2 focus-visible:outline-focus"
        >
          <span className="text-icon-tertiary">{link.icon}</span>
          <span className="max-w-55 min-w-0 truncate underline-offset-3 group-hover:underline">
            {link.label}
          </span>
          <OutIcon className="size-3 shrink-0 text-icon-tertiary transition duration-fast ease-standard group-hover:translate-x-px group-hover:-translate-y-px group-hover:text-icon-primary" />
        </a>
      ))}
    </div>
  );
}

export function DisplaySummary({ display, isPreview, actions }: Props) {
  const organizer =
    [display.organization, display.department].filter(Boolean).join(' ') || display.subtitle;

  return (
    <header className="grid gap-5 px-gutter py-6 desktop:px-0 desktop:pt-0 desktop:pb-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="typography-title-xs break-keep text-primary">{display.title}</h1>
          {organizer && (
            <p className="typography-body-lg-regular mt-1 text-secondary">{organizer}</p>
          )}
        </div>
        <LikeButton display={display} disabled={isPreview} />
      </div>

      <dl className="grid gap-2">
        <InfoRow
          icon={<CalendarDays {...ICON_PROPS} />}
          label="일정"
          value={formatPeriodDate(display.period?.startDate, display.period?.endDate)}
        />
        <InfoRow
          icon={<Clock {...ICON_PROPS} />}
          label="운영"
          value={formatPeriodTime(display.period?.startTime, display.period?.endTime)}
        />
        <InfoRow
          icon={<MapPin {...ICON_PROPS} />}
          label="장소"
          value={display.location?.placeName ?? ''}
        />
      </dl>

      <ExternalLinks display={display} />

      {actions}
    </header>
  );
}
