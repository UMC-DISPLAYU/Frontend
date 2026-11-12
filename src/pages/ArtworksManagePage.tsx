import { useMemo, useState } from 'react';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  ArtworkAuthorChoiceSheet,
  buildArtworkRegisterPath,
  type ProxyAuthor,
  toTeamCandidates,
} from '@/components/artwork-register';
import { ManageScreen, OrderScreen } from '@/components/artworks-manage';
import { ErrorView, LoadingView } from '@/components/common';
import { ExhibitionWorkLayout } from '@/components/exhibition-work';
import { Overlay, Skeleton, SkeletonList } from '@/components/ui';
import {
  useDeleteArtwork,
  useDisplayArtworks,
  useUpdateArtworkOrder,
} from '@/hooks/queries/useDisplayArtworks';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useDisplayMembers } from '@/hooks/queries/useDisplayMembers';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useArtworkPolicy } from '@/hooks/usePolicy';
import type { Work } from '@/types/artworkManage';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';

export function ArtworksManagePage({ embedded = false }: { embedded?: boolean } = {}) {
  const navigate = useNavigate();
  const flowBack = useFlowBack();
  const { displayId: paramDisplayId } = useParams();
  const [searchParams] = useSearchParams();
  const { data: userMe } = useUserMe();
  const userId = userMe?.id;
  const displayId = Number(paramDisplayId ?? searchParams.get('displayId') ?? 0);

  const [screen, setScreen] = useState<'manage' | 'order'>(
    !embedded && searchParams.get('mode') === 'order' ? 'order' : 'manage',
  );
  const [deleting, setDeleting] = useState<Work | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [orderedWorks, setOrderedWorks] = useState<Work[] | null>(null);
  const [authorChoice, setAuthorChoice] = useState({ open: false, key: 0 });

  const { data, isPending, isError, refetch } = useDisplayArtworks(displayId);
  const {
    data: display,
    isPending: displayPending,
    isError: displayError,
  } = useDisplayDetail(displayId);
  const deleteArtworkMutation = useDeleteArtwork(displayId);
  const updateOrder = useUpdateArtworkOrder(displayId);
  const artworkPolicy = useArtworkPolicy(display);
  const canReorder = hasPermission(artworkPolicy, 'reorder');
  const isOrderScreen = screen === 'order' && canReorder;
  const isOwner = typeof display?.ownerUserId === 'number' && display.ownerUserId === userId;
  // 대신 등록 시트의 팀원 목록. 대표자만 시트를 열기 때문에 대표자일 때만 불러온다
  const { data: memberList } = useDisplayMembers(isOwner ? displayId : 0);
  const proxyCandidates = useMemo(
    () =>
      toTeamCandidates(memberList?.members, {
        ownerUserId: display?.ownerUserId,
        excludeUserIds: [userId],
      }),
    [display?.ownerUserId, memberList, userId],
  );

  const fetchedWorks = useMemo<Work[]>(
    () =>
      (data?.artworks ?? []).map((artwork) => ({
        id: artwork.artworkId,
        title: artwork.artworkName,
        artist: artwork.artistName,
        org: '',
        date: '',
        place: '',
        owner: artwork.artistName,
        artistUserId: artwork.artistUserId,
        coAuthorUserIds: artwork.coAuthorUserIds,
        thumbnail: artwork.artworkImageUrl,
      })),
    [data],
  );
  const works = orderedWorks ?? fetchedWorks;

  const handleDelete = () => {
    if (!deleting || deleteArtworkMutation.isPending) return;
    deleteArtworkMutation.mutate(deleting.id, {
      onSuccess: () => {
        setOrderedWorks(null);
        setConfirming(false);
      },
    });
  };

  const saveOrder = (onSuccess: () => void) => {
    if (updateOrder.isPending || !canReorder) return;
    if (!orderedWorks) {
      onSuccess();
      return;
    }
    updateOrder.mutate(
      orderedWorks.map((work) => work.id),
      {
        onSuccess: () => {
          setOrderedWorks(null);
          onSuccess();
        },
      },
    );
  };

  const handleOrderDone = () => saveOrder(() => setScreen('manage'));

  // 프로토타입: 팀원은 바로 작품 등록, 대표자는 먼저 누구의 작품인지 고른다
  const handleAddArtwork = () => {
    if (!isOwner) {
      navigate(buildArtworkRegisterPath(displayId));
      return;
    }

    setAuthorChoice((prev) => ({ open: true, key: prev.key + 1 }));
  };

  // 시트가 쌓은 기록을 대체해야 등록 화면에서 뒤로가기로 이 목록에 돌아온다
  const openRegister = (proxy?: ProxyAuthor) =>
    navigate(buildArtworkRegisterPath(displayId, proxy), { replace: true });

  if (!embedded && displayPending) return <LoadingView message="전시 정보를 불러오는 중..." />;
  if (!embedded && (displayError || !display))
    return <ErrorView message="전시 정보를 불러올 수 없습니다." onRetry={flowBack} />;

  const panel = (
    <>
      {isPending ? (
        <div
          aria-label="전시작을 불러오는 중"
          className="mt-3 grid grid-cols-2 gap-3 tablet:grid-cols-3 desktop:grid-cols-4"
        >
          <SkeletonList count={6}>
            {() => (
              <div className="rounded-12 bg-secondary p-1.75">
                <Skeleton className="aspect-3/4 rounded-12" />
                <Skeleton className="mt-2 h-10 rounded-8" />
              </div>
            )}
          </SkeletonList>
        </div>
      ) : isError ? (
        <ErrorView message="전시작을 불러오지 못했어요." onRetry={() => void refetch()} />
      ) : !isOrderScreen ? (
        <ManageScreen
          works={works}
          display={display}
          userId={userId}
          onAdd={handleAddArtwork}
          onEdit={(work) => navigate(`/exhibition/${displayId}/artworks/${work.id}/edit`)}
          onDelete={(work) => {
            deleteArtworkMutation.reset();
            setDeleting(work);
            setConfirming(true);
          }}
          onEditOrder={() => {
            if (embedded) {
              navigate(`/exhibition/${displayId}/artworks?mode=order`);
              return;
            }
            updateOrder.reset();
            setScreen('order');
          }}
        />
      ) : (
        <>
          {updateOrder.error && (
            <p role="alert" className="typography-body-md-medium my-3 text-error">
              {getErrorMessage(updateOrder.error, '순서를 저장하지 못했어요. 다시 시도해주세요.')}
            </p>
          )}
          <OrderScreen
            works={works}
            onReorder={setOrderedWorks}
            onDone={handleOrderDone}
            disabled={updateOrder.isPending}
          />
        </>
      )}
      <ArtworkAuthorChoiceSheet
        key={authorChoice.key}
        open={authorChoice.open}
        candidates={proxyCandidates}
        onClose={() => setAuthorChoice((prev) => ({ ...prev, open: false }))}
        onSelectMine={() => openRegister()}
        onSelectMember={(memberUserId) => openRegister({ kind: 'member', userId: memberUserId })}
        onSelectName={(name) => openRegister({ kind: 'name', name })}
      />
      <Overlay
        open={confirming}
        onClose={() => setConfirming(false)}
        title="작품을 삭제할까요?"
        description="선택한 작품이 전시에서 사라져요"
        role="alertdialog"
        size="sm"
        showCloseButton={false}
        footer={
          <div className="flex gap-2 pb-5 tablet:pb-0">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleteArtworkMutation.isPending}
              className="typography-body-lg-semibold min-h-11 flex-1 rounded-12 bg-secondary text-primary focus-visible:outline-2 focus-visible:outline-focus active:scale-99 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteArtworkMutation.isPending}
              className="typography-body-lg-semibold min-h-11 flex-1 rounded-12 bg-notice text-interactive-inverse focus-visible:outline-2 focus-visible:outline-focus active:scale-99 disabled:opacity-50"
            >
              {deleteArtworkMutation.isPending ? '삭제 중' : '삭제하기'}
            </button>
          </div>
        }
      >
        <div className="rounded-12 bg-error-subtle p-3 text-error">
          <p className="typography-body-lg-semibold">삭제 주의</p>
          <p className="typography-body-md-medium mt-1">삭제한 작품은 복구할 수 없어요.</p>
        </div>
        {deleteArtworkMutation.error && (
          <p role="alert" className="typography-body-md-medium mt-3 text-error">
            {getErrorMessage(
              deleteArtworkMutation.error,
              '작품을 삭제하지 못했어요. 다시 시도해주세요.',
            )}
          </p>
        )}
      </Overlay>
    </>
  );

  return embedded ? (
    panel
  ) : (
    <ExhibitionWorkLayout
      display={display!}
      activeTab="artworks"
      onBack={isOrderScreen ? handleOrderDone : flowBack}
      onTabChange={(tab) => {
        if (tab === 'artworks') return;
        const changeTab = () =>
          navigate(`/exhibition/${displayId}/work?tab=${tab}`, { replace: true });
        if (isOrderScreen) saveOrder(changeTab);
        else changeTab();
      }}
    >
      {panel}
    </ExhibitionWorkLayout>
  );
}
