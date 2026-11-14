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
import { Overlay, Skeleton, SkeletonList, SkeletonText } from '@/components/ui';
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
import { useSkeleton } from '@/hooks/useSkeleton';
import { toast } from '@/stores/toastStore';
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
  // 순서 편집 결과. 저장 뒤 목록을 다시 불러오면(data 가 바뀌면) 서버 순서를 그대로 쓴다
  const [ordered, setOrdered] = useState<{ base: unknown; works: Work[] } | null>(null);
  const [authorChoice, setAuthorChoice] = useState({ open: false, key: 0 });

  const { data, isPending, isError, refetch } = useDisplayArtworks(displayId);
  const { showSkeleton } = useSkeleton(isPending);
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
  const membersQuery = useDisplayMembers(isOwner ? displayId : 0);
  const memberList = membersQuery.data;
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
  const works = ordered && ordered.base === data ? ordered.works : fetchedWorks;

  const handleDelete = () => {
    if (!deleting || deleteArtworkMutation.isPending) return;
    deleteArtworkMutation.mutate(deleting.id, {
      onSuccess: () => {
        setOrdered(null);
        setConfirming(false);
        toast('작품을 삭제했어요');
      },
    });
  };

  // 프로토타입: 끌어서 놓을 때마다 바로 저장하고, 실패하면 직전 순서로 되돌린다
  const handleReorder = (next: Work[]) => {
    if (updateOrder.isPending || !canReorder) return;
    const previous = ordered;
    setOrdered({ base: data, works: next });
    updateOrder.mutate(
      next.map((work) => work.id),
      { onError: () => setOrdered(previous) },
    );
  };

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

  if (!embedded && displayPending) return <LoadingView />;
  if (!embedded && (displayError || !display))
    return <ErrorView message="전시 정보를 불러올 수 없습니다." onRetry={flowBack} />;

  const panel = (
    <>
      {/* 완료를 누른 뒤 저장이 실패해도(순서는 되돌아간다) 안내가 남도록 화면과 상관없이 둔다 */}
      {updateOrder.error && (
        <p role="alert" className="mt-3 text-[12px] font-medium text-[#fb2c36]">
          {getErrorMessage(updateOrder.error, '순서를 저장하지 못했어요. 다시 시도해주세요.')}
        </p>
      )}
      {showSkeleton ? (
        <div
          aria-label="전시작을 불러오는 중"
          aria-busy="true"
          className="mt-3 grid grid-cols-2 gap-x-3 gap-y-6 min-[640px]:grid-cols-3"
        >
          <SkeletonList count={6}>
            {() => (
              <div>
                <Skeleton className="aspect-3/4 rounded-0" />
                <div className="pt-2">
                  <SkeletonText className="typography-body-lg-semibold w-3/4" />
                  <SkeletonText className="typography-body-md-medium w-1/2" />
                </div>
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
          onOpen={(work) => navigate(`/exhibition/${displayId}/artworks/${work.id}/preview`)}
          onEdit={(work) => navigate(`/exhibition/${displayId}/artworks/${work.id}/edit`)}
          onDelete={(work) => {
            deleteArtworkMutation.reset();
            setDeleting(work);
            setConfirming(true);
          }}
          onEditOrder={() => {
            updateOrder.reset();
            setScreen('order');
          }}
        />
      ) : (
        <>
          <OrderScreen
            works={works}
            onReorder={handleReorder}
            onDone={() => setScreen('manage')}
            disabled={updateOrder.isPending}
          />
        </>
      )}
      <ArtworkAuthorChoiceSheet
        key={authorChoice.key}
        open={authorChoice.open}
        candidates={proxyCandidates}
        candidatesStatus={
          membersQuery.isError ? 'error' : membersQuery.isPending ? 'pending' : 'success'
        }
        onRetryCandidates={() => void membersQuery.refetch()}
        onClose={() => setAuthorChoice((prev) => ({ ...prev, open: false }))}
        onSelectMine={() => openRegister()}
        onSelectMember={(memberUserId) => openRegister({ kind: 'member', userId: memberUserId })}
        onSelectName={(name) => openRegister({ kind: 'name', name })}
      />
      <Overlay
        open={confirming}
        onClose={() => setConfirming(false)}
        title="작품을 삭제할까요?"
        description="삭제하면 이 작품이 전시에서 사라져요"
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
          <p className="typography-body-lg-semibold">삭제 안내</p>
          <p className="typography-body-md-medium mt-1">삭제된 작품은 복구할 수 없어요</p>
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
      onTabChange={(tab) => {
        if (tab === 'artworks') return;
        navigate(`/exhibition/${displayId}/work?tab=${tab}`, { replace: true });
      }}
    >
      {panel}
    </ExhibitionWorkLayout>
  );
}
