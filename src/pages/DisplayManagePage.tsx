import { useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { ManageScreen, WorkScreen } from '@/components/display-manage';
import { useHideFooter } from '@/components/layout';
import { useDisplayArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useMyDisplays } from '@/hooks/queries/useMyDisplays';
import type { ExhibitionItem } from '@/types/mypage';

type DisplayManageLocationState = {
  initialExhibition?: ExhibitionItem;
};

export function DisplayManagePage() {
  useHideFooter();

  const { state } = useLocation() as { state: DisplayManageLocationState | null };
  const [selected, setSelected] = useState<ExhibitionItem | null>(
    () => state?.initialExhibition ?? null,
  );
  const navigate = useNavigate();

  // Fetch data
  const { data: myDisplays = [], isLoading: isLoadingDisplays } = useMyDisplays();
  const { data: displayDetail } = useDisplayDetail(selected ? Number(selected.id) : Number.NaN);
  const { data: displayArtworks } = useDisplayArtworks(selected ? Number(selected.id) : Number.NaN);

  const handleManageArtworks = () => {
    if (!selected) return;

    navigate(`/artworks-manage?displayId=${selected.id}`);
  };

  const handleWorkBack = () => {
    if (state?.initialExhibition) {
      navigate(-1);
      return;
    }

    setSelected(null);
  };

  const artworkItems =
    displayArtworks?.artworks.map((artwork) => ({
      id: String(artwork.artworkId),
      title: artwork.artworkName,
      artist: artwork.artistName,
      image: artwork.artworkImageUrl || null,
    })) ?? [];

  // Transform API data to match WorkScreen expected format
  const workData = selected
    ? {
        contents:
          displayDetail?.contentCategories?.map((cat) => ({
            id: String(cat.categoryId),
            title: cat.name,
            meta: cat.contents.length > 0 ? `${cat.contents.length}개 등록` : '0개',
          })) ?? [],
        artworks: artworkItems,
      }
    : null;

  if (isLoadingDisplays && !selected) {
    return (
      <div className="w-96 mx-auto h-dvh bg-page flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
      {selected ? (
        workData ? (
          <WorkScreen
            ex={selected}
            work={workData}
            onBack={handleWorkBack}
            onManageArtworks={handleManageArtworks}
          />
        ) : null
      ) : (
        <ManageScreen
          exhibitions={myDisplays}
          onOpen={setSelected}
          onBack={() => window.history.back()}
          onRegister={() => navigate('/exhibition-register')}
        />
      )}
    </div>
  );
}
