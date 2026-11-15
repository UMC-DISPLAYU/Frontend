import type { DisplayDetailDto } from '@/api/dto';
import AddArtworkIcon from '@/assets/exhibition-work/AddArtworkIcon.svg';
import PlusIcon from '@/assets/exhibition-work/PlusIcon.svg';
import { WorkIcon } from '@/components/exhibition-work';
import { useArtworkPolicy } from '@/hooks/usePolicy';
import type { ArtworkPolicyResource } from '@/policies/util';
import type { Work } from '@/types/artworkManage';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';
import { staggerStyle } from '@/utils/stagger';

import { MAX_DISPLAY_ARTWORKS, WORK_GRID } from './constants';
import { WorkActionSheet } from './WorkActionSheet';
import { WorkCard } from './WorkCard';

interface ManageScreenProps {
  works: Work[];
  display?: DisplayDetailDto;
  userId?: number;
  /* 카드를 눌렀을 때. 없으면 카드는 누를 수 없다(작품 미리보기는 별도 이슈에서 연결) */
  onOpen?: (work: Work) => void;
  onEdit: (work: Work) => void;
  onDelete: (work: Work) => void;
  onEditOrder: () => void;
  onAdd: () => void;
}

// 작품 목록은 대표 · 공동 작가 계정 id 를 artistUserIds 하나로 준다. 작품을 만든 사람인지만 보면 되므로 대표 외는 공동 작가로 둔다
function getArtworkPolicyResource(work: Work): ArtworkPolicyResource | undefined {
  if (work.artistUserId === undefined) return undefined;
  return {
    artistUserId: work.artistUserId,
    coAuthors: (work.artistUserIds ?? [])
      .filter((userId) => userId !== work.artistUserId)
      .map((userId) => ({ userId, name: '' })),
  };
}

function WorkRow({
  work,
  display,
  userId,
  onOpen,
  onEdit,
  onDelete,
}: Pick<ManageScreenProps, 'display' | 'userId' | 'onOpen' | 'onEdit' | 'onDelete'> & {
  work: Work;
}) {
  const policy = useArtworkPolicy(display, getArtworkPolicyResource(work));
  const canEdit = hasPermission(policy, 'edit');
  const canDelete = hasPermission(policy, 'delete');
  const isMine =
    userId !== undefined &&
    (work.artistUserId === userId || Boolean(work.artistUserIds?.includes(userId)));

  return (
    <div className="relative transition-transform duration-base ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-0.5">
      {/* … 메뉴는 카드 버튼 안에 넣지 않고 위에 겹친다 */}
      {onOpen ? (
        <button
          type="button"
          onClick={() => onOpen(work)}
          aria-label={`${work.title} 작품 미리보기`}
          className="block w-full touch-manipulation text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]"
        >
          <WorkCard work={work} isMine={isMine} />
        </button>
      ) : (
        <WorkCard work={work} isMine={isMine} />
      )}
      {(canEdit || canDelete) && (
        <WorkActionSheet
          work={work}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={() => onEdit(work)}
          onDelete={() => onDelete(work)}
        />
      )}
    </div>
  );
}

export function ManageScreen({
  works,
  display,
  userId,
  onOpen,
  onEdit,
  onDelete,
  onEditOrder,
  onAdd,
}: ManageScreenProps) {
  const policy = useArtworkPolicy(display);
  const canReorder = hasPermission(policy, 'reorder');
  const canCreate = hasPermission(policy, 'create');
  const showAdd = canCreate && works.length < MAX_DISPLAY_ARTWORKS;

  return (
    <>
      {works.length > 0 && (
        <div className="mt-1 flex min-h-10 items-center justify-between gap-3">
          <b className="text-[14px] font-semibold tabular-nums">전시작 {works.length}</b>
          {canReorder && (
            <button
              type="button"
              onClick={onEditOrder}
              className="inline-flex h-8 items-center gap-1 pl-2 text-[12px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]"
            >
              <WorkIcon name="lines" className="size-4" />
              순서 편집
            </button>
          )}
        </div>
      )}
      {works.length === 0 ? (
        canCreate ? (
          <button
            type="button"
            onClick={onAdd}
            className="mt-3 flex min-h-55 w-full flex-col items-center justify-center gap-1 rounded-12 bg-secondary text-primary transition duration-fast ease-standard hover:bg-tertiary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
          >
            <img src={AddArtworkIcon} alt="" className="mb-2" />
            <span className="typography-body-lg-semibold">전시작 추가</span>
            <span className="typography-body-md-medium text-secondary">작품을 등록해 주세요</span>
          </button>
        ) : (
          <p className="typography-body-lg-medium mt-3 flex min-h-55 items-center justify-center rounded-12 bg-secondary text-secondary">
            등록된 전시작이 없어요
          </p>
        )
      ) : (
        <>
          {showAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="typography-body-lg-semibold mt-3 flex min-h-11 w-full items-center justify-center gap-1 rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
            >
              <img src={PlusIcon} alt="" />
              전시작 추가
            </button>
          )}
          <ul className={cn(WORK_GRID, showAdd ? 'mt-5' : 'mt-3')}>
            {works.map((work, index) => (
              <li key={work.id} className="min-w-0 animate-rise" style={staggerStyle(index)}>
                <WorkRow
                  work={work}
                  display={display}
                  userId={userId}
                  onOpen={onOpen}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
