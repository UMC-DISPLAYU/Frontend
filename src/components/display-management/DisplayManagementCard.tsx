import type { DisplayPublishStatus } from '@/api/dto';
import CalendarIcon from '@/assets/display-management/CalendarIcon.svg';
import LocationIcon from '@/assets/display-management/LocationIcon.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { useDisplayMembers } from '@/hooks/queries/useDisplayMembers';
import {
  useCurrentPolicyUser,
  useDisplayArtistNamePolicy,
  useDisplayPolicy,
} from '@/hooks/usePolicy';
import type { ExhibitionItem } from '@/types/mypage';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

import { type DisplayCardAction, DisplayCardMenu } from './DisplayCardMenu';
import { formatDisplayPeriod } from './formatDisplayPeriod';

// 전시 관리에서는 공개 여부만 보여주고, 기간에 따른 전시 예정 · 종료는 보여주지 않는다(PM 확인)
const PUBLISH_STATUS: Record<DisplayPublishStatus, { label: string; className?: string }> = {
  DRAFT: { label: '준비 중' },
  PENDING_REVIEW: { label: '심사 중', className: 'text-info' },
  REJECTED: { label: '반려', className: 'text-error' },
  PUBLISHED: { label: '공개 중', className: 'text-success' },
};

export function DisplayManagementCard({
  ex,
  onOpen,
  onDelete,
  onLeave,
  onEditArtistName,
}: {
  ex: ExhibitionItem;
  onOpen: () => void;
  onDelete: () => void;
  onLeave: () => void;
  onEditArtistName: (artistName: string) => void;
}) {
  const user = useCurrentPolicyUser();
  const myUserId = user?.id;

  // 내 전시 목록에 있다는 것 자체가 소속인이므로 전시 상세를 조회하지 않고 권한을 판단한다
  const policyDisplay = {
    ownerUserId: ex.isOwner ? (myUserId ?? 0) : 0,
    teamMembers: myUserId ? [{ userId: myUserId, accepted: true }] : [],
  };
  const canDelete = hasPermission(useDisplayPolicy(policyDisplay), 'delete');
  const canEditArtistName = hasPermission(useDisplayArtistNamePolicy(policyDisplay), 'edit');

  const { data: membersData } = useDisplayMembers(
    ex.artistName ? 0 : (ex.displayId ?? Number(ex.id)),
  );
  const artistName =
    ex.artistName ||
    membersData?.members?.find(
      (member) => myUserId != null && Number(member.userId) === Number(myUserId),
    )?.displayNickname;

  const isLeader = ex.isLeader ?? ex.isOwner ?? false;
  const role = isLeader ? '대표자' : '팀원';
  // 예전 응답처럼 publishStatus 가 없으면 공개된 전시로 본다
  const status = PUBLISH_STATUS[ex.publishStatus ?? 'PUBLISHED'] ?? PUBLISH_STATUS.PUBLISHED;

  const actions: DisplayCardAction[] = [];
  if (canEditArtistName) {
    actions.push({
      label: '전시 작가명 수정',
      onSelect: () => onEditArtistName(artistName ?? ''),
    });
  }
  if (!isLeader) {
    actions.push({ label: '전시 나가기', destructive: true, onSelect: onLeave });
  } else if (canDelete) {
    actions.push({ label: '전시 삭제하기', destructive: true, onSelect: onDelete });
  }

  return (
    <article className="group relative flex items-center gap-4 rounded-12 border border-primary bg-primary-white p-4 transition duration-fast ease-standard active:scale-99">
      <OptimizedImage
        src={ex.thumbnail}
        alt=""
        displayWidth={96}
        skeleton
        frameClassName="aspect-4/5 w-24 shrink-0 rounded-12 bg-secondary"
        className="transition-transform duration-base ease-standard group-hover:scale-103"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="flex min-h-5 items-center gap-1.5 pr-7">
          <span
            className={cn(
              'typography-body-md-semibold flex shrink-0 items-center gap-1.5',
              status.className ?? 'text-primary',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'size-2 rounded-circle bg-current',
                !status.className && 'text-icon-secondary',
              )}
            />
            {status.label}
          </span>
          <span className="typography-body-md-medium truncate text-secondary">
            · {role}
            {artistName ? `(${artistName})` : ''}
          </span>
        </p>
        <h3 className="typography-body-xl-semibold text-primary">
          {/* 카드 전체가 눌리도록 after 를 카드 크기로 늘린다. 메뉴 버튼은 그 위에 놓인다 */}
          <button
            type="button"
            onClick={onOpen}
            className="block w-full cursor-pointer text-left outline-none after:absolute after:inset-0 after:rounded-12 focus-visible:after:outline-2 focus-visible:after:outline-focus"
          >
            <span className="block truncate">{ex.title}</span>
          </button>
        </h3>
        {ex.org && <p className="typography-body-lg-medium truncate text-secondary">{ex.org}</p>}
        <p className="typography-body-lg-medium flex items-center gap-1 text-secondary">
          <img src={CalendarIcon} alt="" className="shrink-0" />
          <span className="truncate">
            {ex.startDate && ex.endDate ? formatDisplayPeriod(ex.startDate, ex.endDate) : ex.period}
          </span>
        </p>
        {ex.place && (
          <p className="typography-body-lg-medium flex items-center gap-1 text-secondary">
            <img src={LocationIcon} alt="" className="shrink-0" />
            <span className="truncate">{ex.place}</span>
          </p>
        )}
      </div>

      {actions.length > 0 && <DisplayCardMenu displayTitle={ex.title} actions={actions} />}
    </article>
  );
}
