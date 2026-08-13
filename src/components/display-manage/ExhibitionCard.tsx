import { MoreHorizontal } from 'lucide-react';

import { useDisplayArtistNamePolicy, useDisplayPolicy } from '@/hooks/usePolicy';
import { useAuthStore } from '@/stores/authStore';
import type { ExhibitionItem } from '@/types/mypage';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

import { ExhibitionMeta } from './ExhibitionMeta';
import { Poster } from './Poster';

export function ExhibitionCard({
  ex,
  menuOpen = false,
  onClick,
  onDelete,
  onLeave,
  onEditArtistName,
  onToggleMenu,
}: {
  ex: ExhibitionItem;
  menuOpen?: boolean;
  onClick: () => void;
  onDelete: () => void;
  onLeave: () => void;
  onEditArtistName: () => void;
  onToggleMenu: () => void;
}) {
  const userMe = useAuthStore((state) => state.user);

  /*
   * 내 전시 목록 응답이 생성/참여를 구분해 주므로 전시 상세를 따로 조회하지 않습니다.
   * 목록에 있다는 것 자체가 소속인이고, isOwner로 소유자 여부를 판단합니다.
   */
  const myUserId = userMe?.id;
  const policyDisplay = {
    ownerUserId: ex.isOwner ? (myUserId ?? 0) : 0,
    teamMembers: myUserId ? [{ userId: myUserId, accepted: true }] : [],
  };

  const displayPolicy = useDisplayPolicy(policyDisplay);
  const displayArtistNamePolicy = useDisplayArtistNamePolicy(policyDisplay);

  const canDelete = hasPermission(displayPolicy, 'delete');
  const canEditArtistName = hasPermission(displayArtistNamePolicy, 'edit');

  /* isLeader 값이 있으면 그걸 기준으로, 없으면 isOwner로 fallback */
  const isLeader = ex.isLeader ?? ex.isOwner ?? false;

  const canShowMenu = canEditArtistName || canDelete || !isLeader;

  return (
    <div
      className={cn(
        'relative w-full px-4 py-3.5 rounded-2xl border-none overflow-visible',
        'bg-neutral-50 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]',
      )}
    >
      <div className="flex items-start gap-3">
        {/* 썸네일 80×80 */}
        <button type="button" onClick={onClick} className="shrink-0">
          <Poster src={ex.thumbnail} w={80} h={80} radius={12} />
        </button>

        {/* 메타 정보 + 메뉴 버튼 */}
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <ExhibitionMeta ex={ex} />
        </button>

        {/* ... 메뉴 버튼 */}
        {canShowMenu && (
          <button
            type="button"
            aria-label="전시 관리 메뉴"
            onClick={(event) => {
              event.stopPropagation();
              onToggleMenu();
            }}
            className="shrink-0 self-start text-neutral-500"
          >
            <MoreHorizontal className="size-5" />
          </button>
        )}
      </div>

      {/* 드롭다운 메뉴 */}
      {menuOpen && canShowMenu && (
        <div className="absolute top-9 right-3 z-20 flex w-34 flex-col overflow-hidden rounded-2xl bg-neutral-50 shadow-[2px_4px_18px_0px_rgba(67,0,209,0.05)] outline outline-1 outline-offset-[-1px] outline-stone-300">
          {canEditArtistName && (
            <button
              type="button"
              onClick={onEditArtistName}
              className="flex h-10 w-full items-center justify-start px-3.5 typo-body-xs-regular text-main hover:bg-box"
            >
              전시 작가명 수정
            </button>
          )}
          {isLeader ? (
            canDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex h-10 w-full items-center justify-start border-t border-gray-200 px-3.5 typo-body-xs-regular text-error hover:bg-box"
              >
                삭제하기
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={onLeave}
              className="flex h-10 w-full items-center justify-start border-t border-gray-200 px-3.5 typo-body-xs-regular text-error hover:bg-box"
            >
              전시 나가기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
