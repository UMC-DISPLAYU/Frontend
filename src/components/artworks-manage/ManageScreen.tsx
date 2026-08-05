import { MoreHorizontal } from 'lucide-react';

import type { DisplayDetailDto } from '@/api/dto';
import { useArtworkPolicy } from '@/hooks/usePolicy';
import type { ArtworkPolicyResource } from '@/policies/util';
import type { Work } from '@/types/artworkManage';
import { hasPermission } from '@/utils/hasPermission';

import { BottomBar, Header, PrimaryButton, Thumbnail } from './Common';

interface ManageScreenProps {
  works: Work[];
  display?: DisplayDetailDto;
  onOpenSheet: (work: Work) => void;
  onEditOrder: () => void;
  onAddArtwork: () => void;
  onBack: () => void;
}

function getArtworkPolicyResource(work: Work): ArtworkPolicyResource | undefined {
  if (work.artistUserId === undefined) return undefined;

  return {
    artistUserId: work.artistUserId,
    coAuthorUserIds: work.coAuthorUserIds,
  };
}

function WorkRow({
  work,
  display,
  onOpenSheet,
}: {
  work: Work;
  display?: DisplayDetailDto;
  onOpenSheet: (work: Work) => void;
}) {
  const artworkPolicy = useArtworkPolicy(display, getArtworkPolicyResource(work));
  const canEdit = hasPermission(artworkPolicy, 'edit');
  const canDelete = hasPermission(artworkPolicy, 'delete');
  const canShowMenu = canEdit || canDelete;

  return (
    <li className="flex h-[110px] items-center justify-between gap-3 rounded-[18px] bg-card px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]">
      <div className="flex min-w-0 items-center gap-3">
        <Thumbnail src={work.thumbnail} />
        <div className="flex min-w-0 flex-col gap-2.5">
          <p className="typo-body-md-bold truncate text-main">{work.title}</p>
          <div>
            <p className="typo-body-xs-regular text-sub700">{work.artist}</p>
          </div>
          <p className="typo-body-xxs-regular text-faint">등록자 {work.owner}</p>
        </div>
      </div>

      {canShowMenu && (
        <button
          type="button"
          onClick={() => onOpenSheet(work)}
          aria-label={`${work.title} 작품 관리`}
          className="p-1"
        >
          <MoreHorizontal className="size-5 text-hint" />
        </button>
      )}
    </li>
  );
}

export function ManageScreen({
  works,
  display,
  onOpenSheet,
  onEditOrder,
  onAddArtwork,
  onBack,
}: ManageScreenProps) {
  const artworkPolicy = useArtworkPolicy(display);
  const canCreateArtwork = hasPermission(artworkPolicy, 'create');
  const canReorderArtwork = hasPermission(artworkPolicy, 'reorder');

  return (
    <>
      <Header title="전시작 관리" onBack={onBack} />

      <div className="flex items-end justify-between px-5 pt-3 pb-2">
        <p className="typo-body-md-bold text-main">전체 작품 {works.length}개</p>
        {canReorderArtwork && (
          <button
            type="button"
            onClick={onEditOrder}
            className="typo-body-xs-regular text-main underline"
          >
            순서 편집
          </button>
        )}
      </div>

      <ul className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pt-2 pb-28">
        {works.map((work) => (
          <WorkRow key={work.id} work={work} display={display} onOpenSheet={onOpenSheet} />
        ))}
      </ul>

      {canCreateArtwork && (
        <BottomBar>
          <PrimaryButton onClick={onAddArtwork}>전시작 추가</PrimaryButton>
        </BottomBar>
      )}
    </>
  );
}
