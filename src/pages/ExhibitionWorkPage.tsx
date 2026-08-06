import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { WorkScreen } from '@/components/display-manage';
import { useHideFooter } from '@/components/layout';
import { useDisplayArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import type { ExhibitionItem } from '@/types/mypage';

type ExhibitionWorkLocationState = {
  initialExhibition?: ExhibitionItem;
};

/* 전시 상세 응답이 period/location 객체 또는 평평한 필드로 오는 두 형태를 모두 다룹니다. */
type DisplaySource = {
  status?: string;
  title?: string;
  organization?: string | null;
  department?: string | null;
  placeName?: string;
  posterImageUrl?: string;
  startDate?: string;
  endDate?: string;
  period?: { startDate?: string; endDate?: string };
  location?: { placeName?: string };
  images?: { imageUrl?: string }[];
};

export function ExhibitionWorkPage() {
  useHideFooter();

  const { displayId } = useParams();
  const { state } = useLocation() as { state: ExhibitionWorkLocationState | null };
  const navigate = useNavigate();

  // If state is not provided, we should probably fetch the exhibition detail or fallback
  // The current WorkScreen expects an `ExhibitionItem` type.
  const exhibition = state?.initialExhibition;

  // Fetch data
  const { data: displayDetail } = useDisplayDetail(Number(displayId));
  const { data: displayArtworks } = useDisplayArtworks(Number(displayId));

  const handleManageArtworks = () => {
    navigate(`/exhibition/${displayId}/artworks`);
  };

  const handleWorkBack = () => {
    navigate(-1);
  };

  const artworkItems =
    displayArtworks?.artworks.map((artwork) => ({
      id: String(artwork.artworkId),
      title: artwork.artworkName,
      artist: artwork.artistName,
      image: artwork.artworkImageUrl || null,
    })) ?? [];

  // Transform API data to match WorkScreen expected format
  const workData = {
    contents:
      displayDetail?.contentCategories?.map((cat) => ({
        id: String(cat.categoryId),
        title: cat.name,
        meta: cat.contents.length > 0 ? `${cat.contents.length}개 등록` : '0개',
      })) ?? [],
    artworks: artworkItems,
  };

  if (!exhibition && !displayDetail) {
    return (
      <div className="w-96 mx-auto h-dvh bg-page flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  // Create fallback exhibition from displayDetail if state is missing
  const source = displayDetail as DisplaySource | undefined;
  const startDate = source?.period?.startDate ?? source?.startDate ?? '';
  const endDate = source?.period?.endDate ?? source?.endDate ?? '';
  const placeName = source?.location?.placeName ?? source?.placeName ?? '';
  const posterImageUrl = source?.posterImageUrl ?? source?.images?.[0]?.imageUrl ?? '';

  const exItem: ExhibitionItem = exhibition ?? {
    id: String(displayId),
    title: displayDetail?.title ?? '',
    status: displayDetail?.status ?? '',
    thumbnail: posterImageUrl,
    place: placeName,
    period: `${startDate} - ${endDate}`,
    org: source?.organization ?? source?.department ?? '',
  };

  return (
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
      <WorkScreen
        ex={exItem}
        work={workData}
        onBack={handleWorkBack}
        onManageArtworks={handleManageArtworks}
      />
    </div>
  );
}
