import { MoreHorizontal } from 'lucide-react';

import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useDisplayArtistNamePolicy, useDisplayPolicy } from '@/hooks/usePolicy';
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
  onEditArtistName,
  onToggleMenu,
}: {
  ex: ExhibitionItem;
  menuOpen?: boolean;
  onClick: () => void;
  onDelete: () => void;
  onEditArtistName: () => void;
  onToggleMenu: () => void;
}) {
  const { data: userMe } = useUserMe();

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
  const canShowMenu = canEditArtistName || canDelete;

  return (
    <div
      className={cn(
        'relative flex gap-3 w-full px-4 py-3.5 rounded-2xl border-none items-start overflow-visible',
        'bg-box100 shadow-[8px_8px_18px_rgba(6,3,45,0.04),inset_1px_1px_4px_rgba(1,8,21,0.20),inset_-2px_-2px_2px_rgba(252,252,252,0.90)]',
      )}
    >
      <button type="button" onClick={onClick} className="flex min-w-0 flex-1 gap-3 text-left">
        <Poster src={ex.thumbnail} />
        <ExhibitionMeta ex={ex} />
      </button>
      {canShowMenu && (
        <button
          type="button"
          aria-label="전시 관리 메뉴"
          onClick={(event) => {
            event.stopPropagation();
            onToggleMenu();
          }}
          className="mt-0.5 shrink-0 text-hint"
        >
          <MoreHorizontal className="size-5" />
        </button>
      )}

      {menuOpen && canShowMenu && (
        <div className="absolute top-9 right-3 z-20 w-34 overflow-hidden rounded-lg bg-card shadow-[0px_4px_18px_rgba(6,3,45,0.12)]">
          {canEditArtistName && (
            <button
              type="button"
              onClick={onEditArtistName}
              className="typo-body-xs-regular w-full px-3 py-2.5 text-left text-main hover:bg-box"
            >
              전시 작가명 수정
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="typo-body-xs-regular w-full px-3 py-2.5 text-left text-error hover:bg-box"
            >
              삭제하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
