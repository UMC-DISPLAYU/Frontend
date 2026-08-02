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

const DEFAULT_CONTENTS = [
  { id: 'guide', title: '전시 카드 · 브로셔 · 가이드', meta: '1개 등록' },
  { id: 'interior', title: '전시장 내부 사진', meta: '3개 등록' },
  { id: 'bts', title: '준비 과정 / BTS', meta: '0개' },
];

const DEFAULT_ARTWORKS = [{ id: 'a1', title: '흐름의 기억', artist: '이준호', image: null }];

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
    navigate(`/artworks-manage?displayId=${selected ? Number(selected.id) : ''}`);
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
        contents: displayDetail?.contentCategories?.length
          ? displayDetail.contentCategories.map((cat) => ({
              id: String(cat.categoryId),
              title: cat.name,
              meta: cat.contents.length > 0 ? `${cat.contents.length}개 등록` : '0개',
            }))
          : DEFAULT_CONTENTS,
        artworks: artworkItems.length > 0 ? artworkItems : DEFAULT_ARTWORKS,
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
