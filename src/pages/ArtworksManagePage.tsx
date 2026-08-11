import { useMemo, useState } from 'react';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  DeleteConfirmDialog,
  ManageScreen,
  OrderScreen,
  WorkActionSheet,
} from '@/components/artworks-manage';
import { BottomFixedBar } from '@/components/common';
import { ExhibitionHeader } from '@/components/ui';
import {
  useDeleteArtwork,
  useDisplayArtworks,
  useUpdateArtworkOrder,
} from '@/hooks/queries/useDisplayArtworks';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
// import { useArtworkPolicy } from '@/hooks/usePolicy';
// import type { ArtworkPolicyResource } from '@/policies/util';
import type { Work } from '@/types/artworkManage';

export function ArtworksManagePage() {
  const navigate = useNavigate();
  const { displayId: paramDisplayId } = useParams();
  const [searchParams] = useSearchParams();

  // 중첩 라우트의 displayId를 최우선으로 사용하고 없으면 쿼리 스트링에서 가져옵니다.
  const displayId = Number(paramDisplayId ?? searchParams.get('displayId') ?? 0);

  const [screen, setScreen] = useState<'manage' | 'order'>('manage');
  const [sheetWork, setSheetWork] = useState<Work | null>(null);
  const [confirming, setConfirming] = useState(false);
  // 순서 편집 중에는 사용자가 끌어놓은 순서를 우선 보여줍니다.
  const [orderedWorks, setOrderedWorks] = useState<Work[] | null>(null);

  const { data } = useDisplayArtworks(displayId);
  const { data: display } = useDisplayDetail(displayId);
  const deleteArtworkMutation = useDeleteArtwork(displayId);
  const updateOrder = useUpdateArtworkOrder(displayId);

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
  // const sheetArtworkPolicy = useArtworkPolicy(display, getArtworkPolicyResource(sheetWork));
  const canEditSheetArtwork = true;
  const canDeleteSheetArtwork = true;

  const canCreateArtwork = true;
  const shouldShowBottomBar = screen === 'manage' ? canCreateArtwork : true;

  const handleDelete = () => {
    if (sheetWork) {
      deleteArtworkMutation.mutate(sheetWork.id, {
        onSuccess: () => setOrderedWorks(null),
      });
    }
    setConfirming(false);
    setSheetWork(null);
  };

  const handleReorder = (next: Work[]) => {
    setOrderedWorks(next);
  };

  const handleOrderBack = () => {
    // 편집한 순서를 저장하고 목록 화면으로 돌아갑니다.
    if (orderedWorks) {
      updateOrder.mutate(
        orderedWorks.map((work) => work.id),
        { onSuccess: () => setOrderedWorks(null) },
      );
    }
    setScreen('manage');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-page">
      <ExhibitionHeader
        title={screen === 'manage' ? '전시작 관리' : '순서 편집'}
        onBack={screen === 'manage' ? handleBack : handleOrderBack}
      />

      <main className={shouldShowBottomBar ? 'pb-bottom-bar-offset' : undefined}>
        {screen === 'manage' ? (
          <ManageScreen
            works={works}
            display={display}
            onOpenSheet={setSheetWork}
            onEditOrder={() => setScreen('order')}
          />
        ) : (
          <OrderScreen works={works} onReorder={handleReorder} />
        )}
      </main>

      {shouldShowBottomBar && screen === 'manage' ? (
        <BottomFixedBar>
          <button
            type="button"
            onClick={() => navigate(`/exhibition/${displayId}/artworks/add`)}
            className="w-full h-11 py-3 bg-dark rounded-xl typo-body-sm-bold text-card inline-flex justify-center items-center gap-1.5"
          >
            전시작 추가
          </button>
        </BottomFixedBar>
      ) : shouldShowBottomBar ? (
        <BottomFixedBar>
          <button
            type="button"
            onClick={handleOrderBack}
            className="w-full h-11 py-3 bg-dark rounded-xl typo-body-sm-bold text-card inline-flex justify-center items-center gap-1.5"
          >
            순서 저장하기
          </button>
        </BottomFixedBar>
      ) : null}

      {sheetWork && (canEditSheetArtwork || canDeleteSheetArtwork) && (
        <WorkActionSheet
          work={sheetWork}
          canEdit={canEditSheetArtwork}
          canDelete={canDeleteSheetArtwork}
          onClose={() => setSheetWork(null)}
          onEdit={() => navigate(`/exhibition/${displayId}/artworks/${sheetWork.id}/edit`)}
          onDelete={() => setConfirming(true)}
        />
      )}

      {confirming && (
        <DeleteConfirmDialog onCancel={() => setConfirming(false)} onConfirm={handleDelete} />
      )}
    </div>
  );
}
