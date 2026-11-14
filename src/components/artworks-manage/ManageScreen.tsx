import type { DisplayDetailDto } from '@/api/dto';
import AddArtworkIcon from '@/assets/exhibition-work/AddArtworkIcon.svg';
import OrderIcon from '@/assets/exhibition-work/OrderIcon.svg';
import PlusIcon from '@/assets/exhibition-work/PlusIcon.svg';
import { useArtworkPolicy } from '@/hooks/usePolicy';
import type { ArtworkPolicyResource } from '@/policies/util';
import type { Work } from '@/types/artworkManage';
import { hasPermission } from '@/utils/hasPermission';
import { staggerStyle } from '@/utils/stagger';

import { MAX_DISPLAY_ARTWORKS } from './constants';
import { WorkActionSheet } from './WorkActionSheet';
import { WorkCard } from './WorkCard';

interface ManageScreenProps {
  works: Work[];
  display?: DisplayDetailDto;
  userId?: number;
  onEdit: (work: Work) => void;
  onDelete: (work: Work) => void;
  onEditOrder: () => void;
  onAdd: () => void;
}

function getArtworkPolicyResource(work: Work): ArtworkPolicyResource | undefined {
  if (work.artistUserId === undefined) return undefined;
  return {
    artistUserId: work.artistUserId,
    coAuthors: work.coAuthorUserIds?.map((userId) => ({ userId, name: '' })),
  };
}

function WorkRow({
  work,
  display,
  userId,
  onEdit,
  onDelete,
}: Pick<ManageScreenProps, 'display' | 'userId' | 'onEdit' | 'onDelete'> & { work: Work }) {
  const policy = useArtworkPolicy(display, getArtworkPolicyResource(work));
  const canEdit = hasPermission(policy, 'edit');
  const canDelete = hasPermission(policy, 'delete');
  const isMine =
    userId !== undefined &&
    (work.artistUserId === userId || Boolean(work.coAuthorUserIds?.includes(userId)));

  return (
    <WorkCard work={work} isMine={isMine}>
      {(canEdit || canDelete) && (
        <WorkActionSheet
          work={work}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={() => onEdit(work)}
          onDelete={() => onDelete(work)}
        />
      )}
    </WorkCard>
  );
}

export function ManageScreen({
  works,
  display,
  userId,
  onEdit,
  onDelete,
  onEditOrder,
  onAdd,
}: ManageScreenProps) {
  const policy = useArtworkPolicy(display);
  const canReorder = hasPermission(policy, 'reorder');
  const canCreate = hasPermission(policy, 'create');

  return (
    <>
      {works.length > 0 && (
        <div className="flex min-h-11 items-center justify-between">
          <p className="typography-body-lg-semibold text-primary">전시작 {works.length}</p>
          {canReorder && works.length > 1 && (
            <button
              type="button"
              onClick={onEditOrder}
              className="typography-body-md-medium -mr-2 flex min-h-11 items-center gap-1 rounded-8 px-2 text-secondary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
            >
              <img src={OrderIcon} alt="" />
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
          {canCreate && works.length < MAX_DISPLAY_ARTWORKS && (
            <button
              type="button"
              onClick={onAdd}
              className="typography-body-lg-semibold mb-3 flex min-h-11 w-full items-center justify-center gap-1 rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
            >
              <img src={PlusIcon} alt="" />
              전시작 추가
            </button>
          )}
          <ul className="grid grid-cols-2 gap-3 tablet:grid-cols-3 desktop:grid-cols-4">
            {works.map((work, index) => (
              <li key={work.id} className="min-w-0 animate-rise" style={staggerStyle(index)}>
                <WorkRow
                  work={work}
                  display={display}
                  userId={userId}
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
