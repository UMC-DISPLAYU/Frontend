import { useMemo, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  DeleteConfirmDialog,
  ManageScreen,
  OrderScreen,
  WorkActionSheet,
} from '@/components/artworks-manage';
import {
  useDeleteArtwork,
  useDisplayArtworks,
  useUpdateArtworkOrder,
} from '@/hooks/queries/useDisplayArtworks';
import type { Work } from '@/types/artworkManage';

export function ArtworksManagePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 새로고침이나 링크 진입에서도 유지되도록 쿼리 스트링으로 받습니다.
  const displayId = Number(searchParams.get('displayId') ?? 0);

  const { data } = useDisplayArtworks(displayId);
  const deleteArtworkMutation = useDeleteArtwork(displayId);
  const updateOrder = useUpdateArtworkOrder(displayId);

  const [screen, setScreen] = useState<'manage' | 'order'>('manage');
  const [sheetWork, setSheetWork] = useState<Work | null>(null);
  const [confirming, setConfirming] = useState(false);
  // 순서 편집 중에는 사용자가 끌어놓은 순서를 우선 보여줍니다.
  const [orderedWorks, setOrderedWorks] = useState<Work[] | null>(null);

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
        thumbnail: artwork.artworkImageUrl,
      })),
    [data],
  );

  const works = orderedWorks ?? fetchedWorks;

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
    <div className="relative mx-auto flex h-dvh w-96 flex-col overflow-hidden bg-page">
      {screen === 'manage' ? (
        <ManageScreen
          works={works}
          onOpenSheet={setSheetWork}
          onEditOrder={() => setScreen('order')}
          onAddArtwork={() => navigate(`/artworks-register?displayId=${displayId}`)}
          onBack={handleBack}
        />
      ) : (
        <OrderScreen works={works} onReorder={handleReorder} onBack={handleOrderBack} />
      )}

      {sheetWork && (
        <WorkActionSheet
          work={sheetWork}
          onClose={() => setSheetWork(null)}
          onEdit={() => {}}
          onDelete={() => setConfirming(true)}
        />
      )}

      {confirming && (
        <DeleteConfirmDialog onCancel={() => setConfirming(false)} onConfirm={handleDelete} />
      )}
    </div>
  );
}
