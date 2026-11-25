import { DisplayPublishStatusLabel } from '@/components/common/DisplayPublishStatusLabel';
import { FitImage } from '@/components/common/FitImage';
import { VideoPosterBadge } from '@/components/common/VideoPosterBadge';
import { useDisplayMembers } from '@/hooks/queries/useDisplayMembers';
import {
  useCurrentPolicyUser,
  useDisplayArtistNamePolicy,
  useDisplayPolicy,
} from '@/hooks/usePolicy';
import type { ExhibitionItem } from '@/types/mypage';
import { cn } from '@/utils/cn';
import { isDisplayPublishStatus } from '@/utils/displayPublishStatus';
import { hasPermission } from '@/utils/hasPermission';
import { POSTER_FIT_RULE } from '@/utils/imageFit';

import { type DisplayCardAction, DisplayCardMenu } from './DisplayCardMenu';
import { formatDisplayPeriod } from './formatDisplayPeriod';

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
  const role = isLeader ? '대표자' : ex.role === 'MANAGER' ? '관리자' : '팀원';
  // 전시 관리에서는 공개 여부만 보여주고, 기간에 따른 전시 예정 · 종료는 보여주지 않는다(PM 확인).
  // 예전 응답처럼 publishStatus 가 없으면 공개된 전시로 본다
  const status = isDisplayPublishStatus(ex.publishStatus) ? ex.publishStatus : 'PUBLISHED';

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

  const period =
    ex.startDate && ex.endDate ? formatDisplayPeriod(ex.startDate, ex.endDate) : ex.period;

  return (
    <article
      className={cn(
        'relative grid h-full grid-cols-[96px_minmax(0,1fr)] gap-x-4 rounded-[12px] border border-[#d4d4d8] bg-[#fff] p-4 [&_*]:tracking-[-0.03em] transition-[border-color,scale] duration-300 ease-standard',
        // 프로토타입은 대표자 카드(전시 관리로 들어가는 카드)에만 커서 · 테두리 · 누름 효과를 준다
        isLeader && 'hover:border-[#a1a1aa] active:scale-[0.995]',
      )}
    >
      <div className="relative aspect-402/568 w-24 overflow-hidden bg-[#000]">
        <FitImage
          src={ex.thumbnail}
          alt=""
          displayWidth={96}
          crop={ex.posterCrop}
          fit={ex.hasVideoPoster ? 'FILL' : ex.posterFit}
          rule={POSTER_FIT_RULE}
          fitClassName="bg-secondary"
          fitColor={ex.posterEdgeColor}
          skeleton
          frameClassName="absolute inset-0"
          className="object-cover"
        />
        {ex.hasVideoPoster && <VideoPosterBadge />}
      </div>

      <div className="grid min-w-0 grid-cols-1 content-start gap-0.5 pr-8">
        <p className="flex items-center gap-1.5 text-[12px] leading-[1.4] font-medium text-[#3f3f47]">
          <DisplayPublishStatusLabel status={status} className="shrink-0" />
          <span className="min-w-0 truncate">
            · {role}
            {artistName ? `(${artistName})` : ''}
          </span>
        </p>
        <h3 className="mt-1 text-[16px] leading-[1.4] font-semibold text-[#18181b] desktop:text-[18px]">
          {/* 카드 전체가 눌리도록 after 를 카드 크기로 늘린다. 메뉴 버튼은 그 위에 놓인다 */}
          <button
            type="button"
            onClick={onOpen}
            className={cn(
              'block w-full text-left outline-none after:absolute after:inset-0 after:rounded-[12px] focus-visible:after:outline-2 focus-visible:after:outline-focus',
              isLeader ? 'cursor-pointer' : 'cursor-default',
            )}
          >
            <span className="block truncate">{ex.title}</span>
          </button>
        </h3>
        {ex.org && (
          <p className="truncate text-[14px] leading-[1.4] font-medium text-[#3f3f47]">{ex.org}</p>
        )}
        {period && (
          <p className="mt-0.5 truncate text-[14px] leading-[1.4] font-medium text-[#3f3f47]">
            {period}
          </p>
        )}
        {ex.place && (
          <p
            className={cn(
              'truncate text-[14px] leading-[1.4] font-medium text-[#3f3f47]',
              period ? 'mt-[3px]' : 'mt-0.5',
            )}
          >
            {ex.place}
          </p>
        )}
      </div>

      {actions.length > 0 && <DisplayCardMenu displayTitle={ex.title} actions={actions} />}
    </article>
  );
}
